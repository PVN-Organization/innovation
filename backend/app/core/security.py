import asyncio
import time
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx
from jose import JWTError, jwt
from loguru import logger
from pydantic import BaseModel

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    """Authenticated user payload extracted from an Azure AD JWT."""

    email: str
    name: str
    is_admin: bool


# ── JWKS key cache ────────────────────────────────────────────────


class _JwksCache:
    """Async-safe in-memory cache for Azure AD JWKS signing keys.

    Uses double-checked locking so concurrent requests that hit an
    expired cache only trigger a single refresh.
    """

    _TTL: float = 3600.0

    def __init__(self) -> None:
        self._keys: list[dict[str, str]] = []
        self._fetched_at: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def _is_expired(self) -> bool:
        return not self._keys or time.monotonic() - self._fetched_at > self._TTL

    async def get_keys(self, tenant_id: str) -> list[dict[str, str]]:
        if self._is_expired:
            async with self._lock:
                if self._is_expired:
                    await self._refresh(tenant_id)
        return self._keys

    async def _refresh(self, tenant_id: str) -> None:
        url = f"https://login.microsoftonline.com/{tenant_id}" "/discovery/v2.0/keys"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            self._keys = response.json()["keys"]
            self._fetched_at = time.monotonic()
            logger.info("Refreshed Azure AD JWKS signing keys")


_jwks_cache = _JwksCache()


# ── Token verification ────────────────────────────────────────────


async def verify_azure_ad_token(token: str) -> dict:
    """Validate an Azure AD JWT: signature, issuer, audience."""
    if not settings.AZURE_AD_TENANT_ID or not settings.AZURE_AD_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure AD authentication is not configured",
        )

    keys = await _jwks_cache.get_keys(settings.AZURE_AD_TENANT_ID)

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token header",
        ) from exc

    kid = unverified_header.get("kid")
    rsa_key: dict[str, str] = {}
    for key in keys:
        if key.get("kid") == kid:
            rsa_key = {k: key[k] for k in ("kty", "kid", "use", "n", "e")}
            break

    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signing key not found in JWKS",
        )

    try:
        return jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.AZURE_AD_CLIENT_ID,
            issuer=(
                f"https://login.microsoftonline.com/"
                f"{settings.AZURE_AD_TENANT_ID}/v2.0"
            ),
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature or claims validation failed",
        ) from exc


# ── FastAPI dependency ─────────────────────────────────────────────


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> CurrentUser:
    """Extract and verify the current user from the ``Authorization`` header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = await verify_azure_ad_token(credentials.credentials)

    roles = payload.get("roles", [])

    return CurrentUser(
        email=str(payload.get("preferred_username", "")),
        name=str(payload.get("name", "")),
        is_admin="admin" in (roles if isinstance(roles, list) else []),
    )


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]

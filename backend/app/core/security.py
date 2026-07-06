import asyncio
import time
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx
from itsdangerous import BadSignature, TimestampSigner, URLSafeTimedSerializer
from jose import JWTError, jwt
from loguru import logger
from pydantic import BaseModel

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

AZURE_AUTHORITY = (
    f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}"
)
AZURE_AUTH_URL = f"{AZURE_AUTHORITY}/oauth2/v2.0/authorize"
AZURE_TOKEN_URL = f"{AZURE_AUTHORITY}/oauth2/v2.0/token"
AZURE_SCOPES = "openid profile email"


class CurrentUser(BaseModel):
    """Authenticated user payload."""

    email: str
    name: str
    is_admin: bool


# ── Session cookie helpers ────────────────────────────────────────

_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
_signer = TimestampSigner(settings.SECRET_KEY)

SESSION_COOKIE = "session"
SESSION_MAX_AGE = 8 * 3600  # 8 hours


def create_session_token(user: CurrentUser) -> str:
    return _serializer.dumps(user.model_dump())


def read_session_token(token: str) -> CurrentUser | None:
    try:
        data = _serializer.loads(token, max_age=SESSION_MAX_AGE)
        return CurrentUser(**data)
    except (BadSignature, Exception):
        return None


def create_state_token() -> str:
    return _signer.sign("oauth").decode()


def verify_state_token(state: str) -> bool:
    try:
        _signer.unsign(state, max_age=600)
        return True
    except BadSignature:
        return False


# ── OAuth2 token exchange ─────────────────────────────────────────


async def exchange_code_for_tokens(code: str, redirect_uri: str) -> dict:
    """Exchange authorization code for ID + access tokens."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            AZURE_TOKEN_URL,
            data={
                "client_id": settings.AZURE_AD_CLIENT_ID,
                "client_secret": settings.AZURE_AD_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
                "scope": AZURE_SCOPES,
            },
        )
        if resp.status_code != 200:
            logger.error("Token exchange failed: {}", resp.text)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token exchange failed",
            )
        return resp.json()


# ── JWKS key cache ────────────────────────────────────────────────


class _JwksCache:
    _TTL: float = 3600.0

    def __init__(self) -> None:
        self._keys: list[dict[str, str]] = []
        self._fetched_at: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def _is_expired(self) -> bool:
        return (
            not self._keys
            or time.monotonic() - self._fetched_at > self._TTL
        )

    async def get_keys(self, tenant_id: str) -> list[dict[str, str]]:
        if self._is_expired:
            async with self._lock:
                if self._is_expired:
                    await self._refresh(tenant_id)
        return self._keys

    async def _refresh(self, tenant_id: str) -> None:
        url = (
            f"https://login.microsoftonline.com/{tenant_id}"
            "/discovery/v2.0/keys"
        )
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
            issuer=f"{AZURE_AUTHORITY}/v2.0",
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature or claims validation failed",
        ) from exc


# ── FastAPI dependency ─────────────────────────────────────────────


async def get_current_user(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ] = None,
) -> CurrentUser:
    """Extract user from session cookie OR Bearer token."""
    # 1) Try session cookie first
    session_token = request.cookies.get(SESSION_COOKIE)
    if session_token:
        user = read_session_token(session_token)
        if user:
            return user

    # 2) Fall back to Bearer token (API clients)
    if credentials:
        payload = await verify_azure_ad_token(credentials.credentials)
        roles = payload.get("roles", [])
        return CurrentUser(
            email=str(payload.get("preferred_username", "")),
            name=str(payload.get("name", "")),
            is_admin="admin" in (
                roles if isinstance(roles, list) else []
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user_optional(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ] = None,
) -> CurrentUser | None:
    """Like get_current_user but returns None instead of raising."""
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None


CurrentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
OptionalUserDep = Annotated[
    CurrentUser | None, Depends(get_current_user_optional)
]

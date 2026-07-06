"""Azure AD OAuth2 Authorization Code flow endpoints."""

from urllib.parse import urlencode

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from loguru import logger

from app.core.config import settings
from app.core.security import (
    AZURE_AUTH_URL,
    AZURE_SCOPES,
    SESSION_COOKIE,
    SESSION_MAX_AGE,
    CurrentUser,
    OptionalUserDep,
    create_session_token,
    create_state_token,
    exchange_code_for_tokens,
    verify_azure_ad_token,
    verify_state_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _build_redirect_uri(request: Request) -> str:
    """Build the OAuth2 callback URI from the current request."""
    return str(request.url_for("auth_callback"))


# ── GET /api/v1/auth/login ────────────────────────────────────────


@router.get("/login")
async def auth_login(request: Request) -> RedirectResponse:
    """Redirect the user to Azure AD login page."""
    if not settings.AZURE_AD_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure AD is not configured",
        )

    state = create_state_token()
    params = {
        "client_id": settings.AZURE_AD_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": _build_redirect_uri(request),
        "response_mode": "query",
        "scope": AZURE_SCOPES,
        "state": state,
    }
    return RedirectResponse(url=f"{AZURE_AUTH_URL}?{urlencode(params)}")


# ── GET /api/v1/auth/callback ─────────────────────────────────────


@router.get("/callback", name="auth_callback")
async def auth_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
) -> RedirectResponse:
    """Handle Azure AD OAuth2 callback — exchange code, set session cookie."""
    if error:
        logger.warning("Azure AD error: {} — {}", error, error_description)
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}?auth_error={error}",
        )

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing code or state parameter",
        )

    if not verify_state_token(state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state token",
        )

    tokens = await exchange_code_for_tokens(
        code=code,
        redirect_uri=_build_redirect_uri(request),
    )

    id_token = tokens.get("id_token", "")
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No id_token in response",
        )

    payload = await verify_azure_ad_token(id_token)
    roles = payload.get("roles", [])

    user = CurrentUser(
        email=str(payload.get("preferred_username", payload.get("email", ""))),
        name=str(payload.get("name", "")),
        is_admin="admin" in (roles if isinstance(roles, list) else []),
    )

    logger.info("User logged in: {} ({})", user.name, user.email)

    session_token = create_session_token(user)
    response = RedirectResponse(
        url=settings.FRONTEND_URL,
        status_code=status.HTTP_302_FOUND,
    )
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return response


# ── GET /api/v1/auth/me ───────────────────────────────────────────


@router.get("/me")
async def auth_me(user: OptionalUserDep) -> dict:
    """Return the currently authenticated user or null."""
    if not user:
        return {"user": None}
    return {"user": user.model_dump()}


# ── POST /api/v1/auth/logout ──────────────────────────────────────


@router.post("/logout")
async def auth_logout() -> JSONResponse:
    """Clear the session cookie."""
    response = JSONResponse(content={"detail": "Logged out"})
    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/",
    )
    return response

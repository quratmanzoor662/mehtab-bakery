from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.deps import CurrentAdmin
from app.core.security import decode_access_token
from app.schemas.auth import LoginRequest, MessageResponse, TokenResponse
from app.services.admin_service import (
    ensure_default_admin,
    is_token_revoked,
    login_admin,
    revoke_token,
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)

bearer_scheme = HTTPBearer(auto_error=False)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """
    Admin login — returns a JWT access token.

    Send subsequent admin requests as:
    Authorization: Bearer <access_token>
    """
    ensure_default_admin()
    try:
        return login_admin(payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


@router.post("/logout", response_model=MessageResponse)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """
    Revoke the current access token (blacklist by jti until expiry).

    Client should also discard the token locally.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing jti/exp claims",
        )

    if is_token_revoked(jti):
        return {"message": "Already logged out"}

    revoke_token(jti, datetime.fromtimestamp(exp, tz=timezone.utc))
    return {"message": "Logged out successfully"}


@router.get("/me")
def me(admin: CurrentAdmin):
    """Return the currently authenticated admin profile."""
    return {
        "id": admin["id"],
        "email": admin["email"],
        "name": admin["name"],
        "role": admin["role"],
    }

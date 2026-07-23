from datetime import datetime, timezone
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.services.admin_service import (
    ensure_default_admin,
    get_admin_by_id,
    is_token_revoked,
    serialize_admin,
)

# Extracts: Authorization: Bearer <token>
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ] = None,
) -> dict[str, Any]:
    """
    Protect admin-only routes.

    Requires a valid, non-revoked JWT access token.
    """
    # Ensure seed admin exists before the first protected request.
    ensure_default_admin()

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    jti = payload.get("jti")
    if not jti or is_token_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    admin = get_admin_by_id(admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )

    profile = serialize_admin(admin)
    # Attach raw claims for logout (jti / exp).
    profile["_token_jti"] = jti
    exp = payload.get("exp")
    profile["_token_exp"] = (
        datetime.fromtimestamp(exp, tz=timezone.utc) if exp else None
    )
    return profile


# Shortcut type for route signatures.
CurrentAdmin = Annotated[dict[str, Any], Depends(get_current_admin)]

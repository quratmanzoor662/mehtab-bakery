from datetime import datetime, timezone
from typing import Any, Optional

from app.core.config import get_settings
from app.core.database import db
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

admins = db["admins"]
token_blacklist = db["token_blacklist"]


def serialize_admin(admin: dict) -> dict:
    """Public admin profile (never include password_hash)."""
    return {
        "id": str(admin["_id"]),
        "email": admin["email"],
        "name": admin.get("name", "Admin"),
        "role": admin.get("role", "admin"),
    }


def ensure_default_admin() -> None:
    """
    Seed a single admin from env if the admins collection is empty.

    Also migrates legacy docs that stored a plaintext `password` instead of
    `password_hash` (hashes ADMIN_PASSWORD for the seed email, or the old
    plaintext value for other emails).
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    seed_email = settings.admin_email.lower().strip()

    if admins.count_documents({}) == 0:
        admins.insert_one(
            {
                "email": seed_email,
                "name": "Mehtab Bakery Admin",
                "role": "admin",
                "password_hash": hash_password(settings.admin_password),
                "created_at": now,
                "updated_at": now,
            }
        )
        return

    # Repair legacy / incomplete admin documents.
    for admin in admins.find({"password_hash": {"$exists": False}}):
        email = str(admin.get("email", "")).lower().strip()
        if email == seed_email:
            plain = settings.admin_password
        elif isinstance(admin.get("password"), str) and admin["password"]:
            plain = admin["password"]
        else:
            continue

        admins.update_one(
            {"_id": admin["_id"]},
            {
                "$set": {
                    "email": email or seed_email,
                    "name": admin.get("name", "Mehtab Bakery Admin"),
                    "role": admin.get("role", "admin"),
                    "password_hash": hash_password(plain),
                    "updated_at": now,
                },
                "$unset": {"password": ""},
            },
        )


def get_admin_by_email(email: str) -> Optional[dict]:
    return admins.find_one({"email": email.lower().strip()})


def get_admin_by_id(admin_id: str) -> Optional[dict]:
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        return admins.find_one({"_id": ObjectId(admin_id)})
    except (InvalidId, TypeError):
        return None


def authenticate_admin(email: str, password: str) -> Optional[dict]:
    """Validate credentials. Returns admin document or None."""
    admin = get_admin_by_email(email)
    if not admin:
        return None
    password_hash = admin.get("password_hash")
    if not password_hash or not verify_password(password, password_hash):
        return None
    return admin


def login_admin(email: str, password: str) -> dict[str, Any]:
    """Authenticate and issue a JWT access token."""
    admin = authenticate_admin(email, password)
    if not admin:
        raise ValueError("Invalid email or password")

    token, jti, expires_at = create_access_token(
        subject=str(admin["_id"]),
        extra_claims={
            "email": admin["email"],
            "role": admin.get("role", "admin"),
        },
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_at": expires_at.isoformat(),
        "admin": serialize_admin(admin),
    }


def revoke_token(jti: str, expires_at: datetime) -> None:
    """Blacklist a token jti until its natural expiry (used by logout)."""
    token_blacklist.update_one(
        {"jti": jti},
        {
            "$set": {
                "jti": jti,
                "expires_at": expires_at,
                "revoked_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )


def is_token_revoked(jti: str) -> bool:
    """True if this token was logged out before expiry."""
    return token_blacklist.find_one({"jti": jti}) is not None


def cleanup_expired_blacklist() -> None:
    """Optional maintenance: drop blacklist rows that are already expired."""
    token_blacklist.delete_many(
        {"expires_at": {"$lt": datetime.now(timezone.utc)}}
    )

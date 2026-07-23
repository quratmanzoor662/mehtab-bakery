from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")


class Settings:
    """App configuration loaded from environment variables."""

    mongo_uri: str = os.getenv("MONGO_URI", "")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
    )
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@mehtabbakery.com")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "changeme")


@lru_cache
def get_settings() -> Settings:
    return Settings()

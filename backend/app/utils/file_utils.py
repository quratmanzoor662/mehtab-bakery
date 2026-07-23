"""Helpers for validating and naming uploaded product images."""

from __future__ import annotations

import re
import time
from pathlib import Path
from uuid import uuid4

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


def get_extension(filename: str | None) -> str:
    """Return lowercase extension including the leading dot, or empty string."""
    if not filename:
        return ""
    return Path(filename).suffix.lower()


def is_allowed_extension(filename: str | None) -> bool:
    return get_extension(filename) in ALLOWED_EXTENSIONS


def is_allowed_content_type(content_type: str | None) -> bool:
    if not content_type:
        return False
    return content_type.split(";")[0].strip().lower() in ALLOWED_CONTENT_TYPES


def sanitize_stem(filename: str | None) -> str:
    """
    Build a filesystem-safe stem from the original filename.

    Example: "Chocolate Cake!!.JPG" -> "chocolate_cake"
    """
    stem = Path(filename or "image").stem.lower()
    stem = re.sub(r"[^a-z0-9]+", "_", stem).strip("_")
    return stem[:60] or "image"


def unique_image_name(original_filename: str | None) -> str:
    """
    Rename uploads to avoid collisions.

    Example: cake.jpg -> cake_1721655345_a1b2c3d4.jpg
    """
    ext = get_extension(original_filename)
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"
    stem = sanitize_stem(original_filename)
    stamp = int(time.time())
    short_id = uuid4().hex[:8]
    return f"{stem}_{stamp}_{short_id}{ext}"

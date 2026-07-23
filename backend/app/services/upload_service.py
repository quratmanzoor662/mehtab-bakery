"""Save validated product images under backend/uploads/products/."""

from __future__ import annotations

from pathlib import Path

from fastapi import UploadFile

from app.utils.file_utils import (
    MAX_UPLOAD_BYTES,
    is_allowed_content_type,
    is_allowed_extension,
    unique_image_name,
)

# backend/uploads/products  (resolved from this file: .../app/services/ -> backend/)
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
PRODUCTS_UPLOAD_DIR = BACKEND_ROOT / "uploads" / "products"


def ensure_upload_dirs() -> None:
    """Create the uploads/products directory if it does not exist."""
    PRODUCTS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_product_image(file: UploadFile) -> dict[str, str]:
    """
    Validate and store a product image.

    Returns:
        {"filename": "...", "relative_path": "uploads/products/..."}
    Raises:
        ValueError on invalid type/size.
    """
    if not file.filename:
        raise ValueError("No file provided")

    if not is_allowed_extension(file.filename):
        raise ValueError("Only jpg, jpeg, png, and webp images are allowed")

    if not is_allowed_content_type(file.content_type):
        raise ValueError("Invalid image content type")

    ensure_upload_dirs()
    filename = unique_image_name(file.filename)
    destination = PRODUCTS_UPLOAD_DIR / filename

    size = 0
    chunk_size = 1024 * 1024  # 1 MB

    try:
        with destination.open("wb") as buffer:
            while True:
                chunk = file.file.read(chunk_size)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise ValueError("Image must be 5 MB or smaller")
                buffer.write(chunk)
    except Exception:
        if destination.exists():
            destination.unlink(missing_ok=True)
        raise

    if size == 0:
        destination.unlink(missing_ok=True)
        raise ValueError("Empty file is not allowed")

    return {
        "filename": filename,
        "relative_path": f"uploads/products/{filename}",
    }


def resolve_product_image_path(filename: str) -> Path:
    """
    Resolve a product image path safely (blocks path traversal).

    Raises:
        ValueError: invalid filename or extension
        FileNotFoundError: file does not exist
    """
    if not filename or "/" in filename or "\\" in filename:
        raise ValueError("Invalid filename")

    safe_name = Path(filename).name
    if safe_name != filename or safe_name in {".", ".."}:
        raise ValueError("Invalid filename")

    if not is_allowed_extension(safe_name):
        raise ValueError("Invalid filename")

    ensure_upload_dirs()
    uploads_root = PRODUCTS_UPLOAD_DIR.resolve()
    path = (PRODUCTS_UPLOAD_DIR / safe_name).resolve()

    if path.parent != uploads_root:
        raise ValueError("Invalid filename")

    if not path.is_file():
        raise FileNotFoundError("Image not found")

    return path


def delete_product_image(filename: str) -> str:
    """
    Delete a product image from disk.

    Returns the deleted filename.
    Raises ValueError / FileNotFoundError (same as resolve).
    """
    path = resolve_product_image_path(filename)
    path.unlink()
    return path.name

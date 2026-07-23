from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import CurrentAdmin
from app.services.upload_service import delete_product_image, save_product_image

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"],
)


@router.post("/products")
async def upload_product_image(
    _admin: CurrentAdmin,
    file: UploadFile = File(..., description="Product image (jpg/jpeg/png/webp, max 5 MB)"),
):
    """
    Admin — upload a product image.

    Returns a host-relative path to store on the product document, e.g.
    `uploads/products/cake_17216543.jpg`.

    Frontend builds the full URL with the API base:
    `${API_URL}/${product.image}`
    """
    try:
        saved = save_product_image(file)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    finally:
        await file.close()

    return {
        "filename": saved["filename"],
        "image": saved["relative_path"],
    }


@router.delete("/products/{filename}")
def remove_product_image(filename: str, _admin: CurrentAdmin):
    """
    Admin — delete a product image from disk.

    View images via StaticFiles: GET /uploads/products/{filename}
    """
    try:
        deleted = delete_product_image(filename)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return {
        "filename": deleted,
        "message": "Image deleted successfully",
    }

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentAdmin
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import (
    get_all_products,
    get_product,
    create_product,
    update_product,
    delete_product,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.get("/")
def all_products(
    search: Optional[str] = Query(
        None,
        description="Case-insensitive product name search (e.g. gir)",
    ),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
):
    """Public — list products with optional name search and pagination."""
    return get_all_products(search=search, page=page, limit=limit)


@router.get("/{product_id}")
def single_product(product_id: str):
    """Public — product details."""
    product = get_product(product_id)

    if not product:
        raise HTTPException(404, "Product not found")

    return product


@router.post("/")
def add_product(product: ProductCreate, _admin: CurrentAdmin):
    """Admin — create product."""
    try:
        product_id = create_product(product.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "id": product_id,
        "message": "Product Created Successfully",
    }


@router.put("/{product_id}")
def edit_product(
    product_id: str,
    product: ProductUpdate,
    _admin: CurrentAdmin,
):
    """Admin — update product."""
    try:
        return update_product(
            product_id,
            product.model_dump(exclude_none=True),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/{product_id}")
def remove_product(product_id: str, _admin: CurrentAdmin):
    """Admin — delete product."""
    try:
        return delete_product(product_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

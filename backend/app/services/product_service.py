from datetime import datetime
from math import ceil
from typing import Any, Optional, Union
import re
import unicodedata

from bson import ObjectId

from app.core.database import db

collection = db["products"]

ProductId = Union[ObjectId, str]


def serialize(product: dict) -> dict:
    """Convert MongoDB ObjectId to a JSON-safe string."""
    product["_id"] = str(product["_id"])
    return product


def _as_product_id(product_id: str) -> ProductId:
    """
    Parse a path/query product id.

    Supports real ObjectIds and legacy string ids (some early docs used
    placeholder string ids like '...').
    """
    product_id = (product_id or "").strip()
    if not product_id:
        raise ValueError("Invalid product id")

    if ObjectId.is_valid(product_id):
        return ObjectId(product_id)

    return product_id


def _id_query(product_id: str) -> dict[str, Any]:
    """
    Match a product whether `_id` is stored as ObjectId or as a plain string.

    A 24-char hex string may exist as either type in older data.
    """
    parsed = _as_product_id(product_id)
    if isinstance(parsed, ObjectId):
        return {"_id": {"$in": [parsed, str(parsed)]}}
    return {"_id": parsed}


def generate_slug(name: str) -> str:
    """
    Build an SEO-friendly slug from a product name.

    Example: "Fresh Girda!" → "fresh-girda"
    """
    normalized = unicodedata.normalize("NFKD", name.strip())
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = ascii_text.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug).strip("-")
    return slug


def _name_exists(name: str, exclude_id: Optional[str] = None) -> bool:
    """
    Case-insensitive exact match on product name.

    exclude_id: when updating, ignore the product being edited.
    """
    query: dict[str, Any] = {
        "name": {"$regex": f"^{re.escape(name.strip())}$", "$options": "i"},
    }
    if exclude_id:
        parsed = _as_product_id(exclude_id)
        if isinstance(parsed, ObjectId):
            query["_id"] = {"$nin": [parsed, str(parsed)]}
        else:
            query["_id"] = {"$ne": parsed}

    return collection.find_one(query) is not None


def get_all_products(
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> dict[str, Any]:
    """
    List products with optional name search and pagination.

    - search: case-insensitive match on the product name (MongoDB regex)
    - page / limit: page through results with skip + limit
    - Results are always sorted by name (A → Z) for a stable order
    """
    query: dict[str, Any] = {}

    if search is not None:
        search = search.strip()

    if search:
        safe_search = re.escape(search)
        query["name"] = {"$regex": safe_search, "$options": "i"}

    total = collection.count_documents(query)
    skip = (page - 1) * limit

    cursor = (
        collection.find(query)
        .sort("name", 1)
        .skip(skip)
        .limit(limit)
    )
    products = [serialize(product) for product in cursor]

    total_pages = ceil(total / limit) if total > 0 else 0

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1 and total > 0,
        "products": products,
    }


def get_product(product_id: str) -> Optional[dict]:
    try:
        product = collection.find_one(_id_query(product_id))
    except ValueError:
        return None

    if not product:
        return None

    return serialize(product)


def create_product(product: dict) -> str:
    name = product["name"].strip()
    product["name"] = name

    if _name_exists(name):
        raise ValueError("A product with this name already exists")

    product["slug"] = generate_slug(name)

    now = datetime.utcnow()
    product["created_at"] = now
    product["updated_at"] = now

    result = collection.insert_one(product)

    return str(result.inserted_id)


def update_product(product_id: str, data: dict) -> dict:
    try:
        id_filter = _id_query(product_id)
    except ValueError as exc:
        raise ValueError(str(exc)) from exc

    if "name" in data and data["name"] is not None:
        name = data["name"].strip()
        data["name"] = name

        if _name_exists(name, exclude_id=product_id):
            raise ValueError("A product with this name already exists")

        data["slug"] = generate_slug(name)

    data["updated_at"] = datetime.utcnow()

    result = collection.update_one(id_filter, {"$set": data})
    if result.matched_count == 0:
        raise ValueError("Product not found")

    return {"message": "Product updated successfully"}


def delete_product(product_id: str) -> dict:
    try:
        id_filter = _id_query(product_id)
    except ValueError as exc:
        raise ValueError(str(exc)) from exc

    result = collection.delete_one(id_filter)
    if result.deleted_count == 0:
        raise ValueError("Product not found")

    return {"message": "Product deleted successfully"}


def repair_legacy_string_ids() -> int:
    """
    Migrate products whose `_id` is a non-ObjectId string to a real ObjectId.

    Returns how many documents were rewritten.
    """
    repaired = 0
    for doc in list(collection.find({})):
        raw_id = doc["_id"]
        if isinstance(raw_id, ObjectId):
            continue
        if isinstance(raw_id, str) and ObjectId.is_valid(raw_id):
            continue

        payload = {k: v for k, v in doc.items() if k != "_id"}
        collection.insert_one(payload)
        collection.delete_one({"_id": raw_id})
        repaired += 1
    return repaired

from datetime import date, datetime, timedelta
from math import ceil
from typing import Any, Optional
from urllib.parse import quote
import re

from bson import ObjectId
from bson.errors import InvalidId

from app.core.database import db
from app.services.settings_service import get_settings

collection = db["reservations"]
products = db["products"]

# Bakery order workflow (Preparing sits between Confirmed and Ready).
VALID_STATUSES = {
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Collected",
    "Cancelled",
}

# Older docs used this label — still accepted for reads/filters.
LEGACY_STATUS_MAP = {
    "Ready for Pickup": "Ready",
}

# Cart total must meet the same ₹50 floor used on the frontend.
MIN_RESERVATION_AMOUNT = 50
BULK_THRESHOLD = 50


def normalize_status(status: str) -> str:
    """Map legacy labels onto the current workflow vocabulary."""
    return LEGACY_STATUS_MAP.get(status, status)


def _history_entry(status: str, at: Optional[datetime] = None) -> dict:
    return {
        "status": status,
        "time": (at or datetime.utcnow()).isoformat(),
    }


def serialize(reservation: dict) -> dict:
    """Convert ObjectIds to strings and normalize status for JSON responses."""
    data = dict(reservation)
    data["_id"] = str(data["_id"])
    data["status"] = normalize_status(data.get("status", "Pending"))

    history = data.get("status_history") or []
    normalized_history = []
    for entry in history:
        if not isinstance(entry, dict):
            continue
        status = normalize_status(str(entry.get("status", "")))
        raw_time = entry.get("time")
        if isinstance(raw_time, datetime):
            time_value = raw_time.isoformat()
        else:
            time_value = str(raw_time or "")
        normalized_history.append({"status": status, "time": time_value})

    # Backfill a minimal timeline for older orders that never stored history.
    if not normalized_history:
        created = data.get("created_at")
        if isinstance(created, datetime):
            created = created.isoformat()
        elif created is not None:
            created = str(created)
        else:
            created = datetime.utcnow().isoformat()
        normalized_history = [
            {"status": data["status"], "time": created},
        ]

    data["status_history"] = normalized_history

    for item in data.get("items", []):
        if "product_id" in item:
            item["product_id"] = str(item["product_id"])
    return data


def _generate_reservation_number() -> str:
    """
    Build a daily sequential code: MB-YYYYMMDD-001

    Sequence is based on how many reservations already exist for today.
    """
    today = datetime.utcnow().strftime("%Y%m%d")
    prefix = f"MB-{today}-"
    count = collection.count_documents(
        {"reservation_number": {"$regex": f"^{re.escape(prefix)}"}}
    )
    return f"{prefix}{count + 1:03d}"


def _build_line_items(raw_items: list[dict]) -> list[dict]:
    """
    Resolve product_id → snapshot name/price from the products collection.

    Snapshots protect history if a product price changes later.
    """
    line_items: list[dict] = []

    for raw in raw_items:
        product_id = raw["product_id"]
        quantity = int(raw["quantity"])

        try:
            object_id = ObjectId(product_id)
        except (InvalidId, TypeError) as exc:
            raise ValueError(f"Invalid product_id: {product_id}") from exc

        product = products.find_one({"_id": object_id})
        if not product:
            raise ValueError(f"Product not found: {product_id}")

        if product.get("available") is False:
            raise ValueError(f"{product['name']} is currently unavailable")

        stock = product.get("stock")
        if stock is not None and quantity > stock:
            raise ValueError(
                f"Not enough stock for {product['name']} "
                f"(requested {quantity}, available {stock})"
            )

        line_items.append(
            {
                "product_id": str(product["_id"]),
                "name": product["name"],
                "price": int(product["price"]),
                "quantity": quantity,
            }
        )

    return line_items


def _totals(items: list[dict]) -> tuple[int, int]:
    total_items = sum(item["quantity"] for item in items)
    total_amount = sum(item["price"] * item["quantity"] for item in items)
    return total_items, total_amount


def _status_query_values(status: str) -> list[str]:
    """Include legacy synonyms so filters still match old documents."""
    normalized = normalize_status(status)
    if normalized not in VALID_STATUSES:
        raise ValueError(f"Invalid status filter: {status}")
    values = [normalized]
    if normalized == "Ready":
        values.append("Ready for Pickup")
    return values


def _parse_day(value: str) -> datetime:
    """Parse YYYY-MM-DD into midnight UTC."""
    try:
        parsed = datetime.strptime(value.strip(), "%Y-%m-%d")
    except ValueError as exc:
        raise ValueError("Dates must use YYYY-MM-DD") from exc
    return datetime(parsed.year, parsed.month, parsed.day)


def _date_range_filter(
    date_preset: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict[str, Any]:
    """Build a created_at range from presets or an explicit custom range."""
    now = datetime.utcnow()
    today = datetime(now.year, now.month, now.day)

    start: Optional[datetime] = None
    end: Optional[datetime] = None  # exclusive

    preset = (date_preset or "").strip().lower()
    if preset == "today":
        start, end = today, today + timedelta(days=1)
    elif preset == "yesterday":
        start, end = today - timedelta(days=1), today
    elif preset in {"week", "this_week"}:
        # Monday 00:00 → now+ (ISO weekday: Mon=0)
        start = today - timedelta(days=today.weekday())
        end = today + timedelta(days=1)
    elif preset in {"", "all", "custom"}:
        if date_from:
            start = _parse_day(date_from)
        if date_to:
            end = _parse_day(date_to) + timedelta(days=1)
    elif preset:
        raise ValueError(
            "Invalid date filter. Use today, yesterday, week, custom, or all."
        )

    if start is None and end is None:
        return {}

    created: dict[str, Any] = {}
    if start is not None:
        created["$gte"] = start
    if end is not None:
        created["$lt"] = end
    return {"created_at": created}


def build_whatsapp_message(reservation: dict) -> str:
    """Human-readable order message for the bakery WhatsApp chat."""
    customer = reservation["customer"]
    lines = [
        "🍞 *Mehtab Bakery — Bread Reservation*",
        "",
        f"*Reservation:* {reservation['reservation_number']}",
        "",
        "*Order*",
    ]

    for item in reservation["items"]:
        lines.append(
            f"• {item['name']} × {item['quantity']} "
            f"(₹{item['price']} each)"
        )

    lines.extend(
        [
            "",
            f"*Total pieces:* {reservation['total_items']}",
            f"*Estimated total:* ₹{reservation['total_amount']}",
        ]
    )

    if reservation["total_items"] > BULK_THRESHOLD:
        lines.extend(
            [
                "",
                f"_Bulk order (over {BULK_THRESHOLD} pieces) — "
                "please confirm pricing on WhatsApp._",
            ]
        )

    lines.extend(
        [
            "",
            "*Customer*",
            f"Name: {customer['name']}",
            f"Phone: {customer['phone']}",
            f"Pickup: {reservation['pickup_date']} at {reservation['pickup_time']}",
        ]
    )

    notes = (reservation.get("notes") or "").strip()
    if notes:
        lines.append(f"Notes: {notes}")

    lines.extend(["", "Please confirm this reservation. Thank you!"])
    return "\n".join(lines)


def build_whatsapp_url(reservation: dict) -> str:
    """wa.me deep link using the bakery number from Settings."""
    settings = get_settings()
    number = re.sub(r"\D", "", settings.get("whatsapp_number", ""))
    if number and not number.startswith("91") and len(number) == 10:
        number = f"91{number}"

    message = build_whatsapp_message(reservation)
    return f"https://wa.me/{number}?text={quote(message)}"


def create_reservation(payload: dict) -> dict:
    """
    Save a new reservation, then return it with a WhatsApp deep link.

    Flow: validate products → snapshot prices → MongoDB insert → WhatsApp URL
    """
    items = _build_line_items(payload["items"])
    total_items, total_amount = _totals(items)

    if total_amount < MIN_RESERVATION_AMOUNT:
        raise ValueError(
            f"Minimum reservation amount is ₹{MIN_RESERVATION_AMOUNT}"
        )

    pickup_date = payload["pickup_date"]
    if isinstance(pickup_date, date):
        pickup_date = pickup_date.isoformat()

    now = datetime.utcnow()
    document = {
        "reservation_number": _generate_reservation_number(),
        "customer": {
            "name": payload["customer"]["name"].strip(),
            "phone": payload["customer"]["phone"].strip(),
        },
        "items": items,
        "total_items": total_items,
        "total_amount": total_amount,
        "pickup_date": pickup_date,
        "pickup_time": payload["pickup_time"].strip(),
        "notes": (payload.get("notes") or "").strip(),
        "status": "Pending",
        "status_history": [_history_entry("Pending", now)],
        "whatsapp_sent": False,
        "created_at": now,
        "updated_at": now,
    }

    result = collection.insert_one(document)
    document["_id"] = result.inserted_id

    serialized = serialize(document)
    return {
        "reservation": serialized,
        "whatsapp_message": build_whatsapp_message(serialized),
        "whatsapp_url": build_whatsapp_url(serialized),
        "message": "Reservation created successfully",
    }


def get_all_reservations(
    status: Optional[str] = None,
    search: Optional[str] = None,
    date_preset: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> dict[str, Any]:
    """
    List orders (newest first) with status, text search, and date filters.
    """
    query: dict[str, Any] = {}

    if status:
        query["status"] = {"$in": _status_query_values(status)}

    query.update(_date_range_filter(date_preset, date_from, date_to))

    if search is not None:
        search = search.strip()
    if search:
        safe = re.escape(search)
        query["$or"] = [
            {"reservation_number": {"$regex": safe, "$options": "i"}},
            {"customer.name": {"$regex": safe, "$options": "i"}},
            {"customer.phone": {"$regex": safe, "$options": "i"}},
        ]

    total = collection.count_documents(query)
    skip = (page - 1) * limit

    cursor = (
        collection.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    reservations = [serialize(doc) for doc in cursor]
    total_pages = ceil(total / limit) if total > 0 else 0

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1 and total > 0,
        "reservations": reservations,
    }


def get_reservation(reservation_id: str) -> Optional[dict]:
    """Lookup by Mongo ObjectId or reservation_number (e.g. MB-20260721-0005)."""
    document = None

    try:
        object_id = ObjectId(reservation_id)
        document = collection.find_one({"_id": object_id})
    except (InvalidId, TypeError):
        document = None

    if not document:
        document = collection.find_one({"reservation_number": reservation_id})

    if not document:
        return None

    return serialize(document)


def update_reservation(reservation_id: str, data: dict) -> dict:
    """Partial update of customer / items / pickup / notes / whatsapp_sent."""
    existing = get_reservation(reservation_id)
    if not existing:
        raise ValueError("Reservation not found")

    if existing["status"] in {"Collected", "Cancelled"}:
        raise ValueError(
            f"Cannot edit a reservation with status '{existing['status']}'"
        )

    payload: dict[str, Any] = {}

    if "customer" in data and data["customer"] is not None:
        payload["customer"] = {
            "name": data["customer"]["name"].strip(),
            "phone": data["customer"]["phone"].strip(),
        }

    if "items" in data and data["items"] is not None:
        items = _build_line_items(data["items"])
        total_items, total_amount = _totals(items)
        if total_amount < MIN_RESERVATION_AMOUNT:
            raise ValueError(
                f"Minimum reservation amount is ₹{MIN_RESERVATION_AMOUNT}"
            )
        payload["items"] = items
        payload["total_items"] = total_items
        payload["total_amount"] = total_amount

    if "pickup_date" in data and data["pickup_date"] is not None:
        pickup_date = data["pickup_date"]
        payload["pickup_date"] = (
            pickup_date.isoformat()
            if isinstance(pickup_date, date)
            else pickup_date
        )

    if "pickup_time" in data and data["pickup_time"] is not None:
        payload["pickup_time"] = data["pickup_time"].strip()

    if "notes" in data and data["notes"] is not None:
        payload["notes"] = data["notes"].strip()

    if "whatsapp_sent" in data and data["whatsapp_sent"] is not None:
        payload["whatsapp_sent"] = bool(data["whatsapp_sent"])

    if not payload:
        return existing

    payload["updated_at"] = datetime.utcnow()

    collection.update_one(
        {"_id": ObjectId(existing["_id"])},
        {"$set": payload},
    )

    updated = get_reservation(existing["_id"])
    assert updated is not None
    return updated


def update_reservation_status(reservation_id: str, status: str) -> dict:
    """Update workflow status and append to status_history."""
    status = normalize_status(status)
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {status}")

    existing = get_reservation(reservation_id)
    if not existing:
        raise ValueError("Reservation not found")

    if existing["status"] == status:
        return existing

    now = datetime.utcnow()
    collection.update_one(
        {"_id": ObjectId(existing["_id"])},
        {
            "$set": {
                "status": status,
                "updated_at": now,
            },
            "$push": {
                "status_history": _history_entry(status, now),
            },
        },
    )

    updated = get_reservation(existing["_id"])
    assert updated is not None
    return updated


def cancel_reservation(reservation_id: str) -> dict:
    """
    Soft-cancel: keep the record for history/analytics, mark as Cancelled.

    Hard deletes would lose daily counts and customer history.
    """
    existing = get_reservation(reservation_id)
    if not existing:
        raise ValueError("Reservation not found")

    if existing["status"] == "Collected":
        raise ValueError("Collected reservations cannot be cancelled")

    if existing["status"] == "Cancelled":
        return existing

    return update_reservation_status(reservation_id, "Cancelled")

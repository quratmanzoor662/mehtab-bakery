from datetime import datetime
from typing import Any, Optional

from app.core.database import db

collection = db["settings"]

# Singleton document key — the bakery only ever has one settings record.
SETTINGS_DOC_ID = "bakery_settings"

DEFAULT_SETTINGS: dict[str, Any] = {
    "_id": SETTINGS_DOC_ID,
    "shop_open": True,
    "business_hours": {
        "open": "05:00",
        "close": "19:00",
    },
    "friday_break": {
        "start": "12:30",
        "end": "14:30",
    },
    "today_message": "Fresh Girda Available",
    "phone_number": "9320630345",
    "whatsapp_number": "9320630345",
    "address": "Near Qadeem Jamia Masjid, Wavoora Lolab, Kupwara, Kashmir",
    "google_maps_url": "",
    "instagram": "",
    "facebook": "",
    # Temporary closure (Eid, snowfall, etc.)
    "temporary_closed": False,
    "closure_reason": "",
    "closure_message": "",
    "allow_future_orders": True,
    "reopen_date": None,
}

# Keys that may be explicitly set to null to clear them.
NULLABLE_FIELDS = {"reopen_date"}


def serialize(settings: dict) -> dict:
    """Return settings without the internal singleton _id."""
    data = dict(settings)
    data.pop("_id", None)

    # Normalize reopen_date for JSON clients.
    reopen = data.get("reopen_date")
    if isinstance(reopen, datetime):
        data["reopen_date"] = reopen.isoformat()

    # Ensure closure fields always exist for older documents.
    data.setdefault("temporary_closed", False)
    data.setdefault("closure_reason", "")
    data.setdefault("closure_message", "")
    data.setdefault("allow_future_orders", True)
    data.setdefault("reopen_date", None)
    return data


def _ensure_settings_document() -> dict:
    """
    Guarantee exactly one settings document exists.

    On first request, seed MongoDB with bakery defaults.
    """
    existing = collection.find_one({"_id": SETTINGS_DOC_ID})
    if existing:
        return existing

    seed = dict(DEFAULT_SETTINGS)
    now = datetime.utcnow()
    seed["created_at"] = now
    seed["updated_at"] = now
    collection.insert_one(seed)
    return seed


def _parse_reopen_date(value: Any) -> Optional[datetime]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if not text:
        return None
    # Accept "2026-06-29T08:00:00" or with Z / offset.
    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).replace(
            tzinfo=None
        )
    except ValueError as exc:
        raise ValueError("reopen_date must be an ISO datetime") from exc


def _maybe_auto_reopen(document: dict) -> dict:
    """
    If temporary_closed and reopen_date has passed, clear the closure.

    Persists the reopen so the admin panel stays in sync.
    """
    if not document.get("temporary_closed"):
        return document

    reopen = document.get("reopen_date")
    if isinstance(reopen, str):
        try:
            reopen = _parse_reopen_date(reopen)
        except ValueError:
            return document

    if not isinstance(reopen, datetime):
        return document

    if datetime.utcnow() < reopen:
        return document

    now = datetime.utcnow()
    cleared = {
        "temporary_closed": False,
        "closure_reason": "",
        "closure_message": "",
        "reopen_date": None,
        "updated_at": now,
    }
    collection.update_one({"_id": SETTINGS_DOC_ID}, {"$set": cleared})
    document.update(cleared)
    return document


def get_settings() -> dict:
    """Fetch bakery settings (create defaults if missing; auto-reopen if due)."""
    document = _ensure_settings_document()
    document = _maybe_auto_reopen(document)
    return serialize(document)


def update_settings(data: dict) -> dict:
    """
    Partially update bakery settings.

    Nested objects (business_hours, friday_break) are replaced as a whole
    when provided. `reopen_date` may be explicitly null to clear it.
    """
    payload: dict[str, Any] = {}
    for key, value in data.items():
        if value is None and key not in NULLABLE_FIELDS:
            continue
        payload[key] = value

    if "reopen_date" in payload:
        payload["reopen_date"] = _parse_reopen_date(payload["reopen_date"])

    if not payload:
        return get_settings()

    payload["updated_at"] = datetime.utcnow()

    _ensure_settings_document()

    collection.update_one(
        {"_id": SETTINGS_DOC_ID},
        {"$set": payload},
    )

    return get_settings()

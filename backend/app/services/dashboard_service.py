from datetime import datetime
from typing import Any

from app.core.database import db

reservations = db["reservations"]
products = db["products"]

# How many rows the dashboard "Recent Orders" table shows.
RECENT_ORDERS_LIMIT = 5


def _start_of_today_utc() -> datetime:
    """Midnight UTC for 'today' metrics (matches reservation_number date)."""
    now = datetime.utcnow()
    return datetime(now.year, now.month, now.day)


def _recent_orders(limit: int = RECENT_ORDERS_LIMIT) -> list[dict[str, Any]]:
    """Newest reservations, shaped for a compact dashboard table."""
    cursor = (
        reservations.find(
            {},
            {
                "reservation_number": 1,
                "customer.name": 1,
                "customer.phone": 1,
                "status": 1,
                "total_amount": 1,
                "pickup_date": 1,
                "pickup_time": 1,
            },
        )
        .sort("created_at", -1)
        .limit(limit)
    )

    rows: list[dict[str, Any]] = []
    for doc in cursor:
        customer = doc.get("customer") or {}
        status = doc.get("status", "")
        if status == "Ready for Pickup":
            status = "Ready"
        rows.append(
            {
                "id": str(doc["_id"]),
                "reservation_number": doc.get("reservation_number", ""),
                "customer": customer.get("name", ""),
                "phone": customer.get("phone", ""),
                "status": status,
                "total_amount": int(doc.get("total_amount", 0)),
                "pickup_date": doc.get("pickup_date", ""),
                "pickup_time": doc.get("pickup_time", ""),
            }
        )
    return rows


def get_dashboard_stats() -> dict[str, Any]:
    """
    Aggregate admin dashboard cards + recent orders in one response.

    Avoids extra frontend round-trips for summary cards and the recent table.
    """
    today_start = _start_of_today_utc()

    # --- Today's reservation metrics ---
    today_filter = {"created_at": {"$gte": today_start}}
    today_orders = reservations.count_documents(today_filter)

    # Revenue excludes cancelled orders so cancelled carts don't inflate sales.
    revenue_docs = reservations.find(
        {
            **today_filter,
            "status": {"$ne": "Cancelled"},
        },
        {"total_amount": 1},
    )
    today_revenue = sum(int(doc.get("total_amount", 0)) for doc in revenue_docs)

    # --- Live status pipeline ---
    pending_orders = reservations.count_documents({"status": "Pending"})
    confirmed_orders = reservations.count_documents({"status": "Confirmed"})
    preparing_orders = reservations.count_documents({"status": "Preparing"})
    ready_orders = reservations.count_documents(
        {"status": {"$in": ["Ready", "Ready for Pickup"]}}
    )
    collected_orders = reservations.count_documents({"status": "Collected"})
    cancelled_orders = reservations.count_documents({"status": "Cancelled"})

    # --- Product stock board ---
    total_products = products.count_documents({})
    available_products = products.count_documents(
        {"available": True, "stock": {"$gt": 0}}
    )
    sold_out_products = products.count_documents(
        {
            "$or": [
                {"available": False},
                {"stock": {"$lte": 0}},
            ]
        }
    )

    return {
        "summary": {
            "date": today_start.strftime("%Y-%m-%d"),
            "today_orders": today_orders,
            "today_revenue": today_revenue,
            "pending_orders": pending_orders,
            "confirmed_orders": confirmed_orders,
            "preparing_orders": preparing_orders,
            "ready_orders": ready_orders,
            "collected_orders": collected_orders,
            "cancelled_orders": cancelled_orders,
            "products": total_products,
            "available_products": available_products,
            "sold_out_products": sold_out_products,
        },
        "recent_orders": _recent_orders(),
    }

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentAdmin
from app.schemas.reservation import (
    ReservationCreate,
    ReservationStatusUpdate,
    ReservationUpdate,
)
from app.services.reservation_service import (
    VALID_STATUSES,
    cancel_reservation,
    create_reservation,
    get_all_reservations,
    get_reservation,
    update_reservation,
    update_reservation_status,
)

router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"],
)


@router.post("/")
def add_reservation(payload: ReservationCreate):
    """
    Public — customer creates a reservation and gets a WhatsApp deep link.
    """
    try:
        return create_reservation(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/")
def list_reservations(
    _admin: CurrentAdmin,
    status: Optional[str] = Query(
        None,
        description=f"Filter by status: {', '.join(sorted(VALID_STATUSES))}",
    ),
    search: Optional[str] = Query(
        None,
        description="Search order number, customer name, or phone",
    ),
    date: Optional[str] = Query(
        None,
        description="Date preset: today | yesterday | week | custom | all",
    ),
    date_from: Optional[str] = Query(
        None,
        description="Custom range start (YYYY-MM-DD)",
    ),
    date_to: Optional[str] = Query(
        None,
        description="Custom range end (YYYY-MM-DD)",
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Admin — list orders with filters (newest first)."""
    try:
        return get_all_reservations(
            status=status,
            search=search,
            date_preset=date,
            date_from=date_from,
            date_to=date_to,
            page=page,
            limit=limit,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{reservation_id}")
def reservation_details(reservation_id: str, _admin: CurrentAdmin):
    """Admin — order details by Mongo id or reservation_number."""
    reservation = get_reservation(reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.put("/{reservation_id}")
def edit_reservation(
    reservation_id: str,
    payload: ReservationUpdate,
    _admin: CurrentAdmin,
):
    """Admin — update customer details, items, pickup, or whatsapp_sent."""
    try:
        return update_reservation(
            reservation_id,
            payload.model_dump(exclude_none=True),
        )
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if detail == "Reservation not found" else 400
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.patch("/{reservation_id}/status")
def change_status(
    reservation_id: str,
    payload: ReservationStatusUpdate,
    _admin: CurrentAdmin,
):
    """Admin — update workflow status (appends status_history)."""
    try:
        return update_reservation_status(reservation_id, payload.status)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if detail == "Reservation not found" else 400
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.delete("/{reservation_id}")
def remove_reservation(reservation_id: str, _admin: CurrentAdmin):
    """Admin — soft-cancel reservation (status → Cancelled)."""
    try:
        return cancel_reservation(reservation_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = 404 if detail == "Reservation not found" else 400
        raise HTTPException(status_code=status_code, detail=detail) from exc

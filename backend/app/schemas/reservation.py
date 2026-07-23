from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


ReservationStatus = Literal[
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Collected",
    "Cancelled",
    # Legacy alias still accepted on write (normalized to Ready)
    "Ready for Pickup",
]


class CustomerInfo(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)


class ReservationItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)


class ReservationItem(BaseModel):
    product_id: str
    name: str
    price: int
    quantity: int


class ReservationCreate(BaseModel):
    customer: CustomerInfo
    items: List[ReservationItemCreate] = Field(..., min_length=1)
    pickup_date: date
    pickup_time: str = Field(..., min_length=1)
    notes: Optional[str] = None


class ReservationUpdate(BaseModel):
    """Partial update for customer details, pickup, notes, or items."""

    customer: Optional[CustomerInfo] = None
    items: Optional[List[ReservationItemCreate]] = None
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
    notes: Optional[str] = None
    whatsapp_sent: Optional[bool] = None


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus

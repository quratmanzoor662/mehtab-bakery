from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BusinessHours(BaseModel):
    open: str = Field(..., examples=["05:00"])
    close: str = Field(..., examples=["19:00"])


class FridayBreak(BaseModel):
    start: str = Field(..., examples=["12:30"])
    end: str = Field(..., examples=["14:30"])


class SettingsUpdate(BaseModel):
    """Partial update — only send fields you want to change."""

    shop_open: Optional[bool] = None
    business_hours: Optional[BusinessHours] = None
    friday_break: Optional[FridayBreak] = None
    today_message: Optional[str] = None
    phone_number: Optional[str] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None

    temporary_closed: Optional[bool] = None
    closure_reason: Optional[str] = None
    closure_message: Optional[str] = None
    allow_future_orders: Optional[bool] = None
    reopen_date: Optional[datetime] = None


class SettingsResponse(BaseModel):
    shop_open: bool
    business_hours: BusinessHours
    friday_break: FridayBreak
    today_message: str
    phone_number: str
    whatsapp_number: str
    address: str
    google_maps_url: str
    instagram: str
    facebook: str

    temporary_closed: bool = False
    closure_reason: str = ""
    closure_message: str = ""
    allow_future_orders: bool = True
    reopen_date: Optional[datetime] = None

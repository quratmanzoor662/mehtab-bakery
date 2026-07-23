from fastapi import APIRouter

from app.api.deps import CurrentAdmin
from app.schemas.settings import SettingsUpdate
from app.services.settings_service import get_settings, update_settings

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)


@router.get("/")
def read_settings():
    """
    Public — bakery settings for the website.

    Frontend should call this once on load for shop status, hours,
    contact info, today's message, and social links.
    """
    return get_settings()


@router.put("/")
def edit_settings(payload: SettingsUpdate, _admin: CurrentAdmin):
    """Admin — update bakery settings (partial allowed)."""
    # exclude_unset keeps explicit null for reopen_date clearable.
    return update_settings(payload.model_dump(exclude_unset=True))

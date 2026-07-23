from fastapi import APIRouter

from app.api.deps import CurrentAdmin
from app.services.dashboard_service import get_dashboard_stats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard(_admin: CurrentAdmin):
    """
    Admin — single endpoint for dashboard cards + recent orders.
    """
    return get_dashboard_stats()

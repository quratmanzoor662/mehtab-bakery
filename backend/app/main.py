from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import db
from app.services.admin_service import ensure_default_admin
from app.services.upload_service import ensure_upload_dirs
from app.services.product_service import repair_legacy_string_ids
from app.api.routes.products import router as product_router
from app.api.routes.settings import router as settings_router
from app.api.routes.reservations import router as reservation_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.auth import router as auth_router
from app.api.routes.upload import router as upload_router

# backend/uploads — absolute so StaticFiles works regardless of cwd
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Seed the default admin account on startup (no-op if one exists).
    ensure_default_admin()
    ensure_upload_dirs()
    # Fix early products that used placeholder string ids like "...".
    repair_legacy_string_ids()
    yield


app = FastAPI(title="Mehtab Bakery API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(product_router)
app.include_router(settings_router)
app.include_router(reservation_router)
app.include_router(dashboard_router)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads",
)


@app.get("/")
def home():
    return {
        "message": "Backend Running",
        "collections": db.list_collection_names(),
    }

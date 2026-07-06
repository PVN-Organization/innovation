from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chatbot import router as chatbot_router
from app.api.v1.initiatives import router as initiatives_router
from app.core.config import settings
from app.core.database import engine
from app.core.logging import setup_logging
from app.services.minio_service import minio_service

# ── Lifespan (startup / shutdown) ──────────────────────────────────


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Async lifespan manager — replaces deprecated on_event hooks."""
    setup_logging()
    logger.info("{} starting up", settings.PROJECT_NAME)

    logger.info("Database schema managed by Alembic — run 'alembic upgrade head'")

    await minio_service.ensure_bucket_exists(settings.MINIO_BUCKET_NAME)
    logger.info("MinIO bucket '{}' verified", settings.MINIO_BUCKET_NAME)

    yield

    await engine.dispose()
    logger.info("{} shut down", settings.PROJECT_NAME)


# ── Application factory ───────────────────────────────────────────

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="API backend for Petrovietnam Innovation Portal",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route mounting ─────────────────────────────────────────────────

app.include_router(auth_router, prefix="/api/v1")
app.include_router(initiatives_router, prefix="/api/v1")
app.include_router(chatbot_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Liveness probe for container orchestrators."""
    return {"status": "ok"}

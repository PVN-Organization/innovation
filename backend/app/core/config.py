from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Project ───────────────────────────────────────────
    PROJECT_NAME: str = "Cổng Thông Tin Sáng Kiến Công Đoàn Petrovietnam"
    DEBUG: bool = False

    # ── PostgreSQL (async driver) ─────────────────────────
    POSTGRES_ASYNC_URL: str = (
        "postgresql+psycopg://user:password@localhost:5432/innovation_db"
    )

    # ── MinIO / S3 Object Storage ─────────────────────────
    MINIO_ENDPOINT: str = "http://localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "innovations"

    # ── Azure AD SSO ──────────────────────────────────────
    AZURE_AD_CLIENT_ID: str = ""
    AZURE_AD_TENANT_ID: str = ""
    AZURE_AD_CLIENT_SECRET: str = ""

    # ── Security ──────────────────────────────────────────
    SECRET_KEY: str = "change-me-to-a-random-secret"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:10003",
        "http://localhost:3000",
    ]
    FRONTEND_URL: str = "http://localhost:10003"
    COOKIE_SECURE: bool = False


settings = Settings()

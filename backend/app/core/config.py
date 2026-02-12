from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/constructora_dev"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-32"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Sentry
    SENTRY_DSN: Optional[str] = None

    # App
    APP_NAME: str = "Constructora Pro"
    DEBUG: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()

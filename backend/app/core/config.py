from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Base de datos - Railway provee DATABASE_URL automáticamente
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/constructora_dev"

    # Redis - Railway provee REDIS_URL si agregas el servicio Redis
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
    DEBUG: bool = False  # False por defecto para producción

    # CORS - dominios permitidos separados por coma
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"

    # Frontend URL para Railway
    FRONTEND_URL: Optional[str] = None

    model_config = {"env_file": ".env", "extra": "ignore"}

    def get_cors_origins(self) -> list[str]:
        """Retorna lista de orígenes CORS permitidos"""
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
        return origins


settings = Settings()

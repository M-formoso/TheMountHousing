import enum
from sqlalchemy import Column, String, Boolean, DateTime
from app.models.base import BaseModel


class Rol(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMINISTRADOR = "administrador"
    GERENTE_PROYECTO = "gerente_proyecto"
    SUPERVISOR_OBRA = "supervisor_obra"
    CONTADOR = "contador"
    COMPRAS = "compras"
    CLIENTE = "cliente"


class Usuario(BaseModel):
    __tablename__ = "usuarios"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=True)
    telefono = Column(String(20), nullable=True)
    rol = Column(String(30), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    ultimo_acceso = Column(DateTime, nullable=True)

    # Campos de autenticación (pendientes de migración)
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String(100), nullable=True)
    refresh_token = Column(String(500), nullable=True)
    reset_token = Column(String(100), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    @property
    def apellido(self):
        """Compatibilidad: retorna apellido_paterno o combinación"""
        if self.apellido_materno:
            return f"{self.apellido_paterno} {self.apellido_materno}"
        return self.apellido_paterno

    @property
    def last_login(self):
        """Alias para ultimo_acceso"""
        return self.ultimo_acceso

    @last_login.setter
    def last_login(self, value):
        """Alias para ultimo_acceso"""
        self.ultimo_acceso = value

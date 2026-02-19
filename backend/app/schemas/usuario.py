from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models.usuario import Rol


class UsuarioCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nombre: str = Field(..., min_length=1, max_length=255)
    apellido_paterno: str = Field(..., min_length=1, max_length=100)
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None  # String para compatibilidad con la DB


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UsuarioResponse(BaseModel):
    id: str
    email: str
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None  # String para compatibilidad
    is_2fa_enabled: bool = False
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

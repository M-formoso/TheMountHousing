# Skill: Autenticación y Seguridad - JWT + RBAC

## Roles del Sistema

```python
# app/models/usuario.py
import enum

class Rol(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMINISTRADOR = "administrador"
    GERENTE_PROYECTO = "gerente_proyecto"
    SUPERVISOR_OBRA = "supervisor_obra"
    CONTADOR = "contador"
    COMPRAS = "compras"
    CLIENTE = "cliente"
```

## Modelo Usuario

```python
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum
from app.models.base import BaseModel


class Usuario(BaseModel):
    __tablename__ = "usuarios"

    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)
    rol = Column(SAEnum(Rol), nullable=False, default=Rol.CLIENTE)

    # 2FA
    totp_secret = Column(String(64), nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)

    # Tokens
    refresh_token = Column(String(512), nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Reset password
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
```

## Security - Hashing y JWT

```python
# app/core/security.py
from passlib.context import CryptContext
from python_jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

## Dependencies de Auth

```python
# app/core/deps.py
from fastapi import Depends, HTTPException, Cookie, status
from sqlalchemy.orm import Session
from python_jose import JWTError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.usuario import Usuario, Rol


async def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = decode_token(access_token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    user = db.query(Usuario).filter(Usuario.id == user_id, Usuario.activo == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_role(roles: list[Rol]):
    """Dependency factory para verificar rol."""
    async def _require_role(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in roles:
            raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
        return current_user
    return _require_role
```

## Endpoints de Auth

```python
# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token
)
from app.core.deps import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, LoginRequest, LoginResponse, UsuarioResponse
from uuid import uuid4

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UsuarioResponse, status_code=201)
async def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = Usuario(
        id=str(uuid4()),
        email=data.email,
        hashed_password=get_password_hash(data.password),
        nombre=data.nombre,
        apellido=data.apellido,
        rol=data.rol,  # Validar que solo admin pueda asignar roles
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
async def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(
        Usuario.email == data.email, Usuario.activo == True
    ).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    # Si 2FA activado, retornar flag
    if user.is_2fa_enabled:
        return {"requires_2fa": True, "user_id": user.id}

    # Generar tokens
    access_token = create_access_token({"sub": user.id, "rol": user.rol.value})
    refresh_token = create_refresh_token({"sub": user.id})

    # Guardar refresh token en DB
    user.refresh_token = refresh_token
    db.commit()

    # Setear cookies httpOnly
    response.set_cookie(
        key="access_token", value=access_token,
        httponly=True, samesite="lax", max_age=900  # 15 min
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token,
        httponly=True, samesite="lax", max_age=604800  # 7 días
    )
    return {"message": "Login exitoso", "rol": user.rol.value, "nombre": user.nombre}


@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),  # Cookie(alias="refresh_token")
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Token expirado")

    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Token inválido")

    new_access = create_access_token({"sub": user.id, "rol": user.rol.value})
    response.set_cookie(key="access_token", value=new_access, httponly=True, samesite="lax", max_age=900)
    return {"message": "Token renovado"}


@router.post("/logout")
async def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    current_user.refresh_token = None
    db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UsuarioResponse)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
async def forgot_password(data: dict, db: Session = Depends(get_db)):
    # Generar token de reset, enviar email
    pass


@router.post("/reset-password")
async def reset_password(data: dict, db: Session = Depends(get_db)):
    # Validar token, cambiar contraseña
    pass


@router.put("/change-password")
async def change_password(
    data: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not verify_password(data["current_password"], current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    current_user.hashed_password = get_password_hash(data["new_password"])
    db.commit()
    return {"message": "Contraseña actualizada"}
```

## 2FA con TOTP

```python
# Generar secret TOTP
import pyotp
secret = pyotp.random_base32()
# Guardar en usuario.totp_secret

# Generar URI para QR code
totp = pyotp.TOTP(user.totp_secret)
uri = totp.provisioning_uri(name=user.email, issuer_name="Constructora Pro")

# Verificar código
totp = pyotp.TOTP(user.totp_secret)
is_valid = totp.verify(code)  # code es el código de 6 dígitos
```

## Permisos por Rol (referencia rápida)
| Acción | Roles permitidos |
|--------|-----------------|
| Crear/editar proyectos | SuperAdmin, Administrador, GerenteProy |
| Ver proyectos | Todos (filtrado por acceso) |
| Crear cotizaciones | SuperAdmin, Administrador, GerenteProy |
| Gestión financiera | SuperAdmin, Administrador, Contador |
| Gestión materiales/compras | SuperAdmin, Administrador, Compras |
| Ver propio proyecto (cliente) | Cliente (solo sus proyectos) |
| Configuración del sistema | SuperAdmin |

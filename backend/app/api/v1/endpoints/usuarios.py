from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.models.usuario import Usuario, Rol
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.core.security import get_password_hash

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=List[UsuarioResponse])
async def list_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todos los usuarios (solo admin)"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver usuarios")

    usuarios = db.query(Usuario).filter(Usuario.activo.is_(True)).order_by(Usuario.created_at.desc()).all()
    return usuarios


@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene un usuario por ID"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permisos")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def create_usuario(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea un nuevo usuario (solo admin)"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear usuarios")

    # Verificar email único
    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    from uuid import uuid4
    from datetime import datetime

    usuario = Usuario(
        id=str(uuid4()),
        email=data.email,
        hashed_password=get_password_hash(data.password),
        nombre=data.nombre,
        apellido_paterno=data.apellido_paterno,
        apellido_materno=data.apellido_materno or "",
        telefono=data.telefono,
        rol=data.rol or Rol.CLIENTE.value,
        activo=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: str,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza un usuario"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permisos")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    from datetime import datetime

    # Actualizar campos
    if data.nombre is not None:
        usuario.nombre = data.nombre
    if data.apellido_paterno is not None:
        usuario.apellido_paterno = data.apellido_paterno
    if data.apellido_materno is not None:
        usuario.apellido_materno = data.apellido_materno
    if data.telefono is not None:
        usuario.telefono = data.telefono
    if data.rol is not None:
        usuario.rol = data.rol
    if data.email is not None:
        # Verificar email único
        existing = db.query(Usuario).filter(Usuario.email == data.email, Usuario.id != usuario_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        usuario.email = data.email
    if data.password is not None and data.password:
        usuario.hashed_password = get_password_hash(data.password)

    usuario.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}")
async def delete_usuario(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina (soft delete) un usuario"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permisos")

    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = False
    db.commit()
    return {"message": "Usuario eliminado"}

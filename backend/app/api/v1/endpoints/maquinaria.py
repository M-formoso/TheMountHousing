from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.maquinaria import (
    MaquinariaCreate, MaquinariaUpdate, MaquinariaResponse, MaquinariaListResponse,
    MantenimientoCreate, MantenimientoResponse,
)
from app.services.maquinaria_service import MaquinariaService

router = APIRouter(prefix="/maquinaria", tags=["maquinaria"])


@router.get("", response_model=MaquinariaListResponse)
async def listar_maquinaria(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    tipo: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaquinariaService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, tipo=tipo, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=MaquinariaResponse, status_code=status.HTTP_201_CREATED)
async def crear_maquinaria(
    data: MaquinariaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = MaquinariaService(db)
    return service.crear(data)


@router.get("/{id}", response_model=MaquinariaResponse)
async def obtener_maquinaria(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaquinariaService(db)
    maq = service.obtener(id)
    if not maq:
        raise HTTPException(status_code=404, detail="Maquinaria no encontrada")
    return maq


@router.put("/{id}", response_model=MaquinariaResponse)
async def actualizar_maquinaria(
    id: str,
    data: MaquinariaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.SUPERVISOR_OBRA])),
):
    service = MaquinariaService(db)
    maq = service.actualizar(id, data)
    if not maq:
        raise HTTPException(status_code=404, detail="Maquinaria no encontrada")
    return maq


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_maquinaria(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = MaquinariaService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Maquinaria no encontrada")


# --- Mantenimientos ---
@router.post("/{id}/mantenimientos", response_model=MantenimientoResponse, status_code=status.HTTP_201_CREATED)
async def crear_mantenimiento(
    id: str,
    data: MantenimientoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.SUPERVISOR_OBRA])),
):
    service = MaquinariaService(db)
    mant = service.crear_mantenimiento(id, data)
    if not mant:
        raise HTTPException(status_code=404, detail="Maquinaria no encontrada")
    return mant


@router.get("/{id}/mantenimientos", response_model=list[MantenimientoResponse])
async def listar_mantenimientos(
    id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaquinariaService(db)
    items, _ = service.listar_mantenimientos(id, skip=skip, limit=limit)
    return items

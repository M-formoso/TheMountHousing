from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.unidad import UnidadCreate, UnidadUpdate, UnidadResponse, AsignarClienteRequest
from app.services.unidad_service import UnidadService

router = APIRouter(prefix="/unidades", tags=["unidades"])


@router.get("", response_model=List[UnidadResponse])
def get_unidades(
    skip: int = 0,
    limit: int = 100,
    proyecto_id: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene todas las unidades con filtros opcionales"""
    service = UnidadService(db)

    # Si es cliente, solo puede ver sus unidades
    if current_user.rol == "CLIENTE":
        return service.get_by_cliente(current_user.id)

    unidades = service.get_all(skip=skip, limit=limit, proyecto_id=proyecto_id)

    if estado:
        unidades = [u for u in unidades if u.estado == estado]

    return unidades


@router.get("/disponibles", response_model=List[UnidadResponse])
def get_unidades_disponibles(
    proyecto_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene solo unidades disponibles"""
    service = UnidadService(db)
    return service.get_disponibles(proyecto_id=proyecto_id)


@router.get("/{unidad_id}", response_model=UnidadResponse)
def get_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene una unidad por ID"""
    service = UnidadService(db)
    unidad = service.get_by_id(unidad_id)

    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    # Si es cliente, solo puede ver sus propias unidades
    if current_user.rol == "CLIENTE" and unidad.cliente_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta unidad")

    return unidad


@router.post("", response_model=UnidadResponse, status_code=status.HTTP_201_CREATED)
def create_unidad(
    data: UnidadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea una nueva unidad"""
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR", "GERENTE_PROYECTO"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para crear unidades")

    service = UnidadService(db)
    return service.create(data)


@router.put("/{unidad_id}", response_model=UnidadResponse)
def update_unidad(
    unidad_id: str,
    data: UnidadUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza una unidad"""
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR", "GERENTE_PROYECTO"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar unidades")

    service = UnidadService(db)
    unidad = service.update(unidad_id, data)

    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    return unidad


@router.delete("/{unidad_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina una unidad (soft delete)"""
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar unidades")

    service = UnidadService(db)
    if not service.delete(unidad_id):
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    return None


@router.post("/{unidad_id}/asignar-cliente", response_model=UnidadResponse)
def asignar_cliente_a_unidad(
    unidad_id: str,
    data: AsignarClienteRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Asigna un cliente a una unidad (venta)"""
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR", "GERENTE_PROYECTO"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para asignar unidades")

    service = UnidadService(db)
    unidad = service.asignar_cliente(unidad_id, data.cliente_id)

    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    return unidad


@router.post("/{unidad_id}/liberar", response_model=UnidadResponse)
def liberar_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Libera una unidad (cancelar venta)"""
    if current_user.rol not in ["SUPER_ADMIN", "ADMINISTRADOR"]:
        raise HTTPException(status_code=403, detail="No tienes permiso para liberar unidades")

    service = UnidadService(db)
    unidad = service.liberar_unidad(unidad_id)

    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    return unidad

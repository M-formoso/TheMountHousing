from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.material import (
    MaterialCreate, MaterialUpdate, MaterialResponse, MaterialListResponse,
    MovimientoCreate, MovimientoResponse,
    SolicitudCompraCreate, SolicitudCompraUpdate, SolicitudCompraResponse, SolicitudCompraListResponse,
    OrdenCompraCreate, OrdenCompraUpdate, OrdenCompraResponse, OrdenCompraListResponse,
)
from app.services.material_service import MaterialService

router = APIRouter(prefix="/materiales", tags=["materiales"])


# --- Materiales CRUD ---
@router.get("", response_model=MaterialListResponse)
async def listar_materiales(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    categoria: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, categoria=categoria)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def crear_material(
    data: MaterialCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = MaterialService(db)
    return service.crear(data)


@router.get("/{id}", response_model=MaterialResponse)
async def obtener_material(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    material = service.obtener(id)
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    return material


@router.put("/{id}", response_model=MaterialResponse)
async def actualizar_material(
    id: str,
    data: MaterialUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = MaterialService(db)
    material = service.actualizar(id, data)
    if not material:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    return material


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_material(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = MaterialService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Material no encontrado")


# --- Movimientos de inventario ---
@router.post("/{id}/movimientos", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED)
async def crear_movimiento(
    id: str,
    data: MovimientoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.SUPERVISOR_OBRA, Rol.COMPRAS])),
):
    service = MaterialService(db)
    data.material_id = id
    try:
        return service.crear_movimiento(data, usuario_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{id}/movimientos", response_model=list[MovimientoResponse])
async def listar_movimientos(
    id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    items, _ = service.listar_movimientos(id, skip=skip, limit=limit)
    return items


# --- Solicitudes de compra ---
@router.get("/solicitudes", response_model=SolicitudCompraListResponse)
async def listar_solicitudes(
    skip: int = 0,
    limit: int = 20,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    items, total = service.listar_solicitudes(skip=skip, limit=limit, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/solicitudes", response_model=SolicitudCompraResponse, status_code=status.HTTP_201_CREATED)
async def crear_solicitud(
    data: SolicitudCompraCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.SUPERVISOR_OBRA, Rol.COMPRAS, Rol.GERENTE_PROYECTO])),
):
    service = MaterialService(db)
    return service.crear_solicitud(data, solicitante_id=current_user.id)


@router.get("/solicitudes/{id}", response_model=SolicitudCompraResponse)
async def obtener_solicitud(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    solicitud = service.obtener_solicitud(id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud


@router.put("/solicitudes/{id}", response_model=SolicitudCompraResponse)
async def actualizar_solicitud(
    id: str,
    data: SolicitudCompraUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = MaterialService(db)
    solicitud = service.actualizar_solicitud(id, data)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return solicitud


# --- Órdenes de compra ---
@router.get("/ordenes", response_model=OrdenCompraListResponse)
async def listar_ordenes(
    skip: int = 0,
    limit: int = 20,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    items, total = service.listar_ordenes(skip=skip, limit=limit, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/ordenes", response_model=OrdenCompraResponse, status_code=status.HTTP_201_CREATED)
async def crear_orden(
    data: OrdenCompraCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = MaterialService(db)
    return service.crear_orden(data)


@router.get("/ordenes/{id}", response_model=OrdenCompraResponse)
async def obtener_orden(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = MaterialService(db)
    orden = service.obtener_orden(id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden


@router.put("/ordenes/{id}", response_model=OrdenCompraResponse)
async def actualizar_orden(
    id: str,
    data: OrdenCompraUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = MaterialService(db)
    orden = service.actualizar_orden(id, data)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return orden

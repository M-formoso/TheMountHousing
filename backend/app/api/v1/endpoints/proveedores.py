from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.proveedor import (
    ProveedorCreate, ProveedorUpdate, ProveedorResponse, ProveedorListResponse,
    AccionProveedorCreate, AccionProveedorUpdate, AccionProveedorResponse, AccionProveedorListResponse,
    AdjuntoCreate, AdjuntoResponse
)
from app.services.proveedor_service import ProveedorService, AccionProveedorService

router = APIRouter(prefix="/proveedores", tags=["proveedores"])


# ==================== PROVEEDORES ====================

@router.get("", response_model=ProveedorListResponse)
async def listar_proveedores(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    categoria: str | None = None,
    estado: str | None = None,
    especialidad: str | None = None,
    preferido: bool | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProveedorService(db)
    items, total = service.listar(
        skip=skip,
        limit=limit,
        activo=activo,
        buscar=buscar,
        categoria=categoria,
        estado=estado,
        especialidad=especialidad,
        preferido=preferido,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=ProveedorResponse, status_code=status.HTTP_201_CREATED)
async def crear_proveedor(
    data: ProveedorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = ProveedorService(db)
    return service.crear(data)


@router.get("/{id}", response_model=ProveedorResponse)
async def obtener_proveedor(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProveedorService(db)
    proveedor = service.obtener(id)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


@router.put("/{id}", response_model=ProveedorResponse)
async def actualizar_proveedor(
    id: str,
    data: ProveedorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = ProveedorService(db)
    proveedor = service.actualizar(id, data)
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_proveedor(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ProveedorService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")


# ==================== ACCIONES DE PROVEEDOR ====================

@router.get("/{proveedor_id}/acciones", response_model=AccionProveedorListResponse)
async def listar_acciones(
    proveedor_id: str,
    skip: int = 0,
    limit: int = 50,
    tipo: str | None = None,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccionProveedorService(db)
    items, total = service.listar(proveedor_id=proveedor_id, skip=skip, limit=limit, tipo=tipo, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/{proveedor_id}/acciones", response_model=AccionProveedorResponse, status_code=status.HTTP_201_CREATED)
async def crear_accion(
    proveedor_id: str,
    data: AccionProveedorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    # Verificar que el proveedor existe
    proveedor_service = ProveedorService(db)
    if not proveedor_service.obtener(proveedor_id):
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    service = AccionProveedorService(db)
    return service.crear(proveedor_id, data)


@router.get("/{proveedor_id}/acciones/{accion_id}", response_model=AccionProveedorResponse)
async def obtener_accion(
    proveedor_id: str,
    accion_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccionProveedorService(db)
    accion = service.obtener(accion_id)
    if not accion or accion.proveedor_id != proveedor_id:
        raise HTTPException(status_code=404, detail="Acción no encontrada")
    return accion


@router.put("/{proveedor_id}/acciones/{accion_id}", response_model=AccionProveedorResponse)
async def actualizar_accion(
    proveedor_id: str,
    accion_id: str,
    data: AccionProveedorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = AccionProveedorService(db)
    accion = service.obtener(accion_id)
    if not accion or accion.proveedor_id != proveedor_id:
        raise HTTPException(status_code=404, detail="Acción no encontrada")

    accion = service.actualizar(accion_id, data)
    return accion


@router.delete("/{proveedor_id}/acciones/{accion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_accion(
    proveedor_id: str,
    accion_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = AccionProveedorService(db)
    accion = service.obtener(accion_id)
    if not accion or accion.proveedor_id != proveedor_id:
        raise HTTPException(status_code=404, detail="Acción no encontrada")

    if not service.eliminar(accion_id):
        raise HTTPException(status_code=404, detail="Acción no encontrada")


# ==================== ADJUNTOS DE ACCIONES ====================

@router.post("/{proveedor_id}/acciones/{accion_id}/adjuntos", response_model=AdjuntoResponse, status_code=status.HTTP_201_CREATED)
async def agregar_adjunto(
    proveedor_id: str,
    accion_id: str,
    data: AdjuntoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    accion_service = AccionProveedorService(db)
    accion = accion_service.obtener(accion_id)
    if not accion or accion.proveedor_id != proveedor_id:
        raise HTTPException(status_code=404, detail="Acción no encontrada")

    return accion_service.agregar_adjunto(accion_id, data)


@router.delete("/{proveedor_id}/acciones/{accion_id}/adjuntos/{adjunto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_adjunto(
    proveedor_id: str,
    accion_id: str,
    adjunto_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = AccionProveedorService(db)
    if not service.eliminar_adjunto(adjunto_id):
        raise HTTPException(status_code=404, detail="Adjunto no encontrado")

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.proveedor import ProveedorCreate, ProveedorUpdate, ProveedorResponse, ProveedorListResponse
from app.services.proveedor_service import ProveedorService

router = APIRouter(prefix="/proveedores", tags=["proveedores"])


@router.get("", response_model=ProveedorListResponse)
async def listar_proveedores(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    tipo: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProveedorService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, tipo=tipo)
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

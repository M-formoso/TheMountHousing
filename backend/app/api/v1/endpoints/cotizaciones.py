from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.cotizacion import CotizacionCreate, CotizacionUpdate, CotizacionResponse, CotizacionListResponse
from app.services.cotizacion_service import CotizacionService

router = APIRouter(prefix="/cotizaciones", tags=["cotizaciones"])


@router.get("", response_model=CotizacionListResponse)
async def listar_cotizaciones(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    estado: str | None = None,
    cliente_id: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = CotizacionService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, estado=estado, cliente_id=cliente_id)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=CotizacionResponse, status_code=status.HTTP_201_CREATED)
async def crear_cotizacion(
    data: CotizacionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO])),
):
    service = CotizacionService(db)
    return service.crear(data, usuario_id=current_user.id)


@router.get("/{id}", response_model=CotizacionResponse)
async def obtener_cotizacion(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = CotizacionService(db)
    cotizacion = service.obtener(id)
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return cotizacion


@router.put("/{id}", response_model=CotizacionResponse)
async def actualizar_cotizacion(
    id: str,
    data: CotizacionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO])),
):
    service = CotizacionService(db)
    cotizacion = service.actualizar(id, data)
    if not cotizacion:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    return cotizacion


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cotizacion(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = CotizacionService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

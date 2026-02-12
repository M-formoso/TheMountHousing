from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.subcontratista import SubcontratistaCreate, SubcontratistaUpdate, SubcontratistaResponse, SubcontratistaListResponse
from app.services.subcontratista_service import SubcontratistaService

router = APIRouter(prefix="/subcontratistas", tags=["subcontratistas"])


@router.get("", response_model=SubcontratistaListResponse)
async def listar_subcontratistas(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    especialidad: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = SubcontratistaService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, especialidad=especialidad)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=SubcontratistaResponse, status_code=status.HTTP_201_CREATED)
async def crear_subcontratista(
    data: SubcontratistaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = SubcontratistaService(db)
    return service.crear(data)


@router.get("/{id}", response_model=SubcontratistaResponse)
async def obtener_subcontratista(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = SubcontratistaService(db)
    sub = service.obtener(id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontratista no encontrado")
    return sub


@router.put("/{id}", response_model=SubcontratistaResponse)
async def actualizar_subcontratista(
    id: str,
    data: SubcontratistaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.COMPRAS])),
):
    service = SubcontratistaService(db)
    sub = service.actualizar(id, data)
    if not sub:
        raise HTTPException(status_code=404, detail="Subcontratista no encontrado")
    return sub


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_subcontratista(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = SubcontratistaService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Subcontratista no encontrado")

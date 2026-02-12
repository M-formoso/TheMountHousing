from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.empleado import EmpleadoCreate, EmpleadoUpdate, EmpleadoResponse, EmpleadoListResponse
from app.services.empleado_service import EmpleadoService

router = APIRouter(prefix="/empleados", tags=["empleados"])


@router.get("", response_model=EmpleadoListResponse)
async def listar_empleados(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    departamento: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = EmpleadoService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, departamento=departamento)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=EmpleadoResponse, status_code=status.HTTP_201_CREATED)
async def crear_empleado(
    data: EmpleadoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = EmpleadoService(db)
    return service.crear(data)


@router.get("/{id}", response_model=EmpleadoResponse)
async def obtener_empleado(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = EmpleadoService(db)
    empleado = service.obtener(id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.put("/{id}", response_model=EmpleadoResponse)
async def actualizar_empleado(
    id: str,
    data: EmpleadoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = EmpleadoService(db)
    empleado = service.actualizar(id, data)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_empleado(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = EmpleadoService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

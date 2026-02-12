from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.cliente import (
    ClienteCreate, ClienteUpdate, ClienteResponse, ClienteListResponse,
    ContactoClienteCreate, ContactoClienteResponse,
)
from app.services.cliente_service import ClienteService

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("", response_model=ClienteListResponse)
async def listar_clientes(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    tipo: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ClienteService(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo, buscar=buscar, tipo=tipo)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
async def crear_cliente(
    data: ClienteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ClienteService(db)
    cliente = service.crear(data)
    return cliente


@router.get("/{id}", response_model=ClienteResponse)
async def obtener_cliente(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ClienteService(db)
    cliente = service.obtener(id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.put("/{id}", response_model=ClienteResponse)
async def actualizar_cliente(
    id: str,
    data: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ClienteService(db)
    cliente = service.actualizar(id, data)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cliente(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ClienteService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")


# --- Contactos del cliente ---
@router.post("/{id}/contactos", response_model=ContactoClienteResponse, status_code=status.HTTP_201_CREATED)
async def crear_contacto(
    id: str,
    data: ContactoClienteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ClienteService(db)
    contacto = service.crear_contacto(id, data)
    if not contacto:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return contacto


@router.get("/{id}/contactos", response_model=list[ContactoClienteResponse])
async def listar_contactos(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ClienteService(db)
    cliente = service.obtener(id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return service.listar_contactos(id)


# --- Proyectos del cliente ---
@router.get("/{id}/proyectos")
async def listar_proyectos_cliente(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ClienteService(db)
    cliente = service.obtener(id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    proyectos = cliente.proyectos.filter_by(activo=True).all()
    return {"items": proyectos, "total": len(proyectos)}

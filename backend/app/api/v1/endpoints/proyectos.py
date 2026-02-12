from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.proyecto import (
    ProyectoCreate, ProyectoUpdate, ProyectoResponse, ProyectoListResponse,
    FaseProyectoCreate, FaseProyectoUpdate, FaseProyectoResponse,
    EntradaBitacoraCreate, EntradaBitacoraResponse,
)
from app.services.proyecto_service import ProyectoService

router = APIRouter(prefix="/proyectos", tags=["proyectos"])


@router.get("", response_model=ProyectoListResponse)
async def listar_proyectos(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,
    buscar: str | None = None,
    estado: str | None = None,
    tipo: str | None = None,
    cliente_id: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProyectoService(db)
    items, total = service.listar(
        skip=skip, limit=limit, activo=activo,
        buscar=buscar, estado=estado, tipo=tipo, cliente_id=cliente_id,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=ProyectoResponse, status_code=status.HTTP_201_CREATED)
async def crear_proyecto(
    data: ProyectoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO])),
):
    service = ProyectoService(db)
    proyecto = service.crear(data)
    return proyecto


@router.get("/{id}", response_model=ProyectoResponse)
async def obtener_proyecto(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProyectoService(db)
    proyecto = service.obtener(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.put("/{id}", response_model=ProyectoResponse)
async def actualizar_proyecto(
    id: str,
    data: ProyectoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO])),
):
    service = ProyectoService(db)
    proyecto = service.actualizar(id, data)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_proyecto(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR])),
):
    service = ProyectoService(db)
    if not service.eliminar(id):
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")


# --- Fases del proyecto ---
@router.get("/{id}/fases", response_model=list[FaseProyectoResponse])
async def listar_fases(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProyectoService(db)
    proyecto = service.obtener(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return service.listar_fases(id)


@router.post("/{id}/fases", response_model=FaseProyectoResponse, status_code=status.HTTP_201_CREATED)
async def crear_fase(
    id: str,
    data: FaseProyectoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO])),
):
    service = ProyectoService(db)
    fase = service.crear_fase(id, data)
    if not fase:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return fase


@router.put("/{id}/fases/{fase_id}", response_model=FaseProyectoResponse)
async def actualizar_fase(
    id: str,
    fase_id: str,
    data: FaseProyectoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO, Rol.SUPERVISOR_OBRA])),
):
    service = ProyectoService(db)
    fase = service.actualizar_fase(id, fase_id, data)
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    return fase


# --- Bitácora ---
@router.get("/{id}/bitacora", response_model=list[EntradaBitacoraResponse])
async def listar_bitacora(
    id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProyectoService(db)
    proyecto = service.obtener(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    items, _ = service.listar_bitacora(id, skip=skip, limit=limit)
    return items


@router.post("/{id}/bitacora", response_model=EntradaBitacoraResponse, status_code=status.HTTP_201_CREATED)
async def crear_entrada_bitacora(
    id: str,
    data: EntradaBitacoraCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.GERENTE_PROYECTO, Rol.SUPERVISOR_OBRA])),
):
    service = ProyectoService(db)
    entrada = service.crear_entrada_bitacora(id, data, autor_id=current_user.id)
    if not entrada:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return entrada


# --- Dashboard del proyecto ---
@router.get("/{id}/dashboard")
async def dashboard_proyecto(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = ProyectoService(db)
    proyecto = service.obtener(id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    fases = service.listar_fases(id)
    fases_completadas = [f for f in fases if f.estado == "completada"]
    fases_en_progreso = [f for f in fases if f.estado == "en_progreso"]

    return {
        "proyecto_id": proyecto.id,
        "nombre": proyecto.nombre,
        "codigo": proyecto.codigo,
        "estado": proyecto.estado,
        "progreso_general": proyecto.progreso_general,
        "presupuesto_total": float(proyecto.presupuesto_total),
        "costo_real": float(proyecto.costo_real),
        "varianza_presupuesto": float(proyecto.presupuesto_total) - float(proyecto.costo_real),
        "total_fases": len(fases),
        "fases_completadas": len(fases_completadas),
        "fases_en_progreso": len(fases_en_progreso),
    }

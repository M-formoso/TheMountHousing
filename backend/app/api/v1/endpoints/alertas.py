from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.schemas.alerta import AlertaResponse, AlertaListResponse
from app.services.alerta_service import AlertaService

router = APIRouter(prefix="/alertas", tags=["alertas"])


@router.get("", response_model=AlertaListResponse)
async def listar_alertas(
    skip: int = 0,
    limit: int = 30,
    leida: bool | None = None,
    tipo: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AlertaService(db)
    items, total = service.listar(
        skip=skip, limit=limit,
        usuario_id=current_user.id,
        rol=current_user.rol.value,
        leida=leida, tipo=tipo,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/{id}", response_model=AlertaResponse)
async def obtener_alerta(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AlertaService(db)
    alerta = service.obtener(id)
    if not alerta:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta


@router.put("/{id}/leer", response_model=AlertaResponse)
async def marcar_leida(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AlertaService(db)
    alerta = service.marcar_leida(id)
    if not alerta:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alerta


@router.put("/todas/leer")
async def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AlertaService(db)
    cantidad = service.marcar_todas_leidas(current_user.id)
    return {"cantidad_marcadas": cantidad}


@router.get("/no-leidas/contador")
async def contar_no_leidas(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AlertaService(db)
    total = service.contar_no_leidas(current_user.id, current_user.rol.value)
    return {"total": total}

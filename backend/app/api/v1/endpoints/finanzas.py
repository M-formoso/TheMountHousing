from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.models.usuario import Rol
from app.schemas.finanzas import (
    IngresoCreate, IngresoResponse, IngresoListResponse,
    EgresoCreate, EgresoUpdate, EgresoResponse, EgresoListResponse,
    CuentaCobrarCreate, CuentaCobrarResponse, CuentaCobrarListResponse, PagoCobrarCreate, PagoCobrarResponse,
    CuentaPagearCreate, CuentaPagearResponse, CuentaPagearListResponse, PagoPagearCreate, PagoPagearResponse,
)
from app.services.finanzas_service import FinanzasService

router = APIRouter(prefix="/finanzas", tags=["finanzas"])


# --- Ingresos ---
@router.get("/ingresos", response_model=IngresoListResponse)
async def listar_ingresos(
    skip: int = 0,
    limit: int = 20,
    proyecto_id: str | None = None,
    tipo: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    items, total = service.listar_ingresos(skip=skip, limit=limit, proyecto_id=proyecto_id, tipo=tipo)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/ingresos", response_model=IngresoResponse, status_code=status.HTTP_201_CREATED)
async def crear_ingreso(
    data: IngresoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    return service.crear_ingreso(data, usuario_id=current_user.id)


@router.delete("/ingresos/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_ingreso(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    if not service.eliminar_ingreso(id):
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")


# --- Egresos ---
@router.get("/egresos", response_model=EgresoListResponse)
async def listar_egresos(
    skip: int = 0,
    limit: int = 20,
    proyecto_id: str | None = None,
    categoria: str | None = None,
    estado_pago: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    items, total = service.listar_egresos(skip=skip, limit=limit, proyecto_id=proyecto_id, categoria=categoria, estado_pago=estado_pago)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/egresos", response_model=EgresoResponse, status_code=status.HTTP_201_CREATED)
async def crear_egreso(
    data: EgresoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    return service.crear_egreso(data)


@router.put("/egresos/{id}", response_model=EgresoResponse)
async def actualizar_egreso(
    id: str,
    data: EgresoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    egreso = service.actualizar_egreso(id, data)
    if not egreso:
        raise HTTPException(status_code=404, detail="Egreso no encontrado")
    return egreso


@router.delete("/egresos/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_egreso(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    if not service.eliminar_egreso(id):
        raise HTTPException(status_code=404, detail="Egreso no encontrado")


# --- Cuentas por Cobrar ---
@router.get("/cobrar", response_model=CuentaCobrarListResponse)
async def listar_cuentas_cobrar(
    skip: int = 0,
    limit: int = 20,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    items, total = service.listar_cuentas_cobrar(skip=skip, limit=limit, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/cobrar", response_model=CuentaCobrarResponse, status_code=status.HTTP_201_CREATED)
async def crear_cuenta_cobrar(
    data: CuentaCobrarCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    return service.crear_cuenta_cobrar(data)


@router.get("/cobrar/{id}", response_model=CuentaCobrarResponse)
async def obtener_cuenta_cobrar(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    cuenta = service.obtener_cuenta_cobrar(id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return cuenta


@router.post("/cobrar/{id}/pagos", response_model=PagoCobrarResponse, status_code=status.HTTP_201_CREATED)
async def agregar_pago_cobrar(
    id: str,
    data: PagoCobrarCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    pago = service.agregar_pago_cobrar(id, data)
    if not pago:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return pago


# --- Cuentas por Pagar ---
@router.get("/pagar", response_model=CuentaPagearListResponse)
async def listar_cuentas_pagar(
    skip: int = 0,
    limit: int = 20,
    estado: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    items, total = service.listar_cuentas_pagar(skip=skip, limit=limit, estado=estado)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/pagar", response_model=CuentaPagearResponse, status_code=status.HTTP_201_CREATED)
async def crear_cuenta_pagar(
    data: CuentaPagearCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    return service.crear_cuenta_pagar(data)


@router.get("/pagar/{id}", response_model=CuentaPagearResponse)
async def obtener_cuenta_pagar(
    id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = FinanzasService(db)
    cuenta = service.obtener_cuenta_pagar(id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return cuenta


@router.post("/pagar/{id}/pagos", response_model=PagoPagearResponse, status_code=status.HTTP_201_CREATED)
async def agregar_pago_pagar(
    id: str,
    data: PagoPagearCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([Rol.SUPER_ADMIN, Rol.ADMINISTRADOR, Rol.CONTADOR])),
):
    service = FinanzasService(db)
    pago = service.agregar_pago_pagar(id, data)
    if not pago:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    return pago

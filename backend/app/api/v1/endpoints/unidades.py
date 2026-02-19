from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

from app.core.deps import get_db, get_current_user
from app.core.security import get_password_hash
from app.models.usuario import Usuario, Rol
from app.models.unidad import Unidad, ImagenUnidad, EtapaUnidad
from app.models.cliente import Cliente
from app.schemas.unidad import (
    UnidadCreate, UnidadUpdate, UnidadResponse, UnidadDetalleResponse,
    VenderUnidadRequest, ImagenCreate, ImagenResponse,
    EtapaCreate, EtapaUpdate, EtapaResponse,
)

router = APIRouter(prefix="/unidades", tags=["unidades"])

ETAPAS_DEFAULT = [
    {"nombre": "Planos", "orden": 1},
    {"nombre": "Cimientos", "orden": 2},
    {"nombre": "Estructura", "orden": 3},
    {"nombre": "Cerramientos", "orden": 4},
    {"nombre": "Instalaciones", "orden": 5},
    {"nombre": "Terminaciones", "orden": 6},
    {"nombre": "Entrega", "orden": 7},
]


# ============ UNIDADES ============

@router.get("", response_model=List[UnidadResponse])
def get_unidades(
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene todas las unidades"""
    # Si es cliente, solo puede ver su unidad
    if current_user.rol == Rol.CLIENTE.value:
        unidades = db.query(Unidad).filter(
            Unidad.activo.is_(True),
            Unidad.usuario_id == current_user.id
        ).all()
        return unidades

    query = db.query(Unidad).filter(Unidad.activo.is_(True))

    if estado:
        query = query.filter(Unidad.estado == estado)

    return query.order_by(Unidad.numero_unidad).all()


@router.get("/{unidad_id}", response_model=UnidadDetalleResponse)
def get_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene una unidad con detalles completos"""
    unidad = db.query(Unidad).options(
        joinedload(Unidad.cliente),
        joinedload(Unidad.imagenes),
        joinedload(Unidad.etapas),
    ).filter(Unidad.id == unidad_id, Unidad.activo.is_(True)).first()

    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    # Si es cliente, solo puede ver su propia unidad
    if current_user.rol == Rol.CLIENTE.value and unidad.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta unidad")

    return unidad


@router.post("", response_model=UnidadResponse, status_code=status.HTTP_201_CREATED)
def create_unidad(
    data: UnidadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea una nueva unidad con etapas por defecto"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    unidad = Unidad(
        id=str(uuid4()),
        **data.model_dump(),
        activo=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(unidad)

    # Crear etapas por defecto
    for etapa_data in ETAPAS_DEFAULT:
        etapa = EtapaUnidad(
            id=str(uuid4()),
            unidad_id=unidad.id,
            nombre=etapa_data["nombre"],
            orden=etapa_data["orden"],
            completada=False,
            porcentaje=0,
            activo=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(etapa)

    db.commit()
    db.refresh(unidad)
    return unidad


@router.put("/{unidad_id}", response_model=UnidadResponse)
def update_unidad(
    unidad_id: str,
    data: UnidadUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza una unidad"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(unidad, key, value)

    unidad.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(unidad)
    return unidad


@router.delete("/{unidad_id}")
def delete_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina una unidad (soft delete)"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    unidad.activo = False
    db.commit()
    return {"message": "Unidad eliminada"}


# ============ VENTA / ASIGNACIÓN CLIENTE ============

@router.post("/{unidad_id}/vender", response_model=UnidadDetalleResponse)
def vender_unidad(
    unidad_id: str,
    data: VenderUnidadRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Marca una unidad como vendida y opcionalmente crea usuario para el cliente"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Asignar cliente y marcar como vendida
    unidad.cliente_id = data.cliente_id
    unidad.estado = "vendida"
    unidad.fecha_venta = datetime.utcnow()

    # Crear usuario para el cliente si se solicita
    if data.crear_usuario:
        email = data.email_usuario or cliente.email
        if not email:
            raise HTTPException(status_code=400, detail="Se requiere email para crear usuario")

        # Verificar si ya existe usuario con ese email
        existing_user = db.query(Usuario).filter(Usuario.email == email).first()
        if existing_user:
            # Usar usuario existente
            unidad.usuario_id = existing_user.id
        else:
            # Crear nuevo usuario
            password = data.password_usuario or "TheMountPH" + unidad.numero_unidad.replace(" ", "")
            nuevo_usuario = Usuario(
                id=str(uuid4()),
                email=email,
                hashed_password=get_password_hash(password),
                nombre=cliente.nombre,
                apellido_paterno=cliente.apellido_paterno,
                apellido_materno=cliente.apellido_materno or "",
                telefono=cliente.telefono,
                rol=Rol.CLIENTE.value,
                activo=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(nuevo_usuario)
            db.flush()
            unidad.usuario_id = nuevo_usuario.id

    unidad.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(unidad)

    # Recargar con relaciones
    unidad = db.query(Unidad).options(
        joinedload(Unidad.cliente),
        joinedload(Unidad.imagenes),
        joinedload(Unidad.etapas),
    ).filter(Unidad.id == unidad_id).first()

    return unidad


@router.post("/{unidad_id}/liberar", response_model=UnidadResponse)
def liberar_unidad(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Libera una unidad (cancelar venta)"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    unidad.cliente_id = None
    unidad.usuario_id = None
    unidad.estado = "disponible"
    unidad.fecha_venta = None
    unidad.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(unidad)
    return unidad


# ============ ETAPAS ============

@router.get("/{unidad_id}/etapas", response_model=List[EtapaResponse])
def get_etapas(
    unidad_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene las etapas de una unidad"""
    etapas = db.query(EtapaUnidad).filter(
        EtapaUnidad.unidad_id == unidad_id,
        EtapaUnidad.activo.is_(True)
    ).order_by(EtapaUnidad.orden).all()
    return etapas


@router.put("/{unidad_id}/etapas/{etapa_id}", response_model=EtapaResponse)
def update_etapa(
    unidad_id: str,
    etapa_id: str,
    data: EtapaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza una etapa y recalcula el avance de la unidad"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    etapa = db.query(EtapaUnidad).filter(
        EtapaUnidad.id == etapa_id,
        EtapaUnidad.unidad_id == unidad_id
    ).first()

    if not etapa:
        raise HTTPException(status_code=404, detail="Etapa no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(etapa, key, value)

    etapa.updated_at = datetime.utcnow()

    # Recalcular avance de la unidad
    etapas = db.query(EtapaUnidad).filter(
        EtapaUnidad.unidad_id == unidad_id,
        EtapaUnidad.activo.is_(True)
    ).all()

    if etapas:
        total_porcentaje = sum(e.porcentaje for e in etapas)
        avance = total_porcentaje // len(etapas)

        unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
        if unidad:
            unidad.avance_porcentaje = avance
            # Actualizar etapa actual
            for e in sorted(etapas, key=lambda x: x.orden):
                if not e.completada:
                    unidad.etapa_actual = e.nombre.lower()
                    break
            else:
                unidad.etapa_actual = "entrega"

    db.commit()
    db.refresh(etapa)
    return etapa


# ============ IMÁGENES ============

@router.get("/{unidad_id}/imagenes", response_model=List[ImagenResponse])
def get_imagenes(
    unidad_id: str,
    tipo: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene las imágenes de una unidad"""
    query = db.query(ImagenUnidad).filter(
        ImagenUnidad.unidad_id == unidad_id,
        ImagenUnidad.activo.is_(True)
    )

    if tipo:
        query = query.filter(ImagenUnidad.tipo == tipo)

    return query.order_by(ImagenUnidad.orden).all()


@router.post("/{unidad_id}/imagenes", response_model=ImagenResponse, status_code=status.HTTP_201_CREATED)
def add_imagen(
    unidad_id: str,
    data: ImagenCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Agrega una imagen a una unidad"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    # Verificar que la unidad existe
    unidad = db.query(Unidad).filter(Unidad.id == unidad_id).first()
    if not unidad:
        raise HTTPException(status_code=404, detail="Unidad no encontrada")

    imagen = ImagenUnidad(
        id=str(uuid4()),
        unidad_id=unidad_id,
        url=data.url,
        titulo=data.titulo,
        descripcion=data.descripcion,
        tipo=data.tipo,
        orden=data.orden,
        activo=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(imagen)
    db.commit()
    db.refresh(imagen)
    return imagen


@router.delete("/{unidad_id}/imagenes/{imagen_id}")
def delete_imagen(
    unidad_id: str,
    imagen_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina una imagen"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    imagen = db.query(ImagenUnidad).filter(
        ImagenUnidad.id == imagen_id,
        ImagenUnidad.unidad_id == unidad_id
    ).first()

    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    imagen.activo = False
    db.commit()
    return {"message": "Imagen eliminada"}


# ============ SEED DATA ============

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_unidades(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Carga los 20 PH del proyecto The Mount"""
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    # Verificar si ya hay unidades
    existing = db.query(Unidad).filter(Unidad.activo.is_(True)).count()
    if existing > 0:
        raise HTTPException(status_code=400, detail="Ya existen unidades. Elimínalas primero.")

    # Datos de los 20 PH
    unidades_data = [
        {"numero": "PH 1", "m2": 100, "precio_m2": 1900, "total": 190000},
        {"numero": "PH 2", "m2": 100, "precio_m2": 1900, "total": 190000},
        {"numero": "PH 3", "m2": 100, "precio_m2": 1900, "total": 190000},
        {"numero": "PH 4", "m2": 100, "precio_m2": 1900, "total": 190000},
        {"numero": "PH 5", "m2": 140, "precio_m2": None, "total": None, "tipo": "Casa Pietra", "estado": "vendida"},
        {"numero": "PH 6", "m2": 144, "precio_m2": None, "total": None, "tipo": "Casa Ether", "estado": "vendida"},
        {"numero": "PH 7", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 8", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 9", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 10", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 11", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 12", "m2": 80, "precio_m2": 2125, "total": 170000},
        {"numero": "PH 13", "m2": 300, "precio_m2": 1500, "total": 450000},
        {"numero": "PH 14", "m2": 80, "precio_m2": 2000, "total": 160000},
        {"numero": "PH 15", "m2": 80, "precio_m2": 2000, "total": 160000},
        {"numero": "PH 16", "m2": 80, "precio_m2": 2000, "total": 160000},
        {"numero": "PH 17", "m2": 80, "precio_m2": 2000, "total": 160000},
        {"numero": "PH 18", "m2": 130, "precio_m2": 1700, "total": 221000},
        {"numero": "PH 19", "m2": 130, "precio_m2": 1700, "total": 221000},
        {"numero": "PH 20", "m2": 130, "precio_m2": 1700, "total": 221000},
    ]

    created = []
    for data in unidades_data:
        unidad = Unidad(
            id=str(uuid4()),
            numero_unidad=data["numero"],
            nombre=data.get("tipo"),
            tipo_casa=data.get("tipo", "Estándar"),
            metros_cuadrados=data["m2"],
            precio_por_m2=data.get("precio_m2"),
            precio_total=data.get("total"),
            estado=data.get("estado", "disponible"),
            avance_porcentaje=0,
            etapa_actual="planos",
            activo=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(unidad)
        db.flush()

        # Crear etapas por defecto
        for etapa_data in ETAPAS_DEFAULT:
            etapa = EtapaUnidad(
                id=str(uuid4()),
                unidad_id=unidad.id,
                nombre=etapa_data["nombre"],
                orden=etapa_data["orden"],
                completada=False,
                porcentaje=0,
                activo=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(etapa)

        created.append(data["numero"])

    db.commit()
    return {"message": f"Se crearon {len(created)} unidades", "unidades": created}

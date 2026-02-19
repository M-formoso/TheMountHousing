from sqlalchemy.orm import Session
from datetime import datetime, date
from uuid import uuid4
from app.models.proveedor import Proveedor, AccionProveedor, AdjuntoAccion
from app.schemas.proveedor import (
    ProveedorCreate, ProveedorUpdate,
    AccionProveedorCreate, AccionProveedorUpdate,
    AdjuntoCreate
)


class ProveedorService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        categoria: str | None = None,
        estado: str | None = None,
        especialidad: str | None = None,
        preferido: bool | None = None,
    ) -> tuple[list[Proveedor], int]:
        query = self.db.query(Proveedor).filter(Proveedor.activo == activo)
        if buscar:
            query = query.filter(
                Proveedor.razon_social.ilike(f"%{buscar}%")
                | Proveedor.contacto_principal.ilike(f"%{buscar}%")
                | Proveedor.email.ilike(f"%{buscar}%")
            )
        if categoria:
            query = query.filter(Proveedor.categoria == categoria)
        if estado:
            query = query.filter(Proveedor.estado == estado)
        if especialidad:
            query = query.filter(Proveedor.especialidad == especialidad)
        if preferido is not None:
            query = query.filter(Proveedor.preferido == preferido)
        total = query.count()
        items = query.order_by(Proveedor.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Proveedor | None:
        return self.db.query(Proveedor).filter(
            Proveedor.id == id, Proveedor.activo.is_(True)
        ).first()

    def crear(self, data: ProveedorCreate) -> Proveedor:
        proveedor = Proveedor(id=str(uuid4()), **data.model_dump())
        self.db.add(proveedor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def actualizar(self, id: str, data: ProveedorUpdate) -> Proveedor | None:
        proveedor = self.obtener(id)
        if not proveedor:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(proveedor, key, value)
        proveedor.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def eliminar(self, id: str) -> bool:
        proveedor = self.obtener(id)
        if not proveedor:
            return False
        proveedor.activo = False
        proveedor.updated_at = datetime.utcnow()
        self.db.commit()
        return True


class AccionProveedorService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        proveedor_id: str,
        skip: int = 0,
        limit: int = 50,
        tipo: str | None = None,
        estado: str | None = None,
    ) -> tuple[list[AccionProveedor], int]:
        query = self.db.query(AccionProveedor).filter(
            AccionProveedor.proveedor_id == proveedor_id,
            AccionProveedor.activo.is_(True)
        )
        if tipo:
            query = query.filter(AccionProveedor.tipo == tipo)
        if estado:
            query = query.filter(AccionProveedor.estado == estado)
        total = query.count()
        items = query.order_by(AccionProveedor.fecha.desc(), AccionProveedor.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> AccionProveedor | None:
        return self.db.query(AccionProveedor).filter(
            AccionProveedor.id == id, AccionProveedor.activo.is_(True)
        ).first()

    def crear(self, proveedor_id: str, data: AccionProveedorCreate) -> AccionProveedor:
        accion = AccionProveedor(
            id=str(uuid4()),
            proveedor_id=proveedor_id,
            **data.model_dump()
        )
        self.db.add(accion)

        # Actualizar totales del proveedor si es un pago
        if data.tipo.value == "pago" and data.monto:
            proveedor = self.db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
            if proveedor:
                proveedor.total_pagado = float(proveedor.total_pagado or 0) + data.monto
                proveedor.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(accion)
        return accion

    def actualizar(self, id: str, data: AccionProveedorUpdate) -> AccionProveedor | None:
        accion = self.obtener(id)
        if not accion:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(accion, key, value)
        accion.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(accion)
        return accion

    def eliminar(self, id: str) -> bool:
        accion = self.obtener(id)
        if not accion:
            return False
        accion.activo = False
        accion.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def agregar_adjunto(self, accion_id: str, data: AdjuntoCreate) -> AdjuntoAccion:
        adjunto = AdjuntoAccion(
            id=str(uuid4()),
            accion_id=accion_id,
            **data.model_dump()
        )
        self.db.add(adjunto)
        self.db.commit()
        self.db.refresh(adjunto)
        return adjunto

    def eliminar_adjunto(self, adjunto_id: str) -> bool:
        adjunto = self.db.query(AdjuntoAccion).filter(AdjuntoAccion.id == adjunto_id).first()
        if not adjunto:
            return False
        self.db.delete(adjunto)
        self.db.commit()
        return True

from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4
from app.models.cliente import Cliente, ContactoCliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ContactoClienteCreate


class ClienteService:
    def __init__(self, db: Session):
        self.db = db

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        activo: bool = True,
        buscar: str | None = None,
        tipo: str | None = None,
    ) -> tuple[list[Cliente], int]:
        query = self.db.query(Cliente).filter(Cliente.activo == activo)

        if buscar:
            query = query.filter(Cliente.nombre.ilike(f"%{buscar}%"))
        if tipo:
            query = query.filter(Cliente.tipo == tipo)

        total = query.count()
        items = query.order_by(Cliente.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> Cliente | None:
        return self.db.query(Cliente).filter(
            Cliente.id == id,
            Cliente.activo.is_(True),
        ).first()

    def crear(self, data: ClienteCreate) -> Cliente:
        cliente = Cliente(
            id=str(uuid4()),
            **data.model_dump(),
        )
        self.db.add(cliente)
        self.db.commit()
        self.db.refresh(cliente)
        return cliente

    def actualizar(self, id: str, data: ClienteUpdate) -> Cliente | None:
        cliente = self.obtener(id)
        if not cliente:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(cliente, key, value)
        cliente.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(cliente)
        return cliente

    def eliminar(self, id: str) -> bool:
        cliente = self.obtener(id)
        if not cliente:
            return False
        cliente.activo = False
        cliente.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    # --- Contactos ---
    def crear_contacto(self, cliente_id: str, data: ContactoClienteCreate) -> ContactoCliente | None:
        cliente = self.obtener(cliente_id)
        if not cliente:
            return None
        contacto = ContactoCliente(
            id=str(uuid4()),
            cliente_id=cliente_id,
            nombre=data.nombre,
            puesto=data.puesto,
            email=data.email,
            telefono=data.telefono,
            es_principal=1 if data.es_principal else 0,
        )
        self.db.add(contacto)
        self.db.commit()
        self.db.refresh(contacto)
        return contacto

    def listar_contactos(self, cliente_id: str) -> list[ContactoCliente]:
        return self.db.query(ContactoCliente).filter(
            ContactoCliente.cliente_id == cliente_id,
            ContactoCliente.activo.is_(True),
        ).all()

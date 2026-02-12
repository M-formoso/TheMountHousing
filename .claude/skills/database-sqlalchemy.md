# Skill: Database - SQLAlchemy 2.0 + Alembic

## Base Model (todos los modelos heredan de esta)

```python
# app/models/base.py
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(String(36), primary_key=True, index=True)  # UUID como string
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
```

## Declarative Base

```python
# app/db/base.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

## Sesión de BD

```python
# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=40,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Ejemplo Modelo completo: Cliente

```python
# app/models/cliente.py
from sqlalchemy import Column, String, Integer, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class TipoCliente(str, enum.Enum):
    PERSONA_FISICA = "persona_fisica"
    PERSONA_MORAL = "persona_moral"
    GOBIERNO = "gobierno"


class EstadoCuenta(str, enum.Enum):
    AL_DIA = "al_dia"
    DEBE = "debe"
    CREDITO = "credito"


class FormaPago(str, enum.Enum):
    TRANSFERENCIA = "transferencia"
    CHEQUE = "cheque"
    EFECTIVO = "efectivo"
    TARJETA = "tarjeta"


class Cliente(BaseModel):
    __tablename__ = "clientes"

    tipo = Column(SAEnum(TipoCliente), nullable=False)
    nombre = Column(String(255), nullable=False, index=True)
    rfc = Column(String(13), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    telefono = Column(String(20), nullable=True)
    telefono_alternativo = Column(String(20), nullable=True)

    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado_geo = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)

    # Persona física
    fecha_nacimiento = Column(Date, nullable=True)

    # Persona moral
    representante_legal = Column(String(255), nullable=True)
    giro_empresarial = Column(String(255), nullable=True)

    calificacion = Column(Integer, default=0)  # 1-5
    estado_cuenta = Column(SAEnum(EstadoCuenta), default=EstadoCuenta.AL_DIA)
    limite_credito = Column(Numeric(15, 2), default=0)
    descuento_especial = Column(Numeric(5, 2), default=0)  # %
    forma_pago_preferida = Column(SAEnum(FormaPago), nullable=True)

    notas = Column(String, nullable=True)

    # Relaciones
    proyectos = relationship("Proyecto", back_populates="cliente", lazy="dynamic")
    contactos = relationship("ContactoCliente", back_populates="cliente", cascade="all, delete-orphan")
    documentos = relationship("DocumentoCliente", back_populates="cliente", cascade="all, delete-orphan")
```

## Relaciones Comunes

```python
# Uno a Muchos (1:N) - Cliente tiene muchos proyectos
# En Cliente:
proyectos = relationship("Proyecto", back_populates="cliente", lazy="dynamic")
# En Proyecto:
cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False)
cliente = relationship("Cliente", back_populates="proyectos")

# Muchos a Muchos (N:M) - Proyectos y Empleados
# Tabla intermedia:
proyecto_empleado = Table(
    "proyecto_empleados", Base.metadata,
    Column("proyecto_id", String(36), ForeignKey("proyectos.id"), primary_key=True),
    Column("empleado_id", String(36), ForeignKey("empleados.id"), primary_key=True),
)
# En Proyecto:
equipo = relationship("Empleado", secondary=proyecto_empleado, back_populates="proyectos_asignados")
# En Empleado:
proyectos_asignados = relationship("Proyecto", secondary=proyecto_empleado, back_populates="equipo")

# Uno a Uno (1:1)
# En Cotizacion:
proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True, unique=True)
proyecto = relationship("Proyecto", back_populates="cotizacion")
```

## Migraciones con Alembic

```bash
# Crear migración automática
alembic revision --autogenerate -m "descripcion_cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ver historial
alembic history
```

## env.py de Alembic (importante para autogenerate)

```python
# alembic/env.py
from app.db.base import Base
# Importar TODOS los modelos para que Alembic los detecte
from app.models import usuario, proyecto, cliente, cotizacion  # noqa
from app.models import empleado, subcontratista, material, maquinaria  # noqa
from app.models import finanzas, alerta, asociaciones  # noqa

target_metadata = Base.metadata
```

## Datos Iniciales (seed)

```python
# app/db/init_db.py
from app.db.session import SessionLocal
from app.models.usuario import Usuario, Rol
from uuid import uuid4
from datetime import datetime
import hashlib  # usar passlib en producción


def init_data():
    db = SessionLocal()
    # Crear usuario Super Admin si no existe
    admin = db.query(Usuario).filter(Usuario.email == "admin@constructora.com").first()
    if not admin:
        admin = Usuario(
            id=str(uuid4()),
            email="admin@constructora.com",
            hashed_password="...",  # hash con passlib
            nombre="Admin",
            rol=Rol.SUPER_ADMIN,
            activo=True,
        )
        db.add(admin)
        db.commit()
    db.close()
```

## Consultas Comunes

```python
# Filtro por múltiples campos
items = db.query(Modelo).filter(
    Modelo.activo == True,
    Modelo.estado == estado,
    Modelo.nombre.ilike(f"%{buscar}%"),  # búsqueda case-insensitive
).offset(skip).limit(limit).all()

# Contar sin traer datos
total = db.query(Modelo).filter(Modelo.activo == True).count()

# Ordenar
items = db.query(Modelo).order_by(Modelo.created_at.desc()).all()

# Join explícito
from sqlalchemy import and_
items = db.query(Proyecto).join(Cliente).filter(
    Cliente.nombre.ilike(f"%{buscar}%")
).all()
```

## Tipos de Datos Usados
| Tipo Python | SQLAlchemy Column | Uso |
|-------------|-------------------|-----|
| UUID | String(36) | IDs (se almacena como str) |
| str | String(N) | Texto con límite |
| str (long) | String / Text | Descripciones, notas |
| Decimal | Numeric(15,2) | Dinero, precios |
| float | Float | Coordenadas, porcentajes |
| date | Date | Fechas sin hora |
| datetime | DateTime | Timestamps |
| bool | Boolean | Flags |
| Enum | Enum (SAEnum) | Estados, tipos |

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Cliente(BaseModel):
    __tablename__ = "clientes"

    numero_cliente = Column(String(20), nullable=False, unique=True, index=True)
    tipo = Column(String(20), nullable=False)  # persona_fisica, persona_moral
    nombre = Column(String(255), nullable=False, index=True)
    apellido_paterno = Column(String(100), nullable=True)
    apellido_materno = Column(String(100), nullable=True)
    razon_social = Column(String(255), nullable=True)
    rfc = Column(String(13), nullable=True)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    telefono_alternativo = Column(String(20), nullable=True)
    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    notas = Column(String, nullable=True)

    # Relaciones
    proyectos = relationship("Proyecto", back_populates="cliente", lazy="dynamic")
    contactos = relationship("ContactoCliente", back_populates="cliente", cascade="all, delete-orphan")
    documentos = relationship("DocumentoCliente", back_populates="cliente", cascade="all, delete-orphan")
    unidades = relationship("Unidad", back_populates="cliente")


class ContactoCliente(BaseModel):
    __tablename__ = "contactos_clientes"

    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    puesto = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    telefono = Column(String(20), nullable=True)
    es_principal = Column(Integer, default=0)  # 1 si es contacto principal

    # Relación
    cliente = relationship("Cliente", back_populates="contactos")


class DocumentoCliente(BaseModel):
    __tablename__ = "documentos_clientes"

    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # identificacion, rfc, comprobante, otro
    url = Column(String(500), nullable=False)  # URL en Cloudinary
    notas = Column(String, nullable=True)

    # Relación
    cliente = relationship("Cliente", back_populates="documentos")

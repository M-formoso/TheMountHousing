import enum
from sqlalchemy import Column, String, Integer, Numeric, Float, Date, DateTime, ForeignKey, Table, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.db.base import Base


class TipoProyecto(str, enum.Enum):
    RESIDENCIAL = "residencial"
    COMERCIAL = "comercial"
    INDUSTRIAL = "industrial"
    REMODELACION = "remodelacion"
    OBRA_CIVIL = "obra_civil"


class EstadoProyecto(str, enum.Enum):
    COTIZACION = "cotizacion"
    ADJUDICADO = "adjudicado"
    EN_CONSTRUCCION = "en_construccion"
    PAUSADO = "pausado"
    FINALIZADO = "finalizado"
    CANCELADO = "cancelado"


# Tabla intermedia: proyecto <-> empleado (many-to-many)
proyecto_empleados = Table(
    "proyecto_empleados",
    Base.metadata,
    Column("proyecto_id", String(36), ForeignKey("proyectos.id"), primary_key=True),
    Column("empleado_id", String(36), ForeignKey("empleados.id"), primary_key=True),
)


class Proyecto(BaseModel):
    __tablename__ = "proyectos"

    codigo = Column(String(30), unique=True, nullable=False, index=True)  # OBRA-2024-001
    nombre = Column(String(255), nullable=False, index=True)
    descripcion = Column(String, nullable=True)
    tipo = Column(SAEnum(TipoProyecto), nullable=False)
    estado = Column(SAEnum(EstadoProyecto), default=EstadoProyecto.COTIZACION)

    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=False)
    gerente_proyecto_id = Column(String(36), ForeignKey("empleados.id"), nullable=True)

    # Ubicación
    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado_geo = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)
    latitud = Column(Float, nullable=True)
    longitud = Column(Float, nullable=True)

    # Fechas
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin_estimada = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)

    # Financiero
    presupuesto_total = Column(Numeric(15, 2), default=0)
    costo_real = Column(Numeric(15, 2), default=0)
    margen_ganancia_esperado = Column(Numeric(5, 2), default=0)  # %

    # Dimensiones
    area_construccion_m2 = Column(Float, nullable=True)

    # Avance
    progreso_general = Column(Integer, default=0)  # 0-100

    notas = Column(String, nullable=True)

    # Relaciones
    cliente = relationship("Cliente", back_populates="proyectos")
    gerente = relationship("Empleado", foreign_keys=[gerente_proyecto_id])
    equipo = relationship("Empleado", secondary=proyecto_empleados, back_populates="proyectos_asignados")
    fases = relationship("FaseProyecto", back_populates="proyecto", order_by="FaseProyecto.numero_fase")
    documentos = relationship("DocumentoProyecto", back_populates="proyecto", cascade="all, delete-orphan")
    fotos = relationship("FotoProyecto", back_populates="proyecto", cascade="all, delete-orphan")
    bitacora = relationship("EntradaBitacora", back_populates="proyecto", order_by="EntradaBitacora.created_at.desc()")
    cotizacion = relationship("Cotizacion", back_populates="proyecto", uselist=False)


class FaseProyecto(BaseModel):
    __tablename__ = "fases_proyecto"

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=False)
    numero_fase = Column(Integer, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin_estimada = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    progreso = Column(Integer, default=0)  # 0-100
    estado = Column(String(30), default="pendiente")  # pendiente, en_progreso, completada, cancelada

    # Relación
    proyecto = relationship("Proyecto", back_populates="fases")


class DocumentoProyecto(BaseModel):
    __tablename__ = "documentos_proyecto"

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # plano, permiso, contrato, licencia, otro
    url = Column(String(500), nullable=False)
    notas = Column(String, nullable=True)
    subido_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)

    # Relación
    proyecto = relationship("Proyecto", back_populates="documentos")


class FotoProyecto(BaseModel):
    __tablename__ = "fotos_proyecto"

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=False)
    url = Column(String(500), nullable=False)
    url_thumbnail = Column(String(500), nullable=True)
    etapa = Column(String(30), nullable=True)  # antes, durante, despues
    fecha_foto = Column(Date, nullable=True)
    descripcion = Column(String, nullable=True)
    subido_por_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True)

    # Relación
    proyecto = relationship("Proyecto", back_populates="fotos")


class EntradaBitacora(BaseModel):
    __tablename__ = "bitacora_proyecto"

    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=False)
    autor_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    contenido = Column(String, nullable=False)
    clima = Column(String(100), nullable=True)
    temperatura = Column(Float, nullable=True)
    trabajadores_presentes = Column(Integer, nullable=True)
    notas = Column(String, nullable=True)

    # Relación
    proyecto = relationship("Proyecto", back_populates="bitacora")

import enum
from sqlalchemy import Column, String, Integer, Numeric, Date, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.models.proyecto import proyecto_empleados


class Departamento(str, enum.Enum):
    OBRA = "obra"
    ADMINISTRACION = "administracion"
    CONTABILIDAD = "contabilidad"
    COMPRAS = "compras"
    INGENIERIA = "ingenieria"
    RECURSOS_HUMANOS = "recursos_humanos"
    VENTAS = "ventas"


class TipoContrato(str, enum.Enum):
    PLANTA = "planta"
    OBRA = "obra"
    HONORARIOS = "honorarios"


class Empleado(BaseModel):
    __tablename__ = "empleados"

    numero_empleado = Column(String(20), unique=True, nullable=False, index=True)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=True, unique=True)

    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    rfc = Column(String(13), nullable=True)
    curp = Column(String(18), nullable=True)
    nss = Column(String(11), nullable=True)

    email = Column(String(255), nullable=False, index=True)
    telefono = Column(String(20), nullable=True)

    # Contacto de emergencia
    telefono_emergencia = Column(String(20), nullable=True)
    contacto_emergencia_nombre = Column(String(100), nullable=True)
    contacto_emergencia_relacion = Column(String(50), nullable=True)

    # Dirección
    direccion = Column(String(500), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado_geo = Column(String(100), nullable=True)
    codigo_postal = Column(String(10), nullable=True)

    # Laboral
    puesto = Column(String(100), nullable=False)
    departamento = Column(SAEnum(Departamento), nullable=False)
    fecha_ingreso = Column(Date, nullable=True)
    fecha_baja = Column(Date, nullable=True)
    tipo_contrato = Column(SAEnum(TipoContrato), nullable=True)
    salario_diario = Column(Numeric(10, 2), nullable=True)

    # Médico
    tipo_sangre = Column(String(5), nullable=True)
    alergias = Column(String, nullable=True)
    enfermedades = Column(String, nullable=True)

    # Relaciones
    proyectos_asignados = relationship("Proyecto", secondary=proyecto_empleados, back_populates="equipo")
    asistencias = relationship("Asistencia", back_populates="empleado", cascade="all, delete-orphan")
    capacitaciones = relationship("Capacitacion", back_populates="empleado", cascade="all, delete-orphan")
    documentos = relationship("DocumentoEmpleado", back_populates="empleado", cascade="all, delete-orphan")


class Asistencia(BaseModel):
    __tablename__ = "asistencias"

    empleado_id = Column(String(36), ForeignKey("empleados.id"), nullable=False)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    fecha = Column(Date, nullable=False)
    entrada = Column(String(8), nullable=True)   # HH:MM:SS
    salida = Column(String(8), nullable=True)
    estado = Column(String(30), default="presente")  # presente, ausente, permiso, incapacidad
    notas = Column(String, nullable=True)

    # Relación
    empleado = relationship("Empleado", back_populates="asistencias")


class Capacitacion(BaseModel):
    __tablename__ = "capacitaciones"

    empleado_id = Column(String(36), ForeignKey("empleados.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    proveedor = Column(String(100), nullable=True)
    certificado_url = Column(String(500), nullable=True)
    completada = Column(Integer, default=0)  # 1 si completó

    # Relación
    empleado = relationship("Empleado", back_populates="capacitaciones")


class DocumentoEmpleado(BaseModel):
    __tablename__ = "documentos_empleado"

    empleado_id = Column(String(36), ForeignKey("empleados.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # identificacion, curp, nss, contrato, otro
    url = Column(String(500), nullable=False)

    # Relación
    empleado = relationship("Empleado", back_populates="documentos")

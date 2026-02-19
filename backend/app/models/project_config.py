"""Modelo para configuración del proyecto y análisis ROI."""
from sqlalchemy import Column, String, Float, Integer
from app.models.base import BaseModel


class ProjectConfig(BaseModel):
    __tablename__ = "project_config"

    nombre_proyecto = Column(String(255), nullable=True, default="The Mount Housing")

    # Datos del terreno
    costo_terreno = Column(Float, nullable=False, default=0)
    superficie_terreno = Column(Float, nullable=False, default=0)  # m²

    # Datos de construcción
    superficie_construible = Column(Float, nullable=False, default=0)  # m² vendibles
    total_departamentos = Column(Integer, nullable=False, default=0)
    tamano_promedio_depto = Column(Float, nullable=False, default=0)  # m²

    # Datos de venta
    precio_venta_m2 = Column(Float, nullable=False, default=0)  # $/m²

    # Costos adicionales (opcionales)
    gastos_legales = Column(Float, nullable=True, default=0)
    gastos_comercializacion = Column(Float, nullable=True, default=0)
    gastos_financieros = Column(Float, nullable=True, default=0)
    imprevistos = Column(Float, nullable=True, default=0)

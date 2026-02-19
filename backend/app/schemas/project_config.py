"""Schemas para configuración del proyecto."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProjectConfigCreate(BaseModel):
    nombre_proyecto: Optional[str] = "The Mount Housing"
    costo_terreno: float = 0
    superficie_terreno: float = 0
    superficie_construible: float = 0
    total_departamentos: int = 0
    tamano_promedio_depto: float = 0
    precio_venta_m2: float = 0
    gastos_legales: Optional[float] = 0
    gastos_comercializacion: Optional[float] = 0
    gastos_financieros: Optional[float] = 0
    imprevistos: Optional[float] = 0


class ProjectConfigUpdate(ProjectConfigCreate):
    pass


class ProjectConfigResponse(BaseModel):
    id: str
    nombre_proyecto: Optional[str]
    costo_terreno: float
    superficie_terreno: float
    superficie_construible: float
    total_departamentos: int
    tamano_promedio_depto: float
    precio_venta_m2: float
    gastos_legales: Optional[float]
    gastos_comercializacion: Optional[float]
    gastos_financieros: Optional[float]
    imprevistos: Optional[float]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ROIAnalysisResponse(BaseModel):
    """Respuesta con todos los cálculos de ROI."""
    # Configuración base
    config: ProjectConfigResponse

    # Costos
    costo_terreno: float
    costo_construccion: float  # Materiales + gastos
    costo_total: float

    # Incidencia del terreno
    incidencia_terreno: float  # Porcentaje
    evaluacion_incidencia: str

    # Métricas clave
    costo_por_m2: float
    ingresos_totales: float
    ganancia_neta: float
    roi: float  # Porcentaje

    # Análisis de rentabilidad
    margen_ganancia: float  # Porcentaje
    relacion_costo_venta: float

    # Por unidad
    precio_venta_promedio: float
    costo_promedio_unidad: float
    ganancia_por_unidad: float

"""Endpoints para análisis ROI y configuración del proyecto."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from uuid import uuid4

from app.core.deps import get_db, get_current_user
from app.models.usuario import Usuario
from app.models.project_config import ProjectConfig
from app.models.material import OrdenCompra
from app.models.finanzas import Egreso
from app.schemas.project_config import (
    ProjectConfigCreate,
    ProjectConfigUpdate,
    ProjectConfigResponse,
    ROIAnalysisResponse,
)

router = APIRouter(prefix="/roi", tags=["roi-analysis"])


def get_or_create_config(db: Session) -> ProjectConfig:
    """Obtiene o crea la configuración del proyecto."""
    config = db.query(ProjectConfig).filter(ProjectConfig.activo.is_(True)).first()
    if not config:
        config = ProjectConfig(
            id=str(uuid4()),
            nombre_proyecto="The Mount Housing",
            costo_terreno=0,
            superficie_terreno=0,
            superficie_construible=0,
            total_departamentos=0,
            tamano_promedio_depto=0,
            precio_venta_m2=0,
            activo=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def calcular_costos_construccion(db: Session) -> float:
    """Calcula el total de costos de construcción (materiales + gastos)."""
    # Sumar órdenes de compra
    total_ordenes = db.query(func.sum(OrdenCompra.total)).filter(
        OrdenCompra.activo.is_(True)
    ).scalar() or 0

    # Sumar egresos
    total_gastos = db.query(func.sum(Egreso.monto)).filter(
        Egreso.activo.is_(True)
    ).scalar() or 0

    return float(total_ordenes) + float(total_gastos)


@router.get("/config", response_model=ProjectConfigResponse)
async def get_config(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene la configuración del proyecto."""
    config = get_or_create_config(db)
    return config


@router.put("/config", response_model=ProjectConfigResponse)
async def update_config(
    data: ProjectConfigUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza la configuración del proyecto."""
    config = get_or_create_config(db)

    # Actualizar campos
    config.nombre_proyecto = data.nombre_proyecto
    config.costo_terreno = data.costo_terreno
    config.superficie_terreno = data.superficie_terreno
    config.superficie_construible = data.superficie_construible
    config.total_departamentos = data.total_departamentos
    config.tamano_promedio_depto = data.tamano_promedio_depto
    config.precio_venta_m2 = data.precio_venta_m2
    config.gastos_legales = data.gastos_legales or 0
    config.gastos_comercializacion = data.gastos_comercializacion or 0
    config.gastos_financieros = data.gastos_financieros or 0
    config.imprevistos = data.imprevistos or 0
    config.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(config)
    return config


@router.get("/analysis", response_model=ROIAnalysisResponse)
async def get_roi_analysis(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene el análisis ROI completo con todos los cálculos."""
    config = get_or_create_config(db)

    # Calcular costos de construcción
    costo_construccion = calcular_costos_construccion(db)

    # Agregar gastos adicionales de config
    gastos_adicionales = (
        (config.gastos_legales or 0) +
        (config.gastos_comercializacion or 0) +
        (config.gastos_financieros or 0) +
        (config.imprevistos or 0)
    )
    costo_construccion += gastos_adicionales

    # Costo total
    costo_total = config.costo_terreno + costo_construccion

    # Incidencia del terreno
    incidencia_terreno = 0
    if costo_total > 0:
        incidencia_terreno = (config.costo_terreno / costo_total) * 100

    # Evaluación de incidencia
    if incidencia_terreno < 20:
        evaluacion_incidencia = "Incidencia baja - Excelente"
    elif incidencia_terreno <= 30:
        evaluacion_incidencia = "Incidencia media - Buena"
    else:
        evaluacion_incidencia = "Incidencia alta - Revisar"

    # Costo por m²
    costo_por_m2 = 0
    if config.superficie_construible > 0:
        costo_por_m2 = costo_total / config.superficie_construible

    # Ingresos totales
    ingresos_totales = config.precio_venta_m2 * config.superficie_construible

    # Ganancia neta
    ganancia_neta = ingresos_totales - costo_total

    # ROI
    roi = 0
    if costo_total > 0:
        roi = (ganancia_neta / costo_total) * 100

    # Margen de ganancia
    margen_ganancia = 0
    if ingresos_totales > 0:
        margen_ganancia = (ganancia_neta / ingresos_totales) * 100

    # Relación costo/venta
    relacion_costo_venta = 0
    if ingresos_totales > 0:
        relacion_costo_venta = costo_total / ingresos_totales

    # Por unidad
    precio_venta_promedio = config.tamano_promedio_depto * config.precio_venta_m2

    costo_promedio_unidad = 0
    if config.total_departamentos > 0:
        costo_promedio_unidad = costo_total / config.total_departamentos

    ganancia_por_unidad = precio_venta_promedio - costo_promedio_unidad

    return ROIAnalysisResponse(
        config=config,
        costo_terreno=config.costo_terreno,
        costo_construccion=costo_construccion,
        costo_total=costo_total,
        incidencia_terreno=round(incidencia_terreno, 1),
        evaluacion_incidencia=evaluacion_incidencia,
        costo_por_m2=round(costo_por_m2, 2),
        ingresos_totales=round(ingresos_totales, 2),
        ganancia_neta=round(ganancia_neta, 2),
        roi=round(roi, 1),
        margen_ganancia=round(margen_ganancia, 1),
        relacion_costo_venta=round(relacion_costo_venta, 2),
        precio_venta_promedio=round(precio_venta_promedio, 2),
        costo_promedio_unidad=round(costo_promedio_unidad, 2),
        ganancia_por_unidad=round(ganancia_por_unidad, 2),
    )


@router.get("/costos-resumen")
async def get_costos_resumen(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene resumen de costos desglosados."""
    config = get_or_create_config(db)

    # Materiales (órdenes de compra)
    total_materiales = db.query(func.sum(OrdenCompra.total)).filter(
        OrdenCompra.activo.is_(True)
    ).scalar() or 0

    # Gastos operativos (egresos)
    total_gastos = db.query(func.sum(Egreso.monto)).filter(
        Egreso.activo.is_(True)
    ).scalar() or 0

    return {
        "costo_terreno": config.costo_terreno,
        "materiales": float(total_materiales),
        "gastos_operativos": float(total_gastos),
        "gastos_legales": config.gastos_legales or 0,
        "gastos_comercializacion": config.gastos_comercializacion or 0,
        "gastos_financieros": config.gastos_financieros or 0,
        "imprevistos": config.imprevistos or 0,
        "total": config.costo_terreno + float(total_materiales) + float(total_gastos) + (config.gastos_legales or 0) + (config.gastos_comercializacion or 0) + (config.gastos_financieros or 0) + (config.imprevistos or 0),
    }

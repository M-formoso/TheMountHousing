from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.alerta import TipoAlerta, Prioridad


class AlertaResponse(BaseModel):
    id: str
    tipo: TipoAlerta
    prioridad: Prioridad
    titulo: str
    mensaje: str
    usuario_id: Optional[str] = None
    rol_destinatario: Optional[str] = None
    entidad_tipo: Optional[str] = None
    entidad_id: Optional[str] = None
    leida: bool
    fecha_lectura: Optional[datetime] = None
    accion_url: Optional[str] = None
    accion_texto: Optional[str] = None
    expira_en: Optional[datetime] = None
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertaListResponse(BaseModel):
    items: list[AlertaResponse]
    total: int
    skip: int
    limit: int

# Skill: Backend FastAPI - Patrones y Convenciones

## Estructura de un Endpoint (template)

```python
# app/api/v1/endpoints/{modulo}.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, require_role
from app.schemas.{modulo} import (
    {Modulo}Create, {Modulo}Update, {Modulo}Response, {Modulo}ListResponse
)
from app.services.{modulo}_service import {Modulo}Service
from app.models.usuario import Rol

router = APIRouter(prefix="/{modulo}", tags=["{modulo}"])


@router.get("", response_model={Modulo}ListResponse)
async def listar(
    skip: int = 0,
    limit: int = 20,
    activo: bool = True,  # filtros opcionales
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    service = {Modulo}Service(db)
    items, total = service.listar(skip=skip, limit=limit, activo=activo)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model={Modulo}Response, status_code=status.HTTP_201_CREATED)
async def crear(
    data: {Modulo}Create,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Rol.ADMINISTRADOR, Rol.SUPER_ADMIN])),
):
    service = {Modulo}Service(db)
    item = service.crear(data, created_by=current_user.id)
    return item


@router.get("/{id}", response_model={Modulo}Response)
async def obtener(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    service = {Modulo}Service(db)
    item = service.obtener(id)
    if not item:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return item


@router.put("/{id}", response_model={Modulo}Response)
async def actualizar(
    id: str,
    data: {Modulo}Update,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Rol.ADMINISTRADOR, Rol.SUPER_ADMIN])),
):
    service = {Modulo}Service(db)
    item = service.actualizar(id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return item


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Rol.ADMINISTRADOR, Rol.SUPER_ADMIN])),
):
    service = {Modulo}Service(db)
    if not service.eliminar(id):  # soft delete
        raise HTTPException(status_code=404, detail="Registro no encontrado")
```

## Estructura de Service (template)

```python
# app/services/{modulo}_service.py
from sqlalchemy.orm import Session
from app.models.{modulo} import {Modulo}
from app.schemas.{modulo} import {Modulo}Create, {Modulo}Update
from uuid import uuid4
from datetime import datetime


class {Modulo}Service:
    def __init__(self, db: Session):
        self.db = db

    def listar(self, skip: int = 0, limit: int = 20, activo: bool = True):
        query = self.db.query({Modulo}).filter({Modulo}.activo == activo)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def obtener(self, id: str) -> {Modulo} | None:
        return self.db.query({Modulo}).filter(
            {Modulo}.id == id, {Modulo}.activo == True
        ).first()

    def crear(self, data: {Modulo}Create, created_by: str) -> {Modulo}:
        item = {Modulo}(id=str(uuid4()), **data.model_dump(), created_by=created_by)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def actualizar(self, id: str, data: {Modulo}Update) -> {Modulo} | None:
        item = self.obtener(id)
        if not item:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        item.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(item)
        return item

    def eliminar(self, id: str) -> bool:
        item = self.obtener(id)
        if not item:
            return False
        item.activo = False
        item.updated_at = datetime.utcnow()
        self.db.commit()
        return True
```

## Schemas Pydantic v2 (template)

```python
# app/schemas/{modulo}.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class {Modulo}Base(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    # ... campos del modelo


class {Modulo}Create({Modulo}Base):
    pass  # Solo campos necesarios para crear


class {Modulo}Update(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    # ... todos opcionales para partial update


class {Modulo}Response({Modulo}Base):
    id: str
    activo: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class {Modulo}ListResponse(BaseModel):
    items: list[{Modulo}Response]
    total: int
    skip: int
    limit: int
```

## Registro de Routers en api.py

```python
# app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, proyectos, clientes, cotizaciones,
    empleados, subcontratistas, materiales,
    maquinaria, finanzas, alertas, reportes, proveedores, upload
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(proyectos.router)
api_router.include_router(clientes.router)
# ... etc
```

## Manejo de Errores Global

```python
# En main.py
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "status_code": 500}
    )
```

## Paginación Estándar
- Parámetros: `skip` (offset, default 0) y `limit` (default 20)
- Respuesta siempre incluye `total`, `skip`, `limit`, `items`
- Máximo limit permitido: 100

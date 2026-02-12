from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Importar todos los modelos para que SQLAlchemy los registre
from app.models import usuario, cliente, proyecto, empleado  # noqa: F401
from app.models import cotizacion, subcontratista, material  # noqa: F401
from app.models import maquinaria, finanzas, proveedor, alerta  # noqa: F401

app = FastAPI(
    title="Constructora Pro API",
    description="Sistema de gestión integral para empresas constructoras",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router)


# --- Manejo de errores global ---
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "status_code": 500},
    )


# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


# Crear tablas al iniciar (solo desarrollo; en producción usar alembic)
@app.on_event("startup")
async def startup():
    if settings.DEBUG:
        Base.metadata.create_all(bind=engine)

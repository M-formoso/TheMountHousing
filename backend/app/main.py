import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# CORS - configurado desde variables de entorno para Railway
logger.info(f"CORS Origins: {settings.get_cors_origins()}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router)


# --- Manejo de errores global ---
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error in {request.url.path}: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno: {str(exc)}", "status_code": 500},
    )


# Health check
@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

# Test endpoint
@app.get("/test")
async def test():
    return {"message": "API funcionando correctamente"}

# Test DB connection
@app.get("/test-db")
async def test_db():
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"db": "connected"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}


# Crear tablas al iniciar (solo desarrollo; en producción usar alembic)
@app.on_event("startup")
async def startup():
    if settings.DEBUG:
        Base.metadata.create_all(bind=engine)

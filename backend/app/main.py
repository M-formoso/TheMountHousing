import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Constructora Pro API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todo temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check - primero para que responda rápido
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/test")
async def test():
    return {"message": "API working"}

@app.get("/check-admin")
async def check_admin():
    try:
        from app.db.session import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        result = db.execute(text("SELECT id, email, nombre, rol FROM usuarios WHERE email = 'admin@constructorapro.com'"))
        user = result.fetchone()
        db.close()
        if user:
            return {"exists": True, "email": user[1], "nombre": user[2], "rol": user[3]}
        return {"exists": False}
    except Exception as e:
        return {"error": str(e)}

# Importar routers después del health check
from app.api.v1.api import api_router
app.include_router(api_router)

# Manejo de errores
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error: {exc}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})


# Crear tablas al iniciar (solo desarrollo; en producción usar alembic)
@app.on_event("startup")
async def startup():
    if settings.DEBUG:
        Base.metadata.create_all(bind=engine)

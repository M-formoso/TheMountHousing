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

@app.post("/test-login")
async def test_login(data: dict):
    """Test login sin pasar por el endpoint real"""
    try:
        from app.db.session import SessionLocal
        from app.services.auth_service import AuthService

        db = SessionLocal()
        service = AuthService(db)

        email = data.get("email", "")
        password = data.get("password", "")

        user = service.get_user_by_email(email)
        if not user:
            db.close()
            return {"step": "get_user", "error": "User not found", "email": email}

        from app.core.security import verify_password
        password_ok = verify_password(password, user.hashed_password)

        if not password_ok:
            db.close()
            return {"step": "verify_password", "error": "Password invalid"}

        db.close()
        return {"step": "success", "user": user.email, "rol": user.rol}
    except Exception as e:
        return {"step": "exception", "error": str(e)}

@app.get("/check-admin")
async def check_admin():
    try:
        from app.db.session import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        result = db.execute(text("SELECT id, email, nombre, rol, hashed_password FROM usuarios WHERE email = 'admin@constructorapro.com'"))
        user = result.fetchone()
        db.close()
        if user:
            # Probar verificación de password
            import bcrypt
            password = "Admin123!"
            hashed = user[4]
            try:
                is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
            except Exception as e:
                is_valid = f"Error: {e}"
            return {
                "exists": True,
                "email": user[1],
                "nombre": user[2],
                "rol": user[3],
                "hash_prefix": hashed[:20] + "...",
                "password_valid": is_valid
            }
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

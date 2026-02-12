"""Seed de datos iniciales para el sistema."""
from app.db.session import SessionLocal
from app.models.usuario import Usuario, Rol
from app.core.security import get_password_hash
from uuid import uuid4
from datetime import datetime


def init_data():
    db = SessionLocal()
    try:
        # Super Admin
        admin = db.query(Usuario).filter(Usuario.email == "admin@constructora.com").first()
        if not admin:
            admin = Usuario(
                id=str(uuid4()),
                email="admin@constructora.com",
                hashed_password=get_password_hash("Admin1234!"),
                nombre="Administrador",
                apellido="Sistema",
                rol=Rol.SUPER_ADMIN,
                activo=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(admin)
            print("Usuario admin creado: admin@constructora.com / Admin1234!")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error al inicializar datos: {e}")
    finally:
        db.close()

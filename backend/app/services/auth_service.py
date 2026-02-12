from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import uuid4
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> Usuario | None:
        return self.db.query(Usuario).filter(
            Usuario.email == email,
            Usuario.activo.is_(True),
        ).first()

    def get_user_by_id(self, user_id: str) -> Usuario | None:
        return self.db.query(Usuario).filter(
            Usuario.id == user_id,
            Usuario.activo.is_(True),
        ).first()

    def create_user(self, data: UsuarioCreate) -> Usuario:
        user = Usuario(
            id=str(uuid4()),
            email=data.email,
            hashed_password=get_password_hash(data.password),
            nombre=data.nombre,
            apellido_paterno=data.apellido_paterno,
            apellido_materno=data.apellido_materno,
            telefono=data.telefono,
            rol=data.rol,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> Usuario | None:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def generate_tokens(self, user: Usuario) -> dict:
        access_token = create_access_token({"sub": user.id, "rol": user.rol})
        refresh_token = create_refresh_token({"sub": user.id})

        # Guardar refresh token y actualizar last_login (ultimo_acceso)
        user.refresh_token = refresh_token
        user.ultimo_acceso = datetime.utcnow()
        self.db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    def logout(self, user: Usuario) -> None:
        user.refresh_token = None
        self.db.commit()

    def change_password(self, user: Usuario, current_password: str, new_password: str) -> bool:
        if not verify_password(current_password, user.hashed_password):
            return False
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def generate_reset_token(self, user: Usuario) -> str:
        token = str(uuid4())
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        self.db.commit()
        return token

    def reset_password(self, token: str, new_password: str) -> bool:
        user = self.db.query(Usuario).filter(
            Usuario.reset_token == token,
        ).first()
        if not user:
            return False
        if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
            return False
        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True

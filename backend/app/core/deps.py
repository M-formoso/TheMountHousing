from fastapi import Depends, HTTPException, Cookie
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.usuario import Usuario, Rol


async def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = decode_token(access_token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    user = db.query(Usuario).filter(
        Usuario.id == user_id,
        Usuario.activo.is_(True),
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_role(roles: list[Rol]):
    """Factory de dependency para verificar rol del usuario."""

    async def _check(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in roles:
            raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
        return current_user

    return _check

from fastapi import APIRouter, Depends, HTTPException, Response, status, Cookie
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.core.deps import get_db, get_current_user
from app.models.usuario import Usuario, Rol
from app.schemas.usuario import (
    UsuarioCreate, UsuarioResponse, LoginRequest,
    ChangePasswordRequest, ResetPasswordRequest, ResetPasswordConfirm,
)
from app.services.auth_service import AuthService
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["autenticación"])


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    if service.get_user_by_email(data.email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = service.create_user(data)
    return user


@router.post("/login")
async def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"Login attempt for email: {data.email}")

    service = AuthService(db)

    # Debug: verificar si el usuario existe
    user_check = service.get_user_by_email(data.email)
    logger.info(f"User found: {user_check is not None}")

    if user_check:
        logger.info(f"User activo: {user_check.activo}, rol: {user_check.rol}")
        # Verificar password manualmente para debug
        from app.core.security import verify_password
        pwd_ok = verify_password(data.password, user_check.hashed_password)
        logger.info(f"Password verification: {pwd_ok}")

    user = service.authenticate(data.email, data.password)
    logger.info(f"Authenticate result: {user is not None}")

    if not user:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    # Si tiene 2FA activado, retornar flag sin dar tokens
    if user.is_2fa_enabled:
        return {"requires_2fa": True, "user_id": user.id}

    tokens = service.generate_tokens(user)

    # Setear cookies httpOnly - usar samesite="none" y secure=True para cross-origin
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        samesite="none",
        secure=True,
        max_age=900,  # 15 minutos
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        samesite="none",
        secure=True,
        max_age=604800,  # 7 días
    )

    return {
        "message": "Login exitoso",
        "rol": user.rol,
        "nombre": user.nombre,
        "email": user.email,
    }


@router.post("/refresh")
async def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No autenticado")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")

    service = AuthService(db)
    user = service.get_user_by_id(user_id)
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Token inválido")

    tokens = service.generate_tokens(user)
    response.set_cookie(key="access_token", value=tokens["access_token"], httponly=True, samesite="none", secure=True, max_age=900)
    response.set_cookie(key="refresh_token", value=tokens["refresh_token"], httponly=True, samesite="none", secure=True, max_age=604800)
    return {"message": "Token renovado"}


@router.post("/logout")
async def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = AuthService(db)
    service.logout(current_user)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UsuarioResponse)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.put("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = AuthService(db)
    if not service.change_password(current_user, data.current_password, data.new_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/forgot-password")
async def forgot_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.get_user_by_email(data.email)
    # Siempre retornar 200 (no revelar si email existe)
    if user:
        token = service.generate_reset_token(user)
        # TODO: enviar email con token usando Celery
        # from app.tasks.emails import send_reset_password_email
        # send_reset_password_email.delay(user.email, token)
    return {"message": "Si el email existe, recibirás un enlace para resetear tu contraseña"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordConfirm, db: Session = Depends(get_db)):
    service = AuthService(db)
    if not service.reset_password(data.token, data.new_password):
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    return {"message": "Contraseña resetada exitosamente"}


@router.post("/enable-2fa")
async def enable_2fa(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    import pyotp
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    db.commit()

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="Constructora Pro")
    return {"secret": secret, "provisioning_uri": uri}


@router.post("/verify-2fa")
async def verify_2fa(
    data: dict,
    response: Response,
    db: Session = Depends(get_db),
):
    import pyotp
    user_id = data.get("user_id")
    code = data.get("code")

    if not user_id or not code:
        raise HTTPException(status_code=400, detail="user_id y code son requeridos")

    user = db.query(Usuario).filter(Usuario.id == user_id, Usuario.activo.is_(True)).first()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA no configurado")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code):
        raise HTTPException(status_code=401, detail="Código 2FA incorrecto")

    # Activar 2FA si no estaba activado
    if not user.is_2fa_enabled:
        user.is_2fa_enabled = True
        db.commit()

    # Generar tokens
    service = AuthService(db)
    tokens = service.generate_tokens(user)

    response.set_cookie(key="access_token", value=tokens["access_token"], httponly=True, samesite="none", secure=True, max_age=900)
    response.set_cookie(key="refresh_token", value=tokens["refresh_token"], httponly=True, samesite="none", secure=True, max_age=604800)

    return {"message": "2FA verificado exitosamente", "rol": user.rol, "nombre": user.nombre}

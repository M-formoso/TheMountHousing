from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional
from app.core.deps import get_current_user
from app.models.usuario import Usuario, Rol
from app.services.cloudinary_service import upload_image, delete_image

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form(default="general"),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Sube un archivo de imagen a Cloudinary

    - **file**: Archivo de imagen (jpeg, png, gif, webp)
    - **folder**: Carpeta donde guardar (ej: unidades, proveedores, materiales)

    Retorna la URL y datos de la imagen subida.
    """
    # Solo usuarios autorizados pueden subir
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso para subir archivos")

    result = await upload_image(file, folder=folder)

    return {
        "success": True,
        "data": result,
        "message": "Imagen subida correctamente"
    }


@router.delete("")
async def delete_file(
    public_id: str,
    current_user: Usuario = Depends(get_current_user),
):
    """
    Elimina un archivo de Cloudinary

    - **public_id**: ID público del archivo en Cloudinary
    """
    if current_user.rol not in [Rol.SUPER_ADMIN.value, Rol.ADMINISTRADOR.value]:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    success = await delete_image(public_id)

    if not success:
        raise HTTPException(status_code=500, detail="No se pudo eliminar el archivo")

    return {"success": True, "message": "Archivo eliminado"}

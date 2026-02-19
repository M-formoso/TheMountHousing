import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import uuid

# Configurar Cloudinary
def configure_cloudinary():
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        return False

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    return True


async def upload_image(file: UploadFile, folder: str = "unidades") -> dict:
    """
    Sube una imagen a Cloudinary

    Args:
        file: Archivo a subir
        folder: Carpeta en Cloudinary donde guardar

    Returns:
        dict con url, public_id y otros datos
    """
    # Verificar configuración
    if not configure_cloudinary():
        raise HTTPException(
            status_code=500,
            detail="Cloudinary no está configurado. Contacte al administrador."
        )

    # Validar tipo de archivo
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Use: {', '.join(allowed_types)}"
        )

    # Validar tamaño (máximo 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="El archivo es demasiado grande. Máximo 10MB."
        )

    try:
        # Generar un ID único para el archivo
        public_id = f"{folder}/{uuid.uuid4()}"

        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            public_id=public_id,
            folder=folder,
            resource_type="image",
            transformation=[
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
            "bytes": result.get("bytes"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al subir imagen: {str(e)}"
        )


async def delete_image(public_id: str) -> bool:
    """
    Elimina una imagen de Cloudinary

    Args:
        public_id: ID público de la imagen en Cloudinary

    Returns:
        True si se eliminó correctamente
    """
    if not configure_cloudinary():
        return False

    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, clientes, proyectos, unidades,
    empleados, subcontratistas, proveedores,
    cotizaciones, materiales, maquinaria,
    finanzas, alertas, usuarios, roi, upload,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(usuarios.router)
api_router.include_router(clientes.router)
api_router.include_router(proyectos.router)
api_router.include_router(unidades.router)
api_router.include_router(empleados.router)
api_router.include_router(subcontratistas.router)
api_router.include_router(proveedores.router)
api_router.include_router(cotizaciones.router)
api_router.include_router(materiales.router)
api_router.include_router(maquinaria.router)
api_router.include_router(finanzas.router)
api_router.include_router(alertas.router)
api_router.include_router(roi.router)
api_router.include_router(upload.router)

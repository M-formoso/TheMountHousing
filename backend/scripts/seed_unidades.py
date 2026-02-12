"""
Script para cargar las 20 unidades PH iniciales del proyecto The Mount Housing
"""
import sys
import os
from decimal import Decimal

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.proyecto import Proyecto
from app.models.cliente import Cliente
from app.services.unidad_service import UnidadService
from app.schemas.unidad import UnidadCreate
from uuid import uuid4
from datetime import datetime


# Datos de las 20 unidades PH
UNIDADES_DATA = [
    # PH 1-4: 100 m², USD 1.900/m², USD 190.000
    {"numero_unidad": "PH 1", "tipo_casa": "Estándar", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero_unidad": "PH 2", "tipo_casa": "Estándar", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero_unidad": "PH 3", "tipo_casa": "Estándar", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero_unidad": "PH 4", "tipo_casa": "Estándar", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},

    # PH 5-6: Vendidas
    {"numero_unidad": "PH 5", "tipo_casa": "Pietra", "m2": 140, "precio_m2": None, "precio_total": None, "estado": "vendida"},
    {"numero_unidad": "PH 6", "tipo_casa": "Ether", "m2": 144, "precio_m2": None, "precio_total": None, "estado": "vendida"},

    # PH 7-12: 80 m², USD 2.125/m², USD 170.000
    {"numero_unidad": "PH 7", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero_unidad": "PH 8", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero_unidad": "PH 9", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero_unidad": "PH 10", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero_unidad": "PH 11", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero_unidad": "PH 12", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},

    # PH 13: 300 m², USD 1.500/m², USD 450.000
    {"numero_unidad": "PH 13", "tipo_casa": "Premium", "m2": 300, "precio_m2": 1500, "precio_total": 450000, "estado": "disponible"},

    # PH 14-17: 80 m², USD 2.000/m², USD 160.000
    {"numero_unidad": "PH 14", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero_unidad": "PH 15", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero_unidad": "PH 16", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero_unidad": "PH 17", "tipo_casa": "Estándar", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},

    # PH 18-20: 130 m², USD 1.700/m², USD 221.000
    {"numero_unidad": "PH 18", "tipo_casa": "Estándar Plus", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
    {"numero_unidad": "PH 19", "tipo_casa": "Estándar Plus", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
    {"numero_unidad": "PH 20", "tipo_casa": "Estándar Plus", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
]


def get_or_create_proyecto(db: Session) -> str:
    """Obtiene o crea el proyecto The Mount Housing"""
    proyecto = db.query(Proyecto).filter(Proyecto.nombre.like("%Mount%")).first()

    if not proyecto:
        # Crear un cliente genérico primero si no existe
        cliente = db.query(Cliente).first()
        if not cliente:
            cliente = Cliente(
                id=str(uuid4()),
                numero_cliente="CLI-00001",
                tipo="moral",
                nombre="The Mount Housing",
                email="info@themount.com",
                telefono="5555555555",
                activo=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(cliente)
            db.commit()
            print(f"✅ Cliente creado: {cliente.nombre}")

        # Crear el proyecto
        proyecto = Proyecto(
            id=str(uuid4()),
            codigo="OBRA-2024-001",
            nombre="The Mount Housing - Desarrollo Residencial",
            descripcion="Proyecto residencial con 20 unidades PH de diferentes tipos y tamaños",
            tipo="residencial",
            estado="en_construccion",
            cliente_id=cliente.id,
            direccion="The Mount Housing Complex",
            ciudad="Ciudad de México",
            estado_geo="CDMX",
            activo=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(proyecto)
        db.commit()
        print(f"✅ Proyecto creado: {proyecto.nombre}")

    return proyecto.id


def seed_unidades():
    """Carga las 20 unidades PH en la base de datos"""
    db = SessionLocal()

    try:
        print("🏗️  Iniciando seed de unidades PH...")

        # Obtener o crear el proyecto
        proyecto_id = get_or_create_proyecto(db)
        print(f"📁 Proyecto ID: {proyecto_id}")

        # Verificar si ya existen unidades
        service = UnidadService(db)
        unidades_existentes = service.get_all(proyecto_id=proyecto_id)

        if len(unidades_existentes) >= 20:
            print(f"⚠️  Ya existen {len(unidades_existentes)} unidades en el proyecto. Saltando seed...")
            return

        # Crear las 20 unidades
        contador = 0
        for data in UNIDADES_DATA:
            unidad_create = UnidadCreate(
                numero_unidad=data["numero_unidad"],
                proyecto_id=proyecto_id,
                tipo_casa=data["tipo_casa"],
                metros_cuadrados=Decimal(str(data["m2"])),
                precio_por_m2=Decimal(str(data["precio_m2"])) if data["precio_m2"] else None,
                precio_total=Decimal(str(data["precio_total"])) if data["precio_total"] else None,
                estado=data["estado"],
                descripcion=f"Unidad {data['numero_unidad']} - {data['tipo_casa']} de {data['m2']}m²",
            )

            unidad = service.create(unidad_create)
            contador += 1
            estado_emoji = "✅" if data["estado"] == "disponible" else "🔴"
            print(f"{estado_emoji} {unidad.numero_unidad}: {unidad.metros_cuadrados}m² - ${unidad.precio_total or 'N/A'} - {unidad.estado.upper()}")

        print(f"\n🎉 ¡Seed completado! {contador} unidades creadas exitosamente.")

    except Exception as e:
        print(f"❌ Error durante el seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_unidades()

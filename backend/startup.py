#!/usr/bin/env python3
"""Script de inicio para Railway - corre migraciones y crea/actualiza admin"""
import subprocess
import sys

# Datos de los 20 PH
PH_DATA = [
    {"numero": "PH 1", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero": "PH 2", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero": "PH 3", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero": "PH 4", "m2": 100, "precio_m2": 1900, "precio_total": 190000, "estado": "disponible"},
    {"numero": "PH 5", "m2": 140, "precio_m2": None, "precio_total": None, "estado": "vendida", "nombre": "Casa Pietra"},
    {"numero": "PH 6", "m2": 144, "precio_m2": None, "precio_total": None, "estado": "vendida", "nombre": "Casa Ether"},
    {"numero": "PH 7", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 8", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 9", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 10", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 11", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 12", "m2": 80, "precio_m2": 2125, "precio_total": 170000, "estado": "disponible"},
    {"numero": "PH 13", "m2": 300, "precio_m2": 1500, "precio_total": 450000, "estado": "disponible"},
    {"numero": "PH 14", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero": "PH 15", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero": "PH 16", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero": "PH 17", "m2": 80, "precio_m2": 2000, "precio_total": 160000, "estado": "disponible"},
    {"numero": "PH 18", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
    {"numero": "PH 19", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
    {"numero": "PH 20", "m2": 130, "precio_m2": 1700, "precio_total": 221000, "estado": "disponible"},
]


def seed_unidades(conn):
    """Precargar las 20 unidades PH"""
    from sqlalchemy import text

    print("Seeding PH units...")

    for ph in PH_DATA:
        # Verificar si ya existe
        result = conn.execute(
            text("SELECT id FROM unidades WHERE numero_unidad = :numero"),
            {"numero": ph["numero"]}
        )

        if result.fetchone() is None:
            print(f"  Creating {ph['numero']}...")
            conn.execute(text("""
                INSERT INTO unidades (
                    id, numero_unidad, nombre, metros_cuadrados, precio_por_m2,
                    precio_total, estado, avance_porcentaje, etapa_actual,
                    created_at, updated_at
                )
                VALUES (
                    gen_random_uuid()::text,
                    :numero_unidad,
                    :nombre,
                    :metros_cuadrados,
                    :precio_por_m2,
                    :precio_total,
                    :estado,
                    0,
                    'planos',
                    NOW(),
                    NOW()
                )
            """), {
                "numero_unidad": ph["numero"],
                "nombre": ph.get("nombre"),
                "metros_cuadrados": ph["m2"],
                "precio_por_m2": ph["precio_m2"],
                "precio_total": ph["precio_total"],
                "estado": ph["estado"],
            })
        else:
            print(f"  {ph['numero']} already exists, skipping...")

    conn.commit()
    print("PH units seeded successfully!")


def main():
    print("=== STARTUP SCRIPT ===")

    # Correr migraciones
    print("Running migrations...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    # Crear o actualizar usuario admin
    print("Setting up admin user...")
    try:
        from sqlalchemy import text
        from app.db.session import engine
        import bcrypt

        password = "Admin12345"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        with engine.connect() as conn:
            # Verificar si existe el admin
            result = conn.execute(text("SELECT id FROM usuarios WHERE email = 'admin@constructorapro.com'"))
            if result.fetchone() is None:
                print("Creating admin user...")
                conn.execute(text("""
                    INSERT INTO usuarios (id, email, hashed_password, nombre, apellido_paterno, rol, activo, created_at, updated_at)
                    VALUES (
                        gen_random_uuid()::text,
                        'admin@constructorapro.com',
                        :hashed_password,
                        'Admin',
                        'Sistema',
                        'super_admin',
                        true,
                        NOW(),
                        NOW()
                    )
                """), {"hashed_password": hashed})
                conn.commit()
                print("Admin user created!")
            else:
                # Actualizar password del admin existente
                print("Updating admin password...")
                conn.execute(text("""
                    UPDATE usuarios SET hashed_password = :hashed_password WHERE email = 'admin@constructorapro.com'
                """), {"hashed_password": hashed})
                conn.commit()
                print("Admin password updated!")

            # Precargar unidades PH
            seed_unidades(conn)

    except Exception as e:
        print(f"Warning with startup: {e}")

    print("=== STARTUP COMPLETE ===")

if __name__ == "__main__":
    main()

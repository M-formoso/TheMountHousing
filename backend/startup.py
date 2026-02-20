#!/usr/bin/env python3
"""Script de inicio para Railway - corre migraciones y crea admin"""
import subprocess
import sys

def main():
    print("=== STARTUP SCRIPT ===")

    # Correr migraciones
    print("Running migrations...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    # Crear usuario admin si no existe
    print("Checking admin user...")
    try:
        from sqlalchemy import text
        from app.db.session import engine
        import bcrypt

        with engine.connect() as conn:
            # Verificar si existe el admin
            result = conn.execute(text("SELECT id FROM usuarios WHERE email = 'admin@constructorapro.com'"))
            if result.fetchone() is None:
                print("Creating admin user...")
                # Generar hash del password
                password = "Admin123!"
                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

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
                print("Admin user already exists")
    except Exception as e:
        print(f"Warning creating admin: {e}")

    print("=== STARTUP COMPLETE ===")

if __name__ == "__main__":
    main()

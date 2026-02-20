#!/usr/bin/env python3
"""Script de inicio para Railway - resetea DB y corre migraciones"""
import os
import subprocess
import sys

from sqlalchemy import text
from app.db.session import engine

def main():
    print("=== STARTUP SCRIPT ===")

    # 1. Borrar TODO el schema public y recrearlo
    print("Resetting database schema...")
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP SCHEMA public CASCADE"))
            conn.execute(text("CREATE SCHEMA public"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
            conn.commit()
            print("Database schema reset successfully!")
    except Exception as e:
        print(f"Warning: Could not reset schema: {e}")

    # 2. Correr migraciones
    print("Running migrations...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        print(f"Migration failed with code {result.returncode}")
        sys.exit(1)

    print("Migrations completed successfully!")
    print("=== STARTUP COMPLETE ===")

if __name__ == "__main__":
    main()

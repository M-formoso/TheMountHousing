#!/usr/bin/env python3
"""Script de inicio para Railway - resetea alembic y corre migraciones"""
import os
import subprocess
import sys

from sqlalchemy import text
from app.db.session import engine

def main():
    print("=== STARTUP SCRIPT ===")

    # 1. Intentar dropear alembic_version para forzar migraciones
    print("Checking database connection and resetting alembic...")
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            conn.commit()
            print("Alembic version table dropped (if existed)")
    except Exception as e:
        print(f"Warning: Could not reset alembic_version: {e}")

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

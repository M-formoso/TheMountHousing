#!/usr/bin/env python3
"""Script de inicio para Railway - corre migraciones si es necesario"""
import subprocess
import sys

def main():
    print("=== STARTUP SCRIPT ===")

    # Correr migraciones (alembic solo aplica las que faltan)
    print("Running migrations...")
    result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        print(f"Migration warning: {result.returncode}")
        # No salir con error, intentar arrancar el servidor de todas formas

    print("=== STARTUP COMPLETE ===")

if __name__ == "__main__":
    main()

"""Add estado especialidad seguro fields to Proveedor

Revision ID: 3c316c4de2c9
Revises: 5725bba3e2fd
Create Date: 2026-02-12 20:41:25.455476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c316c4de2c9'
down_revision: Union[str, None] = '5725bba3e2fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types first
    estadoproveedor = sa.Enum('ACTIVO', 'INACTIVO', 'SUSPENDIDO', name='estadoproveedor')
    especialidadcontratista = sa.Enum('ALBANILERIA', 'PLOMERIA', 'ELECTRICIDAD', 'ACABADOS', 'CARPINTERIA', 'PINTURA', 'SOLDADURA', 'VIDRIERIA', 'JARDINERIA', 'IMPERMEABILIZACION', 'HERRERIA', 'GENERAL', 'OTRO', name='especialidadcontratista')
    estadoproveedor.create(op.get_bind(), checkfirst=True)
    especialidadcontratista.create(op.get_bind(), checkfirst=True)

    # Add estado column with default value for existing rows
    op.add_column('proveedores', sa.Column('estado', estadoproveedor, nullable=True))
    op.execute("UPDATE proveedores SET estado = 'ACTIVO' WHERE estado IS NULL")
    op.alter_column('proveedores', 'estado', nullable=False)

    # Add other columns
    op.add_column('proveedores', sa.Column('especialidad', especialidadcontratista, nullable=True))
    op.add_column('proveedores', sa.Column('numero_licencia', sa.String(length=50), nullable=True))
    op.add_column('proveedores', sa.Column('tiene_seguro', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('proveedores', sa.Column('aseguradora', sa.String(length=100), nullable=True))
    op.add_column('proveedores', sa.Column('numero_poliza', sa.String(length=50), nullable=True))
    op.add_column('proveedores', sa.Column('vigencia_seguro', sa.Date(), nullable=True))
    op.add_column('proveedores', sa.Column('trabajos_completados', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('proveedores', sa.Column('ultima_actividad', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('proveedores', 'ultima_actividad')
    op.drop_column('proveedores', 'trabajos_completados')
    op.drop_column('proveedores', 'vigencia_seguro')
    op.drop_column('proveedores', 'numero_poliza')
    op.drop_column('proveedores', 'aseguradora')
    op.drop_column('proveedores', 'tiene_seguro')
    op.drop_column('proveedores', 'numero_licencia')
    op.drop_column('proveedores', 'especialidad')
    op.drop_column('proveedores', 'estado')

    # Drop enum types
    sa.Enum(name='especialidadcontratista').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='estadoproveedor').drop(op.get_bind(), checkfirst=True)

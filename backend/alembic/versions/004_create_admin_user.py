"""Create initial admin user

Revision ID: 004
Revises: 3c316c4de2c9
Create Date: 2026-02-19

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
import uuid

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '3c316c4de2c9'
branch_labels = None
depends_on = None


def upgrade():
    # Password: Admin123!
    # Hash generado con bcrypt
    hashed_password = '$2b$12$1uZDDcjIkg30cleawBjFzObqk4uiWdP2WES.OH7MOmVArEDpYilG2'

    op.execute(
        f"""
        INSERT INTO usuarios (id, email, hashed_password, nombre, apellido_paterno, rol, activo, created_at, updated_at)
        VALUES (
            '{str(uuid.uuid4())}',
            'admin@constructorapro.com',
            '{hashed_password}',
            'Admin',
            'Sistema',
            'super_admin',
            true,
            '{datetime.utcnow().isoformat()}',
            '{datetime.utcnow().isoformat()}'
        )
        ON CONFLICT (email) DO NOTHING;
        """
    )


def downgrade():
    op.execute("DELETE FROM usuarios WHERE email = 'admin@constructorapro.com';")

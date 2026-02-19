"""Create initial admin user

Revision ID: 004
Revises: 3c316c4de2c9
Create Date: 2026-02-19

"""
from alembic import op
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '3c316c4de2c9'
branch_labels = None
depends_on = None


def upgrade():
    # Password: Admin123!
    # Hash generado con bcrypt
    conn = op.get_bind()
    conn.execute(text("""
        INSERT INTO usuarios (id, email, hashed_password, nombre, apellido_paterno, rol, activo, created_at, updated_at)
        SELECT
            gen_random_uuid()::text,
            'admin@constructorapro.com',
            '$2b$12$1uZDDcjIkg30cleawBjFzObqk4uiWdP2WES.OH7MOmVArEDpYilG2',
            'Admin',
            'Sistema',
            'super_admin',
            true,
            NOW(),
            NOW()
        WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@constructorapro.com');
    """))


def downgrade():
    conn = op.get_bind()
    conn.execute(text("DELETE FROM usuarios WHERE email = 'admin@constructorapro.com';"))

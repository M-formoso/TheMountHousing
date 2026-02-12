"""Add authentication fields to usuarios

Revision ID: 002
Revises: 001
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add authentication fields to usuarios table
    op.add_column('usuarios', sa.Column('is_2fa_enabled', sa.Boolean(), nullable=True, server_default='0'))
    op.add_column('usuarios', sa.Column('totp_secret', sa.String(length=100), nullable=True))
    op.add_column('usuarios', sa.Column('refresh_token', sa.String(length=500), nullable=True))
    op.add_column('usuarios', sa.Column('reset_token', sa.String(length=100), nullable=True))
    op.add_column('usuarios', sa.Column('reset_token_expires', sa.DateTime(), nullable=True))


def downgrade():
    # Remove authentication fields from usuarios table
    op.drop_column('usuarios', 'reset_token_expires')
    op.drop_column('usuarios', 'reset_token')
    op.drop_column('usuarios', 'refresh_token')
    op.drop_column('usuarios', 'totp_secret')
    op.drop_column('usuarios', 'is_2fa_enabled')

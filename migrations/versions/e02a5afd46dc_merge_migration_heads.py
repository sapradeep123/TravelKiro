"""merge_migration_heads

Revision ID: e02a5afd46dc
Revises: 2a02384ab925, add_step7_tables
Create Date: 2025-11-26 08:27:40.286223

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e02a5afd46dc'
down_revision: Union[str, None] = ('2a02384ab925', 'add_step7_tables')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

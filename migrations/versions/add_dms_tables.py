"""add DMS tables (sections, folders_new, files_new)

Revision ID: add_dms_tables
Revises: add_rbac_tables
Create Date: 2025-11-25

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_dms_tables'
down_revision = 'add_rbac_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Create sections table
    op.create_table(
        'sections',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create folders_new table
    op.create_table(
        'folders_new',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('section_id', sa.String(26), sa.ForeignKey('sections.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('parent_folder_id', sa.String(26), sa.ForeignKey('folders_new.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('section_id', 'parent_folder_id', 'name', name='uq_folder_section_parent_name'),
    )
    
    # Create files_new table
    op.create_table(
        'files_new',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('folder_id', sa.String(26), sa.ForeignKey('folders_new.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(500), nullable=False),
        sa.Column('original_filename', sa.String(500), nullable=False),
        sa.Column('mime_type', sa.String(200), nullable=True),
        sa.Column('size_bytes', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('storage_path', sa.String(1000), nullable=False),
        sa.Column('file_hash', sa.String(64), nullable=True),
        sa.Column('is_office_doc', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('office_type', sa.String(50), nullable=True),
        sa.Column('office_url', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
    )
    
    # Create indexes for better query performance
    op.create_index('idx_files_account_folder', 'files_new', ['account_id', 'folder_id'])
    op.create_index('idx_files_hash', 'files_new', ['file_hash'])
    op.create_index('idx_folders_section', 'folders_new', ['section_id'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_folders_section', 'folders_new')
    op.drop_index('idx_files_hash', 'files_new')
    op.drop_index('idx_files_account_folder', 'files_new')
    
    # Drop tables
    op.drop_table('files_new')
    op.drop_table('folders_new')
    op.drop_table('sections')

"""add metadata, tags, notes, and related files

Revision ID: add_metadata_tables
Revises: add_dms_tables
Create Date: 2025-11-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_metadata_tables'
down_revision = 'add_dms_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to files_new table
    op.add_column('files_new', sa.Column('document_id', sa.String(50), nullable=False, server_default='DOC-000000'))
    op.add_column('files_new', sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True))
    op.add_column('files_new', sa.Column('notes', sa.Text(), nullable=True))
    
    # Create unique constraint for document_id per account
    op.create_unique_constraint('uq_file_account_document_id', 'files_new', ['account_id', 'document_id'])
    op.create_index('idx_files_document_id', 'files_new', ['document_id'])
    
    # Create metadata_definitions table
    op.create_table(
        'metadata_definitions',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('section_id', sa.String(26), sa.ForeignKey('sections.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('key', sa.String(100), nullable=False, index=True),
        sa.Column('label', sa.String(200), nullable=False),
        sa.Column('field_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_required', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('options', postgresql.JSONB(), nullable=True),
        sa.Column('validation_rules', postgresql.JSONB(), nullable=True),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('account_id', 'key', name='uq_metadata_def_account_key'),
    )
    
    # Create file_metadata table
    op.create_table(
        'file_metadata',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('file_id', sa.String(26), sa.ForeignKey('files_new.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('definition_id', sa.String(26), sa.ForeignKey('metadata_definitions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('value', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('file_id', 'definition_id', name='uq_file_metadata_file_def'),
    )
    
    # Create related_files table
    op.create_table(
        'related_files',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('file_id', sa.String(26), sa.ForeignKey('files_new.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('related_file_id', sa.String(26), sa.ForeignKey('files_new.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('relationship_type', sa.String(50), nullable=True),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('file_id', 'related_file_id', name='uq_related_files_pair'),
    )
    
    # Create indexes for better query performance
    op.create_index('idx_file_metadata_file', 'file_metadata', ['file_id'])
    op.create_index('idx_related_files_file', 'related_files', ['file_id'])
    op.create_index('idx_related_files_related', 'related_files', ['related_file_id'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_related_files_related', 'related_files')
    op.drop_index('idx_related_files_file', 'related_files')
    op.drop_index('idx_file_metadata_file', 'file_metadata')
    
    # Drop tables
    op.drop_table('related_files')
    op.drop_table('file_metadata')
    op.drop_table('metadata_definitions')
    
    # Drop indexes and constraints from files_new
    op.drop_index('idx_files_document_id', 'files_new')
    op.drop_constraint('uq_file_account_document_id', 'files_new', type_='unique')
    
    # Drop columns from files_new
    op.drop_column('files_new', 'notes')
    op.drop_column('files_new', 'tags')
    op.drop_column('files_new', 'document_id')

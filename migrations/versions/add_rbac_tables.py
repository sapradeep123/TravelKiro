"""add RBAC tables and relationships

Revision ID: add_rbac_tables
Revises: add_user_fields
Create Date: 2025-11-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_rbac_tables'
down_revision = 'add_user_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Create accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False, unique=True, index=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create roles table
    op.create_table(
        'roles',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('is_system', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create groups table
    op.create_table(
        'groups',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('name', 'account_id', name='uq_group_name_account'),
    )
    
    # Create modules table
    op.create_table(
        'modules',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('key', sa.String(50), nullable=False, unique=True, index=True),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create permissions table
    op.create_table(
        'permissions',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('role_id', sa.String(26), sa.ForeignKey('roles.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('module_id', sa.String(26), sa.ForeignKey('modules.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('can_create', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('can_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('can_update', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('can_delete', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('can_admin', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('role_id', 'module_id', name='uq_permission_role_module'),
    )
    
    # Create password_policies table
    op.create_table(
        'password_policies',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=True, unique=True, index=True),
        sa.Column('min_length', sa.Integer(), nullable=False, server_default='8'),
        sa.Column('require_uppercase', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('require_lowercase', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('require_numbers', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('require_special_chars', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('min_special_chars', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('rotation_days', sa.Integer(), nullable=True),
        sa.Column('prevent_reuse_count', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create api_keys table
    op.create_table(
        'api_keys',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('token_hash', sa.String(255), nullable=False, unique=True, index=True),
        sa.Column('scopes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by', sa.String(26), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.TIMESTAMP(timezone=True), nullable=True),
    )
    
    # Create password_history table
    op.create_table(
        'password_history',
        sa.Column('id', sa.String(26), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(26), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # Create association tables
    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.String(26), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('role_id', sa.String(26), sa.ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    
    op.create_table(
        'user_groups',
        sa.Column('user_id', sa.String(26), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('group_id', sa.String(26), sa.ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    
    op.create_table(
        'group_roles',
        sa.Column('group_id', sa.String(26), sa.ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('role_id', sa.String(26), sa.ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    
    op.create_table(
        'account_users',
        sa.Column('account_id', sa.String(26), sa.ForeignKey('accounts.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('user_id', sa.String(26), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('role_type', sa.String(20), nullable=False, server_default='member'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
    )
    
    # Add is_super_admin and password_changed_at to users table
    op.add_column('users', sa.Column('is_super_admin', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('password_changed_at', sa.TIMESTAMP(timezone=True), nullable=True))


def downgrade():
    # Remove columns from users
    op.drop_column('users', 'password_changed_at')
    op.drop_column('users', 'is_super_admin')
    
    # Drop association tables
    op.drop_table('account_users')
    op.drop_table('group_roles')
    op.drop_table('user_groups')
    op.drop_table('user_roles')
    
    # Drop main tables
    op.drop_table('password_history')
    op.drop_table('api_keys')
    op.drop_table('password_policies')
    op.drop_table('permissions')
    op.drop_table('modules')
    op.drop_table('groups')
    op.drop_table('roles')
    op.drop_table('accounts')

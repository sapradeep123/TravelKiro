from typing import List, Optional
from sqlalchemy import select, delete, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.core.exceptions import http_400, http_404
from app.db.tables.rbac.models import (
    Role, Group, Module, Permission, Account, PasswordPolicy, 
    APIKey, PasswordHistory, user_roles, user_groups, account_users
)
from app.db.tables.auth.auth import User
from app.schemas.rbac.schemas import (
    RoleCreate, RoleUpdate, GroupCreate, GroupUpdate,
    ModuleCreate, ModuleUpdate, PermissionCreate, PermissionUpdate,
    AccountCreate, AccountUpdate, PasswordPolicyCreate, PasswordPolicyUpdate,
    APIKeyCreate, APIKeyUpdate
)
import hashlib
import secrets


class RBACRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    # Account Methods
    async def create_account(self, data: AccountCreate) -> Account:
        # Check if slug exists
        stmt = select(Account).where(Account.slug == data.slug)
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Account slug already exists")
        
        account = Account(**data.model_dump())
        self.session.add(account)
        await self.session.commit()
        await self.session.refresh(account)
        return account
    
    async def get_account(self, account_id: str) -> Optional[Account]:
        stmt = select(Account).where(Account.id == account_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_accounts(self, skip: int = 0, limit: int = 100) -> List[Account]:
        stmt = select(Account).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_account(self, account_id: str, data: AccountUpdate) -> Account:
        account = await self.get_account(account_id)
        if not account:
            raise http_404(msg="Account not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(account, key, value)
        
        await self.session.commit()
        await self.session.refresh(account)
        return account
    
    async def delete_account(self, account_id: str):
        account = await self.get_account(account_id)
        if not account:
            raise http_404(msg="Account not found")
        
        await self.session.delete(account)
        await self.session.commit()
    
    # Role Methods
    async def create_role(self, data: RoleCreate) -> Role:
        # Check if role name exists for this account
        stmt = select(Role).where(
            Role.name == data.name,
            Role.account_id == data.account_id if data.account_id else Role.account_id.is_(None)
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Role name already exists for this account")
        
        role = Role(**data.model_dump())
        self.session.add(role)
        await self.session.commit()
        await self.session.refresh(role)
        return role
    
    async def get_role(self, role_id: str) -> Optional[Role]:
        stmt = select(Role).where(Role.id == role_id).options(selectinload(Role.permissions))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_roles(self, account_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Role]:
        stmt = select(Role)
        if account_id:
            stmt = stmt.where(Role.account_id == account_id)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_role(self, role_id: str, data: RoleUpdate) -> Role:
        role = await self.get_role(role_id)
        if not role:
            raise http_404(msg="Role not found")
        
        if role.is_system:
            raise http_400(msg="Cannot modify system role")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(role, key, value)
        
        await self.session.commit()
        await self.session.refresh(role)
        return role
    
    async def delete_role(self, role_id: str):
        role = await self.get_role(role_id)
        if not role:
            raise http_404(msg="Role not found")
        
        if role.is_system:
            raise http_400(msg="Cannot delete system role")
        
        await self.session.delete(role)
        await self.session.commit()
    
    # Group Methods
    async def create_group(self, data: GroupCreate) -> Group:
        # Check if group name exists for this account
        stmt = select(Group).where(
            Group.name == data.name,
            Group.account_id == data.account_id
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Group name already exists for this account")
        
        group = Group(**data.model_dump())
        self.session.add(group)
        await self.session.commit()
        await self.session.refresh(group)
        return group
    
    async def get_group(self, group_id: str) -> Optional[Group]:
        stmt = select(Group).where(Group.id == group_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_groups(self, account_id: str, skip: int = 0, limit: int = 100) -> List[Group]:
        stmt = select(Group).where(Group.account_id == account_id).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_group(self, group_id: str, data: GroupUpdate) -> Group:
        group = await self.get_group(group_id)
        if not group:
            raise http_404(msg="Group not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(group, key, value)
        
        await self.session.commit()
        await self.session.refresh(group)
        return group
    
    async def delete_group(self, group_id: str):
        group = await self.get_group(group_id)
        if not group:
            raise http_404(msg="Group not found")
        
        await self.session.delete(group)
        await self.session.commit()
    
    # Module Methods
    async def create_module(self, data: ModuleCreate) -> Module:
        # Check if module key exists
        stmt = select(Module).where(Module.key == data.key)
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Module key already exists")
        
        module = Module(**data.model_dump())
        self.session.add(module)
        await self.session.commit()
        await self.session.refresh(module)
        return module
    
    async def get_module(self, module_id: str) -> Optional[Module]:
        stmt = select(Module).where(Module.id == module_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_module_by_key(self, key: str) -> Optional[Module]:
        stmt = select(Module).where(Module.key == key)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_modules(self, skip: int = 0, limit: int = 100) -> List[Module]:
        stmt = select(Module).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    # Permission Methods
    async def create_permission(self, data: PermissionCreate) -> Permission:
        # Check if permission already exists
        stmt = select(Permission).where(
            Permission.role_id == data.role_id,
            Permission.module_id == data.module_id
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Permission already exists for this role and module")
        
        permission = Permission(**data.model_dump())
        self.session.add(permission)
        await self.session.commit()
        await self.session.refresh(permission)
        return permission
    
    async def get_permission(self, permission_id: str) -> Optional[Permission]:
        stmt = select(Permission).where(Permission.id == permission_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_permissions_by_role(self, role_id: str) -> List[Permission]:
        stmt = select(Permission).where(Permission.role_id == role_id).options(selectinload(Permission.module))
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_permission(self, permission_id: str, data: PermissionUpdate) -> Permission:
        permission = await self.get_permission(permission_id)
        if not permission:
            raise http_404(msg="Permission not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(permission, key, value)
        
        await self.session.commit()
        await self.session.refresh(permission)
        return permission
    
    async def delete_permission(self, permission_id: str):
        permission = await self.get_permission(permission_id)
        if not permission:
            raise http_404(msg="Permission not found")
        
        await self.session.delete(permission)
        await self.session.commit()
    
    # User-Role Assignment
    async def assign_role_to_user(self, user_id: str, role_id: str):
        # Check if already assigned
        stmt = select(user_roles).where(
            user_roles.c.user_id == user_id,
            user_roles.c.role_id == role_id
        )
        result = await self.session.execute(stmt)
        if result.fetchone():
            raise http_400(msg="Role already assigned to user")
        
        stmt = user_roles.insert().values(user_id=user_id, role_id=role_id)
        await self.session.execute(stmt)
        await self.session.commit()
    
    async def remove_role_from_user(self, user_id: str, role_id: str):
        stmt = delete(user_roles).where(
            user_roles.c.user_id == user_id,
            user_roles.c.role_id == role_id
        )
        await self.session.execute(stmt)
        await self.session.commit()
    
    # User-Group Assignment
    async def assign_group_to_user(self, user_id: str, group_id: str):
        stmt = select(user_groups).where(
            user_groups.c.user_id == user_id,
            user_groups.c.group_id == group_id
        )
        result = await self.session.execute(stmt)
        if result.fetchone():
            raise http_400(msg="Group already assigned to user")
        
        stmt = user_groups.insert().values(user_id=user_id, group_id=group_id)
        await self.session.execute(stmt)
        await self.session.commit()
    
    async def remove_group_from_user(self, user_id: str, group_id: str):
        stmt = delete(user_groups).where(
            user_groups.c.user_id == user_id,
            user_groups.c.group_id == group_id
        )
        await self.session.execute(stmt)
        await self.session.commit()
    
    # User-Account Assignment
    async def assign_user_to_account(self, user_id: str, account_id: str, role_type: str = "member"):
        stmt = select(account_users).where(
            account_users.c.user_id == user_id,
            account_users.c.account_id == account_id
        )
        result = await self.session.execute(stmt)
        if result.fetchone():
            raise http_400(msg="User already assigned to account")
        
        stmt = account_users.insert().values(
            user_id=user_id,
            account_id=account_id,
            role_type=role_type
        )
        await self.session.execute(stmt)
        await self.session.commit()
    
    async def remove_user_from_account(self, user_id: str, account_id: str):
        stmt = delete(account_users).where(
            account_users.c.user_id == user_id,
            account_users.c.account_id == account_id
        )
        await self.session.execute(stmt)
        await self.session.commit()
    
    async def update_user_account_role(self, user_id: str, account_id: str, role_type: str):
        from sqlalchemy import update
        stmt = update(account_users).where(
            account_users.c.user_id == user_id,
            account_users.c.account_id == account_id
        ).values(role_type=role_type)
        await self.session.execute(stmt)
        await self.session.commit()
    
    # Password Policy Methods
    async def create_password_policy(self, data: PasswordPolicyCreate) -> PasswordPolicy:
        policy = PasswordPolicy(**data.model_dump())
        self.session.add(policy)
        await self.session.commit()
        await self.session.refresh(policy)
        return policy
    
    async def get_password_policy(self, account_id: Optional[str] = None) -> Optional[PasswordPolicy]:
        stmt = select(PasswordPolicy)
        if account_id:
            stmt = stmt.where(PasswordPolicy.account_id == account_id)
        else:
            stmt = stmt.where(PasswordPolicy.account_id.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def update_password_policy(self, policy_id: str, data: PasswordPolicyUpdate) -> PasswordPolicy:
        stmt = select(PasswordPolicy).where(PasswordPolicy.id == policy_id)
        result = await self.session.execute(stmt)
        policy = result.scalar_one_or_none()
        
        if not policy:
            raise http_404(msg="Password policy not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(policy, key, value)
        
        await self.session.commit()
        await self.session.refresh(policy)
        return policy
    
    # API Key Methods
    async def create_api_key(self, data: APIKeyCreate, created_by: str) -> tuple[APIKey, str]:
        # Generate random token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        api_key = APIKey(
            **data.model_dump(),
            token_hash=token_hash,
            created_by=created_by
        )
        self.session.add(api_key)
        await self.session.commit()
        await self.session.refresh(api_key)
        
        return api_key, token
    
    async def get_api_key(self, api_key_id: str) -> Optional[APIKey]:
        stmt = select(APIKey).where(APIKey.id == api_key_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_api_keys(self, account_id: str, skip: int = 0, limit: int = 100) -> List[APIKey]:
        stmt = select(APIKey).where(APIKey.account_id == account_id).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_api_key(self, api_key_id: str, data: APIKeyUpdate) -> APIKey:
        api_key = await self.get_api_key(api_key_id)
        if not api_key:
            raise http_404(msg="API key not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(api_key, key, value)
        
        await self.session.commit()
        await self.session.refresh(api_key)
        return api_key
    
    async def delete_api_key(self, api_key_id: str):
        api_key = await self.get_api_key(api_key_id)
        if not api_key:
            raise http_404(msg="API key not found")
        
        await self.session.delete(api_key)
        await self.session.commit()
    
    # Password History
    async def add_password_history(self, user_id: str, password_hash: str):
        history = PasswordHistory(user_id=user_id, password_hash=password_hash)
        self.session.add(history)
        await self.session.commit()
    
    async def get_password_history(self, user_id: str, limit: int = 10) -> List[PasswordHistory]:
        stmt = select(PasswordHistory).where(
            PasswordHistory.user_id == user_id
        ).order_by(PasswordHistory.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    # Check if user is first user (for super admin)
    async def is_first_user(self) -> bool:
        stmt = select(func.count(User.id))
        result = await self.session.execute(stmt)
        count = result.scalar()
        return count == 0

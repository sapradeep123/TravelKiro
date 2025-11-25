from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
import re


# Account Schemas
class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    is_active: bool = True


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    is_active: Optional[bool] = None


class AccountOut(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Role Schemas
class RoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class RoleCreate(RoleBase):
    account_id: Optional[str] = None


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class RoleOut(RoleBase):
    id: str
    account_id: Optional[str]
    is_system: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Group Schemas
class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class GroupCreate(GroupBase):
    account_id: str


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None


class GroupOut(GroupBase):
    id: str
    account_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Module Schemas
class ModuleBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ModuleOut(ModuleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Permission Schemas
class PermissionBase(BaseModel):
    can_create: bool = False
    can_read: bool = False
    can_update: bool = False
    can_delete: bool = False
    can_admin: bool = False


class PermissionCreate(PermissionBase):
    role_id: str
    module_id: str


class PermissionUpdate(PermissionBase):
    pass


class PermissionOut(PermissionBase):
    id: str
    role_id: str
    module_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PermissionWithModule(PermissionOut):
    module: ModuleOut


# Password Policy Schemas
class PasswordPolicyBase(BaseModel):
    min_length: int = Field(8, ge=6, le=128)
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    min_special_chars: int = Field(1, ge=0, le=10)
    rotation_days: Optional[int] = Field(None, ge=0, le=365)
    prevent_reuse_count: int = Field(5, ge=0, le=20)


class PasswordPolicyCreate(PasswordPolicyBase):
    account_id: Optional[str] = None


class PasswordPolicyUpdate(BaseModel):
    min_length: Optional[int] = Field(None, ge=6, le=128)
    require_uppercase: Optional[bool] = None
    require_lowercase: Optional[bool] = None
    require_numbers: Optional[bool] = None
    require_special_chars: Optional[bool] = None
    min_special_chars: Optional[int] = Field(None, ge=0, le=10)
    rotation_days: Optional[int] = Field(None, ge=0, le=365)
    prevent_reuse_count: Optional[int] = Field(None, ge=0, le=20)


class PasswordPolicyOut(PasswordPolicyBase):
    id: str
    account_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# API Key Schemas
class APIKeyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    scopes: Optional[str] = None
    expires_at: Optional[datetime] = None


class APIKeyCreate(APIKeyBase):
    account_id: str


class APIKeyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    is_active: Optional[bool] = None


class APIKeyOut(APIKeyBase):
    id: str
    account_id: str
    is_active: bool
    created_by: str
    created_at: datetime
    last_used_at: Optional[datetime]

    class Config:
        from_attributes = True


class APIKeyWithToken(APIKeyOut):
    token: str  # Only returned on creation


# User Assignment Schemas
class UserRoleAssignment(BaseModel):
    user_id: str
    role_id: str


class UserGroupAssignment(BaseModel):
    user_id: str
    group_id: str


class UserAccountAssignment(BaseModel):
    user_id: str
    account_id: str
    role_type: str = Field("member", pattern=r'^(owner|admin|member)$')


# Bulk Permission Update
class BulkPermissionUpdate(BaseModel):
    role_id: str
    permissions: List[PermissionCreate]


# Password Validation
class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=5)

    @validator('new_password')
    def validate_password_strength(cls, v, values):
        # Basic validation - will be enhanced by policy
        if len(v) < 5:
            raise ValueError('Password must be at least 5 characters')
        return v


# User with RBAC info
class UserWithRBAC(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_super_admin: bool
    roles: List[RoleOut] = []
    groups: List[GroupOut] = []
    accounts: List[AccountOut] = []

    class Config:
        from_attributes = True

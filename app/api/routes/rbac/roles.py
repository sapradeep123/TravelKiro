from fastapi import APIRouter, Depends, status, Header
from typing import List, Optional

from app.api.dependencies.rbac import require_account_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import (
    RoleCreate, RoleUpdate, RoleOut,
    PermissionCreate, PermissionUpdate, PermissionOut, PermissionWithModule,
    UserRoleAssignment
)
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Roles"], prefix="/roles")


@router.post(
    "",
    response_model=RoleOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Create new role"
)
async def create_role(
    data: RoleCreate,
    x_account_id: Optional[str] = Header(None),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create a new role for an account"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_role(data)


@router.get(
    "",
    response_model=List[RoleOut],
    summary="List roles"
)
async def list_roles(
    skip: int = 0,
    limit: int = 100,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """List all roles for an account"""
    return await repository.list_roles(x_account_id, skip, limit)


@router.get(
    "/{role_id}",
    response_model=RoleOut,
    summary="Get role details"
)
async def get_role(
    role_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get role details with permissions"""
    return await repository.get_role(role_id)


@router.patch(
    "/{role_id}",
    response_model=RoleOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update role"
)
async def update_role(
    role_id: str,
    data: RoleUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update role details"""
    return await repository.update_role(role_id, data)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Delete role"
)
async def delete_role(
    role_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Delete role"""
    await repository.delete_role(role_id)


# Permissions for roles
@router.get(
    "/{role_id}/permissions",
    response_model=List[PermissionWithModule],
    summary="Get role permissions"
)
async def get_role_permissions(
    role_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get all permissions for a role"""
    return await repository.list_permissions_by_role(role_id)


@router.post(
    "/{role_id}/permissions",
    response_model=PermissionOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Add permission to role"
)
async def add_permission_to_role(
    role_id: str,
    data: PermissionCreate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Add a permission to a role"""
    data.role_id = role_id
    return await repository.create_permission(data)


@router.patch(
    "/{role_id}/permissions/{permission_id}",
    response_model=PermissionOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update permission"
)
async def update_permission(
    role_id: str,
    permission_id: str,
    data: PermissionUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update a permission"""
    return await repository.update_permission(permission_id, data)


@router.delete(
    "/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Delete permission"
)
async def delete_permission(
    role_id: str,
    permission_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Delete a permission"""
    await repository.delete_permission(permission_id)


# User-Role assignments
@router.post(
    "/assign-user",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Assign role to user"
)
async def assign_role_to_user(
    data: UserRoleAssignment,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Assign a role to a user"""
    await repository.assign_role_to_user(data.user_id, data.role_id)
    return {"message": "Role assigned to user successfully"}


@router.delete(
    "/unassign-user",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Remove role from user"
)
async def remove_role_from_user(
    data: UserRoleAssignment,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Remove a role from a user"""
    await repository.remove_role_from_user(data.user_id, data.role_id)

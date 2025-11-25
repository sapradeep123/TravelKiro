from fastapi import APIRouter, Depends, status, Header
from typing import List, Optional

from app.api.dependencies.rbac import require_super_admin, require_account_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import AccountCreate, AccountUpdate, AccountOut, UserAccountAssignment
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Accounts"], prefix="/accounts")


@router.post(
    "",
    response_model=AccountOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_super_admin())],
    summary="Create new account (Super Admin only)"
)
async def create_account(
    data: AccountCreate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create a new business account"""
    return await repository.create_account(data)


@router.get(
    "",
    response_model=List[AccountOut],
    summary="List all accounts"
)
async def list_accounts(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """List all accounts (users see only their accounts)"""
    # TODO: Filter by user's accounts if not super admin
    return await repository.list_accounts(skip, limit)


@router.get(
    "/{account_id}",
    response_model=AccountOut,
    summary="Get account details"
)
async def get_account(
    account_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get account details"""
    return await repository.get_account(account_id)


@router.patch(
    "/{account_id}",
    response_model=AccountOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update account"
)
async def update_account(
    account_id: str,
    data: AccountUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update account details (Account Admin only)"""
    return await repository.update_account(account_id, data)


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_super_admin())],
    summary="Delete account"
)
async def delete_account(
    account_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Delete account (Super Admin only)"""
    await repository.delete_account(account_id)


@router.post(
    "/{account_id}/users",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Add user to account"
)
async def add_user_to_account(
    account_id: str,
    data: UserAccountAssignment,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Add user to account with role (owner/admin/member)"""
    await repository.assign_user_to_account(data.user_id, account_id, data.role_type)
    return {"message": "User added to account successfully"}


@router.delete(
    "/{account_id}/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Remove user from account"
)
async def remove_user_from_account(
    account_id: str,
    user_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Remove user from account"""
    await repository.remove_user_from_account(user_id, account_id)


@router.patch(
    "/{account_id}/users/{user_id}/role",
    dependencies=[Depends(require_account_admin())],
    summary="Update user role in account"
)
async def update_user_account_role(
    account_id: str,
    user_id: str,
    role_type: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update user's role in account (owner/admin/member)"""
    await repository.update_user_account_role(user_id, account_id, role_type)
    return {"message": "User role updated successfully"}

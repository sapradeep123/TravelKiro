from fastapi import APIRouter, Depends, status, Header
from typing import Optional

from app.api.dependencies.rbac import require_account_admin, require_super_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import PasswordPolicyCreate, PasswordPolicyUpdate, PasswordPolicyOut
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Password Policy"], prefix="/password-policy")


@router.post(
    "",
    response_model=PasswordPolicyOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Create password policy"
)
async def create_password_policy(
    data: PasswordPolicyCreate,
    x_account_id: Optional[str] = Header(None),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create password policy for an account or globally"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_password_policy(data)


@router.get(
    "",
    response_model=PasswordPolicyOut,
    summary="Get password policy"
)
async def get_password_policy(
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get password policy for an account or global policy"""
    policy = await repository.get_password_policy(x_account_id)
    if not policy:
        # Return default policy
        from app.schemas.rbac.schemas import PasswordPolicyBase
        return PasswordPolicyBase()
    return policy


@router.patch(
    "/{policy_id}",
    response_model=PasswordPolicyOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update password policy"
)
async def update_password_policy(
    policy_id: str,
    data: PasswordPolicyUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update password policy"""
    return await repository.update_password_policy(policy_id, data)

from fastapi import APIRouter, Depends, status, Header
from typing import List, Optional

from app.api.dependencies.rbac import require_account_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import GroupCreate, GroupUpdate, GroupOut, UserGroupAssignment
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Groups"], prefix="/groups")


@router.post(
    "",
    response_model=GroupOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Create new group"
)
async def create_group(
    data: GroupCreate,
    x_account_id: Optional[str] = Header(None),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create a new group for an account"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_group(data)


@router.get(
    "",
    response_model=List[GroupOut],
    summary="List groups"
)
async def list_groups(
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """List all groups for an account"""
    return await repository.list_groups(x_account_id, skip, limit)


@router.get(
    "/{group_id}",
    response_model=GroupOut,
    summary="Get group details"
)
async def get_group(
    group_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get group details"""
    return await repository.get_group(group_id)


@router.patch(
    "/{group_id}",
    response_model=GroupOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update group"
)
async def update_group(
    group_id: str,
    data: GroupUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update group details"""
    return await repository.update_group(group_id, data)


@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Delete group"
)
async def delete_group(
    group_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Delete group"""
    await repository.delete_group(group_id)


# User-Group assignments
@router.post(
    "/assign-user",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Assign user to group"
)
async def assign_user_to_group(
    data: UserGroupAssignment,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Assign a user to a group"""
    await repository.assign_group_to_user(data.user_id, data.group_id)
    return {"message": "User assigned to group successfully"}


@router.delete(
    "/unassign-user",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Remove user from group"
)
async def remove_user_from_group(
    data: UserGroupAssignment,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Remove a user from a group"""
    await repository.remove_group_from_user(data.user_id, data.group_id)

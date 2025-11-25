from fastapi import APIRouter, Depends, status, Header, Query
from typing import List, Optional

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.dms_repository import DMSRepository
from app.schemas.dms.schemas import FolderCreate, FolderUpdate, FolderOut, FolderTree
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Folders DMS"], prefix="/folders-dms")


@router.post(
    "",
    response_model=FolderOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("folders", "create"))],
    summary="Create new folder"
)
async def create_folder(
    data: FolderCreate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Create a new folder in a section"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_folder(data, current_user.id)


@router.get(
    "",
    response_model=List[FolderOut],
    dependencies=[Depends(require_permission("folders", "read"))],
    summary="List folders"
)
async def list_folders(
    section_id: Optional[str] = Query(None),
    parent_folder_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """List folders in an account/section"""
    return await repository.list_folders(x_account_id, section_id, parent_folder_id, skip, limit)


@router.get(
    "/tree/{section_id}",
    response_model=List[dict],
    dependencies=[Depends(require_permission("folders", "read"))],
    summary="Get folder tree"
)
async def get_folder_tree(
    section_id: str,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Get complete folder tree for a section"""
    return await repository.get_folder_tree(section_id, x_account_id)


@router.get(
    "/{folder_id}",
    response_model=FolderOut,
    dependencies=[Depends(require_permission("folders", "read"))],
    summary="Get folder"
)
async def get_folder(
    folder_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Get folder details"""
    return await repository.get_folder(folder_id, x_account_id)


@router.patch(
    "/{folder_id}",
    response_model=FolderOut,
    dependencies=[Depends(require_permission("folders", "update"))],
    summary="Update folder"
)
async def update_folder(
    folder_id: str,
    data: FolderUpdate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Update folder"""
    return await repository.update_folder(folder_id, data, x_account_id)


@router.delete(
    "/{folder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("folders", "delete"))],
    summary="Delete folder"
)
async def delete_folder(
    folder_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Delete folder (cascades to files)"""
    await repository.delete_folder(folder_id, x_account_id)

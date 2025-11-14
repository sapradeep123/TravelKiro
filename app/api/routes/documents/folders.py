from typing import List

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth_utils import get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.documents.folders import FolderRepository
from app.schemas.auth.bands import TokenData
from app.schemas.documents.folders import FolderCreate, FolderRead


router = APIRouter(tags=["Folders"])


@router.get(
    "",
    response_model=List[FolderRead],
    status_code=status.HTTP_200_OK,
    name="list_folders",
)
async def list_folders(
    repository: FolderRepository = Depends(FolderRepository),
    user: TokenData = Depends(get_current_user),
) -> List[FolderRead]:
    """
    List all logical folders for the current user.
    """

    return await repository.list_folders(owner=user)


@router.post(
    "",
    response_model=FolderRead,
    status_code=status.HTTP_201_CREATED,
    name="create_folder",
)
async def create_folder(
    folder: FolderCreate,
    repository: FolderRepository = Depends(FolderRepository),
    user: TokenData = Depends(get_current_user),
) -> FolderRead:
    """
    Create a new logical folder for the current user.
    """

    return await repository.create_folder(data=folder, owner=user)



from fastapi import APIRouter, Depends, status, Header
from typing import List, Optional

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.dms_repository import DMSRepository
from app.schemas.dms.schemas import SectionCreate, SectionUpdate, SectionOut
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Sections"], prefix="/sections")


@router.post(
    "",
    response_model=SectionOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("sections", "create"))],
    summary="Create new section"
)
async def create_section(
    data: SectionCreate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Create a new section in an account"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_section(data, current_user.id)


@router.get(
    "",
    response_model=List[SectionOut],
    dependencies=[Depends(require_permission("sections", "read"))],
    summary="List sections"
)
async def list_sections(
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """List all sections for an account"""
    return await repository.list_sections(x_account_id, skip, limit)


@router.get(
    "/{section_id}",
    response_model=SectionOut,
    dependencies=[Depends(require_permission("sections", "read"))],
    summary="Get section"
)
async def get_section(
    section_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Get section details"""
    return await repository.get_section(section_id, x_account_id)


@router.patch(
    "/{section_id}",
    response_model=SectionOut,
    dependencies=[Depends(require_permission("sections", "update"))],
    summary="Update section"
)
async def update_section(
    section_id: str,
    data: SectionUpdate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Update section"""
    return await repository.update_section(section_id, data, x_account_id)


@router.delete(
    "/{section_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("sections", "delete"))],
    summary="Delete section"
)
async def delete_section(
    section_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Delete section (cascades to folders and files)"""
    await repository.delete_section(section_id, x_account_id)

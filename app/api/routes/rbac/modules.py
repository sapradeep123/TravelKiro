from fastapi import APIRouter, Depends, status
from typing import List

from app.api.dependencies.rbac import require_super_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import ModuleCreate, ModuleUpdate, ModuleOut
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Modules"], prefix="/modules")


@router.post(
    "",
    response_model=ModuleOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_super_admin())],
    summary="Create new module (Super Admin only)"
)
async def create_module(
    data: ModuleCreate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create a new module"""
    return await repository.create_module(data)


@router.get(
    "",
    response_model=List[ModuleOut],
    summary="List all modules"
)
async def list_modules(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """List all available modules"""
    return await repository.list_modules(skip, limit)


@router.get(
    "/{module_id}",
    response_model=ModuleOut,
    summary="Get module details"
)
async def get_module(
    module_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get module details"""
    return await repository.get_module(module_id)

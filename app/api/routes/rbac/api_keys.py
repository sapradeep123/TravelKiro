from fastapi import APIRouter, Depends, status, Header
from typing import List, Optional

from app.api.dependencies.rbac import require_account_admin, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.rbac.rbac_repository import RBACRepository
from app.schemas.rbac.schemas import APIKeyCreate, APIKeyUpdate, APIKeyOut, APIKeyWithToken
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["API Keys"], prefix="/api-keys")


@router.post(
    "",
    response_model=APIKeyWithToken,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_account_admin())],
    summary="Create API key"
)
async def create_api_key(
    data: APIKeyCreate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Create a new API key for an account"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    
    api_key, token = await repository.create_api_key(data, current_user.id)
    
    # Return with token (only shown once)
    result = APIKeyWithToken(**api_key.__dict__, token=token)
    return result


@router.get(
    "",
    response_model=List[APIKeyOut],
    summary="List API keys"
)
async def list_api_keys(
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """List all API keys for an account"""
    return await repository.list_api_keys(x_account_id, skip, limit)


@router.get(
    "/{api_key_id}",
    response_model=APIKeyOut,
    summary="Get API key details"
)
async def get_api_key(
    api_key_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Get API key details (token not included)"""
    return await repository.get_api_key(api_key_id)


@router.patch(
    "/{api_key_id}",
    response_model=APIKeyOut,
    dependencies=[Depends(require_account_admin())],
    summary="Update API key"
)
async def update_api_key(
    api_key_id: str,
    data: APIKeyUpdate,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Update API key (e.g., deactivate)"""
    return await repository.update_api_key(api_key_id, data)


@router.delete(
    "/{api_key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_account_admin())],
    summary="Delete API key"
)
async def delete_api_key(
    api_key_id: str,
    repository: RBACRepository = Depends(get_repository(RBACRepository))
):
    """Delete (revoke) an API key"""
    await repository.delete_api_key(api_key_id)

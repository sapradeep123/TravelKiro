from fastapi import APIRouter, Depends, Header

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.metadata_repository import MetadataRepository
from app.schemas.dms.schemas import SearchRequest, SearchResponse
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Search"], prefix="/search")


@router.post(
    "",
    response_model=SearchResponse,
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Search files"
)
async def search_files(
    search_request: SearchRequest,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """
    Search files by name, metadata, tags, notes, and content.
    
    Scope options:
    - name: Search in file names only
    - metadata: Search in tags and notes
    - content: Search in file content (placeholder for future)
    - all: Search everywhere
    """
    results, total = await repository.search_files(x_account_id, search_request)
    
    return SearchResponse(
        results=results,
        total=total,
        query=search_request.q,
        scope=search_request.scope
    )

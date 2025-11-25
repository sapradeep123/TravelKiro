from fastapi import APIRouter, Depends, status, Header, Query
from typing import List, Optional

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.metadata_repository import MetadataRepository
from app.schemas.dms.schemas import (
    MetadataDefinitionCreate, MetadataDefinitionUpdate, MetadataDefinitionOut,
    FileMetadataValue, FileMetadataBulkUpdate,
    RelatedFileCreate, RelatedFileOut, RelatedFileDetail
)
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["Metadata"], prefix="/metadata-dms")


# ==================== METADATA DEFINITIONS ====================

@router.post(
    "/definitions",
    response_model=MetadataDefinitionOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("metadata", "create"))],
    summary="Create metadata definition"
)
async def create_metadata_definition(
    data: MetadataDefinitionCreate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Create a new metadata definition for files"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_metadata_definition(data, current_user.id)


@router.get(
    "/definitions",
    response_model=List[MetadataDefinitionOut],
    dependencies=[Depends(require_permission("metadata", "read"))],
    summary="List metadata definitions"
)
async def list_metadata_definitions(
    section_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """List all metadata definitions for an account"""
    return await repository.list_metadata_definitions(x_account_id, section_id, skip, limit)


@router.get(
    "/definitions/{definition_id}",
    response_model=MetadataDefinitionOut,
    dependencies=[Depends(require_permission("metadata", "read"))],
    summary="Get metadata definition"
)
async def get_metadata_definition(
    definition_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Get metadata definition details"""
    return await repository.get_metadata_definition(definition_id, x_account_id)


@router.patch(
    "/definitions/{definition_id}",
    response_model=MetadataDefinitionOut,
    dependencies=[Depends(require_permission("metadata", "update"))],
    summary="Update metadata definition"
)
async def update_metadata_definition(
    definition_id: str,
    data: MetadataDefinitionUpdate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Update metadata definition"""
    return await repository.update_metadata_definition(definition_id, data, x_account_id)


@router.delete(
    "/definitions/{definition_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("metadata", "delete"))],
    summary="Delete metadata definition"
)
async def delete_metadata_definition(
    definition_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Delete metadata definition (cascades to file metadata)"""
    await repository.delete_metadata_definition(definition_id, x_account_id)


# ==================== FILE METADATA ====================

@router.get(
    "/files/{file_id}",
    response_model=List[FileMetadataValue],
    dependencies=[Depends(require_permission("metadata", "read"))],
    summary="Get file metadata"
)
async def get_file_metadata(
    file_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Get all metadata values for a file"""
    return await repository.get_file_metadata(file_id)


@router.put(
    "/files/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("metadata", "update"))],
    summary="Update file metadata"
)
async def update_file_metadata(
    file_id: str,
    data: FileMetadataBulkUpdate,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Bulk update metadata values for a file (upsert)"""
    await repository.update_file_metadata(file_id, data.metadata)


@router.delete(
    "/files/{file_id}/{definition_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("metadata", "delete"))],
    summary="Delete file metadata value"
)
async def delete_file_metadata(
    file_id: str,
    definition_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Delete specific metadata value from file"""
    await repository.delete_file_metadata(file_id, definition_id)


# ==================== RELATED FILES ====================

@router.post(
    "/related",
    response_model=RelatedFileOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Link related files"
)
async def create_related_file(
    data: RelatedFileCreate,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Link two files together using document_id"""
    return await repository.create_related_file(data, current_user.id)


@router.get(
    "/related/{file_id}",
    response_model=List[RelatedFileDetail],
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Get related files"
)
async def list_related_files(
    file_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Get all files related to a file"""
    return await repository.list_related_files(file_id)


@router.delete(
    "/related/{related_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Remove file link"
)
async def delete_related_file(
    related_id: str,
    current_user: TokenData = Depends(get_current_user),
    repository: MetadataRepository = Depends(get_repository(MetadataRepository))
):
    """Remove link between files"""
    await repository.delete_related_file(related_id)

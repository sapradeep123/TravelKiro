from fastapi import APIRouter, Depends, status, Header, File, UploadFile, Query
from fastapi.responses import StreamingResponse, Response
from typing import List, Optional
import io

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.dms_repository import DMSRepository
from app.schemas.dms.schemas import (
    FileCreate, FileUpdate, FileOut, UploadResponse, BulkUploadResponse,
    OfficeDocCreate, DownloadAllRequest
)
from app.schemas.auth.bands import TokenData
from app.services.storage_service import storage_service

router = APIRouter(tags=["Files DMS"], prefix="/files-dms")


@router.post(
    "/upload",
    response_model=BulkUploadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("files", "create"))],
    summary="Upload files"
)
async def upload_files(
    files: List[UploadFile] = File(...),
    folder_id: str = Query(...),
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Upload one or multiple files to a folder"""
    uploaded = []
    failed = []
    
    for file in files:
        try:
            # Generate storage path
            storage_path = f"files/{x_account_id}/{folder_id}/{file.filename}"
            
            # Upload to S3/MinIO
            size_bytes, file_hash = await storage_service.upload_file(file, storage_path)
            
            # Check for duplicate
            existing = await repository.get_files_by_hash(file_hash, x_account_id)
            if existing:
                # File already exists, skip or link
                uploaded.append(UploadResponse(
                    file_id=existing.id,
                    name=existing.name,
                    size_bytes=existing.size_bytes,
                    mime_type=existing.mime_type,
                    message="File already exists (deduplicated)"
                ))
                continue
            
            # Create file record
            file_data = FileCreate(
                account_id=x_account_id,
                folder_id=folder_id,
                name=file.filename,
                original_filename=file.filename,
                mime_type=file.content_type,
                size_bytes=size_bytes,
                storage_path=storage_path,
                file_hash=file_hash
            )
            
            new_file = await repository.create_file(file_data, current_user.id)
            
            uploaded.append(UploadResponse(
                file_id=new_file.id,
                name=new_file.name,
                size_bytes=new_file.size_bytes,
                mime_type=new_file.mime_type,
                message="Uploaded successfully"
            ))
        except Exception as e:
            failed.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return BulkUploadResponse(
        uploaded=uploaded,
        failed=failed,
        total=len(files),
        success_count=len(uploaded),
        fail_count=len(failed)
    )


@router.post(
    "/upload-zip",
    response_model=BulkUploadResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("files", "create"))],
    summary="Upload and extract ZIP file"
)
async def upload_zip(
    zip_file: UploadFile = File(...),
    folder_id: str = Query(...),
    preserve_structure: bool = Query(True),
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Upload ZIP file and extract contents into folder structure"""
    # Extract ZIP
    extracted_files = await storage_service.extract_zip(zip_file)
    
    uploaded = []
    failed = []
    folder_cache = {}  # Cache created folders
    
    for file_info in extracted_files:
        try:
            # Determine target folder
            target_folder_id = folder_id
            
            if preserve_structure and file_info['folder_path']:
                # Create nested folders
                parent_id = folder_id
                for folder_name in file_info['folder_path']:
                    cache_key = f"{parent_id}:{folder_name}"
                    
                    if cache_key in folder_cache:
                        parent_id = folder_cache[cache_key]
                    else:
                        # Get section_id from parent folder
                        parent_folder = await repository.get_folder(parent_id, x_account_id)
                        
                        # Create subfolder
                        from app.schemas.dms.schemas import FolderCreate
                        folder_data = FolderCreate(
                            account_id=x_account_id,
                            section_id=parent_folder.section_id,
                            parent_folder_id=parent_id,
                            name=folder_name
                        )
                        new_folder = await repository.create_folder(folder_data, current_user.id)
                        folder_cache[cache_key] = new_folder.id
                        parent_id = new_folder.id
                
                target_folder_id = parent_id
            
            # Upload file
            storage_path = f"files/{x_account_id}/{target_folder_id}/{file_info['filename']}"
            
            # Upload content to S3
            from fastapi import UploadFile as FUF
            temp_file = FUF(filename=file_info['filename'], file=io.BytesIO(file_info['content']))
            size_bytes, file_hash = await storage_service.upload_file(temp_file, storage_path)
            
            # Create file record
            file_data = FileCreate(
                account_id=x_account_id,
                folder_id=target_folder_id,
                name=file_info['filename'],
                original_filename=file_info['filename'],
                size_bytes=file_info['size'],
                storage_path=storage_path,
                file_hash=file_hash
            )
            
            new_file = await repository.create_file(file_data, current_user.id)
            
            uploaded.append(UploadResponse(
                file_id=new_file.id,
                name=new_file.name,
                size_bytes=new_file.size_bytes,
                mime_type=new_file.mime_type,
                message=f"Extracted from ZIP: {file_info['original_path']}"
            ))
        except Exception as e:
            failed.append({
                "filename": file_info['filename'],
                "error": str(e)
            })
    
    return BulkUploadResponse(
        uploaded=uploaded,
        failed=failed,
        total=len(extracted_files),
        success_count=len(uploaded),
        fail_count=len(failed)
    )


@router.post(
    "/create-office",
    response_model=FileOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("files", "create"))],
    summary="Create empty Office document"
)
async def create_office_document(
    data: OfficeDocCreate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Create empty Office document (Word/Excel/PowerPoint)"""
    if not data.account_id and x_account_id:
        data.account_id = x_account_id
    return await repository.create_office_document(data, current_user.id)


@router.get(
    "",
    response_model=List[FileOut],
    dependencies=[Depends(require_permission("files", "read"))],
    summary="List files"
)
async def list_files(
    folder_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """List files in account or folder"""
    return await repository.list_files(x_account_id, folder_id, skip, limit)


@router.get(
    "/{file_id}",
    response_model=FileOut,
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Get file"
)
async def get_file(
    file_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Get file details"""
    return await repository.get_file(file_id, x_account_id)


@router.get(
    "/{file_id}/download",
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Download file"
)
async def download_file(
    file_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Download file"""
    file = await repository.get_file(file_id, x_account_id)
    if not file:
        from app.core.exceptions import http_404
        raise http_404(msg="File not found")
    
    # Download from S3
    content = await storage_service.download_file(file.storage_path)
    
    return Response(
        content=content,
        media_type=file.mime_type or 'application/octet-stream',
        headers={
            'Content-Disposition': f'attachment; filename="{file.original_filename}"'
        }
    )


@router.post(
    "/download-all",
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Download all files as ZIP"
)
async def download_all(
    request: DownloadAllRequest,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Download all files in account/section/folder as ZIP"""
    account_id = request.account_id or x_account_id
    
    # Get files based on scope
    if request.folder_id:
        files = await repository.list_files(account_id, request.folder_id, limit=10000)
    elif request.section_id:
        # Get all folders in section, then all files
        from sqlalchemy import select
        from app.db.tables.dms.folders_new import FolderNew
        stmt = select(FolderNew).where(FolderNew.section_id == request.section_id)
        result = await repository.session.execute(stmt)
        folders = result.scalars().all()
        
        files = []
        for folder in folders:
            folder_files = await repository.list_files(account_id, folder.id, limit=10000)
            files.extend(folder_files)
    else:
        # All files in account
        files = await repository.list_files(account_id, limit=10000)
    
    # Prepare file list for ZIP
    file_list = []
    for file in files:
        file_list.append({
            'storage_path': file.storage_path,
            'filename': file.original_filename,
            'folder_path': []  # TODO: Build folder path
        })
    
    # Create ZIP
    zip_content = await storage_service.create_zip(file_list)
    
    return Response(
        content=zip_content,
        media_type='application/zip',
        headers={
            'Content-Disposition': f'attachment; filename="download-{account_id}.zip"'
        }
    )


@router.patch(
    "/{file_id}",
    response_model=FileOut,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Update file"
)
async def update_file(
    file_id: str,
    data: FileUpdate,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Update file metadata"""
    return await repository.update_file(file_id, data, x_account_id)


@router.delete(
    "/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("files", "delete"))],
    summary="Delete file"
)
async def delete_file(
    file_id: str,
    permanent: bool = Query(False),
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Delete file (soft delete by default, permanent if specified)"""
    if permanent:
        await repository.permanent_delete_file(file_id, x_account_id)
    else:
        await repository.soft_delete_file(file_id, x_account_id)


@router.post(
    "/{file_id}/restore",
    response_model=FileOut,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Restore deleted file"
)
async def restore_file(
    file_id: str,
    x_account_id: Optional[str] = Header(None),
    current_user: TokenData = Depends(get_current_user),
    repository: DMSRepository = Depends(get_repository(DMSRepository))
):
    """Restore soft-deleted file"""
    await repository.restore_file(file_id, x_account_id)
    return await repository.get_file(file_id, x_account_id)

from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field


# Metadata Definition Schemas
class MetadataDefinitionBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9_]+$')
    label: str = Field(..., min_length=1, max_length=200)
    field_type: str = Field(..., pattern=r'^(text|number|date|select|multiselect|boolean)$')
    description: Optional[str] = None
    is_required: bool = False
    options: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None


class MetadataDefinitionCreate(MetadataDefinitionBase):
    account_id: str
    section_id: Optional[str] = None


class MetadataDefinitionUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    is_required: Optional[bool] = None
    options: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None


class MetadataDefinitionOut(MetadataDefinitionBase):
    id: str
    account_id: str
    section_id: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# File Metadata Schemas
class FileMetadataValue(BaseModel):
    definition_id: str
    key: str
    label: str
    field_type: str
    value: Any


class FileMetadataUpdate(BaseModel):
    definition_id: str
    value: Any


class FileMetadataBulkUpdate(BaseModel):
    metadata: List[FileMetadataUpdate]


# Related Files Schemas
class RelatedFileCreate(BaseModel):
    file_id: str
    related_document_id: str  # Document ID of the file to link
    relationship_type: Optional[str] = None


class RelatedFileOut(BaseModel):
    id: str
    file_id: str
    related_file_id: str
    relationship_type: Optional[str]
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class RelatedFileDetail(BaseModel):
    """Related file with full file details"""
    id: str
    file_id: str
    file_name: str
    document_id: str
    mime_type: Optional[str]
    size_bytes: int
    relationship_type: Optional[str]
    created_at: datetime


# Search Schemas
class SearchRequest(BaseModel):
    q: str = Field(..., min_length=1)
    section_id: Optional[str] = None
    folder_id: Optional[str] = None
    scope: str = Field("all", pattern=r'^(name|metadata|content|all)$')
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=100)


class SearchResult(BaseModel):
    file_id: str
    document_id: str
    name: str
    folder_id: str
    folder_name: str
    section_id: str
    section_name: str
    mime_type: Optional[str]
    size_bytes: int
    tags: Optional[List[str]]
    match_type: str  # "name", "metadata", "tags", "notes", "content"
    match_snippet: Optional[str]
    created_at: datetime


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    query: str
    scope: str


# Section Schemas
class SectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    position: int = Field(0, ge=0)


class SectionCreate(SectionBase):
    account_id: str


class SectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    position: Optional[int] = Field(None, ge=0)


class SectionOut(SectionBase):
    id: str
    account_id: str
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Folder Schemas
class FolderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class FolderCreate(FolderBase):
    account_id: str
    section_id: str
    parent_folder_id: Optional[str] = None


class FolderUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    parent_folder_id: Optional[str] = None


class FolderOut(FolderBase):
    id: str
    account_id: str
    section_id: str
    parent_folder_id: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FolderTree(FolderOut):
    """Folder with nested subfolders"""
    subfolders: List['FolderTree'] = []
    file_count: int = 0


# File Schemas
class FileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    mime_type: Optional[str] = None


class FileCreate(FileBase):
    account_id: str
    folder_id: str
    original_filename: str
    size_bytes: int
    storage_path: str
    file_hash: Optional[str] = None
    document_id: Optional[str] = None  # Auto-generated if not provided
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class FileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class FileOut(FileBase):
    id: str
    account_id: str
    folder_id: str
    document_id: str
    original_filename: str
    size_bytes: int
    storage_path: str
    file_hash: Optional[str]
    tags: Optional[List[str]]
    notes: Optional[str]
    is_office_doc: bool
    office_type: Optional[str]
    office_url: Optional[str]
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class FileDetailOut(FileOut):
    """File with metadata and related files"""
    metadata: List[FileMetadataValue] = []
    related_files: List[RelatedFileDetail] = []


# Office Document Creation
class OfficeDocCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    folder_id: str
    office_type: str = Field(..., pattern=r'^(word|excel|powerpoint)$')
    account_id: str


# Upload Response
class UploadResponse(BaseModel):
    file_id: str
    name: str
    size_bytes: int
    mime_type: Optional[str]
    message: str


# Bulk Upload Response
class BulkUploadResponse(BaseModel):
    uploaded: List[UploadResponse]
    failed: List[dict]
    total: int
    success_count: int
    fail_count: int


# Download All Request
class DownloadAllRequest(BaseModel):
    account_id: Optional[str] = None
    section_id: Optional[str] = None
    folder_id: Optional[str] = None


# ZIP Upload Request
class ZipUploadRequest(BaseModel):
    folder_id: str
    account_id: str
    preserve_structure: bool = True

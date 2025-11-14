from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import BaseModel

from app.db.tables.base_class import StatusEnum


class DocumentMetadataCreate(BaseModel):
    owner_id: Optional[str] = None
    name: str
    s3_url: str
    access_to: Optional[List[str]] = None
    custom_metadata: Optional[Dict[str, Any]] = None


class DocumentMetadataRead(BaseModel):
    id: UUID
    owner_id: str
    name: str
    s3_url: str
    created_at: datetime
    size: Optional[int] = None
    file_type: Optional[str] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    status: StatusEnum
    file_hash: Optional[str] = None
    access_to: Optional[List[str]] = None
    custom_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FolderBase(BaseModel):
  name: str = Field(..., description="Folder name")
  path: str = Field(..., description="Full folder path relative to the user's root")


class FolderCreate(BaseModel):
  name: str = Field(..., description="Folder name")
  parent_path: Optional[str] = Field(
    default=None,
    description="Parent folder path. If omitted, folder is created at root level.",
  )


class FolderRead(FolderBase):
  id: str
  parent_id: Optional[str] = None
  created_at: datetime

  class Config:
    from_attributes = True



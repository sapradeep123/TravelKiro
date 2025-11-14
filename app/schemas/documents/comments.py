from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CommentCreate(BaseModel):
    comment: str
    doc_id: UUID


class CommentRead(BaseModel):
    id: UUID
    doc_id: UUID
    user_id: str
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CommentUpdate(BaseModel):
    comment: str


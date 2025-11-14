from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DocumentSharingCreate(BaseModel):
    url_id: str
    owner_id: str
    filename: str
    url: str
    expires_at: datetime
    visits: int
    share_to: Optional[List[str]] = None


class DocumentSharingRead(BaseModel):
    url_id: str
    owner_id: str
    filename: str
    url: str
    expires_at: datetime
    visits: int
    share_to: Optional[List[str]] = None

    class Config:
        from_attributes = True


class SharingRequest(BaseModel):
    visits: int = 1  # default value of visits (1)
    share_to: Optional[List[str]] = None  # emails, or usernames of users to share.

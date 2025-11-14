from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship

from app.db.models import Base


class Folder(Base):
    """
    Logical folder for organizing documents. Independent of actual storage.

    A folder belongs to a user (owner_id) and may have a parent folder,
    allowing nested folder structures. The full path is stored in `path`
    (e.g. "Projects/2025/Q1").
    """

    __tablename__ = "folders"

    id: UUID = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        default=uuid4,
        nullable=False,
    )

    owner_id: Mapped[str] = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = Column(String, nullable=False)

    # Full path, unique per user: e.g. "Projects" or "Projects/2025/Q1"
    path: Mapped[str] = Column(String, nullable=False)

    parent_id: Optional[UUID] = Column(
        UUID(as_uuid=True), ForeignKey("folders.id", ondelete="CASCADE"), nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc),
        nullable=False,
        server_default=text("NOW()"),
    )

    owner = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], backref="children")

    # Ensure path is unique per owner
    __table_args__ = (
        UniqueConstraint("owner_id", "path", name="uq_folder_owner_path"),
    )



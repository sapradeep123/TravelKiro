from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text

from app.api.dependencies.repositories import get_ulid
from app.db.models import Base


class FolderNew(Base):
    """
    Enhanced folder model with account scoping and section support.
    Folders can be nested (parent_folder_id) and belong to a section.
    """
    __tablename__ = "folders_new"

    id = Column(String(26), primary_key=True, default=get_ulid, unique=True, index=True, nullable=False)
    account_id = Column(String(26), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(String(26), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_folder_id = Column(String(26), ForeignKey("folders_new.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String(26), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    account = relationship("Account", foreign_keys=[account_id])
    section = relationship("Section", back_populates="folders")
    parent_folder = relationship("FolderNew", remote_side=[id], backref="subfolders")
    creator = relationship("User", foreign_keys=[created_by])
    files = relationship("FileNew", back_populates="folder", cascade="all, delete-orphan")

    # Ensure unique folder names within same parent/section
    __table_args__ = (
        UniqueConstraint("section_id", "parent_folder_id", "name", name="uq_folder_section_parent_name"),
    )

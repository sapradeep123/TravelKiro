from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text

from app.api.dependencies.repositories import get_ulid
from app.db.models import Base


class Section(Base):
    """
    Top-level organizational unit for documents within an account.
    Sections contain folders and provide the first level of organization.
    """
    __tablename__ = "sections"

    id = Column(String(26), primary_key=True, default=get_ulid, unique=True, index=True, nullable=False)
    account_id = Column(String(26), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, default=0, nullable=False)  # For ordering
    created_by = Column(String(26), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    account = relationship("Account", foreign_keys=[account_id])
    creator = relationship("User", foreign_keys=[created_by])
    folders = relationship("FolderNew", back_populates="section", cascade="all, delete-orphan")

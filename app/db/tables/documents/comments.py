from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship

from app.db.models import Base


class DocumentComment(Base):
    __tablename__ = "document_comments"

    id: UUID = Column(
        UUID(as_uuid=True), default=uuid4, primary_key=True, index=True, nullable=False
    )
    doc_id: Mapped[UUID] = Column(
        UUID(as_uuid=True), ForeignKey("document_metadata.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = Column(String, ForeignKey("users.id"), nullable=False)
    comment: str = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc),
        nullable=False,
        server_default=text("NOW()"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=True,
    )

    # Relationships
    document = relationship("DocumentMetadata", back_populates="comments")
    user = relationship("User", back_populates="comments")


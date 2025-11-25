from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, UniqueConstraint, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text

from app.api.dependencies.repositories import get_ulid
from app.db.models import Base


class MetadataDefinition(Base):
    """
    Defines custom metadata fields that can be applied to files.
    Can be scoped to account or specific section.
    """
    __tablename__ = "metadata_definitions"

    id = Column(String(26), primary_key=True, default=get_ulid, unique=True, index=True, nullable=False)
    account_id = Column(String(26), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(String(26), ForeignKey("sections.id", ondelete="CASCADE"), nullable=True, index=True)
    
    key = Column(String(100), nullable=False, index=True)  # e.g., "invoice_number", "client_name"
    label = Column(String(200), nullable=False)  # Display name
    field_type = Column(String(50), nullable=False)  # text, number, date, select, multiselect, boolean
    description = Column(Text, nullable=True)
    is_required = Column(Boolean, default=False, nullable=False)
    
    # For select/multiselect types
    options = Column(JSONB, nullable=True)  # ["option1", "option2"]
    
    # Validation rules
    validation_rules = Column(JSONB, nullable=True)  # {"min": 0, "max": 100, "pattern": "..."}
    
    created_by = Column(String(26), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    account = relationship("Account", foreign_keys=[account_id])
    section = relationship("Section", foreign_keys=[section_id])
    creator = relationship("User", foreign_keys=[created_by])
    file_metadata = relationship("FileMetadata", back_populates="definition", cascade="all, delete-orphan")

    # Ensure unique key per account (or section if scoped)
    __table_args__ = (
        UniqueConstraint("account_id", "key", name="uq_metadata_def_account_key"),
    )


class FileMetadata(Base):
    """
    Stores metadata values for files based on metadata definitions.
    """
    __tablename__ = "file_metadata"

    id = Column(String(26), primary_key=True, default=get_ulid, unique=True, index=True, nullable=False)
    file_id = Column(String(26), ForeignKey("files_new.id", ondelete="CASCADE"), nullable=False, index=True)
    definition_id = Column(String(26), ForeignKey("metadata_definitions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Store value as JSON to support different types
    value = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    file = relationship("FileNew", foreign_keys=[file_id], backref="metadata_values")
    definition = relationship("MetadataDefinition", back_populates="file_metadata")

    # Ensure one value per file per definition
    __table_args__ = (
        UniqueConstraint("file_id", "definition_id", name="uq_file_metadata_file_def"),
    )


class RelatedFile(Base):
    """
    Links files together (many-to-many relationship).
    """
    __tablename__ = "related_files"

    id = Column(String(26), primary_key=True, default=get_ulid, unique=True, index=True, nullable=False)
    file_id = Column(String(26), ForeignKey("files_new.id", ondelete="CASCADE"), nullable=False, index=True)
    related_file_id = Column(String(26), ForeignKey("files_new.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Optional relationship type
    relationship_type = Column(String(50), nullable=True)  # e.g., "attachment", "reference", "version"
    
    created_by = Column(String(26), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    # Relationships
    file = relationship("FileNew", foreign_keys=[file_id], backref="related_links")
    related_file = relationship("FileNew", foreign_keys=[related_file_id])
    creator = relationship("User", foreign_keys=[created_by])

    # Prevent duplicate links
    __table_args__ = (
        UniqueConstraint("file_id", "related_file_id", name="uq_related_files_pair"),
    )

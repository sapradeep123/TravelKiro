from typing import List, Optional, Dict, Any
from sqlalchemy import select, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import http_400, http_404
from app.db.tables.dms.metadata import MetadataDefinition, FileMetadata, RelatedFile
from app.db.tables.dms.files import FileNew
from app.db.tables.dms.folders_new import FolderNew
from app.db.tables.dms.sections import Section
from app.schemas.dms.schemas import (
    MetadataDefinitionCreate, MetadataDefinitionUpdate,
    FileMetadataUpdate, RelatedFileCreate,
    SearchRequest, SearchResult
)


class MetadataRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    # ==================== METADATA DEFINITIONS ====================
    
    async def create_metadata_definition(self, data: MetadataDefinitionCreate, created_by: str) -> MetadataDefinition:
        """Create metadata definition"""
        # Check if key exists
        stmt = select(MetadataDefinition).where(
            MetadataDefinition.account_id == data.account_id,
            MetadataDefinition.key == data.key
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Metadata definition key already exists")
        
        definition = MetadataDefinition(**data.model_dump(), created_by=created_by)
        self.session.add(definition)
        await self.session.commit()
        await self.session.refresh(definition)
        return definition
    
    async def get_metadata_definition(self, definition_id: str, account_id: Optional[str] = None) -> Optional[MetadataDefinition]:
        """Get metadata definition by ID"""
        stmt = select(MetadataDefinition).where(MetadataDefinition.id == definition_id)
        if account_id:
            stmt = stmt.where(MetadataDefinition.account_id == account_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_metadata_definitions(self, account_id: str, section_id: Optional[str] = None, 
                                       skip: int = 0, limit: int = 100) -> List[MetadataDefinition]:
        """List metadata definitions"""
        stmt = select(MetadataDefinition).where(MetadataDefinition.account_id == account_id)
        
        if section_id:
            stmt = stmt.where(
                or_(
                    MetadataDefinition.section_id == section_id,
                    MetadataDefinition.section_id.is_(None)  # Include global definitions
                )
            )
        
        stmt = stmt.order_by(MetadataDefinition.label).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update_metadata_definition(self, definition_id: str, data: MetadataDefinitionUpdate, 
                                        account_id: Optional[str] = None) -> MetadataDefinition:
        """Update metadata definition"""
        definition = await self.get_metadata_definition(definition_id, account_id)
        if not definition:
            raise http_404(msg="Metadata definition not found")
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(definition, key, value)
        
        await self.session.commit()
        await self.session.refresh(definition)
        return definition
    
    async def delete_metadata_definition(self, definition_id: str, account_id: Optional[str] = None):
        """Delete metadata definition (cascades to file metadata)"""
        definition = await self.get_metadata_definition(definition_id, account_id)
        if not definition:
            raise http_404(msg="Metadata definition not found")
        
        await self.session.delete(definition)
        await self.session.commit()
    
    async def get_files_by_definition(self, definition_id: str, account_id: str, 
                                      skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all files that have a value for a specific metadata definition"""
        stmt = select(FileMetadata, FileNew).join(
            FileNew, FileMetadata.file_id == FileNew.id
        ).where(
            FileMetadata.definition_id == definition_id,
            FileNew.account_id == account_id,
            FileNew.is_deleted == False
        ).offset(skip).limit(limit)
        
        result = await self.session.execute(stmt)
        records = result.all()
        
        files_with_values = []
        for metadata, file in records:
            files_with_values.append({
                "file_id": file.id,
                "file_name": file.name,
                "document_id": file.document_id,
                "folder_id": file.folder_id,
                "mime_type": file.mime_type,
                "value": metadata.value,
                "created_at": file.created_at
            })
        
        return files_with_values
    
    async def count_files_by_definition(self, definition_id: str, account_id: str) -> int:
        """Count files that have a value for a specific metadata definition"""
        from sqlalchemy import func
        stmt = select(func.count()).select_from(FileMetadata).join(
            FileNew, FileMetadata.file_id == FileNew.id
        ).where(
            FileMetadata.definition_id == definition_id,
            FileNew.account_id == account_id,
            FileNew.is_deleted == False
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0
    
    # ==================== FILE METADATA ====================
    
    async def get_file_metadata(self, file_id: str) -> List[Dict[str, Any]]:
        """Get all metadata for a file"""
        stmt = select(FileMetadata).where(
            FileMetadata.file_id == file_id
        ).options(selectinload(FileMetadata.definition))
        result = await self.session.execute(stmt)
        metadata_records = result.scalars().all()
        
        return [
            {
                "definition_id": m.definition_id,
                "key": m.definition.key,
                "label": m.definition.label,
                "field_type": m.definition.field_type,
                "value": m.value
            }
            for m in metadata_records
        ]
    
    async def update_file_metadata(self, file_id: str, metadata_updates: List[FileMetadataUpdate]):
        """Bulk update file metadata (upsert)"""
        for update in metadata_updates:
            # Check if metadata exists
            stmt = select(FileMetadata).where(
                FileMetadata.file_id == file_id,
                FileMetadata.definition_id == update.definition_id
            )
            result = await self.session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                # Update
                existing.value = update.value
            else:
                # Insert
                new_metadata = FileMetadata(
                    file_id=file_id,
                    definition_id=update.definition_id,
                    value=update.value
                )
                self.session.add(new_metadata)
        
        await self.session.commit()
    
    async def delete_file_metadata(self, file_id: str, definition_id: str):
        """Delete specific metadata value"""
        stmt = delete(FileMetadata).where(
            FileMetadata.file_id == file_id,
            FileMetadata.definition_id == definition_id
        )
        await self.session.execute(stmt)
        await self.session.commit()
    
    # ==================== RELATED FILES ====================
    
    async def create_related_file(self, data: RelatedFileCreate, created_by: str) -> RelatedFile:
        """Link files together"""
        # Find file by document_id
        stmt = select(FileNew).where(FileNew.document_id == data.related_document_id)
        result = await self.session.execute(stmt)
        related_file = result.scalar_one_or_none()
        
        if not related_file:
            raise http_404(msg=f"File with document_id {data.related_document_id} not found")
        
        # Check if link already exists
        stmt = select(RelatedFile).where(
            RelatedFile.file_id == data.file_id,
            RelatedFile.related_file_id == related_file.id
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise http_400(msg="Files are already linked")
        
        related = RelatedFile(
            file_id=data.file_id,
            related_file_id=related_file.id,
            relationship_type=data.relationship_type,
            created_by=created_by
        )
        self.session.add(related)
        await self.session.commit()
        await self.session.refresh(related)
        return related
    
    async def list_related_files(self, file_id: str) -> List[Dict[str, Any]]:
        """Get all related files for a file"""
        stmt = select(RelatedFile).where(
            RelatedFile.file_id == file_id
        ).options(selectinload(RelatedFile.related_file))
        result = await self.session.execute(stmt)
        related_records = result.scalars().all()
        
        return [
            {
                "id": r.id,
                "file_id": r.related_file_id,
                "file_name": r.related_file.name,
                "document_id": r.related_file.document_id,
                "mime_type": r.related_file.mime_type,
                "size_bytes": r.related_file.size_bytes,
                "relationship_type": r.relationship_type,
                "created_at": r.created_at
            }
            for r in related_records
        ]
    
    async def delete_related_file(self, related_id: str):
        """Remove file link"""
        stmt = select(RelatedFile).where(RelatedFile.id == related_id)
        result = await self.session.execute(stmt)
        related = result.scalar_one_or_none()
        
        if not related:
            raise http_404(msg="Related file link not found")
        
        await self.session.delete(related)
        await self.session.commit()
    
    # ==================== SEARCH ====================
    
    async def search_files(self, account_id: str, search_request: SearchRequest) -> tuple[List[SearchResult], int]:
        """Search files by name, metadata, tags, notes"""
        query = search_request.q.lower()
        
        # Base query
        stmt = select(FileNew).where(
            FileNew.account_id == account_id,
            FileNew.is_deleted == False
        )
        
        # Apply filters
        if search_request.section_id:
            stmt = stmt.join(FolderNew).where(FolderNew.section_id == search_request.section_id)
        
        if search_request.folder_id:
            stmt = stmt.where(FileNew.folder_id == search_request.folder_id)
        
        # Search conditions based on scope
        search_conditions = []
        
        if search_request.scope in ["name", "all"]:
            # Search in file name
            search_conditions.append(FileNew.name.ilike(f"%{query}%"))
        
        if search_request.scope in ["metadata", "all"]:
            # Search in tags
            search_conditions.append(FileNew.tags.contains([query]))
            # Search in notes
            search_conditions.append(FileNew.notes.ilike(f"%{query}%"))
        
        # TODO: Content search - placeholder for future implementation
        # if search_request.scope in ["content", "all"]:
        #     # This would require full-text search on file content
        #     pass
        
        if search_conditions:
            stmt = stmt.where(or_(*search_conditions))
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar()
        
        # Apply pagination
        stmt = stmt.offset(search_request.skip).limit(search_request.limit)
        
        # Load relationships
        stmt = stmt.options(
            selectinload(FileNew.folder).selectinload(FolderNew.section)
        )
        
        result = await self.session.execute(stmt)
        files = result.scalars().all()
        
        # Build search results
        search_results = []
        for file in files:
            # Determine match type
            match_type = "name"
            match_snippet = None
            
            if query in file.name.lower():
                match_type = "name"
                match_snippet = file.name
            elif file.tags and any(query in tag.lower() for tag in file.tags):
                match_type = "tags"
                match_snippet = ", ".join(file.tags)
            elif file.notes and query in file.notes.lower():
                match_type = "notes"
                # Extract snippet around match
                idx = file.notes.lower().find(query)
                start = max(0, idx - 50)
                end = min(len(file.notes), idx + 50)
                match_snippet = "..." + file.notes[start:end] + "..."
            
            search_results.append(SearchResult(
                file_id=file.id,
                document_id=file.document_id,
                name=file.name,
                folder_id=file.folder_id,
                folder_name=file.folder.name,
                section_id=file.folder.section_id,
                section_name=file.folder.section.name,
                mime_type=file.mime_type,
                size_bytes=file.size_bytes,
                tags=file.tags,
                match_type=match_type,
                match_snippet=match_snippet,
                created_at=file.created_at
            ))
        
        return search_results, total

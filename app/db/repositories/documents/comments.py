from typing import List
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import http_404, http_403
from app.db.tables.documents.comments import DocumentComment
from app.db.tables.documents.documents_metadata import DocumentMetadata
from app.schemas.auth.bands import TokenData
from app.schemas.documents.comments import CommentCreate, CommentRead, CommentUpdate


class CommentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.comment_cls = DocumentComment

    async def create_comment(
        self, comment_data: CommentCreate, user: TokenData
    ) -> CommentRead:
        # Verify document exists and user has access
        stmt = select(DocumentMetadata).where(DocumentMetadata.id == comment_data.doc_id)
        result = await self.session.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise http_404(msg="Document not found")

        # Check if user has access (owner or in access_to)
        if doc.owner_id != user.id and (
            not doc.access_to or user.id not in doc.access_to
        ):
            raise http_403(msg="You don't have permission to comment on this document")

        db_comment = DocumentComment(
            doc_id=comment_data.doc_id,
            user_id=user.id,
            comment=comment_data.comment,
        )
        self.session.add(db_comment)
        await self.session.commit()
        await self.session.refresh(db_comment)

        return CommentRead(**db_comment.__dict__)

    async def get_comments(self, doc_id: UUID, user: TokenData) -> List[CommentRead]:
        # Verify document exists and user has access
        stmt = select(DocumentMetadata).where(DocumentMetadata.id == doc_id)
        result = await self.session.execute(stmt)
        doc = result.scalar_one_or_none()

        if not doc:
            raise http_404(msg="Document not found")

        # Check if user has access
        if doc.owner_id != user.id and (
            not doc.access_to or user.id not in doc.access_to
        ):
            raise http_403(msg="You don't have permission to view comments on this document")

        stmt = (
            select(self.comment_cls)
            .where(self.comment_cls.doc_id == doc_id)
            .order_by(self.comment_cls.created_at.desc())
        )
        result = await self.session.execute(stmt)
        comments = result.scalars().all()

        return [CommentRead(**comment.__dict__) for comment in comments]

    async def update_comment(
        self, comment_id: UUID, comment_update: CommentUpdate, user: TokenData
    ) -> CommentRead:
        stmt = select(self.comment_cls).where(self.comment_cls.id == comment_id)
        result = await self.session.execute(stmt)
        comment = result.scalar_one_or_none()

        if not comment:
            raise http_404(msg="Comment not found")

        if comment.user_id != user.id:
            raise http_403(msg="You can only edit your own comments")

        stmt = (
            update(self.comment_cls)
            .where(self.comment_cls.id == comment_id)
            .values(comment=comment_update.comment)
        )
        await self.session.execute(stmt)
        await self.session.commit()

        await self.session.refresh(comment)
        return CommentRead(**comment.__dict__)

    async def delete_comment(self, comment_id: UUID, user: TokenData) -> None:
        stmt = select(self.comment_cls).where(self.comment_cls.id == comment_id)
        result = await self.session.execute(stmt)
        comment = result.scalar_one_or_none()

        if not comment:
            raise http_404(msg="Comment not found")

        # Allow deletion if user is comment owner or document owner
        stmt_doc = select(DocumentMetadata).where(
            DocumentMetadata.id == comment.doc_id
        )
        result_doc = await self.session.execute(stmt_doc)
        doc = result_doc.scalar_one_or_none()

        if comment.user_id != user.id and (not doc or doc.owner_id != user.id):
            raise http_403(msg="You don't have permission to delete this comment")

        stmt = delete(self.comment_cls).where(self.comment_cls.id == comment_id)
        await self.session.execute(stmt)
        await self.session.commit()


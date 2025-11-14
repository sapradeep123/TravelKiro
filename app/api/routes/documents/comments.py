from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException

from app.api.dependencies.auth_utils import get_current_user
from app.api.dependencies.repositories import get_repository
from app.core.exceptions import http_404, http_403
from app.db.repositories.documents.comments import CommentRepository
from app.schemas.auth.bands import TokenData
from app.schemas.documents.comments import CommentCreate, CommentRead, CommentUpdate

router = APIRouter(tags=["Document Comments"])


@router.post(
    "/{doc_id}/comments",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
    name="create_comment",
)
async def create_comment(
    doc_id: UUID,
    comment_data: CommentCreate,
    repository: CommentRepository = Depends(get_repository(CommentRepository)),
    user: TokenData = Depends(get_current_user),
) -> CommentRead:
    """Create a comment on a document"""
    comment_data.doc_id = doc_id
    return await repository.create_comment(comment_data=comment_data, user=user)


@router.get(
    "/{doc_id}/comments",
    response_model=List[CommentRead],
    status_code=status.HTTP_200_OK,
    name="get_comments",
)
async def get_comments(
    doc_id: UUID,
    repository: CommentRepository = Depends(get_repository(CommentRepository)),
    user: TokenData = Depends(get_current_user),
) -> List[CommentRead]:
    """Get all comments for a document"""
    return await repository.get_comments(doc_id=doc_id, user=user)


@router.put(
    "/comments/{comment_id}",
    response_model=CommentRead,
    status_code=status.HTTP_200_OK,
    name="update_comment",
)
async def update_comment(
    comment_id: UUID,
    comment_update: CommentUpdate,
    repository: CommentRepository = Depends(get_repository(CommentRepository)),
    user: TokenData = Depends(get_current_user),
) -> CommentRead:
    """Update a comment"""
    return await repository.update_comment(
        comment_id=comment_id, comment_update=comment_update, user=user
    )


@router.delete(
    "/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    name="delete_comment",
)
async def delete_comment(
    comment_id: UUID,
    repository: CommentRepository = Depends(get_repository(CommentRepository)),
    user: TokenData = Depends(get_current_user),
) -> None:
    """Delete a comment"""
    return await repository.delete_comment(comment_id=comment_id, user=user)


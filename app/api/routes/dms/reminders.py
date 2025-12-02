from fastapi import APIRouter, Depends, status, Header, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.api.dependencies.rbac import require_permission, get_current_user
from app.api.dependencies.repositories import get_repository
from app.db.repositories.dms.reminders_repository import RemindersRepository
from app.db.tables.dms.versioning import ReminderStatus
from app.schemas.auth.bands import TokenData

router = APIRouter(tags=["File Reminders"], prefix="/reminders")


# ==================== SCHEMAS ====================

class ReminderCreate(BaseModel):
    target_user_id: str
    remind_at: datetime
    message: str


class ReminderUpdate(BaseModel):
    status: Optional[str] = None


class ReminderOut(BaseModel):
    id: str
    file_id: str
    created_by: str
    target_user_id: str
    remind_at: datetime
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    # Optional enriched fields
    file_name: Optional[str] = None
    document_id: Optional[str] = None
    creator_username: Optional[str] = None
    target_username: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== ROUTES ====================

@router.get(
    "/me",
    response_model=List[ReminderOut],
    dependencies=[Depends(require_permission("files", "read"))],
    summary="Get my reminders"
)
async def get_my_reminders(
    due: str = Query("all"),
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RemindersRepository = Depends(get_repository(RemindersRepository))
):
    """Get reminders assigned to current user"""
    due_only = due == "now"
    reminders = await repository.list_user_reminders(
        current_user.id, x_account_id, due_only, skip, limit
    )
    
    return [
        ReminderOut(
            id=r.id,
            file_id=r.file_id,
            created_by=r.created_by,
            target_user_id=r.target_user_id,
            remind_at=r.remind_at,
            message=r.message,
            status=r.status.value,
            created_at=r.created_at,
            updated_at=r.updated_at,
            file_name=r.file.name if r.file else None,
            document_id=r.file.document_id if r.file else None,
            creator_username=r.creator.username if r.creator else None
        )
        for r in reminders
    ]


@router.get(
    "/file/{file_id}",
    response_model=List[ReminderOut],
    dependencies=[Depends(require_permission("files", "read"))],
    summary="List file reminders"
)
async def list_file_reminders(
    file_id: str,
    skip: int = 0,
    limit: int = 100,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RemindersRepository = Depends(get_repository(RemindersRepository))
):
    """List all reminders for a specific file"""
    reminders = await repository.list_file_reminders(file_id, skip, limit)
    
    return [
        ReminderOut(
            id=r.id,
            file_id=r.file_id,
            created_by=r.created_by,
            target_user_id=r.target_user_id,
            remind_at=r.remind_at,
            message=r.message,
            status=r.status.value,
            created_at=r.created_at,
            updated_at=r.updated_at,
            creator_username=r.creator.username if r.creator else None,
            target_username=r.target_user.username if r.target_user else None
        )
        for r in reminders
    ]


@router.post(
    "/file/{file_id}",
    response_model=ReminderOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Create file reminder"
)
async def create_reminder(
    file_id: str,
    data: ReminderCreate,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RemindersRepository = Depends(get_repository(RemindersRepository))
):
    """Create a reminder for a file"""
    reminder = await repository.create_reminder(
        file_id=file_id,
        created_by=current_user.id,
        target_user_id=data.target_user_id,
        remind_at=data.remind_at,
        message=data.message
    )
    
    return ReminderOut(
        id=reminder.id,
        file_id=reminder.file_id,
        created_by=reminder.created_by,
        target_user_id=reminder.target_user_id,
        remind_at=reminder.remind_at,
        message=reminder.message,
        status=reminder.status.value,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.patch(
    "/{reminder_id}",
    response_model=ReminderOut,
    dependencies=[Depends(require_permission("files", "update"))],
    summary="Update reminder"
)
async def update_reminder(
    reminder_id: str,
    data: ReminderUpdate,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RemindersRepository = Depends(get_repository(RemindersRepository))
):
    """Update reminder status (dismiss, etc.)"""
    if not data.status:
        from app.core.exceptions import http_400
        raise http_400(msg="Status is required")
    
    try:
        new_status = ReminderStatus(data.status)
    except ValueError:
        from app.core.exceptions import http_400
        raise http_400(msg=f"Invalid status: {data.status}")
    
    reminder = await repository.update_reminder_status(reminder_id, new_status)
    
    if not reminder:
        from app.core.exceptions import http_404
        raise http_404(msg="Reminder not found")
    
    return ReminderOut(
        id=reminder.id,
        file_id=reminder.file_id,
        created_by=reminder.created_by,
        target_user_id=reminder.target_user_id,
        remind_at=reminder.remind_at,
        message=reminder.message,
        status=reminder.status.value,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )


@router.delete(
    "/{reminder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("files", "delete"))],
    summary="Delete reminder"
)
async def delete_reminder(
    reminder_id: str,
    x_account_id: str = Header(...),
    current_user: TokenData = Depends(get_current_user),
    repository: RemindersRepository = Depends(get_repository(RemindersRepository))
):
    """Delete a reminder"""
    deleted = await repository.delete_reminder(reminder_id)
    
    if not deleted:
        from app.core.exceptions import http_404
        raise http_404(msg="Reminder not found")

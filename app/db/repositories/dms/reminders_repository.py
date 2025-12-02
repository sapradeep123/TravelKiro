from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.tables.dms.versioning import FileReminder, ReminderStatus
from app.db.tables.dms.files import FileNew


class RemindersRepository:
    """Repository for file reminders"""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_reminder(
        self,
        file_id: str,
        created_by: str,
        target_user_id: str,
        remind_at: datetime,
        message: str
    ) -> FileReminder:
        """Create a new reminder"""
        reminder = FileReminder(
            file_id=file_id,
            created_by=created_by,
            target_user_id=target_user_id,
            remind_at=remind_at,
            message=message,
            status=ReminderStatus.pending
        )
        self.session.add(reminder)
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def get_reminder(self, reminder_id: str) -> Optional[FileReminder]:
        """Get a reminder by ID"""
        stmt = (
            select(FileReminder)
            .where(FileReminder.id == reminder_id)
            .options(
                selectinload(FileReminder.file),
                selectinload(FileReminder.creator),
                selectinload(FileReminder.target_user)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_file_reminders(
        self,
        file_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[FileReminder]:
        """List reminders for a specific file"""
        stmt = (
            select(FileReminder)
            .where(FileReminder.file_id == file_id)
            .options(
                selectinload(FileReminder.creator),
                selectinload(FileReminder.target_user)
            )
            .order_by(FileReminder.remind_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def list_user_reminders(
        self,
        user_id: str,
        account_id: str,
        due_only: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> List[FileReminder]:
        """List reminders for a specific user (filtered by account through file)"""
        # Join with FileNew to filter by account
        conditions = [
            FileReminder.target_user_id == user_id,
            FileNew.account_id == account_id
        ]
        
        if due_only:
            conditions.append(FileReminder.status == ReminderStatus.pending)
            conditions.append(FileReminder.remind_at <= datetime.now(timezone.utc))
        
        stmt = (
            select(FileReminder)
            .join(FileNew, FileReminder.file_id == FileNew.id)
            .where(and_(*conditions))
            .options(
                selectinload(FileReminder.file),
                selectinload(FileReminder.creator)
            )
            .order_by(FileReminder.remind_at.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_reminder_status(
        self,
        reminder_id: str,
        status: ReminderStatus
    ) -> Optional[FileReminder]:
        """Update reminder status"""
        reminder = await self.get_reminder(reminder_id)
        if not reminder:
            return None
        
        reminder.status = status
        await self.session.commit()
        await self.session.refresh(reminder)
        return reminder

    async def delete_reminder(self, reminder_id: str) -> bool:
        """Delete a reminder"""
        reminder = await self.get_reminder(reminder_id)
        if not reminder:
            return False
        
        await self.session.delete(reminder)
        await self.session.commit()
        return True

    async def get_due_reminders(self) -> List[FileReminder]:
        """Get all pending reminders that are due (for notification processing)"""
        stmt = (
            select(FileReminder)
            .where(
                and_(
                    FileReminder.status == ReminderStatus.pending,
                    FileReminder.remind_at <= datetime.now(timezone.utc)
                )
            )
            .options(
                selectinload(FileReminder.file),
                selectinload(FileReminder.creator),
                selectinload(FileReminder.target_user)
            )
            .order_by(FileReminder.remind_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

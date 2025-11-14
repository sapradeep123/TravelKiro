from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import http_400, http_500
from app.db.tables.documents.folders import Folder
from app.schemas.auth.bands import TokenData
from app.schemas.documents.folders import FolderCreate, FolderRead


class FolderRepository:
    """
    Repository for logical folders used to organize documents.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.folder_cls = Folder

    async def list_folders(self, owner: TokenData) -> List[FolderRead]:
        stmt = select(self.folder_cls).where(self.folder_cls.owner_id == owner.id)
        result = await self.session.execute(stmt)
        folders = result.scalars().all()
        return [FolderRead.from_orm(folder) for folder in folders]

    async def get_by_path(self, owner: TokenData, path: str) -> Optional[Folder]:
        stmt = select(self.folder_cls).where(
            self.folder_cls.owner_id == owner.id, self.folder_cls.path == path
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_folder(self, data: FolderCreate, owner: TokenData) -> FolderRead:
        # Normalize path
        parent_path = (data.parent_path or "").strip().strip("/")
        name = data.name.strip()

        if not name:
            raise http_400(msg="Folder name cannot be empty")

        full_path = f"{parent_path}/{name}" if parent_path else name

        # Check existing folder with same path for this owner
        if await self.get_by_path(owner=owner, path=full_path) is not None:
            raise http_400(msg="Folder with this path already exists")

        parent_id = None
        if parent_path:
            parent = await self.get_by_path(owner=owner, path=parent_path)
            if parent is None:
                # Optionally auto-create missing parent, but for now return error
                raise http_400(
                    msg="Parent folder does not exist. Create the parent first."
                )
            parent_id = parent.id

        folder = Folder(
            owner_id=owner.id,
            name=name,
            path=full_path,
            parent_id=parent_id,
        )

        try:
            self.session.add(folder)
            await self.session.commit()
            await self.session.refresh(folder)
            return FolderRead.from_orm(folder)
        except IntegrityError as e:
            await self.session.rollback()
            raise http_400(msg="Folder already exists") from e
        except Exception as e:  # pragma: no cover - generic safety net
            await self.session.rollback()
            raise http_500(msg=f"Error creating folder: {e}") from e



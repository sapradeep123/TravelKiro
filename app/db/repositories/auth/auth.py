from typing import Any, Coroutine
from datetime import datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth_utils import (
    get_hashed_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.core.exceptions import http_400, http_403
from app.db.tables.auth.auth import User
from app.schemas.auth.bands import UserOut, UserAuth


class AuthRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _check_user_or_none(
        self, userdata: UserAuth
    ) -> Coroutine[Any, Any, Any | None]:
        stmt = select(User).where(
            User.username == userdata.username or User.email == userdata.email
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user(self, field: str, detail: str):
        stmt = ""
        if field == "username":
            stmt = select(User).where(User.username == detail)
        elif field == "email":
            stmt = select(User).where(User.email == detail)
        elif field == "id":
            stmt = select(User).where(User.id == detail)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def is_first_user(self) -> bool:
        """Check if this is the first user (for super admin)"""
        stmt = select(func.count(User.id))
        result = await self.session.execute(stmt)
        count = result.scalar()
        return count == 0

    async def signup(self, userdata: UserAuth) -> UserOut:
        # Checking if the user already exists
        if await self._check_user_or_none(userdata) is not None:
            raise http_400(msg="User with details already exists")

        # Check if this is the first user
        is_first = await self.is_first_user()

        # hashing the password
        hashed_password = get_hashed_password(password=userdata.password)
        userdata.password = hashed_password

        new_user = User(**userdata.model_dump())
        
        # First user becomes super admin
        if is_first:
            new_user.is_super_admin = True
        
        new_user.password_changed_at = datetime.utcnow()

        self.session.add(new_user)
        await self.session.commit()
        await self.session.refresh(new_user)

        return new_user

    async def login(self, ipdata):
        # Try to find user by username first, then by email
        user = await self.get_user(field="username", detail=ipdata.username)
        if user is None:
            # Try email if username didn't work
            user = await self.get_user(field="email", detail=ipdata.username)
        if user is None:
            raise http_403(msg="Recheck the credentials")
        
        # Check if user is active
        if not user.is_active:
            raise http_403(msg="User account is inactive")
        
        user_dict = user.__dict__
        hashed_password = user_dict.get("password")
        if not verify_password(
            password=ipdata.password, hashed_password=hashed_password
        ):
            raise http_403("Incorrect Password")

        return {
            "token_type": "bearer",
            "access_token": create_access_token(
                subject={"id": user_dict.get("id"), "username": user_dict.get("username")}
            ),
            "refresh_token": create_refresh_token(
                subject={"id": user_dict.get("id"), "username": user_dict.get("username")}
            ),
        }

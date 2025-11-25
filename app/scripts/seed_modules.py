"""
Seed script to initialize system modules for RBAC
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.config import settings
from app.db.tables.rbac.models import Module


# Define system modules
SYSTEM_MODULES = [
    {"key": "sections", "display_name": "Sections", "description": "Document sections management"},
    {"key": "folders", "display_name": "Folders", "description": "Folder management"},
    {"key": "files", "display_name": "Files", "description": "File/document management"},
    {"key": "metadata", "display_name": "Metadata", "description": "Document metadata management"},
    {"key": "approvals", "display_name": "Approvals", "description": "Document approval workflows"},
    {"key": "admin_users", "display_name": "User Administration", "description": "User and access management"},
    {"key": "sharing", "display_name": "Sharing", "description": "Document sharing and collaboration"},
    {"key": "retention", "display_name": "Retention", "description": "Document retention policies"},
    {"key": "audit", "display_name": "Audit Logs", "description": "System audit and activity logs"},
    {"key": "inbox", "display_name": "Inbox", "description": "Document inbox and notifications"},
    {"key": "accounts", "display_name": "Accounts", "description": "Business account management"},
    {"key": "api", "display_name": "API Access", "description": "API key and integration management"},
    {"key": "roles", "display_name": "Roles", "description": "Role management"},
    {"key": "groups", "display_name": "Groups", "description": "Group management"},
    {"key": "permissions", "display_name": "Permissions", "description": "Permission management"},
]


async def seed_modules():
    """Seed system modules"""
    engine = create_async_engine(settings.async_database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Seeding system modules...")
        
        for module_data in SYSTEM_MODULES:
            # Check if module already exists
            stmt = select(Module).where(Module.key == module_data["key"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"  ✓ Module '{module_data['key']}' already exists")
            else:
                module = Module(**module_data)
                session.add(module)
                print(f"  + Created module '{module_data['key']}'")
        
        await session.commit()
        print("\n✅ Module seeding complete!")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_modules())

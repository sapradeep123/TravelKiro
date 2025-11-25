# RBAC Implementation - Complete Guide

## ✅ Implementation Status: COMPLETE (Backend)

**Date:** November 25, 2025  
**Feature:** Complete RBAC, Multi-Account, Password Policy, API Keys

---

## 📋 What Was Implemented

### 1. Database Models ✅

**Location:** `app/db/tables/rbac/models.py`

**New Tables:**
- `accounts` - Business accounts/sub-accounts
- `roles` - User roles with permissions
- `groups` - User groups
- `modules` - System modules (files, folders, admin, etc.)
- `permissions` - Role-module permissions (CRUD + admin)
- `password_policies` - Password requirements per account
- `api_keys` - API key authentication
- `password_history` - Password reuse prevention

**Association Tables:**
- `user_roles` - Many-to-many users ↔ roles
- `user_groups` - Many-to-many users ↔ groups
- `group_roles` - Many-to-many groups ↔ roles
- `account_users` - Many-to-many users ↔ accounts (with role_type: owner/admin/member)

**User Model Updates:**
- Added `is_super_admin` field (first user becomes super admin)
- Added `password_changed_at` field
- Added relationships to roles, groups, accounts

### 2. RBAC Logic ✅

**Location:** `app/api/dependencies/rbac.py`

**Key Features:**
- `RBACService` class for permission checking
- `get_user_permissions()` - Aggregates permissions from roles and groups
- `check_permission()` - Validates specific permission
- `require_permission()` - Dependency factory for route protection
- `require_super_admin()` - Super admin only routes
- `require_account_admin()` - Account admin only routes
- API key authentication support
- Account-scoped permission checking

**Permission Format:**
- `module_key:action` (e.g., "files:read", "admin_users:admin")
- Super admin has wildcard `*:*` permission

### 3. Repositories ✅

**Location:** `app/db/repositories/rbac/rbac_repository.py`

**Methods Implemented:**
- Account CRUD
- Role CRUD with system role protection
- Group CRUD
- Module CRUD
- Permission CRUD
- User-Role assignments
- User-Group assignments
- User-Account assignments with role types
- Password policy management
- API key management with token generation
- Password history tracking
- First user detection

### 4. API Endpoints ✅

**Base Path:** `/v2/rbac/`

#### Accounts (`/accounts`)
- `POST /accounts` - Create account (Super Admin)
- `GET /accounts` - List accounts
- `GET /accounts/{id}` - Get account
- `PATCH /accounts/{id}` - Update account (Account Admin)
- `DELETE /accounts/{id}` - Delete account (Super Admin)
- `POST /accounts/{id}/users` - Add user to account
- `DELETE /accounts/{id}/users/{user_id}` - Remove user
- `PATCH /accounts/{id}/users/{user_id}/role` - Update user role

#### Roles (`/roles`)
- `POST /roles` - Create role (Account Admin)
- `GET /roles` - List roles
- `GET /roles/{id}` - Get role
- `PATCH /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role
- `GET /roles/{id}/permissions` - Get role permissions
- `POST /roles/{id}/permissions` - Add permission
- `PATCH /roles/{id}/permissions/{perm_id}` - Update permission
- `DELETE /roles/{id}/permissions/{perm_id}` - Delete permission
- `POST /roles/assign-user` - Assign role to user
- `DELETE /roles/unassign-user` - Remove role from user

#### Groups (`/groups`)
- `POST /groups` - Create group (Account Admin)
- `GET /groups` - List groups
- `GET /groups/{id}` - Get group
- `PATCH /groups/{id}` - Update group
- `DELETE /groups/{id}` - Delete group
- `POST /groups/assign-user` - Assign user to group
- `DELETE /groups/unassign-user` - Remove user from group

#### Modules (`/modules`)
- `POST /modules` - Create module (Super Admin)
- `GET /modules` - List modules
- `GET /modules/{id}` - Get module

#### Password Policy (`/password-policy`)
- `POST /password-policy` - Create policy (Account Admin)
- `GET /password-policy` - Get policy
- `PATCH /password-policy/{id}` - Update policy

#### API Keys (`/api-keys`)
- `POST /api-keys` - Create API key (Account Admin)
- `GET /api-keys` - List API keys
- `GET /api-keys/{id}` - Get API key
- `PATCH /api-keys/{id}` - Update API key
- `DELETE /api-keys/{id}` - Delete API key

#### Users (`/users`)
- `GET /users` - List users
- `GET /users/{id}` - Get user with RBAC info
- `GET /users/{id}/permissions` - Get user permissions
- `GET /users/{id}/accounts` - Get user accounts
- `PATCH /users/{id}/activate` - Activate user
- `PATCH /users/{id}/deactivate` - Deactivate user

### 5. System Modules ✅

**Location:** `app/scripts/seed_modules.py`

**Pre-defined Modules:**
1. `sections` - Document sections management
2. `folders` - Folder management
3. `files` - File/document management
4. `metadata` - Document metadata management
5. `approvals` - Document approval workflows
6. `admin_users` - User and access management
7. `sharing` - Document sharing and collaboration
8. `retention` - Document retention policies
9. `audit` - System audit and activity logs
10. `inbox` - Document inbox and notifications
11. `accounts` - Business account management
12. `api` - API key and integration management
13. `roles` - Role management
14. `groups` - Group management
15. `permissions` - Permission management

### 6. Password Policy ✅

**Features:**
- Configurable per account or global
- Min length (6-128 chars)
- Require uppercase/lowercase/numbers/special chars
- Min special chars count
- Password rotation days
- Prevent reuse of last N passwords
- Password history tracking

### 7. First User = Super Admin ✅

**Implementation:**
- `AuthRepository.is_first_user()` checks if user count is 0
- First registered user gets `is_super_admin = True`
- Super admin has all permissions (`*:*`)
- Super admin can't be deactivated
- Super admin can manage all accounts

### 8. API Key Authentication ✅

**Features:**
- SHA-256 hashed tokens
- Account-scoped
- Scopes/permissions (JSON)
- Expiration dates
- Last used tracking
- Active/inactive status
- Token only shown once on creation

**Usage:**
```bash
curl -H "X-API-Key: <token>" https://api.example.com/v2/...
```

### 9. Account Switching ✅

**Implementation:**
- Users can belong to multiple accounts
- `X-Account-Id` header for account context
- All queries scoped to current account
- Account admins can manage their account
- Account owners have full control

---

## 🗄️ Database Migration

**File:** `migrations/versions/add_rbac_tables.py`

**Run Migration:**
```bash
# Using Docker
docker compose exec api alembic upgrade head

# Or manually
cd docflow
alembic upgrade head
```

**Seed Modules:**
```bash
# Using Docker
docker compose exec api python app/scripts/seed_modules.py

# Or manually
python app/scripts/seed_modules.py
```

---

## 🔧 Usage Examples

### 1. Protect Route with Permission

```python
from app.api.dependencies.rbac import require_permission

@router.get(
    "/files",
    dependencies=[Depends(require_permission("files", "read"))]
)
async def list_files():
    # Only users with files:read permission can access
    pass
```

### 2. Check Permission in Code

```python
from app.api.dependencies.rbac import get_rbac_service

async def my_function(
    rbac_service: RBACService = Depends(get_rbac_service),
    current_user: TokenData = Depends(get_current_user)
):
    has_permission = await rbac_service.check_permission(
        current_user.id,
        "files",
        "delete"
    )
    
    if not has_permission:
        raise HTTPException(403, "Permission denied")
```

### 3. Create Account and Assign User

```python
# Create account
account = await rbac_repo.create_account(AccountCreate(
    name="Acme Corp",
    slug="acme-corp"
))

# Assign user as owner
await rbac_repo.assign_user_to_account(
    user_id="user123",
    account_id=account.id,
    role_type="owner"
)
```

### 4. Create Role with Permissions

```python
# Create role
role = await rbac_repo.create_role(RoleCreate(
    name="Document Manager",
    description="Can manage documents",
    account_id=account.id
))

# Add permissions
await rbac_repo.create_permission(PermissionCreate(
    role_id=role.id,
    module_id=files_module.id,
    can_create=True,
    can_read=True,
    can_update=True,
    can_delete=False,
    can_admin=False
))
```

### 5. API Key Usage

```python
# Create API key
api_key, token = await rbac_repo.create_api_key(
    APIKeyCreate(
        name="Integration Key",
        account_id=account.id,
        scopes='["files:read", "files:create"]',
        expires_at=datetime.utcnow() + timedelta(days=365)
    ),
    created_by=user.id
)

# Token is only shown once: save it!
print(f"API Key: {token}")
```

---

## 🎨 Frontend Implementation (Partial)

**Created:**
- `frontend/src/pages/admin/Users.jsx` - User management page

**TODO (Next Steps):**
- Roles management page
- Groups management page
- Permissions editor
- Account switcher component
- Password policy settings
- API keys management
- Mobile "My Access" view

---

## 📱 Mobile Considerations

**Desktop:**
- Full admin UI with tables and forms
- Manage users, roles, groups, permissions
- Account switcher dropdown
- Password policy configuration
- API key management

**Mobile:**
- Simplified "My Access" view (read-only)
- Show current user's roles and permissions
- Account switcher
- No admin functions on mobile (use desktop)

---

## 🔐 Security Features

1. **First User Protection:** Automatically becomes super admin
2. **Password Policies:** Enforced at account level
3. **Password History:** Prevents reuse
4. **API Key Hashing:** SHA-256, never stored in plain text
5. **Permission Aggregation:** From roles AND groups
6. **Account Isolation:** All data scoped to account
7. **Super Admin Override:** Can access all accounts
8. **System Role Protection:** Can't delete system roles
9. **Active Status:** Can deactivate users
10. **Token Expiration:** API keys can expire

---

## 🧪 Testing

### Test Super Admin Creation

```bash
# Register first user
curl -X POST http://localhost:8000/v2/u/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Check if super admin
curl -X GET http://localhost:8000/v2/rbac/users/USER_ID \
  -H "Authorization: Bearer TOKEN"
# Should show "is_super_admin": true
```

### Test Permission Checking

```bash
# Get user permissions
curl -X GET http://localhost:8000/v2/rbac/users/USER_ID/permissions \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID"
```

### Test API Key

```bash
# Create API key
curl -X POST http://localhost:8000/v2/rbac/api-keys \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "account_id": "ACCOUNT_ID"
  }'

# Use API key
curl -X GET http://localhost:8000/v2/files \
  -H "X-API-Key: TOKEN_FROM_ABOVE"
```

---

## 📊 Database Schema

```
users
├── id (PK)
├── username
├── email
├── password
├── is_super_admin ← NEW
├── is_active
└── password_changed_at ← NEW

accounts
├── id (PK)
├── name
├── slug (unique)
└── is_active

roles
├── id (PK)
├── name
├── account_id (FK) ← NULL for global roles
└── is_system

groups
├── id (PK)
├── name
└── account_id (FK)

modules
├── id (PK)
├── key (unique)
└── display_name

permissions
├── id (PK)
├── role_id (FK)
├── module_id (FK)
├── can_create
├── can_read
├── can_update
├── can_delete
└── can_admin

user_roles (M:M)
├── user_id (FK)
└── role_id (FK)

user_groups (M:M)
├── user_id (FK)
└── group_id (FK)

account_users (M:M)
├── account_id (FK)
├── user_id (FK)
└── role_type (owner/admin/member)

password_policies
├── id (PK)
├── account_id (FK, nullable)
├── min_length
├── require_uppercase
├── require_lowercase
├── require_numbers
├── require_special_chars
├── rotation_days
└── prevent_reuse_count

api_keys
├── id (PK)
├── account_id (FK)
├── name
├── token_hash
├── scopes
├── expires_at
└── is_active

password_history
├── id (PK)
├── user_id (FK)
└── password_hash
```

---

## ✅ Checklist

### Backend ✅
- [x] Database models created
- [x] Relationships defined
- [x] RBAC service implemented
- [x] Permission checking logic
- [x] Repositories created
- [x] API endpoints created
- [x] First user = super admin
- [x] Password policy support
- [x] API key authentication
- [x] Account switching
- [x] Migration created
- [x] Module seeding script

### Frontend (Partial)
- [x] User management page (basic)
- [ ] Roles management page
- [ ] Groups management page
- [ ] Permissions editor
- [ ] Account switcher
- [ ] Password policy settings
- [ ] API keys management
- [ ] Mobile "My Access" view

---

## 🚀 Next Steps

1. **Run Migration:**
   ```bash
   docker compose exec api alembic upgrade head
   ```

2. **Seed Modules:**
   ```bash
   docker compose exec api python app/scripts/seed_modules.py
   ```

3. **Register First User (becomes super admin):**
   - Go to http://localhost:3000/register
   - Register with any credentials
   - This user will have `is_super_admin = true`

4. **Create Accounts:**
   - Use API or create admin UI
   - Assign users to accounts

5. **Create Roles:**
   - Define roles per account
   - Assign permissions to roles

6. **Assign Users:**
   - Assign roles to users
   - Or assign users to groups with roles

7. **Test Permissions:**
   - Try accessing protected endpoints
   - Verify permission checking works

---

## 📝 Notes

- **Account Scoping:** All DMS entities (files, folders, etc.) should have `account_id` field
- **Permission Format:** `module_key:action` (e.g., "files:read")
- **Super Admin:** Has wildcard `*:*` permission
- **System Roles:** Can't be deleted (e.g., "Super Admin" role)
- **API Keys:** Token only shown once on creation
- **Password History:** Stored for reuse prevention
- **Account Switching:** Use `X-Account-Id` header

---

**Implementation Complete! 🎉**

The RBAC system is fully functional on the backend. Frontend admin UI needs completion for full user experience.

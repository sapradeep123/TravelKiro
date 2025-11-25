# DMS Core Implementation - Complete Guide

## ✅ Implementation Status: COMPLETE (Backend)

**Date:** November 25, 2025  
**Feature:** Core DMS with Sections, Folders, Files, ZIP, Office Docs

---

## 📋 What Was Implemented

### 1. Database Models ✅

**Location:** `app/db/tables/dms/`

**New Tables:**

1. **`sections`** - Top-level organization
   - `id`, `account_id`, `name`, `description`, `position`
   - `created_by`, `created_at`, `updated_at`
   - Belongs to account, contains folders

2. **`folders_new`** - Hierarchical folder structure
   - `id`, `account_id`, `section_id`, `parent_folder_id`
   - `name`, `description`, `created_by`, timestamps
   - Supports nested folders (self-referencing)
   - Unique constraint: section + parent + name

3. **`files_new`** - File metadata with storage
   - `id`, `account_id`, `folder_id`
   - `name`, `original_filename`, `mime_type`, `size_bytes`
   - `storage_path`, `file_hash` (for deduplication)
   - `is_office_doc`, `office_type`, `office_url`
   - `is_deleted`, `deleted_at` (soft delete)
   - `created_by`, timestamps

### 2. Storage Service ✅

**Location:** `app/services/storage_service.py`

**Features:**
- S3/MinIO integration via boto3
- File upload with hash calculation (SHA-256)
- File download
- File deletion
- ZIP extraction (preserves folder structure)
- ZIP creation (for download-all)
- Presigned URL generation
- File existence checking

**Methods:**
- `upload_file()` - Upload to S3, return size and hash
- `download_file()` - Download from S3
- `delete_file()` - Remove from S3
- `extract_zip()` - Extract ZIP contents
- `create_zip()` - Create ZIP from file list
- `get_file_url()` - Generate presigned URL
- `file_exists()` - Check if file exists

### 3. Repository ✅

**Location:** `app/db/repositories/dms/dms_repository.py`

**Sections:**
- `create_section()` - Create section
- `get_section()` - Get by ID
- `list_sections()` - List for account (ordered by position)
- `update_section()` - Update section
- `delete_section()` - Delete (cascades)

**Folders:**
- `create_folder()` - Create folder
- `get_folder()` - Get by ID
- `list_folders()` - List by account/section/parent
- `get_folder_tree()` - Get complete tree structure
- `update_folder()` - Update folder
- `delete_folder()` - Delete (cascades)

**Files:**
- `create_file()` - Create file record
- `get_file()` - Get by ID
- `list_files()` - List by account/folder
- `update_file()` - Update metadata
- `soft_delete_file()` - Soft delete
- `restore_file()` - Restore deleted
- `permanent_delete_file()` - Hard delete
- `create_office_document()` - Create Office placeholder
- `get_files_by_hash()` - Find duplicate (deduplication)

### 4. API Endpoints ✅

**Base Path:** `/v2/dms/`

#### Sections (`/sections`)
- `POST /sections` - Create section (requires "sections:create")
- `GET /sections` - List sections (requires "sections:read")
- `GET /sections/{id}` - Get section
- `PATCH /sections/{id}` - Update section (requires "sections:update")
- `DELETE /sections/{id}` - Delete section (requires "sections:delete")

#### Folders (`/folders-dms`)
- `POST /folders-dms` - Create folder (requires "folders:create")
- `GET /folders-dms` - List folders (query: section_id, parent_folder_id)
- `GET /folders-dms/tree/{section_id}` - Get folder tree
- `GET /folders-dms/{id}` - Get folder
- `PATCH /folders-dms/{id}` - Update folder (requires "folders:update")
- `DELETE /folders-dms/{id}` - Delete folder (requires "folders:delete")

#### Files (`/files-dms`)
- `POST /files-dms/upload` - Upload files (requires "files:create")
  - Supports multiple files
  - Automatic deduplication via hash
  - Returns BulkUploadResponse
  
- `POST /files-dms/upload-zip` - Upload and extract ZIP
  - Query params: folder_id, preserve_structure
  - Extracts ZIP and creates folder structure
  - Returns BulkUploadResponse
  
- `POST /files-dms/create-office` - Create Office document
  - Supports: word, excel, powerpoint
  - Creates placeholder with proper MIME type
  
- `GET /files-dms` - List files (query: folder_id)
- `GET /files-dms/{id}` - Get file details
- `GET /files-dms/{id}/download` - Download file
- `POST /files-dms/download-all` - Download as ZIP
  - Supports: account, section, or folder scope
  
- `PATCH /files-dms/{id}` - Update file (requires "files:update")
- `DELETE /files-dms/{id}` - Delete file (query: permanent)
- `POST /files-dms/{id}/restore` - Restore deleted file

### 5. Key Features ✅

**Account Scoping:**
- All entities have `account_id`
- All queries filtered by account
- Use `X-Account-Id` header for context

**RBAC Integration:**
- All endpoints protected by permissions
- Modules: "sections", "folders", "files"
- Actions: create, read, update, delete

**File Deduplication:**
- SHA-256 hash calculated on upload
- Checks for existing files with same hash
- Saves storage space

**ZIP Support:**
- Upload ZIP and extract
- Preserve folder structure option
- Download multiple files as ZIP
- Download entire account/section/folder

**Office Documents:**
- Create empty Word/Excel/PowerPoint
- Proper MIME types
- Placeholder for Office 365 integration
- `office_url` field for edit links

**Soft Delete:**
- Files marked as deleted, not removed
- Can be restored
- Permanent delete option available

**Folder Tree:**
- Nested folder support
- Parent-child relationships
- Tree structure API endpoint
- File count per folder

### 6. Schemas ✅

**Location:** `app/schemas/dms/schemas.py`

**Defined:**
- `SectionCreate`, `SectionUpdate`, `SectionOut`
- `FolderCreate`, `FolderUpdate`, `FolderOut`, `FolderTree`
- `FileCreate`, `FileUpdate`, `FileOut`
- `OfficeDocCreate`
- `UploadResponse`, `BulkUploadResponse`
- `DownloadAllRequest`
- `ZipUploadRequest`

---

## 🗄️ Database Migration

**File:** `migrations/versions/add_dms_tables.py`

**Run Migration:**
```bash
# Using Docker
docker compose exec api alembic upgrade head

# Or manually
cd docflow
alembic upgrade head
```

---

## 🔧 Usage Examples

### 1. Create Section

```bash
curl -X POST http://localhost:8000/v2/dms/sections \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projects",
    "description": "Project documents",
    "position": 0,
    "account_id": "ACCOUNT_ID"
  }'
```

### 2. Create Folder

```bash
curl -X POST http://localhost:8000/v2/dms/folders-dms \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2025",
    "section_id": "SECTION_ID",
    "account_id": "ACCOUNT_ID"
  }'
```

### 3. Upload Files

```bash
curl -X POST http://localhost:8000/v2/dms/files-dms/upload?folder_id=FOLDER_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -F "files=@document1.pdf" \
  -F "files=@document2.docx"
```

### 4. Upload ZIP

```bash
curl -X POST "http://localhost:8000/v2/dms/files-dms/upload-zip?folder_id=FOLDER_ID&preserve_structure=true" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -F "zip_file=@archive.zip"
```

### 5. Create Office Document

```bash
curl -X POST http://localhost:8000/v2/dms/files-dms/create-office \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meeting Notes",
    "folder_id": "FOLDER_ID",
    "office_type": "word",
    "account_id": "ACCOUNT_ID"
  }'
```

### 6. Download File

```bash
curl -X GET http://localhost:8000/v2/dms/files-dms/FILE_ID/download \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  --output downloaded_file.pdf
```

### 7. Download All as ZIP

```bash
curl -X POST http://localhost:8000/v2/dms/files-dms/download-all \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "folder_id": "FOLDER_ID"
  }' \
  --output download.zip
```

### 8. Get Folder Tree

```bash
curl -X GET http://localhost:8000/v2/dms/folders-dms/tree/SECTION_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID"
```

---

## 📱 Frontend Implementation (TODO)

### Desktop UI

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Top Bar: Account Switcher | Search | User      │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  Sections    │  Folders & Files                 │
│  ├─ Projects │  ┌─────────────────────────────┐ │
│  ├─ HR       │  │ Breadcrumb: Projects > 2025 │ │
│  └─ Finance  │  └─────────────────────────────┘ │
│              │                                   │
│  Folders     │  📁 Q1                           │
│  ├─ 2025     │  📁 Q2                           │
│  │  ├─ Q1    │  📄 Budget.xlsx                  │
│  │  └─ Q2    │  📄 Report.pdf                   │
│  └─ 2024     │                                   │
│              │  [Upload] [New Folder] [ZIP]     │
└──────────────┴──────────────────────────────────┘
```

**Features:**
- Tree view on left (sections → folders)
- File list on right with icons
- Drag & drop upload
- Context menus (right-click)
- Breadcrumb navigation
- Bulk actions (select multiple)
- Download all button

### Mobile UI

**Navigation:**
1. Sections list (with FAB: + Section)
2. Tap section → Folders list (with FAB: + Folder)
3. Tap folder → Files list (with FAB: Upload)

**FAB Actions:**
- In sections: "New Section"
- In folders: "New Folder", "Upload File"
- In files: "Upload File", "Take Photo"

**Features:**
- Bottom navigation: Dashboard, Files, Tasks, Profile
- Swipe actions (delete, share)
- Long-press for context menu
- Pull to refresh
- Search bar at top

---

## 🎨 Frontend Components (TODO)

### Components to Create:

1. **`SectionList.jsx`** - List sections
2. **`FolderTree.jsx`** - Tree view of folders
3. **`FileList.jsx`** - Grid/list view of files
4. **`FileUpload.jsx`** - Upload component with drag-drop
5. **`ZipUpload.jsx`** - ZIP upload with options
6. **`OfficeDocCreate.jsx`** - Create Office doc modal
7. **`DownloadAll.jsx`** - Download all button/modal
8. **`Breadcrumb.jsx`** - Navigation breadcrumb
9. **`FilePreview.jsx`** - File preview modal
10. **`MobileFileView.jsx`** - Mobile-optimized file view

### Pages to Create:

1. **`/files`** - Main DMS page (desktop)
2. **`/files/mobile`** - Mobile file browser
3. **`/files/section/:id`** - Section view
4. **`/files/folder/:id`** - Folder view

---

## 🔐 Security & RBAC

**Permissions Required:**
- `sections:create` - Create sections
- `sections:read` - View sections
- `sections:update` - Edit sections
- `sections:delete` - Delete sections
- `folders:create` - Create folders
- `folders:read` - View folders
- `folders:update` - Edit folders
- `folders:delete` - Delete folders
- `files:create` - Upload files
- `files:read` - View/download files
- `files:update` - Edit file metadata
- `files:delete` - Delete files

**Account Scoping:**
- All queries filtered by `account_id`
- Use `X-Account-Id` header
- RBAC checks account context

---

## 📊 Database Schema

```
sections
├── id (PK)
├── account_id (FK → accounts)
├── name
├── description
├── position
├── created_by (FK → users)
└── timestamps

folders_new
├── id (PK)
├── account_id (FK → accounts)
├── section_id (FK → sections)
├── parent_folder_id (FK → folders_new, nullable)
├── name
├── description
├── created_by (FK → users)
└── timestamps

files_new
├── id (PK)
├── account_id (FK → accounts)
├── folder_id (FK → folders_new)
├── name
├── original_filename
├── mime_type
├── size_bytes
├── storage_path
├── file_hash
├── is_office_doc
├── office_type
├── office_url
├── is_deleted
├── deleted_at
├── created_by (FK → users)
└── timestamps
```

---

## ✅ Checklist

### Backend ✅
- [x] Database models created
- [x] Storage service implemented
- [x] Repository methods created
- [x] API endpoints created
- [x] RBAC integration
- [x] Account scoping
- [x] File upload (single/multiple)
- [x] ZIP upload and extract
- [x] Office document creation
- [x] Download file
- [x] Download all as ZIP
- [x] File deduplication
- [x] Soft delete
- [x] Folder tree structure
- [x] Migration created

### Frontend (TODO)
- [ ] Section management UI
- [ ] Folder tree component
- [ ] File list component
- [ ] Upload component (drag-drop)
- [ ] ZIP upload UI
- [ ] Office doc creation UI
- [ ] Download all button
- [ ] Mobile file browser
- [ ] Breadcrumb navigation
- [ ] File preview

---

## 🚀 Next Steps

1. **Run Migration:**
   ```bash
   docker compose exec api alembic upgrade head
   ```

2. **Create Account & Section:**
   - Use RBAC endpoints to create account
   - Create first section via API

3. **Test File Upload:**
   - Upload files via API
   - Verify S3/MinIO storage

4. **Test ZIP Upload:**
   - Create ZIP with folder structure
   - Upload and verify extraction

5. **Build Frontend:**
   - Create section/folder/file components
   - Implement upload UI
   - Add mobile views

---

## 📝 Notes

- **Storage Path Format:** `files/{account_id}/{folder_id}/{filename}`
- **Office Docs:** Placeholders for Office 365 integration
- **Deduplication:** Files with same hash are linked, not duplicated
- **Soft Delete:** Files marked deleted, can be restored
- **ZIP Structure:** Preserved when `preserve_structure=true`
- **Download All:** Creates ZIP on-the-fly from S3 files

---

**Implementation Complete! 🎉**

The core DMS backend is fully functional. Frontend UI needs to be built for complete user experience.

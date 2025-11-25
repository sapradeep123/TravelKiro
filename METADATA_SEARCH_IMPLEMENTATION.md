# Metadata & Search Implementation - Complete Guide

## ✅ Implementation Status: COMPLETE (Backend)

**Date:** November 25, 2025  
**Feature:** Metadata, Tags, Notes, File Linking, Search

---

## 📋 What Was Implemented

### 1. Database Models ✅

**Location:** `app/db/tables/dms/`

**New Tables:**

1. **`metadata_definitions`** - Custom metadata field definitions
   - `id`, `account_id`, `section_id` (optional scope)
   - `key`, `label`, `field_type`, `description`
   - `is_required`, `options`, `validation_rules`
   - Field types: text, number, date, select, multiselect, boolean
   - Unique constraint: account_id + key

2. **`file_metadata`** - Metadata values for files
   - `id`, `file_id`, `definition_id`
   - `value` (JSONB - supports any type)
   - Unique constraint: file_id + definition_id

3. **`related_files`** - File linking
   - `id`, `file_id`, `related_file_id`
   - `relationship_type` (optional: "attachment", "reference", "version")
   - Unique constraint: file_id + related_file_id

**Extended `files_new` Table:**
- ✅ `document_id` - Unique identifier per account (format: DOC-XXXXXX)
- ✅ `tags` - Array of strings for simple tagging
- ✅ `notes` - Text field for free-form notes with link support

### 2. Metadata System ✅

**Features:**
- Admin-defined metadata fields
- Per-account or per-section scope
- Multiple field types with validation
- Bulk upsert for file metadata
- Cascading deletes

**Field Types:**
- `text` - Free text input
- `number` - Numeric values
- `date` - Date values
- `select` - Single selection from options
- `multiselect` - Multiple selections
- `boolean` - True/false

**Validation Rules (JSONB):**
```json
{
  "min": 0,
  "max": 100,
  "pattern": "^[A-Z]{3}-\\d{4}$",
  "required": true
}
```

### 3. File Linking ✅

**Features:**
- Link files using `document_id`
- Bidirectional relationships
- Optional relationship types
- Prevent duplicate links
- List all related files

**Use Cases:**
- Link invoice to contract
- Link document versions
- Link attachments to main document
- Reference related documents

### 4. Tags & Notes ✅

**Tags:**
- Simple array of strings
- Searchable
- No predefined list (free-form)

**Notes:**
- Free-form text field
- Supports markdown/links
- Can reference document_ids
- Searchable

### 5. Search System ✅

**Location:** `app/db/repositories/dms/metadata_repository.py`

**Search Scopes:**
- `name` - Search in file names
- `metadata` - Search in tags and notes
- `content` - Placeholder for future full-text search
- `all` - Search everywhere

**Features:**
- Account-scoped
- Optional section/folder filtering
- Pagination support
- Match type detection (name, tags, notes)
- Snippet extraction for context
- RBAC-compliant

**Search Results Include:**
- File details (id, name, document_id)
- Location (folder, section)
- Match type and snippet
- Tags and metadata

### 6. Repository ✅

**Location:** `app/db/repositories/dms/metadata_repository.py`

**Metadata Definitions:**
- `create_metadata_definition()` - Create definition
- `get_metadata_definition()` - Get by ID
- `list_metadata_definitions()` - List for account/section
- `update_metadata_definition()` - Update definition
- `delete_metadata_definition()` - Delete (cascades)

**File Metadata:**
- `get_file_metadata()` - Get all metadata for file
- `update_file_metadata()` - Bulk upsert metadata values
- `delete_file_metadata()` - Delete specific value

**Related Files:**
- `create_related_file()` - Link files by document_id
- `list_related_files()` - Get all related files
- `delete_related_file()` - Remove link

**Search:**
- `search_files()` - Search with filters and pagination

### 7. API Endpoints ✅

**Base Path:** `/v2/dms/`

#### Metadata Definitions (`/metadata-dms/definitions`)
- `POST /definitions` - Create definition (requires "metadata:create")
- `GET /definitions` - List definitions (query: section_id)
- `GET /definitions/{id}` - Get definition
- `PATCH /definitions/{id}` - Update definition (requires "metadata:update")
- `DELETE /definitions/{id}` - Delete definition (requires "metadata:delete")

#### File Metadata (`/metadata-dms/files`)
- `GET /files/{file_id}` - Get file metadata (requires "metadata:read")
- `PUT /files/{file_id}` - Bulk update metadata (requires "metadata:update")
- `DELETE /files/{file_id}/{definition_id}` - Delete value (requires "metadata:delete")

#### Related Files (`/metadata-dms/related`)
- `POST /related` - Link files (requires "files:update")
- `GET /related/{file_id}` - List related files (requires "files:read")
- `DELETE /related/{related_id}` - Remove link (requires "files:update")

#### Search (`/search`)
- `POST /search` - Search files (requires "files:read")

### 8. Document ID Generation ✅

**Format:** `DOC-XXXXXX` (6 hex characters)

**Features:**
- Auto-generated on file creation
- Unique per account
- Used for file linking
- Displayed in UI for reference

**Example:** `DOC-A3F2B1`, `DOC-9C4E7D`

---

## 🔧 Usage Examples

### 1. Create Metadata Definition

```bash
curl -X POST http://localhost:8000/v2/dms/metadata-dms/definitions \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "ACCOUNT_ID",
    "key": "invoice_number",
    "label": "Invoice Number",
    "field_type": "text",
    "description": "Unique invoice identifier",
    "is_required": true,
    "validation_rules": {
      "pattern": "^INV-\\d{4}$"
    }
  }'
```

### 2. Update File Metadata

```bash
curl -X PUT http://localhost:8000/v2/dms/metadata-dms/files/FILE_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": [
      {
        "definition_id": "DEF_ID_1",
        "value": "INV-1234"
      },
      {
        "definition_id": "DEF_ID_2",
        "value": "2025-01-15"
      }
    ]
  }'
```

### 3. Link Related Files

```bash
curl -X POST http://localhost:8000/v2/dms/metadata-dms/related \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "FILE_ID_1",
    "related_document_id": "DOC-A3F2B1",
    "relationship_type": "attachment"
  }'
```

### 4. Search Files

```bash
curl -X POST http://localhost:8000/v2/dms/search \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "q": "invoice",
    "scope": "all",
    "section_id": "SECTION_ID",
    "skip": 0,
    "limit": 20
  }'
```

### 5. Update File Tags and Notes

```bash
curl -X PATCH http://localhost:8000/v2/dms/files-dms/FILE_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["urgent", "finance", "2025"],
    "notes": "Related to contract DOC-A3F2B1. Needs approval by end of month."
  }'
```

### 6. Get File with Metadata

```bash
curl -X GET http://localhost:8000/v2/dms/files-dms/FILE_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Account-Id: ACCOUNT_ID"
```

### 7. List Related Files

```bash
curl -X GET http://localhost:8000/v2/dms/metadata-dms/related/FILE_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Database Schema

```
files_new (extended)
├── document_id (NEW) - Unique per account
├── tags (NEW) - Array of strings
└── notes (NEW) - Text field

metadata_definitions
├── id (PK)
├── account_id (FK → accounts)
├── section_id (FK → sections, nullable)
├── key (unique per account)
├── label
├── field_type
├── description
├── is_required
├── options (JSONB)
├── validation_rules (JSONB)
├── created_by (FK → users)
└── timestamps

file_metadata
├── id (PK)
├── file_id (FK → files_new)
├── definition_id (FK → metadata_definitions)
├── value (JSONB)
└── timestamps

related_files
├── id (PK)
├── file_id (FK → files_new)
├── related_file_id (FK → files_new)
├── relationship_type
├── created_by (FK → users)
└── created_at
```

---

## 🔍 Search Implementation

### Current Implementation

**Searches:**
- File names (case-insensitive)
- Tags (array contains)
- Notes (case-insensitive)

**Filters:**
- Account (required)
- Section (optional)
- Folder (optional)
- Scope (name/metadata/all)

**Results:**
- Paginated
- Match type detection
- Snippet extraction
- Full file details

### Future Enhancement: Content Search

**Placeholder for:**
- Full-text search in file content
- PDF text extraction
- Office document text extraction
- OCR for images

**Implementation Path:**
1. Extract text on upload
2. Store in separate table or search index
3. Use PostgreSQL full-text search or Elasticsearch
4. Update search endpoint to include content

---

## 🎨 Frontend Implementation (TODO)

### Desktop UI

**File Detail Panel:**
```
┌─────────────────────────────────────────┐
│ File: Invoice_2025.pdf                  │
│ Document ID: DOC-A3F2B1                 │
├─────────────────────────────────────────┤
│ Metadata                                │
│ ┌─────────────────────────────────────┐ │
│ │ Invoice Number: INV-1234            │ │
│ │ Date: 2025-01-15                    │ │
│ │ Client: Acme Corp                   │ │
│ │ Amount: $5,000                      │ │
│ └─────────────────────────────────────┘ │
│ [Edit Metadata]                         │
├─────────────────────────────────────────┤
│ Tags                                    │
│ [urgent] [finance] [2025]               │
│ [+ Add Tag]                             │
├─────────────────────────────────────────┤
│ Notes                                   │
│ Related to contract DOC-B4C3A2.         │
│ Needs approval by end of month.         │
│ [Edit Notes]                            │
├─────────────────────────────────────────┤
│ Related Files (2)                       │
│ 📄 Contract.pdf (DOC-B4C3A2)           │
│ 📄 Receipt.pdf (DOC-C5D4E3)            │
│ [+ Link File]                           │
└─────────────────────────────────────────┘
```

**Search Bar:**
```
┌─────────────────────────────────────────┐
│ 🔍 Search files...                      │
│ Filters: [All] [Name] [Metadata]       │
│ Section: [All Sections ▼]              │
└─────────────────────────────────────────┘

Results (15):
┌─────────────────────────────────────────┐
│ 📄 Invoice_2025.pdf                     │
│ DOC-A3F2B1 • Finance • 2025-01-15      │
│ Match: "invoice" in name                │
│ Tags: urgent, finance                   │
├─────────────────────────────────────────┤
│ 📄 Contract_Invoice.docx                │
│ DOC-B4C3A2 • Legal • 2025-01-10        │
│ Match: "invoice" in notes               │
│ "...related to invoice INV-1234..."     │
└─────────────────────────────────────────┘
```

### Mobile UI

**File Detail (Read-Only):**
- Document ID displayed
- Metadata values shown
- Tags as chips
- Notes with link detection
- Related files list (tap to open)

**Search Page:**
- Simple search input
- Scope selector
- Results list
- Tap to open file

---

## 🔐 Security & RBAC

**Permissions Required:**
- `metadata:create` - Create metadata definitions
- `metadata:read` - View metadata
- `metadata:update` - Edit metadata
- `metadata:delete` - Delete metadata
- `files:read` - Search and view files
- `files:update` - Link files, edit tags/notes

**Account Scoping:**
- All metadata scoped to account
- Search limited to account
- Document IDs unique per account

---

## ✅ Checklist

### Backend ✅
- [x] Database models created
- [x] Metadata definitions CRUD
- [x] File metadata upsert
- [x] Document ID generation
- [x] Tags and notes support
- [x] File linking by document_id
- [x] Search implementation
- [x] RBAC integration
- [x] Account scoping
- [x] Migration created

### Frontend (TODO)
- [ ] Metadata definition management UI
- [ ] File metadata editor
- [ ] Tags input component
- [ ] Notes editor with link detection
- [ ] Related files panel
- [ ] Document ID display
- [ ] Global search bar
- [ ] Search results page
- [ ] Mobile file detail view
- [ ] Mobile search page

---

## 🚀 Next Steps

1. **Run Migration:**
   ```bash
   docker compose exec api alembic upgrade head
   ```

2. **Create Metadata Definitions:**
   - Define custom fields for your documents
   - Set validation rules

3. **Upload Files:**
   - Files get auto-generated document_id
   - Add tags and notes

4. **Link Files:**
   - Use document_id to link related files

5. **Search:**
   - Test search by name, tags, notes
   - Filter by section/folder

6. **Build Frontend:**
   - Create metadata editor
   - Implement search UI
   - Add file linking interface

---

## 📝 Notes

- **Document ID Format:** DOC-XXXXXX (auto-generated)
- **Metadata Values:** Stored as JSONB for flexibility
- **Search:** Currently name/tags/notes, content search is placeholder
- **File Linking:** Uses document_id, not file_id
- **Tags:** Free-form, no predefined list
- **Notes:** Support markdown/links in frontend

---

**Implementation Complete! 🎉**

The metadata and search backend is fully functional. Frontend UI needs to be built for complete user experience.

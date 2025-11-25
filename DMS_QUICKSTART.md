# DMS Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Run Migration

```bash
cd docflow
docker compose exec api alembic upgrade head
```

This creates the new DMS tables: `sections`, `folders_new`, `files_new`

### 2. Seed Modules (if not done)

```bash
docker compose exec api python app/scripts/seed_modules.py
```

This ensures the "sections", "folders", and "files" modules exist for RBAC.

### 3. Create Account (if not exists)

```bash
curl -X POST http://localhost:8000/v2/rbac/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "slug": "my-company",
    "is_active": true
  }'
```

Save the `account_id` from the response.

### 4. Create Section

```bash
curl -X POST http://localhost:8000/v2/dms/sections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Account-Id: YOUR_ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projects",
    "description": "Project documents",
    "position": 0,
    "account_id": "YOUR_ACCOUNT_ID"
  }'
```

Save the `section_id`.

### 5. Create Folder

```bash
curl -X POST http://localhost:8000/v2/dms/folders-dms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Account-Id: YOUR_ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2025",
    "section_id": "YOUR_SECTION_ID",
    "account_id": "YOUR_ACCOUNT_ID"
  }'
```

Save the `folder_id`.

### 6. Upload File

```bash
curl -X POST "http://localhost:8000/v2/dms/files-dms/upload?folder_id=YOUR_FOLDER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Account-Id: YOUR_ACCOUNT_ID" \
  -F "files=@test.pdf"
```

### 7. List Files

```bash
curl -X GET "http://localhost:8000/v2/dms/files-dms?folder_id=YOUR_FOLDER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Account-Id: YOUR_ACCOUNT_ID"
```

### 8. Download File

```bash
curl -X GET "http://localhost:8000/v2/dms/files-dms/FILE_ID/download" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Account-Id: YOUR_ACCOUNT_ID" \
  --output downloaded.pdf
```

---

## 📋 Complete Workflow Example

```bash
# 1. Login and get token
TOKEN=$(curl -X POST http://localhost:8000/v2/u/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | jq -r '.access_token')

# 2. Create account (Super Admin only)
ACCOUNT_ID=$(curl -X POST http://localhost:8000/v2/rbac/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company","slug":"test-company"}' | jq -r '.id')

# 3. Create section
SECTION_ID=$(curl -X POST http://localhost:8000/v2/dms/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Documents\",\"account_id\":\"$ACCOUNT_ID\"}" | jq -r '.id')

# 4. Create folder
FOLDER_ID=$(curl -X POST http://localhost:8000/v2/dms/folders-dms \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Invoices\",\"section_id\":\"$SECTION_ID\",\"account_id\":\"$ACCOUNT_ID\"}" | jq -r '.id')

# 5. Upload file
curl -X POST "http://localhost:8000/v2/dms/files-dms/upload?folder_id=$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -F "files=@invoice.pdf"

# 6. List files
curl -X GET "http://localhost:8000/v2/dms/files-dms?folder_id=$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID"
```

---

## 🎯 Test All Features

### Upload Multiple Files
```bash
curl -X POST "http://localhost:8000/v2/dms/files-dms/upload?folder_id=$FOLDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -F "files=@file1.pdf" \
  -F "files=@file2.docx" \
  -F "files=@file3.xlsx"
```

### Upload ZIP
```bash
curl -X POST "http://localhost:8000/v2/dms/files-dms/upload-zip?folder_id=$FOLDER_ID&preserve_structure=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -F "zip_file=@archive.zip"
```

### Create Office Document
```bash
curl -X POST http://localhost:8000/v2/dms/files-dms/create-office \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Meeting Notes\",\"folder_id\":\"$FOLDER_ID\",\"office_type\":\"word\",\"account_id\":\"$ACCOUNT_ID\"}"
```

### Get Folder Tree
```bash
curl -X GET "http://localhost:8000/v2/dms/folders-dms/tree/$SECTION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID"
```

### Download All as ZIP
```bash
curl -X POST http://localhost:8000/v2/dms/files-dms/download-all \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Account-Id: $ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d "{\"folder_id\":\"$FOLDER_ID\"}" \
  --output download.zip
```

---

## 🔧 Troubleshooting

### Migration Fails
```bash
# Check current migration
docker compose exec api alembic current

# Check migration history
docker compose exec api alembic history

# Downgrade if needed
docker compose exec api alembic downgrade -1

# Upgrade again
docker compose exec api alembic upgrade head
```

### Permission Denied
- Ensure user has proper roles assigned
- Check if modules are seeded
- Verify account_id is correct
- Check X-Account-Id header

### File Upload Fails
- Check MinIO is running: `docker compose ps`
- Verify S3 credentials in `.env`
- Check bucket exists
- View logs: `docker compose logs api`

### Can't Access Files
- Verify account_id matches
- Check RBAC permissions
- Ensure file is not soft-deleted
- Check storage_path in database

---

## 📊 Verify Setup

### Check Tables
```bash
docker compose exec postgres psql -U postgres -d docflow -c "\dt"
```

Should show: `sections`, `folders_new`, `files_new`

### Check Modules
```bash
curl -X GET http://localhost:8000/v2/rbac/modules \
  -H "Authorization: Bearer $TOKEN"
```

Should include: "sections", "folders", "files"

### Check MinIO
Open http://localhost:9001 and login with credentials from `.env`

---

## ✅ Success Indicators

- ✅ Migration runs without errors
- ✅ Can create sections
- ✅ Can create folders
- ✅ Can upload files
- ✅ Files appear in MinIO
- ✅ Can download files
- ✅ ZIP upload extracts correctly
- ✅ Office docs create successfully
- ✅ Download-all creates ZIP

---

**Ready to Build Frontend! 🎨**

The backend is fully functional. Next step: Create React components for the DMS UI.

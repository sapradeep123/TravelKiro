# DocFlow Test Users and Sample Data

## 🚀 Quick Setup

Run the seeding script to create all test data:

```bash
# Install dependencies
pip install httpx

# Run the seeding script
python scripts/seed_data.py
```

## 👥 Test Users

After running the seeding script, you can login with these users:

### 1. Administrator
- **Email**: `admin@docflow.com`
- **Password**: `admin123`
- **Role**: Admin user with full access
- **Documents**: 8+ sample documents

### 2. John Doe
- **Email**: `john.doe@docflow.com`
- **Password**: `password123`
- **Role**: Regular user
- **Documents**: 2 sample documents

### 3. Jane Smith
- **Email**: `jane.smith@docflow.com`
- **Password**: `password123`
- **Role**: Regular user
- **Documents**: 2 sample documents

### 4. Manager
- **Email**: `manager@docflow.com`
- **Password**: `password123`
- **Role**: Manager user
- **Documents**: None (can be used for testing sharing)

## 📄 Sample Documents

### Documents with Full Features:

1. **Project_Requirements.pdf**
   - Tags: `project`, `requirements`, `important`
   - Custom Metadata:
     - Department: Engineering
     - Project: DocFlow
     - Priority: High
     - Status: Active
   - Comments: 2 comments

2. **Meeting_Notes_2024.md**
   - Tags: `meeting`, `notes`, `2024`
   - Custom Metadata:
     - Meeting_Date: 2024-11-14
     - Attendees: 5
     - Duration: 60 minutes
   - Comments: 2 comments

3. **API_Documentation.docx**
   - Tags: `api`, `documentation`, `technical`
   - Custom Metadata:
     - Version: 1.0.0
     - Author: Development Team
     - Last_Updated: 2024-11-14
   - Comments: 2 comments

4. **Budget_Report_2024.xlsx**
   - Tags: `finance`, `budget`, `report`, `2024`
   - Custom Metadata:
     - Fiscal_Year: 2024
     - Department: Finance
     - Approved: Yes
   - Comments: 2 comments

5. **Design_Mockups.png**
   - Tags: `design`, `ui`, `mockups`
   - Custom Metadata:
     - Designer: Jane Smith
     - Tool: Figma
     - Status: Approved
   - Comments: 2 comments

6. **User_Guide.pdf**
   - Tags: `documentation`, `user-guide`, `help`
   - Custom Metadata:
     - Target_Audience: End Users
     - Language: English
     - Pages: 45
   - Comments: 2 comments

7. **Security_Audit_Report.pdf**
   - Tags: `security`, `audit`, `compliance`
   - Custom Metadata:
     - Auditor: Security Team
     - Date: 2024-11-10
     - Status: Completed
   - Comments: 2 comments

8. **Database_Schema.sql**
   - Tags: `database`, `schema`, `sql`, `technical`
   - Custom Metadata:
     - Database: PostgreSQL
     - Version: 15
     - Tables: 12
   - Comments: 2 comments

### Trash Document:

- **Deleted_Document.txt** - Document in trash (for testing restore functionality)

## 🧪 Testing Scenarios

### 1. Authentication
- ✅ Login with different users
- ✅ Register new user
- ✅ Logout functionality

### 2. Document Management
- ✅ View all documents
- ✅ Search documents
- ✅ Filter by tags
- ✅ View document details
- ✅ Download documents
- ✅ Delete documents (move to trash)

### 3. Tags
- ✅ View tags on documents
- ✅ Filter documents by tags
- ✅ Add new tags to documents
- ✅ Remove tags from documents

### 4. Comments
- ✅ View comments on documents
- ✅ Add new comments
- ✅ Edit your own comments
- ✅ Delete comments

### 5. Custom Metadata
- ✅ View custom metadata fields
- ✅ Add new custom metadata (key-value pairs)
- ✅ Remove custom metadata fields

### 6. Bulk Upload
- ✅ Upload multiple files at once
- ✅ Add tags during upload
- ✅ Add custom metadata during upload

### 7. Trash Management
- ✅ View deleted documents
- ✅ Restore documents from trash
- ✅ Permanently delete documents
- ✅ Empty trash

### 8. Search and Filter
- ✅ Search by document name
- ✅ Filter by multiple tags
- ✅ Clear filters

## 📝 Manual Testing Steps

1. **Login** as `admin@docflow.com` / `admin123`
2. **View Dashboard** - See statistics and recent documents
3. **Go to Documents** - View all uploaded documents
4. **Click on a document** - View details, tags, comments, metadata
5. **Add a tag** - Type a tag and press Enter
6. **Add a comment** - Type a comment and click +
7. **Add custom metadata** - Add key-value pairs
8. **Upload new document** - Test bulk upload with tags and metadata
9. **Delete a document** - Move to trash
10. **Go to Trash** - View and restore deleted document
11. **Search** - Search for documents by name
12. **Filter by tags** - Click on tags to filter documents

## 🎯 Feature Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] View documents list
- [ ] Search documents
- [ ] Filter by tags
- [ ] View document details
- [ ] Download document
- [ ] Upload single document
- [ ] Bulk upload multiple documents
- [ ] Add tags to document
- [ ] Remove tags from document
- [ ] Add comments to document
- [ ] Edit comments
- [ ] Delete comments
- [ ] Add custom metadata
- [ ] Remove custom metadata
- [ ] Delete document (move to trash)
- [ ] View trash
- [ ] Restore from trash
- [ ] Permanently delete
- [ ] Empty trash

## 🔄 Re-seeding Data

To reset and re-seed the data:

1. Stop the backend: `docker compose down`
2. Remove volumes: `docker compose down -v`
3. Start backend: `docker compose up -d`
4. Run seeding script: `python scripts/seed_data.py`

This will create fresh test data.


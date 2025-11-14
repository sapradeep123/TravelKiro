# DocFlow Seeding Scripts

## Seed Sample Data

This script creates sample users and documents for testing the DocFlow application.

### Prerequisites

1. Backend API must be running on `http://localhost:8000`
2. Python 3.8+ with httpx installed

### Installation

```bash
pip install httpx
```

### Usage

```bash
# From the project root directory
python scripts/seed_data.py
```

### What it creates:

#### Users (4 users):
1. **admin@docflow.com** / admin123
2. **john.doe@docflow.com** / password123
3. **jane.smith@docflow.com** / password123
4. **manager@docflow.com** / password123

#### Documents (8+ documents):
Each document includes:
- ✅ Tags (for filtering and organization)
- ✅ Custom metadata (key-value pairs)
- ✅ Comments (multiple comments per document)
- ✅ Various file types (PDF, DOCX, XLSX, PNG, MD, SQL, TXT)

#### Document Features:
- Documents with different tags (project, requirements, meeting, api, etc.)
- Custom metadata fields (Department, Project, Priority, etc.)
- Multiple comments per document
- One document in trash for testing restore functionality
- Documents owned by different users

### Sample Documents Created:

1. **Project_Requirements.pdf** - Project documentation with tags and metadata
2. **Meeting_Notes_2024.md** - Meeting notes with custom fields
3. **API_Documentation.docx** - Technical documentation
4. **Budget_Report_2024.xlsx** - Financial document
5. **Design_Mockups.png** - Design files
6. **User_Guide.pdf** - User documentation
7. **Security_Audit_Report.pdf** - Security documentation
8. **Database_Schema.sql** - Database schema file

### Testing Features:

After running the script, you can test:

1. **Login** with any of the created users
2. **View Documents** - See all uploaded documents
3. **Search** - Search by document name
4. **Filter by Tags** - Click on tags to filter
5. **View Details** - Click on any document to see:
   - Tags (add/remove)
   - Comments (add/edit/delete)
   - Custom metadata (add/remove)
6. **Trash** - View and restore deleted documents
7. **Upload** - Upload new documents with tags and metadata
8. **Bulk Upload** - Upload multiple files at once

### Notes:

- The script creates sample files in `scripts/sample_files/` directory
- All documents are uploaded with realistic metadata
- Comments are added to demonstrate the commenting feature
- One document is intentionally deleted to test trash functionality


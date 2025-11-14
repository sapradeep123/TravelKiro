# DocFlow - Complete Setup Guide

## Overview

DocFlow is a comprehensive Document Management System with a professional React frontend and FastAPI backend.

## Features Implemented

### ✅ Core Features
- Document Upload and Download
- Organization and Searching
- Versioning
- Sharing
- Authentication and Authorization
- Access Control List
- Deletion and Archiving
- Document Preview
- Send file via Email
- MinIO Support for on-premise object storage

### ✅ Additional Features
- **Document Interactions** - Adding Comments and Tags
- **Custom Metadata Fields** - Add custom key-value pairs to documents
- **Bulk File Importer** - Upload multiple files at once

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Python 3.12+ (if running backend directly)

## Backend Setup

### 1. Database Configuration

Update `app/.env` with your PostgreSQL credentials:

```env
DATABASE_HOSTNAME=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=NewStrongPassword_2025!
POSTGRES_PORT=5432
POSTGRES_DB=docflow
```

### 2. Start Backend Services

```bash
docker compose up -d
```

This will start:
- FastAPI backend on port 8000
- PostgreSQL on port 5433 (external)
- MinIO on ports 9000-9001

### 3. Verify Backend

- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## Usage

### 1. Register/Login

- Go to http://localhost:3000
- Register a new account or login
- You'll be redirected to the dashboard

### 2. Upload Documents

- Click "Upload Files" button
- Drag and drop files or click to select
- Add tags (comma-separated)
- Add custom metadata (key-value pairs)
- Click "Upload"

### 3. Manage Documents

- **View**: Click on any document to see details
- **Download**: Click download button
- **Delete**: Click trash icon (moves to trash)
- **Search**: Use search bar to find documents
- **Filter**: Click tags to filter documents

### 4. Document Details

- **Tags**: Add/remove tags
- **Comments**: Add, edit, or delete comments
- **Custom Metadata**: Add custom fields
- **Preview**: View document preview
- **Share**: Share documents with others

### 5. Trash Management

- View deleted documents
- Restore documents
- Permanently delete documents
- Empty trash

## API Endpoints

### Authentication
- `POST /v2/u/register` - Register new user
- `POST /v2/u/login` - Login

### Documents
- `POST /v2/upload` - Upload files (bulk)
- `GET /v2/metadata` - List documents
- `GET /v2/metadata/{id}/detail` - Get document details
- `PUT /v2/metadata/{name}` - Update document metadata
- `DELETE /v2/{name}` - Delete document
- `GET /v2/file/{name}/download` - Download document
- `GET /v2/preview/{id}` - Preview document

### Comments
- `POST /v2/documents/{doc_id}/comments` - Add comment
- `GET /v2/documents/{doc_id}/comments` - Get comments
- `PUT /v2/documents/comments/{comment_id}` - Update comment
- `DELETE /v2/documents/comments/{comment_id}` - Delete comment

### Trash
- `GET /v2/trash` - List trash
- `POST /v2/restore/{file}` - Restore document
- `DELETE /v2/trash/{file}` - Permanently delete
- `DELETE /v2/trash` - Empty trash

## Project Structure

```
docflow/
├── app/                    # Backend application
│   ├── api/               # API routes
│   ├── db/                # Database models and repositories
│   ├── schemas/           # Pydantic schemas
│   └── main.py            # FastAPI app
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API services
│   └── package.json
├── docker-compose.yml     # Docker configuration
└── README.md
```

## Troubleshooting

### Backend Issues

1. **Port already in use**: Change ports in `docker-compose.yml`
2. **Database connection error**: Check `.env` file credentials
3. **MinIO not accessible**: Check if port 9000-9001 are available

### Frontend Issues

1. **API connection error**: Ensure backend is running on port 8000
2. **CORS errors**: Check `vite.config.js` proxy configuration
3. **Build errors**: Clear `node_modules` and reinstall

## Production Deployment

### Backend

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Frontend

```bash
cd frontend
npm run build
# Serve the dist/ directory with nginx or similar
```

## Support

For issues or questions, check the API documentation at http://localhost:8000/docs


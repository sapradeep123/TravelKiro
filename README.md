# DocFlow - Document Management System

A modern, full-featured Document Management System built with FastAPI and React.

## Quick Start

```bash
# Clone repository
git clone https://github.com/sapradeep123/DocMS.git docflow
cd docflow

# Create environment file
cp app/.env.template app/.env

# Start services
docker compose up -d --build

# Access application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with RBAC
- 📁 **Document Management** - Upload, organize, and manage files
- 🔄 **Version Control** - Track file versions and changes
- 🔒 **File Locking** - Prevent concurrent edits
- 🤝 **Collaboration** - Share files and folders with teams
- ✅ **Approval Workflows** - Multi-step approval processes
- 🔍 **Search & Metadata** - Advanced search with custom metadata
- 📊 **Audit Logging** - Track all system activities
- ♻️ **Recycle Bin** - Recover deleted files
- ⏰ **Retention Policies** - Automated file lifecycle management

## Tech Stack

**Backend:**
- FastAPI (Python 3.12)
- PostgreSQL 15
- SQLAlchemy (async)
- MinIO (S3-compatible storage)

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Vite

## Documentation

For complete documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

Topics covered:
- Quick Start Guide
- Production Deployment
- Development Setup
- Testing
- Architecture
- Troubleshooting
- Contributing

## Testing

```bash
# Backend tests
docker compose exec api python -m pytest tests/ -v

# Frontend tests
docker compose exec frontend npm test
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

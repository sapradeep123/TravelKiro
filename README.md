# DocFlow - Document Management System

A modern, full-featured Document Management System built with FastAPI and React.

## 🚀 Quick Start for Your Team

```bash
# 1. Clone the repository
git clone https://github.com/srdaspradeep-gif/DMsDoc.git
cd DMsDoc/DocMS

# 2. Start the application
docker compose up -d --build

# 3. Access the application
# Frontend: http://localhost:3200
# API: http://localhost:8200
```

**First time?** Read the [SETUP.md](SETUP.md) for detailed instructions.

## 📋 Features

- **Hierarchical Organization**: Account → Sections → Folders → Files
- **Document Management**: Upload, download, preview, version control
- **Metadata & Tags**: Custom fields and tagging system
- **User Management**: Role-based access control (RBAC)
- **Search & Filter**: Find documents quickly
- **Audit Logging**: Track all document activities
- **Approvals Workflow**: Document approval system
- **Retention Policies**: Automated document lifecycle management

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.12)
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL 15
- **Storage**: MinIO (S3-compatible)
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

## 📖 Documentation

- [Setup Guide](SETUP.md) - Complete setup instructions
- [Documentation](DOCUMENTATION.md) - Full system documentation
- [Deployment Guide](DEPLOYMENT_INFO.md) - Production deployment

## 🔧 Development

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)

### Project Structure

```
DocMS/
├── app/                    # Backend (FastAPI)
│   ├── api/               # API routes
│   ├── db/                # Database models
│   ├── services/          # Business logic
│   └── schemas/           # Pydantic schemas
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── services/     # API services
│   └── public/           # Static assets
├── docker-compose.yml    # Docker configuration
└── .env                  # Environment variables
```

## 🎯 Usage Workflow

1. **Create Organization Structure**
   - Go to **Sections** page
   - Create sections (e.g., "HR Documents", "Finance")
   - Add folders within sections (e.g., "2024 Reports")

2. **Upload Documents**
   - Go to **Documents** page
   - Select a folder
   - Click **Upload** and select files
   - Add tags and metadata

3. **Manage Users**
   - Go to **Admin → Users**
   - Create users and assign roles
   - Manage permissions

## 🔐 Default Credentials

First registered user becomes the super admin.

## 🐛 Troubleshooting

### Ports Already in Use

Edit `.env` file and change ports:
```bash
API_PORT=8201
FRONTEND_PORT=3201
```

### Reset Database

```bash
docker compose down -v
docker compose up -d --build
```

### View Logs

```bash
docker compose logs -f api
docker compose logs -f frontend
```

## 📝 License

[Add your license here]

## 👥 Team

[Add your team information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

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

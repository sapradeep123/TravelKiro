# DocFlow - Complete Documentation

## Table of Contents
1. [Quick Start](#quick-start)
2. [Deployment](#deployment)
3. [Development Setup](#development-setup)
4. [Testing](#testing)
5. [Architecture](#architecture)
6. [Contributing](#contributing)

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Local Development

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

---

## Deployment

### Production Deployment on Contabo/VPS

1. **SSH into server**
```bash
ssh user@your-server-ip
```

2. **Clone repository**
```bash
git clone https://github.com/sapradeep123/DocMS.git docflow
cd docflow
```

3. **Configure environment**
```bash
cp app/.env.template app/.env
nano app/.env
```

Required environment variables:
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourSecurePassword123!
POSTGRES_DB=docflow
DATABASE_HOSTNAME=postgres
POSTGRES_PORT=5432

# JWT Secrets (generate secure random strings)
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET_KEY=your-refresh-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MIN=30
REFRESH_TOKEN_EXPIRE_MIN=10080

# MinIO/S3 Storage
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT_URL=http://minio:9000
S3_BUCKET=docflow

# App Config
HOST_URL=http://your-domain.com:8000
DEBUG=False
```

4. **Start application**
```bash
# Production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or development mode
docker compose up -d --build
```

5. **Verify deployment**
```bash
docker compose ps
curl http://localhost:8000/health
```

### Updating Deployment

```bash
cd docflow
git pull origin master
docker compose up -d --build
```

---

## Development Setup

### Backend Development

```bash
# Install dependencies (inside container)
docker compose exec api pip install -r requirements/api.txt

# Run migrations
docker compose exec api alembic upgrade head

# Access Python shell
docker compose exec api python

# View logs
docker compose logs -f api
```

### Frontend Development

```bash
# Install dependencies
docker compose exec frontend npm install

# Run tests
docker compose exec frontend npm test

# View logs
docker compose logs -f frontend
```

### Database Access

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d docflow

# Common commands
\dt              # List tables
\d table_name    # Describe table
\q               # Quit
```

---

## Testing

### Backend Tests

```bash
# Run all tests
docker compose exec api python -m pytest tests/ -v

# Run specific test file
docker compose exec api python -m pytest tests/test_auth.py -v

# Run with coverage
docker compose exec api python -m pytest tests/ --cov=app
```

### Frontend Tests

```bash
# Run all tests
docker compose exec frontend npm test

# Run specific tests
docker compose exec frontend npm test -- Roles.test.jsx

# Run with coverage
docker compose exec frontend npm test -- --coverage
```

---

## Architecture

### Tech Stack

**Backend:**
- FastAPI (Python 3.12)
- PostgreSQL 15
- SQLAlchemy (async)
- Alembic (migrations)
- MinIO (S3-compatible storage)

**Frontend:**
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite

### Project Structure

```
docflow/
├── app/                    # Backend application
│   ├── api/               # API routes
│   │   ├── routes/       # Endpoint definitions
│   │   └── dependencies/ # Dependency injection
│   ├── db/               # Database layer
│   │   ├── tables/       # SQLAlchemy models
│   │   └── repositories/ # Data access layer
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── core/             # Core utilities
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── services/     # API services
├── migrations/            # Database migrations
├── tests/                # Backend tests
└── docker-compose.yml    # Docker configuration
```

### Key Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-Based Access Control (RBAC)
   - User, Role, Group, Permission management

2. **Document Management**
   - File upload/download
   - Folder organization
   - File versioning
   - File locking
   - Metadata management

3. **Collaboration**
   - File sharing
   - Approval workflows
   - Notifications
   - Comments

4. **Advanced Features**
   - Retention policies
   - Audit logging
   - Recycle bin
   - Search & filters

---

## Contributing

### Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Write docstrings

**JavaScript:**
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Running Quality Checks

```bash
# Backend linting
docker compose exec api flake8 app/

# Frontend linting
docker compose exec frontend npm run lint

# Type checking
docker compose exec api mypy app/
```

---

## Troubleshooting

### Common Issues

**API not starting:**
```bash
docker compose logs api
docker compose exec api python -c "from app.db.models import engine; print('DB OK')"
```

**Frontend not loading:**
```bash
docker compose logs frontend
docker compose up -d --build frontend
```

**Database connection issues:**
```bash
docker compose exec postgres pg_isready -U postgres
docker compose restart postgres
```

**Port conflicts:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # API
  - "3001:3000"  # Frontend
```

### Useful Commands

```bash
# View all logs
docker compose logs -f

# Restart specific service
docker compose restart api

# Stop all services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild specific service
docker compose up -d --build api
```

---

## Security Notes

### Production Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Set `DEBUG=False`
- [ ] Enable HTTPS with reverse proxy
- [ ] Restrict database port access
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Configure CORS properly

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/sapradeep123/DocMS/issues
- Email: support@example.com

---

## License

[Add your license information here]

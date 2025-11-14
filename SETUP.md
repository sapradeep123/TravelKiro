# DocFlow Setup Guide

Complete setup guide for the DocFlow Document Management System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Setup](#manual-setup)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Docker & Docker Compose** (Recommended)
  - Docker Desktop: https://www.docker.com/products/docker-desktop
  - OR Docker Engine + Docker Compose

- **OR Manual Setup:**
  - Python 3.11 or higher
  - Node.js 18 or higher
  - PostgreSQL 15 or higher
  - Git

### System Requirements

- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** At least 5GB free
- **OS:** Windows 10+, macOS 10.15+, or Linux

## Quick Start with Docker

### Step 1: Clone the Repository

```bash
git clone https://github.com/sapradeep123/DocMS.git
cd DocMS
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp app/.env.example app/.env

# Edit app/.env with your settings
# At minimum, update:
# - POSTGRES_PASSWORD
# - SECRET_KEY
```

### Step 3: Start Services

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)

### Step 5: Create Test Data (Optional)

```bash
# In a new terminal
docker compose exec api python scripts/seed_data.py
```

## Manual Setup

### Backend Setup

#### 1. Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements/api.txt
```

#### 2. Setup PostgreSQL Database

```bash
# Create database
createdb docflow

# Or using psql
psql -U postgres
CREATE DATABASE docflow;
\q
```

#### 3. Configure Environment

```bash
# Copy example file
cp app/.env.example app/.env

# Edit app/.env
# Update DATABASE_URL to point to your local PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/docflow
```

#### 4. Run Database Migrations

```bash
# Run Alembic migrations
alembic upgrade head
```

#### 5. Initialize MinIO Bucket (if using MinIO)

```bash
python app/scripts/init_bucket.py
```

#### 6. Start Backend Server

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

#### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure API Endpoint

The frontend is configured to proxy API requests to `http://localhost:8000` by default. This is set in `frontend/vite.config.js`.

#### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

#### 4. Build for Production

```bash
npm run build
```

The built files will be in `frontend/dist/`

## Configuration

### Environment Variables

Create `app/.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:password@postgres:5432/docflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=docflow

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MinIO/S3 Configuration
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=docflow
MINIO_USE_SSL=false

# API Configuration
API_PREFIX=/v2
API_HOST=0.0.0.0
API_PORT=8000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Generating SECRET_KEY

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -hex 32
```

## Database Setup

### Using Docker

The database is automatically set up when you run `docker compose up`.

### Manual PostgreSQL Setup

```bash
# Install PostgreSQL (if not installed)
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS (using Homebrew):
brew install postgresql@15

# Windows: Download from https://www.postgresql.org/download/windows/

# Start PostgreSQL service
# Linux:
sudo systemctl start postgresql

# macOS:
brew services start postgresql@15

# Create database and user
psql -U postgres
CREATE DATABASE docflow;
CREATE USER docflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE docflow TO docflow_user;
\q
```

### Run Migrations

```bash
# Using Alembic
alembic upgrade head

# Or using Docker
docker compose exec api alembic upgrade head
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd app
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Production Mode

**Using Docker:**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Manual:**
```bash
# Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (after build)
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

## Creating Test Users

### Using Seed Script

```bash
# Docker
docker compose exec api python scripts/seed_data.py

# Manual
cd scripts
pip install -r requirements.txt
python seed_data.py
```

### Manual User Creation

1. Register via frontend: http://localhost:3000/register
2. Or use API:
```bash
curl -X POST http://localhost:8000/v2/u/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "user",
    "password": "password123"
  }'
```

## Troubleshooting

### Port Already in Use

**Error:** `port is already allocated` or `Address already in use`

**Solution:**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000
# Linux/Mac:
lsof -i :8000

# Kill process or change port in docker-compose.yml
```

### Database Connection Error

**Error:** `could not connect to server`

**Solutions:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Check firewall settings
4. For Docker: Ensure postgres service is up: `docker compose ps`

### Frontend Can't Connect to Backend

**Error:** `Network Error` or `CORS error`

**Solutions:**
1. Verify backend is running on port 8000
2. Check `vite.config.js` proxy configuration
3. Verify CORS settings in `app/main.py`

### MinIO Connection Error

**Error:** `MinIO connection failed`

**Solutions:**
1. Check MinIO service is running: `docker compose ps`
2. Verify MINIO_* variables in `.env`
3. Access MinIO console: http://localhost:9001

### Migration Errors

**Error:** `Target database is not up to date`

**Solution:**
```bash
# Reset migrations (WARNING: Deletes all data)
alembic downgrade base
alembic upgrade head

# Or check current version
alembic current
```

## Next Steps

1. ✅ Application is running
2. ✅ Create test users (see above)
3. ✅ Explore API docs: http://localhost:8000/docs
4. ✅ Test frontend: http://localhost:3000
5. ✅ Read [FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md) for frontend details

## Getting Help

- Check [QUICK_FIX.md](QUICK_FIX.md) for common issues
- Review [TEST_USERS.md](TEST_USERS.md) for test credentials
- Open an issue on GitHub
- Check API documentation at `/docs` endpoint

---

**Happy Coding! 🚀**


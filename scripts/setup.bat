@echo off
REM DocFlow Setup Script for Windows
REM This script helps set up the development environment

echo.
echo ========================================
echo   DocFlow Setup Script
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo         Visit: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist "app\.env" (
    echo [INFO] Creating .env file from .env.example...
    copy "app\.env.example" "app\.env" >nul
    echo [OK] Created app\.env
    echo [WARN] Please edit app\.env with your configuration before continuing
    echo.
    pause
) else (
    echo [OK] app\.env already exists
    echo.
)

REM Start services
echo [INFO] Starting Docker services...
docker compose up -d --build

echo.
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo [ERROR] Some services failed to start. Check logs with:
    echo         docker compose logs
    pause
    exit /b 1
)

echo [OK] Services are running!
echo.
echo ========================================
echo   Service URLs:
echo ========================================
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   MinIO:     http://localhost:9001
echo ========================================
echo.

REM Ask if user wants to seed data
set /p SEED_DATA="Would you like to create test data? (y/n): "
if /i "%SEED_DATA%"=="y" (
    echo [INFO] Creating test data...
    docker compose exec -T api python scripts/seed_data.py
    echo.
    echo [OK] Test users created!
    echo      Email: admin@docflow.com
    echo      Password: admin123
    echo.
)

echo.
echo [SUCCESS] Setup complete! Visit http://localhost:3000 to get started
echo.
pause


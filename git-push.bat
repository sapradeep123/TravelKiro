@echo off
REM Travel Encyclopedia - Git Push Script for Windows
REM This script helps you push your code to GitHub

echo.
echo ================================
echo Travel Encyclopedia - Git Setup
echo ================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Git initialized
    echo.
)

REM Check git config
echo Checking Git configuration...
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Git user not configured. Please configure:
    echo.
    set /p USER_NAME="Enter your name: "
    set /p USER_EMAIL="Enter your email: "
    git config user.name "%USER_NAME%"
    git config user.email "%USER_EMAIL%"
    echo Git user configured
) else (
    for /f "delims=" %%i in ('git config user.name') do set GIT_NAME=%%i
    for /f "delims=" %%i in ('git config user.email') do set GIT_EMAIL=%%i
    echo Git configured as: %GIT_NAME% ^<%GIT_EMAIL%^>
)
echo.

REM Add all files
echo Adding all files to Git...
git add .
echo Files added
echo.

REM Create commit
echo Creating commit...
git commit -m "feat: Initial commit - Travel Encyclopedia full-stack application" -m "" -m "- Complete backend implementation with Node.js/Express/TypeScript" -m "- PostgreSQL database with Prisma ORM" -m "- JWT authentication with role-based authorization" -m "- Location, Event, Package, Accommodation management" -m "- Community features (posts, likes, comments, follow)" -m "- Group travel with bidding system" -m "- Approval workflow for all content" -m "- Notification system" -m "- 60+ API endpoints" -m "- React Native/Expo frontend setup" -m "- Authentication UI and context" -m "- API service layer with auto token refresh" -m "- TypeScript types and interfaces" -m "- Comprehensive documentation"

if errorlevel 1 (
    echo Commit failed or no changes to commit
) else (
    echo Commit created successfully
)
echo.

REM Check for remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo No remote repository configured
    echo.
    echo Please enter your GitHub repository URL:
    echo Example: https://github.com/username/travel-encyclopedia.git
    echo Or: git@github.com:username/travel-encyclopedia.git
    echo.
    set /p REPO_URL="Repository URL: "
    
    if not "%REPO_URL%"=="" (
        git remote add origin "%REPO_URL%"
        echo Remote repository added
    ) else (
        echo No URL provided. Please add remote manually:
        echo    git remote add origin YOUR_REPO_URL
        pause
        exit /b 1
    )
) else (
    for /f "delims=" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    echo Remote repository: %REMOTE_URL%
)
echo.

REM Push to remote
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed. Common issues:
    echo    1. Repository doesn't exist on GitHub
    echo    2. Authentication failed
    echo    3. No permission to push
    echo.
    echo Solutions:
    echo    - Create repository on GitHub first
    echo    - Use personal access token for HTTPS
    echo    - Set up SSH keys for SSH URLs
    echo.
    echo See GIT_SETUP.md for detailed instructions
) else (
    echo.
    echo ========================================
    echo SUCCESS! Your code has been pushed to GitHub!
    echo ========================================
    echo.
    echo Repository Statistics:
    echo    - Backend: 100%% Complete
    echo    - Frontend: Started
    echo.
    echo View your repository at: %REMOTE_URL%
)

echo.
pause

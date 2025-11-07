#!/bin/bash

# Travel Encyclopedia - Git Push Script
# This script helps you push your code to GitHub

echo "🚀 Travel Encyclopedia - Git Setup"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check git config
echo "👤 Checking Git configuration..."
GIT_NAME=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    echo "⚠️  Git user not configured. Please configure:"
    echo ""
    read -p "Enter your name: " USER_NAME
    read -p "Enter your email: " USER_EMAIL
    git config user.name "$USER_NAME"
    git config user.email "$USER_EMAIL"
    echo "✅ Git user configured"
else
    echo "✅ Git configured as: $GIT_NAME <$GIT_EMAIL>"
fi
echo ""

# Add all files
echo "📝 Adding all files to Git..."
git add .
echo "✅ Files added"
echo ""

# Create commit
echo "💾 Creating commit..."
git commit -m "feat: Initial commit - Travel Encyclopedia full-stack application

- Complete backend implementation with Node.js/Express/TypeScript
- PostgreSQL database with Prisma ORM
- JWT authentication with role-based authorization
- Location, Event, Package, Accommodation management
- Community features (posts, likes, comments, follow)
- Group travel with bidding system
- Approval workflow for all content
- Notification system
- 60+ API endpoints
- React Native/Expo frontend setup
- Authentication UI and context
- API service layer with auto token refresh
- TypeScript types and interfaces
- Comprehensive documentation"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
else
    echo "⚠️  Commit failed or no changes to commit"
fi
echo ""

# Check for remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "🔗 No remote repository configured"
    echo ""
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/username/travel-encyclopedia.git"
    echo "Or: git@github.com:username/travel-encyclopedia.git"
    echo ""
    read -p "Repository URL: " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote repository added"
    else
        echo "❌ No URL provided. Please add remote manually:"
        echo "   git remote add origin YOUR_REPO_URL"
        exit 1
    fi
else
    echo "✅ Remote repository: $REMOTE_URL"
fi
echo ""

# Push to remote
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your code has been pushed to GitHub!"
    echo ""
    echo "📊 Repository Statistics:"
    echo "   - Backend: 100% Complete"
    echo "   - Frontend: Started"
    echo "   - Total Files: $(git ls-files | wc -l)"
    echo "   - Total Lines: $(git ls-files | xargs wc -l | tail -1 | awk '{print $1}')"
    echo ""
    echo "🔗 View your repository at: $REMOTE_URL"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Repository doesn't exist on GitHub"
    echo "   2. Authentication failed"
    echo "   3. No permission to push"
    echo ""
    echo "💡 Solutions:"
    echo "   - Create repository on GitHub first"
    echo "   - Use personal access token for HTTPS"
    echo "   - Set up SSH keys for SSH URLs"
    echo ""
    echo "📖 See GIT_SETUP.md for detailed instructions"
fi

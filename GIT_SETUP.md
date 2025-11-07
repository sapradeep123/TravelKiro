# Git Setup and Push Instructions

## Initial Setup

### 1. Initialize Git Repository (if not already done)

```bash
git init
```

### 2. Configure Git (if not already configured)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Add All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
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
```

### 5. Add Remote Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Or if using SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 6. Push to GitHub

For first push:

```bash
git branch -M main
git push -u origin main
```

For subsequent pushes:

```bash
git push
```

## Quick Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### Create New Branch
```bash
git checkout -b feature/your-feature-name
```

### Switch Branch
```bash
git checkout main
```

## Recommended .gitignore

The project already has `.gitignore` files in:
- Root directory
- `backend/` directory
- `frontend/` directory

These files exclude:
- `node_modules/`
- `.env` files
- Build outputs
- IDE files
- OS files

## Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example:
```bash
git commit -m "feat: add user profile update functionality"
git commit -m "fix: resolve token refresh issue"
git commit -m "docs: update API documentation"
```

## Pushing to Your Repository

1. **Create a new repository on GitHub** (if you haven't already)
   - Go to https://github.com/new
   - Name it (e.g., "travel-encyclopedia")
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Copy the repository URL** from GitHub

3. **Run the commands above** with your repository URL

## Verify Push

After pushing, visit your GitHub repository URL to verify all files are uploaded.

## Next Steps After Push

1. Set up GitHub Actions for CI/CD (optional)
2. Configure branch protection rules (optional)
3. Add collaborators if working in a team
4. Create issues for remaining tasks
5. Set up project board for task tracking

## Troubleshooting

### If you get "remote origin already exists"
```bash
git remote remove origin
git remote add origin YOUR_REPO_URL
```

### If you get authentication errors
- For HTTPS: Use personal access token instead of password
- For SSH: Set up SSH keys (https://docs.github.com/en/authentication)

### If you want to see what will be pushed
```bash
git diff origin/main
```

## Important Notes

- ✅ `.env` files are excluded (sensitive data protected)
- ✅ `node_modules/` excluded (dependencies not tracked)
- ✅ Build outputs excluded
- ✅ All source code included
- ✅ Documentation included
- ✅ Configuration files included

Your repository will be ready for:
- Cloning by team members
- CI/CD setup
- Deployment
- Collaboration

# Quick Start Guide

## 🚀 Push to GitHub (Choose One Method)

### Method 1: Using the Script (Easiest)

**Windows:**
```bash
git-push.bat
```

**Mac/Linux:**
```bash
chmod +x git-push.sh
./git-push.sh
```

### Method 2: Manual Commands

```bash
# 1. Initialize Git (if not done)
git init

# 2. Configure Git (if not done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 3. Add all files
git add .

# 4. Commit
git commit -m "feat: Initial commit - Travel Encyclopedia application"

# 5. Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 6. Push
git branch -M main
git push -u origin main
```

## 📋 Prerequisites for GitHub

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name: `travel-encyclopedia` (or your choice)
   - Don't initialize with README
   - Click "Create repository"

2. **Get Repository URL:**
   - Copy the HTTPS or SSH URL from GitHub
   - Example: `https://github.com/username/travel-encyclopedia.git`

## 🏃 After Pushing to GitHub

### 1. Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Backend will run on: http://localhost:3000

### 2. Set Up Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Then:
- Press `w` for web
- Press `a` for Android
- Press `i` for iOS

## 🧪 Test the Application

### Test Credentials:
- **Admin:** admin@travelencyclopedia.com / admin123
- **User:** user@example.com / user123
- **Guide:** guide@example.com / guide123
- **Govt Dept:** tourism@kerala.gov.in / govt123

### Test API:
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}'

# Get locations
curl http://localhost:3000/api/locations
```

## 📚 Documentation

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Setup Guide:** See `SETUP.md`
- **Git Guide:** See `GIT_SETUP.md`
- **Backend Status:** See `BACKEND_COMPLETE.md`
- **Progress:** See `PROGRESS.md`

## 🎯 What's Implemented

### ✅ Backend (100% Complete)
- Authentication & Authorization
- User Management
- Locations, Events, Packages
- Accommodations
- Community Features
- Group Travel & Bidding
- Approval System
- Notifications
- 60+ API Endpoints

### 🚧 Frontend (Started)
- Project Setup
- Authentication UI
- API Integration Layer
- Type Definitions

## 🔧 Troubleshooting

### Git Push Issues

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin YOUR_URL
```

**Authentication failed**
- Use Personal Access Token instead of password
- Or set up SSH keys

### Backend Issues

**Database connection error**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**Port 3000 already in use**
- Change PORT in backend/.env
- Update EXPO_PUBLIC_API_URL in frontend/.env

### Frontend Issues

**Expo won't start**
```bash
npx expo start -c  # Clear cache
```

**Module not found**
```bash
rm -rf node_modules
npm install
```

## 📞 Need Help?

1. Check the documentation files
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Verify environment variables are set

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] PostgreSQL installed and running
- [ ] Backend dependencies installed
- [ ] Database migrated and seeded
- [ ] Backend server running
- [ ] Frontend dependencies installed
- [ ] Frontend app running
- [ ] Can login with test credentials
- [ ] Can view locations/events/packages

## 🚀 Next Steps

1. Complete frontend implementation
2. Add more features
3. Deploy to production
4. Set up CI/CD
5. Add tests

---

**Current Status:** Backend 100% Complete | Frontend Started
**Ready for:** Development, Testing, Deployment

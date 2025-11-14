# Team Onboarding Guide

Welcome to the DocFlow team! This guide will help you get started quickly.

## 🎯 First Day Checklist

- [ ] Clone the repository
- [ ] Set up development environment
- [ ] Run the application locally
- [ ] Create a test user
- [ ] Explore the codebase
- [ ] Read the documentation

## 📥 Getting the Code

```bash
# Clone the repository
git clone https://github.com/sapradeep123/DocMS.git
cd DocMS

# Checkout main branch
git checkout master
```

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```bash
scripts\setup.bat
```

### Option 2: Manual Setup

Follow the [SETUP.md](SETUP.md) guide for detailed instructions.

## 🧪 Verify Installation

1. **Check Services:**
   ```bash
   docker compose ps
   ```
   All services should show "Up"

2. **Test Frontend:**
   - Open http://localhost:3000
   - Should see login page

3. **Test Backend:**
   - Open http://localhost:8000/docs
   - Should see Swagger UI

4. **Test API:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy"}`

## 👤 Create Your Account

1. Go to http://localhost:3000/register
2. Fill in:
   - Email: your.email@company.com
   - Username: yourusername
   - Password: (choose a secure password)
3. Click "Sign Up"
4. Login with your credentials

## 📚 Understanding the Codebase

### Backend Structure

```
app/
├── api/              # API routes and endpoints
│   ├── routes/       # Route handlers
│   └── dependencies/ # FastAPI dependencies
├── core/             # Core configuration
├── db/               # Database layer
│   ├── tables/       # SQLAlchemy models
│   └── repositories/ # Data access layer
└── schemas/          # Pydantic models
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── contexts/     # React contexts
│   └── services/     # API service layer
```

## 🔍 Key Files to Know

- `app/main.py` - FastAPI application entry point
- `app/core/config.py` - Configuration settings
- `frontend/src/App.jsx` - React app entry point
- `frontend/src/components/Layout.jsx` - Main layout component
- `docker-compose.yml` - Service configuration

## 🛠️ Development Workflow

### Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test locally:**
   ```bash
   # Backend
   docker compose logs -f api
   
   # Frontend
   # Check browser console
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "Add: Description of changes"
   ```

5. **Push:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

### Running Tests

```bash
# Backend tests (when available)
docker compose exec api pytest

# Frontend tests
cd frontend
npm test
```

## 📖 Important Documentation

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [TEST_USERS.md](TEST_USERS.md) - Test user credentials

## 🐛 Common Issues

### Port Already in Use
```bash
# Find process
# Windows:
netstat -ano | findstr :8000
# Linux/Mac:
lsof -i :8000

# Kill process or change port in docker-compose.yml
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Restart services
docker compose restart
```

### Frontend Not Loading
- Check frontend service: `docker compose ps frontend`
- Check logs: `docker compose logs frontend`
- Clear browser cache

## 💡 Tips

1. **Use Docker:** It's the easiest way to run everything
2. **Check Logs:** `docker compose logs -f` shows all logs
3. **API Docs:** Use http://localhost:8000/docs to test APIs
4. **Hot Reload:** Both frontend and backend support hot reload
5. **Database Access:** Use `docker compose exec postgres psql -U postgres -d docflow`

## 🎓 Learning Resources

- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Docker:** https://docs.docker.com/

## 🤝 Getting Help

1. Check documentation first
2. Search existing issues on GitHub
3. Ask in team chat
4. Create a new issue if needed

## ✅ Next Steps

1. ✅ Setup complete
2. ✅ Application running
3. ✅ Account created
4. ⬜ Explore the UI
5. ⬜ Review code structure
6. ⬜ Make your first change
7. ⬜ Submit a PR

## 🎉 Welcome to the Team!

You're all set! Start exploring and contributing to DocFlow.

For questions, don't hesitate to ask the team!

---

**Happy Coding! 🚀**


# DocFlow - Quick Validation Guide

## 🚀 Quick Start (5 Minutes)

### 1. Start the Application

```bash
cd docflow
docker compose up --build
```

Wait for all services to be healthy (about 2-3 minutes).

### 2. Create a Test User

In a new terminal:

```bash
docker compose exec api python scripts/create_test_user.py
```

Or manually register at http://localhost:3000/register

### 3. Access the Application

**Frontend:** http://localhost:3000  
**Backend API Docs:** http://localhost:8000/docs  
**MinIO Console:** http://localhost:9001

**Default Test Credentials:**
- Email: `admin@docflow.com` or Username: `admin`
- Password: `admin123`

---

## ✅ Validation Checklist

### Test Authentication Flow

1. **Register New User:**
   - Go to http://localhost:3000/register
   - Fill in: email, username, password (min 5 chars)
   - Should auto-login and redirect to dashboard

2. **Login:**
   - Go to http://localhost:3000/login
   - Login with email OR username
   - Should redirect to dashboard

3. **Protected Routes:**
   - Try accessing http://localhost:3000/ without login
   - Should redirect to /login
   - After login, should access dashboard

4. **Logout:**
   - Click logout in sidebar
   - Should redirect to login page
   - Token should be cleared

### Test Responsive Layout

**Desktop (> 768px):**
- ✅ Collapsible sidebar on left
- ✅ Top search bar
- ✅ No bottom navigation
- ✅ No FAB button

**Mobile (< 768px):**
- ✅ Hidden sidebar (hamburger menu)
- ✅ Bottom navigation bar (4 tabs)
- ✅ Floating Action Button (bottom right)
- ✅ FAB expands to show actions

**Test by resizing browser or using DevTools mobile view.**

### Test API Endpoints

**Using API Docs (http://localhost:8000/docs):**

1. **POST /v2/u/signup**
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "test123"
   }
   ```
   Expected: 201 Created

2. **POST /v2/u/login**
   - Click "Try it out"
   - Enter username and password
   - Expected: 200 OK with access_token

3. **GET /v2/u/me**
   - Click "Authorize" button (top right)
   - Enter: `Bearer <your-access-token>`
   - Try the /me endpoint
   - Expected: 200 OK with user data

---

## 🧪 Run Tests

### Backend Tests

```bash
# Install test dependencies
pip install -r requirements/test.txt

# Run tests
pytest tests/ -v

# Expected: 8 tests passed
```

### Frontend Tests

```bash
cd frontend

# Install dependencies (if not already)
npm install

# Run tests
npm test

# Expected: Tests for Login and Dashboard pass
```

---

## 🔍 Verify Database

```bash
# Access PostgreSQL
docker compose exec postgres psql -U postgres -d docflow

# Check users table
\d users

# Should show columns:
# - id, username, email, password
# - full_name, is_active (NEW)
# - user_since, updated_at (NEW)

# View users
SELECT id, username, email, is_active, user_since FROM users;

# Exit
\q
```

---

## 📱 Mobile Features to Test

### Bottom Navigation Bar
1. Resize browser to mobile width (< 768px)
2. Bottom bar should appear with 4 tabs:
   - Dashboard (Home icon)
   - Files (Document icon)
   - Tasks (CheckSquare icon)
   - Profile (User icon)
3. Active tab should be highlighted in blue
4. Tapping tabs should navigate

### Floating Action Button (FAB)
1. In mobile view, FAB appears bottom-right
2. Click FAB (+ icon)
3. Should expand to show:
   - "Upload Document" (blue)
   - "New Folder" (purple)
4. Click backdrop or X to close
5. Click action to execute

---

## 🐛 Troubleshooting

### Services Not Starting
```bash
# Check logs
docker compose logs -f

# Restart specific service
docker compose restart api
docker compose restart frontend
```

### Database Connection Error
```bash
# Check PostgreSQL is healthy
docker compose ps

# Recreate database
docker compose down -v
docker compose up --build
```

### Frontend Can't Connect to Backend
- Check `frontend/vite.config.js` proxy settings
- Verify API is running: http://localhost:8000/health
- Check browser console for CORS errors

### Migration Issues
```bash
# Run migrations manually
docker compose exec api alembic upgrade head

# Check migration status
docker compose exec api alembic current
```

---

## 📊 Expected Results

### ✅ All Systems Operational

- **Backend:** http://localhost:8000/health returns `{"status": "healthy"}`
- **Frontend:** http://localhost:3000 loads login page
- **Database:** PostgreSQL accepting connections
- **Storage:** MinIO bucket created

### ✅ Authentication Working

- Users can register
- Users can login with email or username
- JWT tokens are generated and validated
- Protected routes redirect to login
- /auth/me returns user data

### ✅ Responsive Layout Working

- Desktop: Sidebar + top nav
- Mobile: Bottom nav + FAB
- Smooth transitions between breakpoints
- All navigation items functional

### ✅ Tests Passing

- Backend: 8/8 auth tests pass
- Frontend: Login and Dashboard tests pass

---

## 🎯 Next Steps

After validation, you can:

1. **Add Business Logic:**
   - Document upload/download
   - Approval workflows
   - User roles and permissions

2. **Enhance UI:**
   - Add more pages
   - Improve mobile UX
   - Add animations

3. **Production Prep:**
   - Environment-specific configs
   - SSL/TLS setup
   - Monitoring and logging
   - CI/CD pipeline

---

## 📞 Support

If you encounter issues:

1. Check `ARCHITECTURE_VALIDATION.md` for detailed architecture info
2. Review `README.md` for full documentation
3. Check `SETUP.md` for manual setup instructions
4. Review Docker logs: `docker compose logs -f`

---

**Validation Complete! 🎉**

Your base architecture is ready for feature development.

# 🚀 How to Start and Login to Travel Encyclopedia

## ⚠️ IMPORTANT: Database Setup Required First!

Before you can login, you need to set up the database. Follow these steps:

1. **See `DATABASE_SETUP_STEPS.md`** for complete instructions
2. Create the database in PGAdmin
3. Run migrations: `cd backend && npx prisma migrate dev --name init`
4. Seed test data: `cd backend && npm run seed`
5. Restart backend server

---

## ✅ Application Status

**Backend Server:** ✅ Running on http://localhost:3000
**Frontend App:** ✅ Running on Expo (scan QR code or press 'w' for web)
**Database:** ⚠️ Needs setup (see DATABASE_SETUP_STEPS.md)

---

## 📱 How to Access the Frontend

You have 3 options to run the frontend:

### Option 1: Web Browser (Easiest)
1. In the frontend terminal, press **`w`** to open in web browser
2. The app will open at http://localhost:8081

### Option 2: Mobile Device (Expo Go App)
1. Download **Expo Go** app from:
   - iOS: App Store
   - Android: Google Play Store
2. Scan the QR code shown in the frontend terminal
3. The app will load on your phone

### Option 3: Android Emulator
1. Make sure you have Android Studio with an emulator set up
2. In the frontend terminal, press **`a`** to open in Android emulator

---

## 🔐 Test Login Credentials

The database has been seeded with test users. You can login with any of these:

### 1. Admin Account
- **Email:** `admin@travelencyclopedia.com`
- **Password:** `admin123`
- **Role:** Site Administrator
- **Can:** Approve all content, manage users, full system access

### 2. Government Department Account
- **Email:** `tourism@kerala.gov.in`
- **Password:** `govt123`
- **Role:** Government Tourism Department
- **Can:** Create locations, events, accommodations (auto-approved)

### 3. Tourist Guide Account
- **Email:** `guide@example.com`
- **Password:** `guide123`
- **Role:** Tourist Guide
- **Can:** Create packages, accommodations (requires approval)

### 4. Regular User Account
- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** Regular User
- **Can:** Browse content, create community posts, join group travels

---

## 📝 How to Login

1. **Open the app** (web browser, phone, or emulator)
2. You'll see the **Login screen** automatically
3. Enter one of the test credentials above
4. Click **"Login"** button
5. You'll be redirected to the main app with tabs

---

## 🎯 What You Can Do After Login

### All Users Can:
- 📍 Browse locations (India, states, areas)
- 🎉 View events and festivals
- 📦 Explore travel packages
- 🏨 Find accommodations (hotels, restaurants, hospitals)
- 👥 View community posts
- 🚌 Browse group travel opportunities
- 👤 Manage their profile

### Tourist Guides Can Also:
- Create travel packages
- Add accommodations
- Submit content for approval

### Government Departments Can Also:
- Add official locations
- Create events
- Add government-approved accommodations
- Content is auto-approved

### Admins Can Also:
- Approve/reject all pending content
- Manage all users
- Full system administration

---

## 🗂️ Sample Data Available

The database includes:
- ✅ 3 Locations: Munnar, Alleppey, Jaipur
- ✅ 1 Event: Kerala Boat Race Festival
- ✅ 1 Package: Kerala Backwaters Experience (3 days)
- ✅ 2 Accommodations: Taj Gateway Hotel, Saravana Bhavan
- ✅ 1 Community Post
- ✅ 1 Group Travel: Rajasthan Heritage Tour

---

## 🔄 If You Need to Restart

### Stop the Servers:
Press **Ctrl+C** in both terminal windows (backend and frontend)

### Start Backend:
```bash
cd backend
npm run dev
```

### Start Frontend:
```bash
cd frontend
npm start
```

---

## 🐛 Troubleshooting

### Backend won't start (port 3000 in use):
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>
```

### Frontend won't connect to backend:
- Check that backend is running on http://localhost:3000
- Check `frontend/.env` has: `EXPO_PUBLIC_API_URL=http://localhost:3000`

### Database errors:
```bash
cd backend
npm run prisma:migrate
npm run seed
```

---

## 📚 Additional Resources

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Backend Details:** See `BACKEND_COMPLETE.md`
- **Project Summary:** See `PROJECT_SUMMARY.md`
- **Quick Start:** See `QUICK_START.md`

---

## 🎉 Ready to Go!

Your Travel Encyclopedia app is now running! Login with any of the test accounts above and start exploring. Enjoy! 🌍✈️

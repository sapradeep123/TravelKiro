# 🎯 START HERE - Quick Setup Guide

## Current Status

✅ **Backend Server:** Running on http://localhost:3000
✅ **Frontend App:** Running (press 'w' for web browser)
✅ **Database:** Created and seeded with test data
✅ **PostgreSQL:** Connected on port 5433

## 🎉 YOU'RE READY TO LOGIN!

See **READY_TO_LOGIN.md** for login instructions and credentials.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Database in PGAdmin ⭐ DO THIS FIRST!

1. Open **PGAdmin**
2. Right-click **PostgreSQL 16** → **Query Tool**
3. Run this SQL:
   ```sql
   CREATE DATABASE travel_encyclopedia;
   ```
4. Press **F5** to execute

### Step 2: Run Migrations & Seed Data

Open a new terminal and run:

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

Wait for both commands to complete successfully.

### Step 3: Restart Backend & Open Frontend

1. In the backend terminal, press **Ctrl+C** then run: `npm run dev`
2. In the frontend terminal, press **`w`** to open in web browser

---

## 🔐 Login Credentials

After seeding, use any of these to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelencyclopedia.com | admin123 |
| Govt Dept | tourism@kerala.gov.in | govt123 |
| Tourist Guide | guide@example.com | guide123 |
| User | user@example.com | user123 |

---

## 📱 How to Access Frontend

**Option 1: Web Browser (Easiest)**
- Press **`w`** in the frontend terminal
- Opens at http://localhost:8081

**Option 2: Mobile Phone**
- Download **Expo Go** app
- Scan the QR code in terminal

**Option 3: Android Emulator**
- Press **`a`** in the frontend terminal

---

## 📚 Detailed Documentation

- **Database Setup:** `DATABASE_SETUP_STEPS.md`
- **Login Guide:** `HOW_TO_LOGIN.md`
- **API Docs:** `API_DOCUMENTATION.md`
- **Project Summary:** `PROJECT_SUMMARY.md`

---

## 🐛 Having Issues?

### Backend won't connect to database:
- Make sure you created the database in PGAdmin
- Check `backend/.env` has correct password: `NewStrongPassword_2025!`

### Frontend shows errors:
- Make sure backend is running on port 3000
- Check `frontend/.env` has: `EXPO_PUBLIC_API_URL=http://localhost:3000`

### Can't login:
- Make sure you ran the seed command: `npm run seed`
- Check backend terminal for any errors

---

## ✨ You're All Set!

Once you complete the 3 steps above, you can login and explore the Travel Encyclopedia app! 🌍✈️

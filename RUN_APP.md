# How to Run Your Travel Encyclopedia App

## 🚀 Quick Start Guide

Follow these steps to see your app running!

---

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js (v18 or higher) - [Download](https://nodejs.org/)
- ✅ PostgreSQL database - [Download](https://www.postgresql.org/download/)
- ✅ Git (already have it)

---

## Step-by-Step Instructions

### Step 1: Set Up PostgreSQL Database

#### Option A: Using PostgreSQL GUI (pgAdmin)
1. Open pgAdmin
2. Create a new database named `travel_encyclopedia`
3. Note your username and password

#### Option B: Using Command Line
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE travel_encyclopedia;

# Exit
\q
```

### Step 2: Update Database Connection

The `.env` file is already created in `backend/.env`. Update it if needed:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/travel_encyclopedia?schema=public"
```

Replace:
- `YOUR_USERNAME` with your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password

---

## Step 3: Start the Backend

Open a terminal and run:

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

### Expected Output:
```
🚀 Server is running on port 3000
📍 Environment: development
📚 API Documentation: http://localhost:3000/health
```

### Verify Backend is Running:
Open your browser and go to: **http://localhost:3000/health**

You should see:
```json
{
  "status": "ok",
  "message": "Travel Encyclopedia API is running"
}
```

---

## Step 4: Start the Frontend

Open a **NEW terminal** (keep backend running) and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start Expo
npm start
```

### Expected Output:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

---

## Step 5: View Your App

### Option 1: Web Browser (Easiest)
1. Press `w` in the terminal
2. Your browser will open automatically
3. You'll see the Travel Encyclopedia app!

### Option 2: Android Emulator
1. Install Android Studio
2. Set up an Android emulator
3. Press `a` in the terminal

### Option 3: iOS Simulator (Mac only)
1. Install Xcode
2. Press `i` in the terminal

### Option 4: Physical Device
1. Install "Expo Go" app from Play Store or App Store
2. Scan the QR code shown in terminal
3. App will load on your phone!

---

## 🎉 What You'll See

### 1. Login Screen
- Beautiful blue-themed login page
- Test credentials displayed
- Sign in or register options

### 2. After Login - Main App
You'll see **7 tabs** at the bottom:

#### 📍 Locations Tab
- Browse beautiful locations (Munnar, Alleppey, Jaipur)
- Search locations
- See images and descriptions
- Pull to refresh

#### 📅 Events Tab
- View upcoming events
- See event dates and details
- Express interest button
- Beautiful event cards

#### 📦 Packages Tab
- Browse travel packages
- See pricing (₹15,000)
- View itinerary preview
- Express interest

#### 🏨 Stay & Dine Tab
- Filter: Hotels, Restaurants, Resorts
- Government approval badges
- Contact buttons (Call, Email, Website)
- Full contact information

#### 👥 Community Tab
- Instagram-style feed
- Like and comment on posts
- See user profiles
- Time ago display

#### 🚌 Group Travel Tab
- Browse group travel requests
- See interested users count
- View bids from guides
- Express interest
- Days until travel countdown

#### 👤 Profile Tab
- Your user information
- Role display
- Contact details
- Logout button

---

## 🧪 Test the App

### Test Credentials:
```
Admin:     admin@travelencyclopedia.com / admin123
User:      user@example.com / user123
Guide:     guide@example.com / guide123
Govt Dept: tourism@kerala.gov.in / govt123
```

### Things to Try:
1. ✅ Login with different user roles
2. ✅ Browse locations, events, packages
3. ✅ Express interest in events/packages
4. ✅ View accommodations and click contact buttons
5. ✅ Like and comment on community posts
6. ✅ Join group travel requests
7. ✅ Search for locations
8. ✅ Pull to refresh on any screen
9. ✅ View your profile
10. ✅ Logout and login again

---

## 📱 Screenshots You'll See

### Login Screen
- Blue header "Travel Encyclopedia"
- Email and password fields
- Sign In button
- Test credentials displayed

### Locations Screen
- Search bar at top
- Beautiful location cards with images
- Country/State chips
- Descriptions

### Events Screen
- Event cards with dates
- Calendar icons
- Express Interest buttons
- Pending approval indicators

### Packages Screen
- Package cards with pricing
- Duration indicators
- Itinerary previews
- Price in ₹ (Rupees)

### Accommodations Screen
- Segmented buttons (All, Hotels, Restaurants, Resorts)
- Government badges
- Contact buttons
- Full contact info

### Community Screen
- Instagram-like feed
- User avatars
- Like and comment counts
- Time ago display

### Group Travel Screen
- Travel request cards
- Days until travel
- Interested users count
- Bid previews

### Profile Screen
- User avatar
- Name and email
- Role display
- Logout button

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "Database connection failed"**
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

**Error: "Port 3000 already in use"**
```bash
# Change port in backend/.env
PORT=3001

# Update frontend/.env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Error: "Expo command not found"**
```bash
npm install -g expo-cli
```

### App Shows "Network Error"

1. Make sure backend is running on port 3000
2. Check `frontend/.env` has correct API URL
3. Try restarting both backend and frontend

---

## 🎯 Quick Commands Reference

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:studio # Open database GUI
npm run seed         # Reseed database
```

### Frontend Commands
```bash
cd frontend
npm start            # Start Expo
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run on web
```

---

## 🌐 Access URLs

Once running:
- **Backend API:** http://localhost:3000
- **API Health:** http://localhost:3000/health
- **Frontend Web:** http://localhost:8081 (or shown in terminal)
- **Prisma Studio:** http://localhost:5555 (run `npm run prisma:studio`)

---

## 📊 What Data You'll See

All data comes from the database (seeded):

### Locations (3)
- Munnar, Kerala
- Alleppey, Kerala
- Jaipur, Rajasthan

### Events (1)
- Kerala Boat Race Festival

### Packages (1)
- Kerala Backwaters Experience - 3 Days (₹15,000)

### Accommodations (2)
- The Taj Gateway Hotel (Munnar) - Govt Approved
- Saravana Bhavan Restaurant (Alleppey)

### Community Posts (1)
- Post from John Doe about Munnar

### Group Travel (1)
- Rajasthan Heritage Tour - Group of 10

### Users (4)
- Admin, Govt Department, Tourist Guide, Regular User

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Backend shows "Server is running on port 3000"
- ✅ Frontend shows Expo QR code and options
- ✅ Web browser opens with login screen
- ✅ You can login with test credentials
- ✅ You see all 7 tabs at the bottom
- ✅ Data loads from backend
- ✅ Images display correctly
- ✅ Buttons work and show alerts

---

## 💡 Pro Tips

### View Database
```bash
cd backend
npm run prisma:studio
```
Opens a web interface to view/edit database records!

### Clear Cache (if issues)
```bash
# Frontend
cd frontend
npx expo start -c

# Backend
cd backend
rm -rf dist
npm run dev
```

### Hot Reload
- Backend: Automatically reloads on file changes
- Frontend: Shake device or press `r` to reload

---

## 🎬 Video Walkthrough (What You'll Experience)

1. **Start Backend** → See "Server running" message
2. **Start Frontend** → See Expo menu
3. **Press 'w'** → Browser opens
4. **Login Screen** → Enter credentials
5. **Main App** → See 7 tabs
6. **Browse Content** → See locations, events, packages
7. **Interact** → Click buttons, express interest
8. **Profile** → View your info, logout

---

## 🚀 You're Ready!

Run these two commands in separate terminals:

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm start
```

Then press `w` for web!

**Your Travel Encyclopedia app will be running and beautiful!** 🌍✈️

---

## Need Help?

- Check TROUBLESHOOTING.md for common issues
- Check SETUP.md for detailed setup
- Check API_DOCUMENTATION.md for API reference
- All documentation is in the root directory

**Enjoy exploring your Travel Encyclopedia!** 🎉

# 🚀 Quick Start - Group Travel Feature

## ✅ Everything is Ready!

Both servers are running and sample data is loaded.

## 🌐 Access the App

**Web Browser**: http://localhost:8081

**Expo Go**: Scan the QR code in the terminal

## 🔑 Login Credentials

### Regular User (Can create group travels)
```
Email: user@travelencyclopedia.com
Password: password123
```

### Tourist Guide (Can submit bids)
```
Email: guide@butterfliy.com
Password: password123
```

## 📱 Quick Test Flow

### As a User:
1. Login with user credentials
2. Go to "Group Travel" tab
3. See 2 sample group travels
4. Click on "Weekend Trip to Manali"
5. Click "Express Interest"
6. Now you can see the bids!
7. Click "Approve Contact" on a bid

### As a Tourist Guide:
1. Login with guide credentials
2. Go to "Group Travel" tab
3. Click "My Bids" to see existing bids
4. Click on any group travel
5. Click "Submit Bid"
6. Fill the form and submit

### Create New Group Travel:
1. Login as any user
2. Click the "+" button
3. Fill in:
   - Title: "Trip to Kerala"
   - Description: "Backwaters and beaches"
   - Country: India
   - State: Kerala
   - Area: Alleppey
   - Travel Date: Pick a date 6+ days ahead
   - Expiry Date: Pick a date before travel date
4. Submit!

## 📊 Sample Data Available

- ✅ Weekend Trip to Manali (₹15,000, 3 days)
- ✅ Goa Beach Vacation (₹20,000, 4 days)
- ✅ 2 bids with complete itineraries

## 🎯 What to Test

1. ✅ View group travels
2. ✅ Create new group travel
3. ✅ Express interest
4. ✅ Submit bid (as guide)
5. ✅ Approve contact (as creator)
6. ✅ View my travels
7. ✅ View my bids

## 🐛 If Something Goes Wrong

### Backend not responding?
```bash
cd backend
npm run dev
```

### Frontend not loading?
```bash
cd frontend
npm start
```

### Need fresh data?
```bash
cd backend
npx tsx src/scripts/seed-group-travel.ts
```

## 📚 More Info

- Full documentation: `docs/GROUP_TRAVEL_FEATURE.md`
- Testing guide: `TESTING_GROUP_TRAVEL.md`
- Implementation details: `GROUP_TRAVEL_IMPLEMENTATION.md`

## ✨ Features Implemented

✅ Create group travel proposals
✅ Express interest in travels
✅ Submit structured bids with itineraries
✅ Approve contact for guides
✅ View my travels and bids
✅ Automatic expiration
✅ Date validation (5-day minimum)
✅ Bid visibility control
✅ Role-based access

## 🎉 You're All Set!

Open http://localhost:8081 and start exploring the Group Travel feature!

# Maintenance & Rollback Guide

## 🔖 Current Stable Version

**Tag:** `v1.0-stable-edit-screens`  
**Commit:** `ac33e87`  
**Date:** November 10, 2025

### What's Working
- ✅ Edit screens (Package, Event, Location) load data correctly
- ✅ Footer scrolls with content (not fixed)
- ✅ Database seeding functionality
- ✅ All CRUD operations working

---

## 🔄 Quick Rollback

If you need to return to this stable version:

```bash
# View the stable version
git checkout v1.0-stable-edit-screens

# Or reset main branch to this version (CAREFUL!)
git reset --hard v1.0-stable-edit-screens
git push origin main --force
```

---

## 🗄️ Database Seeding

### Quick Seed
Run the batch file:
```bash
seed-data.bat
```

### Manual Seed
```bash
curl -X POST http://localhost:3000/api/seed/users
curl -X POST http://localhost:3000/api/seed/event-types
curl -X POST http://localhost:3000/api/seed/locations
curl -X POST http://localhost:3000/api/seed/events
curl -X POST http://localhost:3000/api/seed/packages
```

### What Gets Seeded
- 6 Locations (Munnar, Jaipur, Goa, Manali, Agra, Alleppey)
- 1 Event (Diwali Festival 2025)
- 5 Packages with full itineraries
- 12 Event Types
- Test users

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelencyclopedia.com | admin123 |
| Tourism | tourism@travelencyclopedia.com | tourism123 |
| Guide | guide@travelencyclopedia.com | guide123 |
| User | user@travelencyclopedia.com | user123 |

---

## 🐛 Fixes in This Version

### 1. Edit Package Screen
- **Issue:** Data not loading when clicking Edit
- **Fix:** Changed `response.data` to `response.data.data`

### 2. Database Seeding
- **Issue:** Empty database, no locations/events visible
- **Fix:** Added seedLocations endpoint, fixed field names (`createdBy` instead of `createdById`)

### 3. Footer Positioning
- **Issue:** Fixed footer covering form content
- **Fix:** Moved WebFooter inside ScrollView

---

## 💾 Database Backup

Before major changes:
```bash
# Backup
pg_dump -U postgres -d travel_encyclopedia > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d travel_encyclopedia < backup_20251110.sql
```

---

## 📝 Creating New Stable Versions

When you reach another stable point:
```bash
git add .
git commit -m "Description of changes"
git tag -a v1.1-stable-feature-name -m "Description"
git push origin main
git push origin v1.1-stable-feature-name
```

Update this file with the new version info!

---

## 🆘 Troubleshooting

### If seeding fails
1. Check backend is running on port 3000
2. Check database connection in `backend/.env`
3. Check backend console for errors

### If edit screens don't load data
1. Check browser console for errors
2. Verify API is returning `{ data: {...} }` format
3. Check network tab in browser dev tools

### If footer is fixed
1. Ensure WebFooter is inside ScrollView
2. Check the component structure in edit screens

---

**Last Updated:** November 10, 2025

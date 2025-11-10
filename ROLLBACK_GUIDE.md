# Rollback Guide

## Current Stable Version
**Tag:** `v1.0-stable-edit-screens`  
**Commit:** `ac33e87`  
**Date:** November 10, 2025

This version includes:
- ✅ Working edit screens (Package, Event, Location)
- ✅ Database seeding functionality
- ✅ Fixed footer positioning
- ✅ Proper API response handling

---

## How to Rollback to This Version

If you encounter issues in the future and want to return to this stable state, follow these steps:

### Option 1: Rollback using Git Tag (Recommended)

```bash
# View all available tags
git tag -l

# Rollback to the stable version
git checkout v1.0-stable-edit-screens

# If you want to create a new branch from this point
git checkout -b rollback-branch v1.0-stable-edit-screens

# Or if you want to reset main branch to this point (CAREFUL!)
git checkout main
git reset --hard v1.0-stable-edit-screens
git push origin main --force
```

### Option 2: Rollback using Commit Hash

```bash
# Rollback to specific commit
git checkout ac33e87

# Create a new branch from this commit
git checkout -b rollback-branch ac33e87

# Or reset main branch (CAREFUL!)
git checkout main
git reset --hard ac33e87
git push origin main --force
```

### Option 3: View Changes Without Rollback

```bash
# See what changed since this version
git diff v1.0-stable-edit-screens

# View commit history since this version
git log v1.0-stable-edit-screens..HEAD

# Compare files
git diff v1.0-stable-edit-screens -- path/to/file
```

---

## After Rollback

1. **Reinstall dependencies** (if package.json changed):
   ```bash
   cd frontend
   npm install
   
   cd ../backend
   npm install
   ```

2. **Re-seed database** (if needed):
   ```bash
   seed-data.bat
   ```

3. **Restart servers**:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend
   cd frontend
   npm start
   ```

---

## What Was Fixed in This Version

### 1. Edit Package Screen
- **Issue:** Data not loading when clicking Edit
- **Fix:** Changed `response.data` to `response.data.data`
- **File:** `frontend/app/(admin)/edit-package.tsx`

### 2. Database Seeding
- **Issue:** Empty database, no locations/events visible
- **Fix:** Added seedLocations endpoint, fixed field names
- **Files:** 
  - `backend/src/controllers/seedController.ts`
  - `backend/src/routes/seed.ts`
  - `seed-data.bat`
  - `SEED_DATABASE.md`

### 3. Footer Positioning
- **Issue:** Fixed footer covering form content
- **Fix:** Moved WebFooter inside ScrollView
- **Files:**
  - `frontend/app/(admin)/edit-event.tsx`
  - `frontend/app/(admin)/edit-location.tsx`

---

## Database Backup

Before making major changes, always backup your database:

```bash
# PostgreSQL backup
pg_dump -U postgres -d travel_encyclopedia > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U postgres -d travel_encyclopedia < backup_20251110_133000.sql
```

---

## Contact & Support

If you need help with rollback:
1. Check git log: `git log --oneline`
2. View this commit: `git show ac33e87`
3. Compare with current: `git diff v1.0-stable-edit-screens HEAD`

---

## Future Stable Versions

When you reach another stable point, create a new tag:

```bash
git tag -a v1.1-stable-feature-name -m "Description of stable state"
git push origin v1.1-stable-feature-name
```

Keep this file updated with new stable versions!

# Quick Fix Guide - Login Issues

## Issues Fixed

1. ✅ **Login endpoint** - Now accepts both email and username
2. ✅ **Form data format** - Fixed to use `application/x-www-form-urlencoded`
3. ✅ **Register endpoint** - Changed from `/register` to `/signup`

## Test User

A test user has been created:
- **Username**: `admin`
- **Email**: `admin@docflow.com`
- **Password**: `admin123`

## How to Login

You can now login with either:
- **Email**: `admin@docflow.com`
- **Username**: `admin`
- **Password**: `admin123`

## If Login Still Fails

1. **Check backend is running**:
   ```bash
   docker compose ps
   ```

2. **Check backend logs**:
   ```bash
   docker compose logs api --tail=20
   ```

3. **Test backend directly**:
   ```bash
   curl http://localhost:8000/health
   ```

4. **Restart frontend dev server**:
   - Stop the frontend (Ctrl+C)
   - Run `npm run dev` again

5. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

## Create More Test Users

Run the seeding script:
```bash
python scripts/seed_data.py
```

This will create 4 users with sample documents.


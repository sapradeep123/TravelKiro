@echo off
echo ========================================
echo Seeding Database with Sample Data
echo ========================================
echo.

echo Step 1: Seeding Users...
curl -X POST http://localhost:3000/api/seed/users
echo.
echo.

echo Step 2: Seeding Event Types...
curl -X POST http://localhost:3000/api/seed/event-types
echo.
echo.

echo Step 3: Seeding Locations...
curl -X POST http://localhost:3000/api/seed/locations
echo.
echo.

echo Step 4: Seeding Events...
curl -X POST http://localhost:3000/api/seed/events
echo.
echo.

echo Step 5: Seeding Packages...
curl -X POST http://localhost:3000/api/seed/packages
echo.
echo.

echo ========================================
echo Database seeding completed!
echo ========================================
echo.
echo You can now login with:
echo - Admin: admin@travelencyclopedia.com / admin123
echo - Tourism: tourism@travelencyclopedia.com / tourism123
echo - Guide: guide@travelencyclopedia.com / guide123
echo - User: user@travelencyclopedia.com / user123
echo.
pause

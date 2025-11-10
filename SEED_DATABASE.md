# Database Seeding Instructions

## Problem
The database is empty, so no locations, events, or packages are visible in the application.

## Solution
Run the seed script to populate the database with sample data.

## Steps

### 1. Make sure your backend server is running
```bash
cd backend
npm run dev
```

### 2. Run the seed script

**On Windows:**
```bash
seed-data.bat
```

**Or manually using curl:**
```bash
# Seed users
curl -X POST http://localhost:3000/api/seed/users

# Seed event types
curl -X POST http://localhost:3000/api/seed/event-types

# Seed locations
curl -X POST http://localhost:3000/api/seed/locations

# Seed events
curl -X POST http://localhost:3000/api/seed/events

# Seed packages
curl -X POST http://localhost:3000/api/seed/packages
```

### 3. Refresh your browser

After seeding, refresh the application and you should see:
- **6 Locations**: Munnar, Jaipur, North Goa, Manali, Agra, Alleppey
- **1 Event**: Diwali Festival 2025
- **5 Packages**: Kerala Backwaters, Rajasthan Heritage, Himalayan Adventure, Goa Beach, Golden Triangle

## Test Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Site Admin | admin@travelencyclopedia.com | admin123 |
| Tourism Dept | tourism@travelencyclopedia.com | tourism123 |
| Travel Guide | guide@travelencyclopedia.com | guide123 |
| Regular User | user@travelencyclopedia.com | user123 |

## What Gets Seeded

### Locations (6)
- Munnar, Kerala (Admin - Approved)
- Jaipur, Rajasthan (Tourism - Approved)
- North Goa, Goa (Guide - Pending)
- Manali, Himachal Pradesh (Admin - Approved)
- Agra, Uttar Pradesh (Tourism - Approved)
- Alleppey, Kerala (Guide - Pending)

### Events (1)
- Diwali Festival 2025 (Admin - Approved)

### Packages (5)
- Kerala Backwaters Experience (5 days, ₹25,000)
- Rajasthan Royal Heritage Tour (7 days, ₹45,000)
- Himalayan Adventure Package (6 days, ₹35,000)
- Goa Beach Paradise (4 days, ₹20,000)
- Golden Triangle - Delhi, Agra, Jaipur (5 days, ₹30,000)

Each package includes complete day-by-day itinerary with activities.

## Troubleshooting

### If curl is not found
Install curl or use Postman to make POST requests to the seed endpoints.

### If seeding fails
1. Check that the backend server is running on port 3000
2. Check the backend console for error messages
3. Verify database connection in backend/.env

### To re-seed
The seed scripts will delete existing data before creating new data, so you can run them multiple times.

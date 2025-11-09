# How to Add Sample Events

## Option 1: Using pgAdmin (Recommended)

1. **Open pgAdmin**
2. **Connect to your database** (butterfliy)
3. **Open Query Tool** (Tools → Query Tool)
4. **Copy and paste** the contents of `backend/seed-events.sql`
5. **Execute** (F5 or click Execute button)
6. You should see: "Successfully inserted 8 sample events!"

## Option 2: Using Database GUI

If you're using another database tool:
1. Open your database tool
2. Connect to `butterfliy` database
3. Run the SQL from `backend/seed-events.sql`

## Option 3: Create One Event Manually via Admin Interface

1. **Go to Admin Dashboard**
2. **Click "Manage Events"** card (pink, calendar icon)
3. **Click "Create Event"** button
4. **Fill in the form:**
   - Title: `Diwali Festival 2025`
   - Type: Select `Festival` from dropdown
   - Description: `Grand celebration of lights`
   - Start Date: `2025-11-12` (must be future date)
   - End Date: `2025-11-14`
   - Venue: `City Central Park`
   - Country: `India`
   - State: `Maharashtra`
   - City: `Mumbai`
5. **Click "Create Event"**

## Option 4: Quick Test Event (Copy-Paste SQL)

Open your database tool and run this single event:

```sql
INSERT INTO "Event" (
  id, title, description, "eventType", venue,
  "customCountry", "customState", "customArea",
  "startDate", "endDate", images,
  "hostId", "hostRole", "approvalStatus", "isActive",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'Test Event 2025',
  'This is a test event to verify the system works',
  'Festival',
  'Test Venue',
  'India', 'Maharashtra', 'Mumbai',
  (NOW() + INTERVAL '30 days')::DATE,
  (NOW() + INTERVAL '32 days')::DATE,
  ARRAY['https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'],
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  true,
  NOW(),
  NOW()
);
```

## Verify Events Were Added

Run this query to check:

```sql
SELECT COUNT(*) FROM "Event";
```

Should return a number greater than 0.

## View Events on Frontend

### Admin View:
1. Go to http://localhost:8081
2. Login as admin
3. Click profile → Admin Dashboard
4. Click "Manage Events" card
5. You should see your events in a table

### Public View:
1. Go to http://localhost:8081
2. Click "Events" in the navigation
3. You should see approved events

## Troubleshooting

### No events showing on public page:
- Events must have `approvalStatus = 'APPROVED'`
- Events must have `isActive = true`
- Events must have future dates

### No events showing on admin page:
- Check if you're logged in as admin
- Check browser console (F12) for errors
- Verify backend is running on port 3000

### Can't create event:
- Start date must be in future (format: YYYY-MM-DD)
- End date must be after start date
- All required fields must be filled

## Quick Database Check

To see what's in your database:

```sql
-- Count events
SELECT COUNT(*) FROM "Event";

-- View all events
SELECT title, "startDate", "endDate", "isActive", "approvalStatus" 
FROM "Event";

-- View only approved active events
SELECT title, "startDate", "endDate" 
FROM "Event" 
WHERE "approvalStatus" = 'APPROVED' 
AND "isActive" = true
AND "startDate" > NOW();
```

## Need Help?

If you're still not seeing data:
1. Check if backend is running (port 3000)
2. Check browser console for errors (F12)
3. Verify you have events in database
4. Make sure events have future dates
5. Ensure events are APPROVED and active

# Events Management - Quick Start Guide

## ✅ What's Been Implemented

### Complete Events Management System
- Full CRUD operations (Create, Read, Update, Delete)
- Active/Inactive status management
- Future dates validation
- Role-based access control
- Professional admin interface
- Sample data ready

## 🚀 Quick Start

### Step 1: Add Sample Events to Database

```bash
# Connect to your database
psql -U postgres -d butterfliy

# Run the seed script
\i backend/seed-events.sql
```

This creates 8 sample events with future dates.

### Step 2: Access the Frontend

1. Open browser: http://localhost:8081
2. Login as admin
3. Go to Admin Dashboard
4. Click **"Manage Events"** card (pink, calendar icon)

### Step 3: Test Features

#### View Events
- See table with all events
- Click tabs: All / Active / Inactive
- Use search bar to find events
- Navigate pages (if more than 10 events)

#### Create Event
1. Click **"Create Event"** button
2. Fill in the form:
   - Title: "Test Event 2025"
   - Type: Select from dropdown (Festival, Concert, etc.)
   - Description: Event details
   - Start Date: Future date (YYYY-MM-DD)
   - End Date: After start date
   - Location details (optional)
   - Transportation info (optional)
3. Click **"Create Event"**
4. Event appears in the list

#### Edit Event
1. Click ✏️ (pencil icon) on any event
2. Modify any fields
3. Click **"Update Event"**
4. Changes saved

#### Toggle Status
1. Click ▶️ (play) or ⏸️ (pause) icon
2. Event switches between Active/Inactive
3. Badge color changes

#### Delete Event
1. Click 🗑️ (trash icon)
2. Confirm deletion
3. Event removed

## 📋 Event Types Available

- Festival
- Concert
- Sports
- Cultural
- Religious
- Exhibition
- Conference
- Workshop
- Food & Drink
- Other

## ⚠️ Important Rules

### Date Validation
- ✅ Start date MUST be in the future
- ✅ End date MUST be after start date
- ❌ Past events are NOT allowed
- ❌ Past events are filtered out from display

### Permissions
- **Admin**: Can manage all events
- **Tourism Dept**: Can manage own events
- **Travel Agent**: Can create (pending approval)

## 🎯 Sample Events Included

1. **Diwali Festival 2025** - Festival in Mumbai
2. **Goa Sunburn Festival 2025** - Concert in Goa
3. **Jaipur Literature Festival 2025** - Cultural in Jaipur
4. **Nehru Trophy Boat Race 2025** - Sports in Kerala
5. **Pushkar Camel Fair 2025** - Festival in Rajasthan
6. **Hampi Utsav 2025** - Cultural (Inactive for testing)
7. **Holi Festival 2025** - Festival in Mathura
8. **Manali Winter Carnival 2025** - Sports in Himachal

All events have:
- Future dates
- Transportation details (airport, railway, bus)
- Location information
- Event type
- Active/Inactive status

## 🔍 What You'll See

### Dashboard
```
┌─────────────────────────────────────────┐
│  📅 Manage Events                       │
│  View, edit, and manage all events     │
│  (Pink card with calendar icon)        │
└─────────────────────────────────────────┘
```

### Manage Events Page
```
Manage Events
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[All (8)] [Active (7)] [Inactive (1)]

[🔍 Search events...]                [+ Create Event]

┌────────────────────────────────────────────────────────────────┐
│ Image │ Event          │ Type    │ Start    │ End      │ Status│
├────────────────────────────────────────────────────────────────┤
│ [img] │ Diwali 2025    │Festival │ Nov 12   │ Nov 14   │Active │
│ [img] │ Goa Sunburn    │Concert  │ Dec 12   │ Dec 15   │Active │
│ [img] │ Jaipur Lit Fest│Cultural │ Jan 10   │ Jan 15   │Active │
└────────────────────────────────────────────────────────────────┘
```

### Create Event Form
```
Create Event
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Basic Information
  Event Title *: [________________]
  Event Type *:  [▼ Select type  ]
  Description *: [________________]
                 [________________]

Date & Time
  Start Date *:  [YYYY-MM-DD]
  End Date *:    [YYYY-MM-DD]

Location Details
  Venue:         [________________]
  Country:       [________________]
  State:         [________________]
  City:          [________________]

How to Reach
  Airport:       [________________]
  Distance:      [________________]
  Railway:       [________________]
  Distance:      [________________]

                    [Cancel] [Create Event]
```

## 🎨 Visual Indicators

### Role Badges
- 🔵 **Admin** (Blue)
- 🟢 **Tourism Dept** (Green)
- 🟠 **Travel Agent** (Orange)

### Status Badges
- 🟢 **Active** (Green)
- 🔴 **Inactive** (Red)

### Action Icons
- ✏️ Edit
- ▶️ Activate (when inactive)
- ⏸️ Deactivate (when active)
- 🗑️ Delete

## ✅ Testing Checklist

- [ ] Run seed script to add sample events
- [ ] Login as admin
- [ ] See "Manage Events" card on dashboard
- [ ] Click card to open events page
- [ ] See 8 sample events in table
- [ ] Test "All" tab - shows all 8 events
- [ ] Test "Active" tab - shows 7 events
- [ ] Test "Inactive" tab - shows 1 event
- [ ] Search for "Diwali" - filters results
- [ ] Click "Create Event" - opens form
- [ ] Create new event with future dates
- [ ] Click Edit on an event - opens edit form
- [ ] Modify event and save
- [ ] Click toggle status - changes active/inactive
- [ ] Click delete - removes event
- [ ] Try creating event with past date - shows error
- [ ] Try end date before start date - shows error

## 🐛 Troubleshooting

### "Manage Events" card not showing
- Make sure you're logged in as SITE_ADMIN or GOVT_DEPARTMENT
- Hard refresh browser (Ctrl + Shift + R)

### No events in the list
- Run the seed script: `\i backend/seed-events.sql`
- Check if events were created: `SELECT COUNT(*) FROM "Event";`

### Can't create event
- Check start date is in future
- Check end date is after start date
- Verify all required fields are filled
- Check browser console for errors

### Date format error
- Use format: YYYY-MM-DD
- Example: 2025-12-25
- Not: 25/12/2025 or 12-25-2025

## 📊 Database Check

To verify events in database:

```sql
-- Count events
SELECT COUNT(*) FROM "Event";

-- View all events
SELECT title, "eventType", "startDate", "endDate", "isActive" 
FROM "Event" 
ORDER BY "startDate";

-- View only future events
SELECT title, "startDate", "endDate" 
FROM "Event" 
WHERE "startDate" > NOW()
ORDER BY "startDate";
```

## 🎉 Success!

If you can:
1. ✅ See "Manage Events" card
2. ✅ View events in table
3. ✅ Create new event
4. ✅ Edit existing event
5. ✅ Toggle active/inactive
6. ✅ Delete event

Then everything is working perfectly! 🚀

## 📞 Need Help?

- Check `EVENTS_MANAGEMENT_COMPLETE.md` for full documentation
- Look at browser console (F12) for errors
- Verify backend is running on port 3000
- Check Network tab for API responses

Enjoy managing your events! 🎊

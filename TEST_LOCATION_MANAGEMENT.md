# Testing Location Management on Frontend

## Quick Start Guide

### Step 1: Add Sample Data to Database

Open your PostgreSQL client and run:

```bash
# Connect to database
psql -U postgres -d butterfliy

# Run the seed script
\i backend/seed-locations-simple.sql
```

Or using pgAdmin:
1. Open pgAdmin
2. Connect to your `butterfliy` database
3. Open Query Tool
4. Copy and paste the contents of `backend/seed-locations-simple.sql`
5. Execute the query

This will create:
- ✅ 3 APPROVED locations (2 Admin, 1 Tourism Dept)
- ✅ 2 PENDING locations (Travel Guides)

### Step 2: Access the Frontend

1. **Open your browser**: http://localhost:8081

2. **Login as Admin**:
   - Email: `admin@butterfliy.com` (or your admin email)
   - Password: Your admin password

3. **Navigate to Admin Dashboard**:
   - Click on your profile icon (top right)
   - You should see "Admin Dashboard" option
   - Click it

### Step 3: Test Location Management Features

#### View the Dashboard
You should see a new card:
- **"Manage Locations"** - Purple card with list icon
- Description: "View, edit, and manage all locations"

#### Click "Manage Locations"
You'll see:
- **Table view** with all locations
- **Tabs** at the top:
  - All (shows count)
  - Admin (shows count)
  - Tourism Dept (shows count)
  - Travel Agents (shows count)
- **Search bar** to filter locations
- **Add Location button** (top right)

#### Test Filtering
1. Click **"All"** tab - Should show all 6 locations
2. Click **"Admin"** tab - Should show 3 locations
3. Click **"Tourism Dept"** tab - Should show 2 locations
4. Click **"Travel Agents"** tab - Should show 1 location

#### Test Search
1. Type "Kerala" in search box
2. Should show only Munnar and Alleppey
3. Clear search to see all again

#### Test Edit Location
1. Find any location in the table
2. Click the **pencil icon** (Edit)
3. You'll be taken to Edit Location page
4. Modify any field (e.g., description)
5. Click **"Update Location"**
6. Should see success message
7. Return to Manage Locations to verify changes

#### Test Publish/Unpublish
1. Find a location with "Published" status (green badge)
2. Click the **eye-off icon** (Unpublish)
3. Status should change to "Draft" (orange badge)
4. Click the **eye icon** (Publish)
5. Status should change back to "Published" (green badge)

#### Test Delete
1. Find any location
2. Click the **trash icon** (Delete)
3. Confirm deletion in the dialog
4. Location should be removed from the list

#### Test Add Location
1. Click **"Add Location"** button
2. Fill in the form:
   - Country: India
   - State: Karnataka
   - Area: Bangalore
   - Description: Silicon Valley of India...
3. Click **"Submit"**
4. Should see success message
5. New location appears in the list

### Step 4: Verify Backend Integration

Open browser DevTools (F12) and check:
1. **Network tab** - Should see API calls to:
   - `GET /api/locations?approvalStatus=all`
   - `PATCH /api/locations/:id/status`
   - `PUT /api/locations/:id`
   - `DELETE /api/locations/:id`

2. **Console tab** - Should have no errors

### Expected Results

✅ **Dashboard Card**: "Manage Locations" visible
✅ **Table View**: Shows all locations with images
✅ **Tabs**: Filter by role (All/Admin/Tourism/Agents)
✅ **Search**: Filters locations by name/state/country
✅ **Pagination**: Shows "Page 1 of 1" (if < 10 locations)
✅ **Edit**: Opens edit form with pre-filled data
✅ **Publish/Unpublish**: Changes status with visual feedback
✅ **Delete**: Removes location after confirmation
✅ **Add**: Creates new location

### Visual Indicators

**Role Badges**:
- 🔵 Blue = Admin
- 🟢 Green = Tourism Dept
- 🟠 Orange = Travel Agent

**Status Badges**:
- 🟢 Green "Published" = APPROVED
- 🟠 Orange "Draft" = PENDING

**Action Icons**:
- ✏️ Pencil = Edit
- 👁️ Eye = Publish (when unpublished)
- 👁️‍🗨️ Eye-off = Unpublish (when published)
- 🗑️ Trash = Delete

### Troubleshooting

**Issue**: "Manage Locations" card not showing
- **Solution**: Make sure you're logged in as SITE_ADMIN role

**Issue**: No locations showing
- **Solution**: Run the seed script to add sample data

**Issue**: Edit button not working
- **Solution**: Check browser console for errors, ensure backend is running

**Issue**: Status not updating
- **Solution**: Check Network tab for API errors, verify authentication

**Issue**: 401 Unauthorized errors
- **Solution**: Log out and log back in to refresh token

### API Endpoints Being Used

```
GET    /api/locations?approvalStatus=all  - Get all locations
GET    /api/locations/:id                 - Get single location
POST   /api/locations                     - Create location
PUT    /api/locations/:id                 - Update location
PATCH  /api/locations/:id/status          - Update status
DELETE /api/locations/:id                 - Delete location
```

### Next Steps

After testing, you can:
1. Add more sample locations
2. Test with different user roles
3. Test image uploads (when implemented)
4. Test bulk operations (when implemented)
5. Export data (when implemented)

## Success Criteria

✅ All CRUD operations work
✅ Role-based filtering works
✅ Search functionality works
✅ Publish/unpublish works
✅ Visual indicators are clear
✅ No console errors
✅ Smooth user experience

Enjoy managing your locations! 🎉

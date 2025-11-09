# Events - Remaining Tasks

## ✅ Completed
1. Event detail page with image gallery
2. Transportation information display
3. Location details
4. Hosted by information

## ⏳ Still To Do

### 1. Fix Responsive Layout on Events Page
**Issue:** Event cards extending beyond page width
**Solution:** The FlatList already has numColumns logic, but need to ensure proper spacing

### 2. Add Image Upload to Create/Edit Forms
**Current:** Forms only have text fields
**Need:** 
- Image picker/uploader
- Multiple image support
- Image preview
- Remove image functionality

### 3. Add View Button to Manage Events Page
**Current:** Only Edit, Toggle, Delete buttons
**Need:** Add "View" button that opens event detail page

### 4. Link Events Page to Detail Page
**Current:** Alert dialog on click
**Need:** Navigate to event-detail page with event ID

## Quick Fixes Needed

### Fix 1: Events Page - Navigate to Detail
File: `frontend/app/(tabs)/events.tsx`
Change `showEventDetails` function to navigate instead of showing alert

### Fix 2: Manage Events - Add View Button
File: `frontend/app/(admin)/manage-events.tsx`
Add view icon button next to edit button

### Fix 3: Add Image Upload
Files: 
- `frontend/app/(admin)/create-event.tsx`
- `frontend/app/(admin)/edit-event.tsx`

Need to add:
- expo-image-picker
- Image upload UI
- Multiple image selection
- Image preview grid

## Priority Order
1. **HIGH**: Fix responsive layout (cards overflow)
2. **HIGH**: Link events to detail page
3. **MEDIUM**: Add view button to manage page
4. **MEDIUM**: Add image upload functionality

## Notes
- The events page FlatList has responsive numColumns (1-4 based on width)
- Cards should fit within viewport
- Need to test on different screen sizes
- Image upload will require expo-image-picker package

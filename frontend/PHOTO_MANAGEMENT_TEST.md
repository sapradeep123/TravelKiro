# Photo Management Testing Guide

This guide explains how to test the photo management functionality in the app.

## Overview

The photo management feature allows users to:
- Click on photos to open a management modal
- Add photos to multiple albums
- View and add comments on photos
- Manage photo settings

## Test Methods

### Method 1: Using the Test Button (Easiest)

1. **Start the app** in development mode
2. **Navigate to the Community tab**
3. **Look for the red test button** (floating button with a test tube icon) on the right side
4. **Click the test button** to open the photo management modal with sample data
5. **Test the features:**
   - Switch between "Add to Albums" and "Comments" tabs
   - Select/deselect albums
   - Add comments
   - Close and reopen the modal

### Method 2: Using the Dedicated Test Screen

1. **Navigate to** `/photo-test` route (if configured in your navigation)
2. **Choose test mode:**
   - **Online Mode**: Uses Unsplash images (requires internet)
   - **Offline Mode**: Uses placeholder SVG images (works offline)
3. **Click any photo** to open the management modal
4. **Test all features** as described above

### Method 3: Using Real Photos in Community Tab

1. **Create some posts** with photos in the Community tab
2. **Click on any photo** in:
   - The Photos sidebar section
   - Post images in the feed
3. **Test the modal** with real data

## Test Data

The app includes pre-configured test data:

### Test Photos (6 photos)
- Beautiful sunset at the beach
- Mountain adventure
- City lights at night
- Tropical paradise
- Desert landscape
- Forest trail

### Test Albums (4 albums)
- Summer Vacation 2024 (Public, 12 photos)
- Mountain Adventures (Friends Only, 8 photos)
- City Exploration (Public, 15 photos)
- Private Memories (Private, 5 photos)

### Test Comments (3 comments)
- Sample comments from different users
- Timestamps showing relative time

## Features to Test

### 1. Photo Modal Opening
- ✅ Modal opens when clicking photos
- ✅ Photo displays correctly
- ✅ Modal can be closed

### 2. Add to Albums Tab
- ✅ Albums list displays correctly
- ✅ Album thumbnails show (or placeholder)
- ✅ Privacy icons display correctly
- ✅ Photo count shows for each album
- ✅ Can select/deselect albums
- ✅ Selected albums show checkmark
- ✅ "Add to Albums" button enables/disables correctly
- ✅ Success message shows after adding

### 3. Comments Tab
- ✅ Comments list displays correctly
- ✅ User avatars show
- ✅ Comment text displays
- ✅ Timestamps show correctly
- ✅ Can add new comments
- ✅ Comment input works
- ✅ Send button enables/disables correctly
- ✅ Empty state shows when no comments

### 4. UI/UX
- ✅ Smooth animations
- ✅ Loading states work
- ✅ Error handling works
- ✅ Keyboard behavior is correct
- ✅ Responsive on different screen sizes

## Test Scenarios

### Scenario 1: Add Photo to Single Album
1. Open photo modal
2. Go to "Add to Albums" tab
3. Select one album
4. Click "Add to Albums"
5. Verify success message

### Scenario 2: Add Photo to Multiple Albums
1. Open photo modal
2. Go to "Add to Albums" tab
3. Select multiple albums
4. Click "Add to Albums"
5. Verify success message shows correct count

### Scenario 3: Add Comment
1. Open photo modal
2. Go to "Comments" tab
3. Type a comment
4. Click send button
5. Verify comment appears in list

### Scenario 4: Switch Between Tabs
1. Open photo modal
2. Switch between tabs multiple times
3. Verify content loads correctly
4. Verify no data loss

## Troubleshooting

### Images Not Loading
- Check internet connection (for online mode)
- Try offline mode with placeholders
- Check console for error messages

### Modal Not Opening
- Check if test button is visible (only in dev mode)
- Verify photos exist in the sidebar
- Check console for errors

### Albums Not Showing
- Verify user is logged in
- Check if albums exist for the user
- Test data should show automatically if no real albums

### Comments Not Loading
- Check if postId is provided
- Test data should show automatically if no postId
- Check console for API errors

## Development Notes

### Test Button
- Only visible in development mode (`__DEV__`)
- Red floating button with test tube icon
- Located below the main FAB button
- Opens modal with first test photo

### Test Data Location
- Test data: `frontend/src/utils/testPhotoData.ts`
- Test component: `frontend/components/community/PhotoManagementTest.tsx`
- Test screen: `frontend/app/(tabs)/photo-test.tsx`

### Mock API
The test data includes a mock API for simulating backend responses:
```typescript
import { mockPhotoAPI } from '../utils/testPhotoData';

// Use in tests
mockPhotoAPI.getPhotos();
mockPhotoAPI.getAlbums();
mockPhotoAPI.addToAlbum(photoId, albumId);
```

## Next Steps

After testing, you can:
1. Remove the test button by setting `__DEV__` check
2. Remove test data imports if not needed
3. Integrate with real backend APIs
4. Add more test scenarios as needed

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure backend APIs are running
4. Check network requests in dev tools

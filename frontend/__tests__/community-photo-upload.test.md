# Community Photo Upload - Integration Test Plan

This document outlines comprehensive integration tests for the community photo upload feature. These tests should be executed to verify the complete functionality of the photo upload workflow.

## Test Environment Setup

### Prerequisites
- Backend server running on http://localhost:3000
- Frontend app running (Expo)
- Test user account with authentication
- Test images available (various formats and sizes)
- Location data seeded in database

### Test Data Requirements
- Valid images: JPEG, PNG, WebP (under 10MB)
- Invalid images: PDF, GIF, oversized files (over 10MB)
- Test locations in database
- Test user with valid JWT token

---

## Test Suite 1: Image Selection and Validation

### Test 1.1: Camera Access Permission
**Objective:** Verify camera permission handling

**Steps:**
1. Open community screen
2. Tap the floating action button (FAB)
3. Tap "Take Photo" button
4. Observe permission request

**Expected Results:**
- Permission dialog appears
- If granted: Camera opens
- If denied: Alert shows "Camera Permission Required" message
- User can retry after granting permission in settings

**Status:** [ ] Pass [ ] Fail

---

### Test 1.2: Gallery Access Permission
**Objective:** Verify gallery permission handling

**Steps:**
1. Open create post modal
2. Tap "Choose from Gallery" button
3. Observe permission request

**Expected Results:**
- Permission dialog appears
- If granted: Gallery opens with multi-select
- If denied: Alert shows "Photo Library Permission Required" message
- User can retry after granting permission in settings

**Status:** [ ] Pass [ ] Fail

---

### Test 1.3: Single Image Selection from Camera
**Objective:** Verify single image capture from camera

**Steps:**
1. Grant camera permission
2. Tap "Take Photo"
3. Capture a photo
4. Confirm the photo

**Expected Results:**
- Camera opens successfully
- Photo is captured
- Image appears in preview grid
- Image counter shows "1/10 images selected"
- Image has remove button overlay

**Status:** [ ] Pass [ ] Fail

---

### Test 1.4: Multiple Image Selection from Gallery
**Objective:** Verify multi-select from gallery

**Steps:**
1. Grant gallery permission
2. Tap "Choose from Gallery"
3. Select 5 images
4. Confirm selection

**Expected Results:**
- Gallery opens with multi-select enabled
- All 5 images appear in preview grid
- Image counter shows "5/10 images selected"
- Images display in selection order
- Each image has remove button

**Status:** [ ] Pass [ ] Fail

---

### Test 1.5: Maximum Image Limit (10 images)
**Objective:** Verify 10 image limit enforcement

**Steps:**
1. Select 10 images from gallery
2. Attempt to add more images

**Expected Results:**
- First 10 images are added successfully
- Image counter shows "10/10 images selected"
- Both "Take Photo" and "Choose from Gallery" buttons are disabled
- Alert shows "Maximum Images Reached" if attempting to add more

**Status:** [ ] Pass [ ] Fail

---

### Test 1.6: Invalid File Type Validation
**Objective:** Verify file type validation

**Steps:**
1. Attempt to select a PDF or GIF file (if possible)
2. Observe validation

**Expected Results:**
- Alert shows "Invalid file type. Only JPEG, PNG, and WebP are allowed."
- File is not added to selection
- User can continue selecting valid files

**Status:** [ ] Pass [ ] Fail

---

### Test 1.7: File Size Validation (10MB limit)
**Objective:** Verify file size validation

**Steps:**
1. Attempt to select an image larger than 10MB
2. Observe validation

**Expected Results:**
- Alert shows file name and size: "File 'large-image.jpg' is 12.5MB. Maximum size is 10MB."
- File is not added to selection
- User can continue selecting valid files

**Status:** [ ] Pass [ ] Fail

---

### Test 1.8: Remove Individual Image
**Objective:** Verify image removal functionality

**Steps:**
1. Select 3 images
2. Tap the X button on the second image
3. Observe the result

**Expected Results:**
- Second image is removed
- Remaining images stay in place
- Image counter updates to "2/10 images selected"
- Image numbers update (1, 2 instead of 1, 2, 3)
- Add buttons become enabled if previously at limit

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 2: Image Reordering

### Test 2.1: Drag and Drop Reordering
**Objective:** Verify image reordering functionality

**Steps:**
1. Select 4 images
2. Long press on the first image
3. Drag it to the third position
4. Release

**Expected Results:**
- Image can be dragged
- Visual feedback shows dragging state (opacity change, scale)
- Drag handle icon is visible
- Images reorder in real-time
- Image numbers update to reflect new order
- Order is maintained through preview and submission

**Status:** [ ] Pass [ ] Fail

---

### Test 2.2: Order Persistence
**Objective:** Verify order is maintained through workflow

**Steps:**
1. Select 3 images in order: A, B, C
2. Reorder to: C, A, B
3. Navigate to preview
4. Check image order in carousel

**Expected Results:**
- Preview shows images in order: C, A, B
- Carousel pagination reflects correct order
- Order is maintained when post is created

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 3: Location Picker

### Test 3.1: Location Search with Debouncing
**Objective:** Verify location search with debouncing

**Steps:**
1. Tap location input field
2. Type "Ker" quickly
3. Wait 300ms
4. Observe search behavior

**Expected Results:**
- Search doesn't trigger until typing stops for 300ms
- Loading indicator appears during search
- Results appear after search completes
- Results are limited to 20 locations
- Results formatted as "Area, State, Country"

**Status:** [ ] Pass [ ] Fail

---

### Test 3.2: Location Selection
**Objective:** Verify location selection

**Steps:**
1. Search for "Kerala"
2. Tap on "Kochi, Kerala, India" from results
3. Observe the result

**Expected Results:**
- Search dropdown closes
- Selected location appears as a chip/tag
- Location chip shows "Kochi, Kerala, India"
- Location chip has remove (X) button
- Search input is cleared

**Status:** [ ] Pass [ ] Fail

---

### Test 3.3: Location Removal
**Objective:** Verify location removal

**Steps:**
1. Select a location
2. Tap the X button on the location chip
3. Observe the result

**Expected Results:**
- Location chip is removed
- Search input reappears
- User can search and select a different location

**Status:** [ ] Pass [ ] Fail

---

### Test 3.4: Empty Search Results
**Objective:** Verify empty state handling

**Steps:**
1. Search for "XYZ123NonExistent"
2. Observe the result

**Expected Results:**
- Loading indicator appears briefly
- Empty state shows with icon
- Message displays "No locations found"
- Subtext says "Try a different search term"

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 4: Caption Input

### Test 4.1: Caption Entry
**Objective:** Verify caption input functionality

**Steps:**
1. Tap caption input field
2. Type a multi-line caption (100 characters)
3. Observe the display

**Expected Results:**
- Text input accepts multi-line text
- Character counter shows "1900/2000 characters remaining"
- Character count updates in real-time
- Emoji keyboard is accessible

**Status:** [ ] Pass [ ] Fail

---

### Test 4.2: Character Limit Warning
**Objective:** Verify approaching limit warning

**Steps:**
1. Type 1950 characters in caption
2. Observe the warning

**Expected Results:**
- Character counter turns orange/warning color
- Counter shows "50 characters remaining"
- Helper text shows "You're approaching the character limit"
- Input still accepts characters

**Status:** [ ] Pass [ ] Fail

---

### Test 4.3: Character Limit Enforcement
**Objective:** Verify 2000 character limit

**Steps:**
1. Type or paste 2000+ characters
2. Observe the behavior

**Expected Results:**
- Input stops accepting characters at 2000
- Character counter turns red
- Counter shows "0 characters remaining"
- Helper text shows "Maximum character limit reached"

**Status:** [ ] Pass [ ] Fail

---

### Test 4.4: Optional Caption
**Objective:** Verify caption is optional

**Steps:**
1. Select images
2. Leave caption empty
3. Proceed to preview

**Expected Results:**
- Preview shows post without caption
- Post can be submitted without caption
- No validation errors

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 5: Preview and Submission

### Test 5.1: Preview Navigation
**Objective:** Verify preview screen navigation

**Steps:**
1. Select 3 images, add location and caption
2. Tap "Preview" button
3. Observe the preview

**Expected Results:**
- Preview screen opens
- Header shows "Preview Post"
- All content is displayed as it will appear in feed
- Edit button is visible
- Post button is visible

**Status:** [ ] Pass [ ] Fail

---

### Test 5.2: Preview Content Display
**Objective:** Verify all content displays correctly in preview

**Steps:**
1. Create post with 3 images, location, and caption
2. View preview

**Expected Results:**
- User avatar and name display
- Timestamp shows "Just now"
- Caption displays with correct formatting
- All 3 images display in carousel
- Image counter shows "1/3"
- Pagination dots show (3 dots)
- Location tag displays below images
- Post actions (React, Comment, Share) are visible

**Status:** [ ] Pass [ ] Fail

---

### Test 5.3: Preview Image Carousel
**Objective:** Verify image carousel in preview

**Steps:**
1. Preview post with 5 images
2. Swipe through images
3. Observe pagination

**Expected Results:**
- Images swipe horizontally
- Pagination is smooth
- Image counter updates (1/5, 2/5, etc.)
- Pagination dots update to show current image
- Active dot is highlighted

**Status:** [ ] Pass [ ] Fail

---

### Test 5.4: Edit from Preview
**Objective:** Verify edit functionality from preview

**Steps:**
1. View preview
2. Tap "Edit" button
3. Observe the result

**Expected Results:**
- Returns to edit screen
- All content is preserved (images, caption, location)
- User can make changes
- Can return to preview

**Status:** [ ] Pass [ ] Fail

---

### Test 5.5: Successful Post Submission
**Objective:** Verify complete upload and post creation flow

**Steps:**
1. Create post with 2 images, location, and caption
2. Tap "Post" button
3. Wait for upload to complete

**Expected Results:**
- Progress bar appears showing upload progress
- Progress updates from 0% to 100%
- Post button is disabled during upload
- Success alert shows "Your post has been published!"
- Modal closes automatically
- Community feed refreshes
- New post appears at top of feed
- Success snackbar shows "Post created successfully!"

**Status:** [ ] Pass [ ] Fail

---

### Test 5.6: Upload Progress Indicator
**Objective:** Verify upload progress display

**Steps:**
1. Create post with 5 large images
2. Submit post
3. Observe progress

**Expected Results:**
- Progress bar appears
- Progress text shows percentage (e.g., "Uploading your post... 45%")
- Progress updates smoothly
- Post button shows "Posting..." text
- Post button is disabled

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 6: Error Handling

### Test 6.1: Network Error During Upload
**Objective:** Verify network error handling

**Steps:**
1. Create post with images
2. Disable network connection
3. Attempt to submit
4. Observe error handling

**Expected Results:**
- Upload fails gracefully
- Error alert shows with descriptive message
- Post draft is preserved (images, caption, location remain)
- User can retry after reconnecting
- Upload progress resets

**Status:** [ ] Pass [ ] Fail

---

### Test 6.2: Server Error Response
**Objective:** Verify server error handling

**Steps:**
1. Simulate server error (500 response)
2. Attempt to submit post
3. Observe error handling

**Expected Results:**
- Error alert shows user-friendly message
- Post draft is preserved
- User can retry
- No data loss

**Status:** [ ] Pass [ ] Fail

---

### Test 6.3: Discard Confirmation
**Objective:** Verify discard confirmation dialog

**Steps:**
1. Select images and add caption
2. Tap back/close button
3. Observe confirmation

**Expected Results:**
- Alert shows "Discard Post?"
- Message: "You have unsaved changes. Are you sure you want to discard this post?"
- Two options: "Cancel" and "Discard"
- Cancel returns to edit screen
- Discard closes modal and clears all data

**Status:** [ ] Pass [ ] Fail

---

### Test 6.4: No Images Validation
**Objective:** Verify validation when no images selected

**Steps:**
1. Open create post modal
2. Add only caption (no images)
3. Tap "Preview" button

**Expected Results:**
- Alert shows "No Images"
- Message: "Please select at least one image to preview."
- User remains on edit screen
- Can add images and retry

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 7: Feed Display Integration

### Test 7.1: Single Image Post Display
**Objective:** Verify single image post displays correctly in feed

**Steps:**
1. Create and publish post with 1 image
2. View post in community feed

**Expected Results:**
- Post displays in feed
- Single image shows at full width
- No image counter badge
- No pagination dots
- Caption displays correctly
- Location tag displays if present

**Status:** [ ] Pass [ ] Fail

---

### Test 7.2: Multiple Image Post Display
**Objective:** Verify multi-image post displays correctly in feed

**Steps:**
1. Create and publish post with 4 images
2. View post in community feed
3. Swipe through images

**Expected Results:**
- First image displays initially
- Image counter badge shows "1/4"
- Pagination dots show (4 dots, first active)
- Swipe works smoothly
- Counter and dots update on swipe
- All images are accessible

**Status:** [ ] Pass [ ] Fail

---

### Test 7.3: Image Tap Interaction
**Objective:** Verify image tap behavior in feed

**Steps:**
1. View post with images in feed
2. Tap on an image

**Expected Results:**
- Console logs image URL (placeholder for future full-screen gallery)
- No errors occur
- Feed remains functional

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 8: Performance and Optimization

### Test 8.1: Large Image Upload Performance
**Objective:** Verify performance with large images

**Steps:**
1. Select 10 images (each ~8MB)
2. Submit post
3. Monitor performance

**Expected Results:**
- Images upload successfully
- Progress indicator updates smoothly
- No UI freezing or lag
- Upload completes within reasonable time
- Images are optimized on backend (resized to 1200x1200)

**Status:** [ ] Pass [ ] Fail

---

### Test 8.2: Location Search Debouncing
**Objective:** Verify search debouncing prevents excessive API calls

**Steps:**
1. Type "Kerala" character by character quickly
2. Monitor network requests

**Expected Results:**
- Only one API call is made after typing stops
- No API call for each character
- 300ms delay is respected
- Previous requests are cancelled if new input arrives

**Status:** [ ] Pass [ ] Fail

---

### Test 8.3: Component Re-render Optimization
**Objective:** Verify React.memo prevents unnecessary re-renders

**Steps:**
1. Open create post modal
2. Type in caption field
3. Observe other components

**Expected Results:**
- ImagePickerSection doesn't re-render when caption changes
- LocationPickerSection doesn't re-render when caption changes
- Only CaptionInputSection updates
- No performance degradation

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 9: Edge Cases

### Test 9.1: Rapid Modal Open/Close
**Objective:** Verify stability with rapid interactions

**Steps:**
1. Rapidly open and close create post modal 10 times
2. Observe behavior

**Expected Results:**
- No crashes or errors
- Modal opens and closes smoothly
- No memory leaks
- State resets properly each time

**Status:** [ ] Pass [ ] Fail

---

### Test 9.2: Orientation Change (Mobile)
**Objective:** Verify behavior on orientation change

**Steps:**
1. Open create post modal with content
2. Rotate device
3. Observe layout

**Expected Results:**
- Content is preserved
- Layout adjusts appropriately
- No data loss
- Images remain visible
- All functionality works

**Status:** [ ] Pass [ ] Fail

---

### Test 9.3: Background/Foreground Transition
**Objective:** Verify state preservation when app backgrounds

**Steps:**
1. Create post with images and caption
2. Background the app
3. Return to app after 30 seconds

**Expected Results:**
- Modal state is preserved
- Images remain selected
- Caption text is preserved
- Location selection is preserved
- User can continue editing

**Status:** [ ] Pass [ ] Fail

---

### Test 9.4: Concurrent Post Creation
**Objective:** Verify handling of multiple users posting simultaneously

**Steps:**
1. Create post from User A
2. Create post from User B at same time
3. Both submit

**Expected Results:**
- Both posts upload successfully
- No conflicts or errors
- Both posts appear in feed
- Correct user attribution for each post

**Status:** [ ] Pass [ ] Fail

---

## Test Execution Summary

**Total Tests:** 44
**Passed:** ___
**Failed:** ___
**Blocked:** ___
**Not Executed:** ___

**Test Date:** ___________
**Tester Name:** ___________
**Environment:** ___________
**Build Version:** ___________

---

## Known Issues

Document any issues found during testing:

1. Issue: ___________
   - Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   - Steps to Reproduce: ___________
   - Expected: ___________
   - Actual: ___________

---

## Notes

Additional observations or comments:

___________________________________________
___________________________________________
___________________________________________

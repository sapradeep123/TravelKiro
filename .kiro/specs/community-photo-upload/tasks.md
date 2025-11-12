# Implementation Plan

- [x] 1. Set up backend community image upload infrastructure



  - Create `backend/uploads/community/` directory structure
  - Add community-specific multer configuration in `backend/src/middleware/upload.ts` with 10MB file size limit and 10 files maximum
  - Implement `uploadCommunityImages` method in `backend/src/controllers/uploadController.ts` with image optimization using sharp
  - Create upload route `POST /api/community/upload-images` in `backend/src/routes/community.ts` with authentication and multer middleware


  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Implement image picker and selection component


  - [x] 2.1 Install expo-image-picker dependency and configure permissions

    - Add `expo-image-picker` to frontend package.json
    - Configure camera and photo permissions in app.json
    - Request permissions at runtime in the component
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Create ImagePickerSection component with camera and gallery access


    - Create `frontend/components/community/ImagePickerSection.tsx` component
    - Implement camera button that opens device camera
    - Implement gallery button that opens photo gallery with multi-select
    - Add client-side validation for file types (JPEG, PNG, WebP) and size (10MB limit)
    - Display error alerts for invalid files
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 2.4, 2.5_

  - [x] 2.3 Implement image preview grid with remove functionality

    - Display selected images in a grid layout with thumbnails
    - Show image count indicator (e.g., "3/10 images")
    - Add remove button (X) overlay on each image thumbnail
    - Implement remove functionality to update images array
    - Disable add buttons when 10 images are selected
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.4 Add drag-and-drop image reordering


    - Install `react-native-draggable-flatlist` dependency
    - Implement drag-and-drop reordering in image grid
    - Update image order state on drag completion
    - Maintain order through submission
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3. Implement location picker component



  - [x] 3.1 Create LocationPickerSection component with search functionality


    - Create `frontend/components/community/LocationPickerSection.tsx` component
    - Implement search input with debouncing (300ms)
    - Call existing `/api/locations/search` endpoint with query parameter
    - Display searchable dropdown with location results formatted as "Area, State, Country"
    - Handle empty results state
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Implement location selection and display

    - Handle location selection from dropdown
    - Display selected location as a chip/tag with location name
    - Add remove button (X) to clear selected location
    - Update parent component state on selection/removal
    - _Requirements: 3.4, 3.5_

- [x] 4. Implement caption input component



  - Create `frontend/components/community/CaptionInputSection.tsx` component
  - Implement multi-line TextInput with 2000 character limit
  - Add character counter display showing remaining characters
  - Show warning styling when approaching limit (e.g., last 100 characters)
  - Support emoji keyboard
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Create photo post preview screen



  - [x] 5.1 Create PhotoPostPreview component


    - Create `frontend/components/community/PhotoPostPreview.tsx` component
    - Display images in a horizontal scrollable carousel
    - Show caption text as it will appear in feed
    - Display location tag if present
    - Add "Edit" button to return to edit mode
    - Add "Post" button to submit
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.2 Add upload progress indicator

    - Implement progress bar or spinner during upload
    - Disable "Post" button while uploading
    - Show upload status message
    - _Requirements: 6.1, 6.2_

- [x] 6. Create main photo upload modal and workflow



  - [x] 6.1 Create CreatePhotoPostModal component


    - Create `frontend/components/community/CreatePhotoPostModal.tsx` component
    - Implement modal with full-screen or large modal layout
    - Manage state for images, caption, location, preview mode, and upload status
    - Integrate ImagePickerSection, LocationPickerSection, and CaptionInputSection components
    - Add "Preview" button to switch to preview mode
    - Handle modal close with confirmation if content exists
    - _Requirements: 1.1, 5.4_

  - [x] 6.2 Implement image upload logic

    - Create FormData with selected images
    - Call `POST /api/community/upload-images` endpoint
    - Handle upload response with image URLs
    - Implement error handling with user-friendly messages
    - Preserve draft data on upload failure
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 6.3 Implement post creation after successful upload

    - Call existing `communityService.createPost()` with uploaded image URLs
    - Pass caption, location ID, and media URLs
    - Set mediaTypes array to 'IMAGE' for all images
    - Maintain user-defined image order
    - Handle post creation errors
    - _Requirements: 6.3, 8.4, 8.5_

  - [x] 6.4 Integrate modal into community screen


    - Add "Create Post" floating action button to `frontend/app/(tabs)/community.tsx`
    - Show CreatePhotoPostModal when button is tapped
    - Refresh feed after successful post creation
    - Close modal and show success message
    - _Requirements: 6.3_

- [x] 7. Add error handling and validation



  - Implement permission error handling for camera and gallery
  - Add file type validation with descriptive error messages
  - Add file size validation with file name and size in error
  - Add image count validation (max 10)
  - Add caption length validation (max 2000)
  - Implement network error handling with retry option
  - Add loading states for all async operations
  - _Requirements: 6.4, 6.5_

- [x] 8. Optimize image display in community feed



  - Update post rendering in `frontend/app/(tabs)/community.tsx` to handle multiple images
  - Implement horizontal scrollable image carousel for posts with multiple images
  - Add image counter indicator (e.g., "1/5") on multi-image posts
  - Implement progressive image loading with placeholders
  - Add image tap to view full-screen gallery
  - _Requirements: 7.5_

- [x] 9. Add performance optimizations



  - Implement image caching for uploaded images
  - Add lazy loading for images in feed
  - Optimize image grid rendering with FlatList
  - Add debouncing to location search input
  - Implement request cancellation for location search
  - _Requirements: 7.5_

- [x] 10. Write integration tests for photo upload flow



  - Test complete flow from image selection to post creation
  - Test error scenarios (permissions, file validation, network errors)
  - Test location picker search and selection
  - Test image reordering functionality
  - Test preview and edit workflow
  - _Requirements: All_

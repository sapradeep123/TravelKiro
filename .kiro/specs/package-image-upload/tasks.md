# Implementation Plan

- [x] 1. Set up backend file upload infrastructure

  - [x] 1.1 Create uploads directory structure and configure multer middleware


    - Create `backend/uploads/packages/` directory
    - Implement multer configuration in `backend/src/middleware/upload.ts` with file type validation, size limits, and unique filename generation
    - Add static file serving for `/uploads` route in main server file
    - _Requirements: 3.2, 3.3, 5.1, 5.2_



  - [ ] 1.2 Create upload controller and route for package images
    - Implement `UploadController` in `backend/src/controllers/uploadController.ts` with `uploadPackageImages` method
    - Create upload route `POST /api/packages/upload-images` in `backend/src/routes/packages.ts` or new upload routes file
    - Add authentication middleware to upload endpoint


    - Return array of uploaded image URLs in response
    - _Requirements: 3.1, 3.3, 3.4, 3.5_


  - [x] 1.3 Add error handling and validation for upload endpoint


    - Implement file type validation error responses
    - Implement file size validation error responses
    - Add try-catch error handling for disk operations
    - _Requirements: 4.4_


- [ ] 2. Implement frontend image upload component
  - [ ] 2.1 Install expo-image-picker and create ImageUploadField component
    - Add `expo-image-picker` dependency to frontend package.json
    - Create `frontend/components/ImageUploadField.tsx` component
    - Implement file picker integration with image selection
    - Add client-side validation for file types (JPEG, PNG, WebP) and size (5MB limit)


    - _Requirements: 1.2, 1.3, 1.4_




  - [ ] 2.2 Implement image preview grid with remove functionality
    - Create thumbnail preview grid layout in ImageUploadField component
    - Display file name and size for each selected image
    - Add remove button overlay on hover/press
    - Implement remove functionality to update images array


    - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.5_

  - [ ] 2.3 Add drag-and-drop reordering for image previews
    - Implement reordering capability for multiple images in preview grid
    - _Requirements: 2.4_



- [ ] 3. Integrate image upload into package creation form
  - [ ] 3.1 Replace URL input with ImageUploadField component in create-package page
    - Import and use ImageUploadField component in `frontend/app/(admin)/create-package.tsx`
    - Remove existing images text input field

    - Add state management for selected images array


    - Update form layout to accommodate image upload component
    - _Requirements: 1.1_



  - [x] 3.2 Implement image upload on form submission


    - Modify handleSubmit to upload images to backend before creating package
    - Call upload endpoint with FormData containing image files
    - Receive and store returned image URLs


    - Pass image URLs to package creation endpoint
    - _Requirements: 3.1, 3.4, 3.5_

  - [ ] 3.3 Add upload progress indicators and error handling
    - Display loading indicator during image upload
    - Disable submit button while uploading
    - Show success message on successful upload
    - Display error messages with details on upload failure
    - Re-enable submit button on error to allow retry
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Update package edit functionality to support image uploads
  - [ ] 4.1 Add ImageUploadField to edit-package page (if exists)
    - Check if edit-package page exists
    - If exists, integrate ImageUploadField component
    - Handle existing images display and new image uploads
    - _Requirements: 1.1, 2.1_

- [ ] 5. Add image optimization and CDN preparation
  - [ ] 5.1 Implement image compression on upload
    - Add image compression library to backend
    - Compress images before saving to disk
    - _Requirements: 5.3_

  - [ ] 5.2 Add caching headers for served images
    - Configure Express static middleware with cache headers
    - _Requirements: 5.3_

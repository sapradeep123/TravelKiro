# Photo Albums Feature - Implementation Tasks

- [x] 1. Add Album database tables


  - Add Album and AlbumPhoto models to Prisma schema
  - Run migration to create tables
  - _Requirements: 1.1, 2.1_

- [x] 2. Create backend album API



  - Create album service with CRUD methods
  - Create album controller with routes (create, list, get, update, delete)
  - Create album-photo routes (add photo, remove photo)
  - _Requirements: 1.1-1.7, 2.1-2.7_

- [x] 3. Create frontend album service





  - Add albumService.ts with API calls for CRUD operations
  - Add types for Album and AlbumPhoto
  - _Requirements: 1.1-1.7, 2.1-2.7_

- [x] 4. Build Albums UI in sidebar





  - Update community sidebar to show user's albums
  - Add create album button
  - Display album grid with thumbnails
  - _Requirements: 1.3, 6.1_

- [x] 5. Build album detail view





  - Create album detail screen showing photos in grid
  - Add edit/delete album buttons
  - Add "Add Photos" button to select from posts
  - Add remove photo functionality
  - _Requirements: 1.4, 1.6, 1.7, 2.1-2.6, 6.2_

- [x] 6. Add photo viewer with comments





  - Create full-screen photo viewer modal
  - Reuse existing comment system from posts
  - Add comment controls (enable/disable/hide) for album owner
  - Add report button for comments
  - _Requirements: 3.1-3.7, 4.1-4.10, 6.3-6.5, 7.1-7.11_

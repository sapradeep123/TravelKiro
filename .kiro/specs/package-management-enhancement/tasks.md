# Implementation Plan

- [x] 1. Update database schema and create migrations


  - [x] 1.1 Add new fields to Package model in Prisma schema


    - Add `isActive Boolean @default(true)` field
    - Add `isArchived Boolean @default(false)` field
    - Add `archivedAt DateTime?` field
    - Add `archivedBy String?` field
    - _Requirements: 5.1, 5.2, 6.2, 6.3_



  - [ ] 1.2 Update PackageCallbackRequest model with status tracking
    - Change `isContacted Boolean` to `status CallbackStatus @default(PENDING)`
    - Add `notes String?` field for admin notes
    - Add `rescheduleDate DateTime?` field
    - Add `contactedAt DateTime?` field
    - Add `contactedBy String?` field


    - Create `CallbackStatus` enum with values: PENDING, CONTACTED, RESCHEDULED, NOT_INTERESTED, BOOKING_COMPLETED
    - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 1.3 Create CallbackStatusHistory model for audit trail


    - Create new model with fields: id, callbackRequestId, status, notes, changedBy, createdAt


    - Add relation to PackageCallbackRequest


    - Add relation to User
    - _Requirements: 2.4, 3.4_

  - [ ] 1.4 Run Prisma migration to update database
    - Generate Prisma client
    - Create and apply migration


    - _Requirements: All database-related requirements_

- [ ] 2. Implement backend API endpoints for package management
  - [ ] 2.1 Create package update endpoint
    - Implement `PATCH /api/packages/:id` in packageController



    - Add validation for all updatable fields
    - Handle image updates (add/remove)
    - Handle itinerary updates
    - Add authorization check (admin or package owner)


    - _Requirements: 4.3, 4.4_

  - [x] 2.2 Create active/inactive toggle endpoint


    - Implement `PATCH /api/packages/:id/active-status` in packageController
    - Update `isActive` field
    - Add authorization check (admin only)


    - Return updated package
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 2.3 Create package archive endpoint
    - Implement `PATCH /api/packages/:id/archive` in packageController
    - Set `isArchived = true`, `archivedAt = now()`, `archivedBy = userId`
    - Add authorization check (admin only)


    - Return success message


    - _Requirements: 6.1, 6.2, 6.3, 6.4_



  - [ ] 2.4 Update getAllPackages to exclude archived packages
    - Modify packageService.getAllPackages to filter out archived packages by default
    - Add optional `includeArchived` parameter
    - _Requirements: 6.3_

  - [x] 2.5 Update getAllPackages to include callback counts


    - Add Prisma aggregation to count total, pending, and urgent callbacks
    - Include counts in response


    - _Requirements: 7.1, 7.2, 7.5_



  - [ ] 2.6 Create callback status update endpoint
    - Implement `PATCH /api/packages/callback-requests/:requestId/status` in packageController
    - Update callback request status
    - Add notes if provided
    - Set rescheduleDate if status is RESCHEDULED
    - Set contactedAt and contactedBy if status is CONTACTED
    - Create status history record
    - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3_


  - [ ] 2.7 Update getPackageCallbackRequests to include status history
    - Modify to include related status history records
    - Add status filter parameter
    - _Requirements: 2.2, 2.5, 3.4_

- [x] 3. Create Package Detail Modal component


  - [ ] 3.1 Create PackageDetailModal component
    - Create `frontend/components/PackageDetailModal.tsx`
    - Implement modal with package details display
    - Add image gallery with navigation
    - Display complete itinerary
    - Show location and host information
    - Add close button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 3.2 Integrate PackageDetailModal into manage packages page
    - Import and add modal to packages.tsx
    - Update "View" button to open modal with package ID
    - Pass package data to modal
    - _Requirements: 1.1_

- [ ] 4. Create Callback Management Modal component
  - [ ] 4.1 Create CallbackManagementModal component
    - Create `frontend/components/CallbackManagementModal.tsx`
    - Implement modal with callback requests list
    - Add status filter dropdown
    - Display callback request cards with all details
    - Add status update dropdown for each request
    - Add notes textarea
    - Add reschedule date picker
    - Display status history timeline
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Implement callback status update functionality
    - Create API call function in packageService
    - Handle status change with confirmation
    - Show reschedule date picker when status is RESCHEDULED
    - Update UI after successful status change
    - Show error messages on failure
    - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3_




  - [ ] 4.3 Integrate CallbackManagementModal into manage packages page
    - Import and add modal to packages.tsx
    - Update "Call" button to open modal with package ID
    - Add callback count badge to "Call" button
    - Highlight button when pending callbacks exist
    - _Requirements: 2.1, 7.1, 7.2_


- [ ] 5. Create Package Edit page
  - [x] 5.1 Create edit-package page component

    - Create `frontend/app/(admin)/edit-package.tsx`


    - Copy structure from create-package.tsx
    - Add package ID parameter from route
    - Fetch existing package data on load
    - Pre-populate all form fields
    - _Requirements: 4.1, 4.2_


  - [ ] 5.2 Implement package data loading and form population
    - Fetch package details using package ID
    - Set form state with existing data


    - Load existing images into ImageUploadField


    - Load existing itinerary days
    - Show loading indicator
    - _Requirements: 4.2_


  - [ ] 5.3 Implement package update submission
    - Create update API call function
    - Handle image uploads (new images)
    - Handle image removals
    - Handle itinerary updates
    - Show success message and navigate back
    - Show error messages on failure
    - _Requirements: 4.3, 4.4_

  - [ ] 5.4 Update manage packages page to navigate to edit page
    - Update "Edit" button click handler
    - Navigate to edit-package page with package ID parameter
    - _Requirements: 4.1_

- [ ] 6. Implement active/inactive toggle functionality
  - [ ] 6.1 Update manage packages page toggle button
    - Update handleToggleStatus to use isActive field
    - Change API call to new active-status endpoint
    - Update visual indicator (checkmark for active, pause for inactive)
    - Show confirmation dialog before toggling
    - Update package list after successful toggle
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 6.2 Update frontend package queries to respect isActive status
    - Modify package listing queries to filter by isActive
    - Ensure inactive packages don't show on public pages
    - _Requirements: 5.2, 5.3_

- [ ] 7. Implement package archive functionality
  - [ ] 7.1 Update delete button to archive instead of delete
    - Update handleDelete to call archive endpoint
    - Update confirmation dialog text
    - Remove package from list after archiving
    - Show success message
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 7.2 Add archived packages view (optional)
    - Add "View Archived" tab or button
    - Create archived packages list view
    - Add restore functionality (future enhancement)
    - _Requirements: 6.5_

- [ ] 8. Update manage packages list with callback counts
  - [ ] 8.1 Display callback count badges
    - Show pending callback count on "Call" button
    - Use different colors for urgency levels
    - Update badge when callbacks are updated
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 8.2 Add callback count sorting
    - Add sort option for callback count
    - Implement sorting logic
    - _Requirements: 7.4_

- [ ] 9. Testing and validation
  - [ ] 9.1 Test package detail modal
    - Test opening modal with different packages
    - Test image gallery navigation
    - Test close functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 9.2 Test callback management
    - Test loading callback requests
    - Test status filtering
    - Test status updates
    - Test reschedule functionality
    - Test notes addition
    - Test status history display
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 9.3 Test package editing
    - Test loading existing package data
    - Test editing all fields
    - Test image management
    - Test itinerary editing
    - Test save functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 9.4 Test active/inactive toggle
    - Test toggling from active to inactive
    - Test toggling from inactive to active
    - Test frontend visibility changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 9.5 Test package archiving
    - Test archive confirmation
    - Test archiving packages
    - Test archived packages exclusion
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

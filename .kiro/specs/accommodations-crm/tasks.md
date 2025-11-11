# Accommodations Module with CRM - Implementation Tasks

## Phase 1: Database & Backend Foundation (Priority: HIGH)

### Task 1.1: Update Prisma Schema
- [ ] Add Accommodation model with all fields
- [ ] Add AccommodationCallRequest model
- [ ] Add CallInteraction model
- [ ] Add CallStatusHistory model
- [ ] Add AccommodationReview model
- [ ] Add all enums (AccommodationType, DietType, etc.)
- [ ] Add indexes for performance
- [ ] Create migration file
- [ ] Run migration

**Files:**
- `backend/prisma/schema.prisma`

### Task 1.2: Create Accommodation Service
- [ ] Create `accommodationService.ts`
- [ ] Implement CRUD operations
- [ ] Implement search with filters
- [ ] Implement nearby search (geospatial)
- [ ] Implement slug generation
- [ ] Add validation logic

**Files:**
- `backend/src/services/accommodationService.ts`

### Task 1.3: Create Accommodation Controller
- [ ] Create `accommodationController.ts`
- [ ] Implement public endpoints (list, detail, search, nearby)
- [ ] Implement admin endpoints (create, update, delete)
- [ ] Add request validation
- [ ] Add error handling

**Files:**
- `backend/src/controllers/accommodationController.ts`

### Task 1.4: Create Accommodation Routes
- [ ] Create `accommodations.ts` routes file
- [ ] Define public routes (no auth)
- [ ] Define admin routes (with auth)
- [ ] Add rate limiting middleware
- [ ] Register routes in main app

**Files:**
- `backend/src/routes/accommodations.ts`
- `backend/src/index.ts`

## Phase 2: CRM - Call Management Backend (Priority: HIGH)

### Task 2.1: Create Call Request Service
- [ ] Create `callRequestService.ts`
- [ ] Implement lead capture
- [ ] Implement auto-assignment logic
- [ ] Implement status workflow
- [ ] Implement interaction logging
- [ ] Implement callback scheduling
- [ ] Add reminder logic

**Files:**
- `backend/src/services/callRequestService.ts`

### Task 2.2: Create Call Request Controller
- [ ] Create `callRequestController.ts`
- [ ] Implement public endpoint (request call)
- [ ] Implement admin endpoints (list, assign, update status)
- [ ] Implement interaction endpoints
- [ ] Implement scheduling endpoints
- [ ] Add CAPTCHA validation

**Files:**
- `backend/src/controllers/callRequestController.ts`

### Task 2.3: Create Call Request Routes
- [ ] Create `callRequests.ts` routes file
- [ ] Define public route (POST /request-call)
- [ ] Define admin routes
- [ ] Add rate limiting for public endpoint
- [ ] Register routes

**Files:**
- `backend/src/routes/callRequests.ts`

### Task 2.4: Create Reporting Service
- [ ] Create `reportingService.ts`
- [ ] Implement lead metrics
- [ ] Implement conversion reports
- [ ] Implement admin performance reports
- [ ] Implement property performance reports
- [ ] Add date range filtering

**Files:**
- `backend/src/services/reportingService.ts`

### Task 2.5: Create Notification Service
- [ ] Create `reminderService.ts`
- [ ] Implement email reminders
- [ ] Implement in-app notifications
- [ ] Create scheduled job for reminders
- [ ] Add notification templates

**Files:**
- `backend/src/services/reminderService.ts`
- `backend/src/jobs/reminderJob.ts`

## Phase 3: Frontend - Public Pages (Priority: HIGH)

### Task 3.1: Create Accommodation Types
- [ ] Update `types/index.ts`
- [ ] Add Accommodation interface
- [ ] Add filter interfaces
- [ ] Add enums

**Files:**
- `frontend/src/types/index.ts`

### Task 3.2: Create Accommodation Service
- [ ] Create `accommodationService.ts`
- [ ] Implement API calls (list, detail, search, nearby)
- [ ] Implement request call API
- [ ] Add error handling

**Files:**
- `frontend/src/services/accommodationService.ts`

### Task 3.3: Create Accommodations List Page
- [ ] Create `(tabs)/accommodations.tsx`
- [ ] Implement filter sidebar
- [ ] Implement grid/list view
- [ ] Implement map view toggle
- [ ] Implement pagination
- [ ] Add loading states
- [ ] Add empty states

**Files:**
- `frontend/app/(tabs)/accommodations.tsx`

### Task 3.4: Create Accommodation Detail Page
- [ ] Create `(tabs)/accommodation-detail.tsx`
- [ ] Implement image gallery
- [ ] Display property details
- [ ] Display amenities
- [ ] Integrate map
- [ ] Add "Request Call" button
- [ ] Display reviews
- [ ] Show similar properties

**Files:**
- `frontend/app/(tabs)/accommodation-detail.tsx`

### Task 3.5: Create Request Call Modal
- [ ] Create `RequestCallModal.tsx` component
- [ ] Implement form with validation
- [ ] Add phone number validation
- [ ] Add time picker
- [ ] Integrate CAPTCHA
- [ ] Add success/error states

**Files:**
- `frontend/components/RequestCallModal.tsx`

### Task 3.6: Create Filter Components
- [ ] Create `AccommodationFilters.tsx`
- [ ] Implement type filter
- [ ] Implement location filter
- [ ] Implement price range slider
- [ ] Implement amenity checkboxes
- [ ] Implement diet type filter (restaurants)
- [ ] Add clear filters button

**Files:**
- `frontend/components/AccommodationFilters.tsx`

### Task 3.7: Create Map Component
- [ ] Create `AccommodationMap.tsx`
- [ ] Integrate Google Maps/Mapbox
- [ ] Implement clustered markers
- [ ] Add info windows
- [ ] Implement click to detail
- [ ] Add current location button

**Files:**
- `frontend/components/AccommodationMap.tsx`

## Phase 4: Frontend - Admin CMS (Priority: MEDIUM)

### Task 4.1: Create Manage Accommodations Page
- [ ] Create `(admin)/manage-accommodations.tsx`
- [ ] Implement list view with filters
- [ ] Add quick actions (edit, delete, toggle)
- [ ] Implement bulk operations
- [ ] Add search functionality
- [ ] Add pagination

**Files:**
- `frontend/app/(admin)/manage-accommodations.tsx`

### Task 4.2: Create Create/Edit Accommodation Page
- [ ] Create `(admin)/create-accommodation.tsx`
- [ ] Create `(admin)/edit-accommodation.tsx`
- [ ] Implement multi-step form
- [ ] Add image upload with preview
- [ ] Integrate location picker with map
- [ ] Add amenity selector
- [ ] Add validation
- [ ] Implement preview mode

**Files:**
- `frontend/app/(admin)/create-accommodation.tsx`
- `frontend/app/(admin)/edit-accommodation.tsx`

### Task 4.3: Create Location Picker Component
- [ ] Create `LocationPicker.tsx`
- [ ] Integrate map
- [ ] Implement address autocomplete
- [ ] Auto-fill lat/lng on selection
- [ ] Add manual lat/lng input
- [ ] Validate coordinates

**Files:**
- `frontend/components/LocationPicker.tsx`

## Phase 5: Frontend - CRM Dashboard (Priority: MEDIUM)

### Task 5.1: Create Call Requests Dashboard
- [ ] Create `(admin)/call-requests.tsx`
- [ ] Implement Kanban board view
- [ ] Add status filters
- [ ] Add priority filters
- [ ] Add assigned filter
- [ ] Implement drag-and-drop status update
- [ ] Add scheduled callbacks section
- [ ] Add overdue indicators

**Files:**
- `frontend/app/(admin)/call-requests.tsx`

### Task 5.2: Create Call Request Detail Page
- [ ] Create `(admin)/call-request-detail.tsx`
- [ ] Display lead information
- [ ] Display accommodation details
- [ ] Implement interaction timeline
- [ ] Add interaction form
- [ ] Add schedule callback form
- [ ] Add status update dropdown
- [ ] Add notes section

**Files:**
- `frontend/app/(admin)/call-request-detail.tsx`

### Task 5.3: Create Interaction Components
- [ ] Create `InteractionTimeline.tsx`
- [ ] Create `AddInteractionForm.tsx`
- [ ] Create `ScheduleCallbackForm.tsx`
- [ ] Add validation
- [ ] Add success/error states

**Files:**
- `frontend/components/InteractionTimeline.tsx`
- `frontend/components/AddInteractionForm.tsx`
- `frontend/components/ScheduleCallbackForm.tsx`

### Task 5.4: Create Reports Page
- [ ] Create `(admin)/accommodation-reports.tsx`
- [ ] Implement lead metrics cards
- [ ] Add conversion funnel chart
- [ ] Add admin performance table
- [ ] Add property performance table
- [ ] Implement date range picker
- [ ] Add export functionality

**Files:**
- `frontend/app/(admin)/accommodation-reports.tsx`

## Phase 6: SEO & Performance (Priority: LOW)

### Task 6.1: Implement SEO
- [ ] Add dynamic meta tags
- [ ] Implement Open Graph tags
- [ ] Add Schema.org markup
- [ ] Generate sitemap
- [ ] Add canonical URLs
- [ ] Implement breadcrumbs

**Files:**
- `frontend/app/(tabs)/accommodation-detail.tsx`
- `frontend/utils/seo.ts`

### Task 6.2: Optimize Performance
- [ ] Implement image lazy loading
- [ ] Add caching for API calls
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Implement pagination
- [ ] Add loading skeletons

**Files:**
- Various

## Phase 7: Testing & Documentation (Priority: LOW)

### Task 7.1: Create Seed Data
- [ ] Create seed script for accommodations
- [ ] Add sample hotels
- [ ] Add sample restaurants
- [ ] Add sample home stays
- [ ] Add sample call requests

**Files:**
- `backend/src/controllers/seedController.ts`

### Task 7.2: API Documentation
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Add authentication guide

**Files:**
- `docs/ACCOMMODATIONS_API.md`

### Task 7.3: User Guide
- [ ] Create admin user guide
- [ ] Document CRM workflow
- [ ] Add screenshots
- [ ] Create video tutorials

**Files:**
- `docs/ACCOMMODATIONS_GUIDE.md`

## Estimated Timeline

- **Phase 1:** 3-4 days
- **Phase 2:** 4-5 days
- **Phase 3:** 5-6 days
- **Phase 4:** 3-4 days
- **Phase 5:** 4-5 days
- **Phase 6:** 2-3 days
- **Phase 7:** 2-3 days

**Total:** 23-30 days

## Dependencies

- Google Maps API key (or Mapbox)
- CAPTCHA service (reCAPTCHA)
- Email service for reminders
- Image storage service (AWS S3 or similar)

## Success Criteria

- [ ] All accommodation types can be created and managed
- [ ] Location is mandatory with lat/lng
- [ ] Filters work correctly
- [ ] Map displays properties accurately
- [ ] Call requests are captured successfully
- [ ] CRM workflow is smooth
- [ ] Reminders are sent on time
- [ ] Reports show accurate data
- [ ] SEO meta tags are generated
- [ ] Performance is optimized

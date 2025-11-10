# Design Document: Package Management Enhancement

## Overview

This design enhances the existing Manage Packages admin interface with comprehensive package management capabilities. The solution includes a package detail modal, callback management interface with status tracking, package edit functionality, active/inactive toggle, and soft-delete archiving system.

## Architecture

### High-Level Component Structure

```
Manage Packages Page
├── Package Detail Modal (View)
├── Callback Management Modal (Call)
├── Package Edit Page (Edit)
├── Status Toggle (Active/Inactive)
└── Archive Confirmation (Delete)
```

### Data Flow

```
User Action → Frontend Component → API Call → Backend Service → 
Database Update → Response → UI Update
```

## Components and Interfaces

### 1. Package Detail Modal

**Purpose:** Display complete package information in a read-only modal

**Component:** `PackageDetailModal.tsx`

```typescript
interface PackageDetailModalProps {
  packageId: string;
  visible: boolean;
  onClose: () => void;
}
```

**Features:**
- Full package details display (title, description, price, duration)
- Image gallery with navigation
- Complete itinerary display
- Location information
- Host information
- Approval status badge
- Close button

**API Endpoint:** Uses existing `GET /api/packages/:id`

### 2. Callback Management Interface

**Purpose:** Manage callback requests with status tracking

**Component:** `CallbackManagementModal.tsx`

```typescript
interface CallbackManagementModalProps {
  packageId: string;
  packageTitle: string;
  visible: boolean;
  onClose: () => void;
}

interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: CallbackStatus;
  rescheduleDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: StatusChange[];
}

enum CallbackStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  RESCHEDULED = 'RESCHEDULED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED'
}

interface StatusChange {
  status: CallbackStatus;
  timestamp: Date;
  changedBy: string;
  notes?: string;
}
```

**Features:**
- List all callback requests for the package
- Filter by status (All, Pending, Contacted, etc.)
- Update status with dropdown
- Add notes for each request
- Reschedule callback with date/time picker
- Status history timeline
- Pending callback count badge

**New API Endpoints:**

```typescript
// Update callback status
PATCH /api/packages/callback-requests/:requestId/status
Body: {
  status: CallbackStatus;
  notes?: string;
  rescheduleDate?: Date;
}

// Get callback requests with status
GET /api/packages/:id/callback-requests?status=PENDING
```

### 3. Package Edit Page

**Purpose:** Edit existing package details

**Component:** `EditPackage.tsx` (new page at `frontend/app/(admin)/edit-package.tsx`)

**Features:**
- Pre-populated form with existing package data
- Same form structure as create-package
- Image upload with existing images display
- Ability to remove existing images
- Ability to add new images
- Itinerary editing (add/remove/modify days)
- Save changes button
- Cancel button

**API Endpoint:**

```typescript
// Update package
PATCH /api/packages/:id
Body: {
  title?: string;
  description?: string;
  duration?: number;
  price?: number;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  images?: string[];
  itinerary?: ItineraryDay[];
}
```

### 4. Active/Inactive Toggle

**Purpose:** Control package visibility on frontend

**Database Schema Update:**

```prisma
model Package {
  // ... existing fields
  isActive Boolean @default(true)
  // ... rest of fields
}
```

**Logic:**
- Active packages: `isActive = true` AND `approvalStatus = APPROVED`
- Inactive packages: `isActive = false` OR `approvalStatus != APPROVED`

**API Endpoint:**

```typescript
// Toggle active status
PATCH /api/packages/:id/active-status
Body: {
  isActive: boolean;
}
```

**Frontend Update:**
- Update toggle button to use `isActive` field
- Show visual indicator (green checkmark for active, orange pause for inactive)
- Immediate UI feedback

### 5. Archive System (Soft Delete)

**Purpose:** Archive packages instead of permanent deletion

**Database Schema Update:**

```prisma
model Package {
  // ... existing fields
  isArchived Boolean @default(false)
  archivedAt DateTime?
  archivedBy String?
  // ... rest of fields
}
```

**Logic:**
- Delete action sets `isArchived = true`
- Archived packages excluded from default queries
- Separate view for archived packages
- Ability to restore archived packages (future enhancement)

**API Endpoint:**

```typescript
// Archive package (soft delete)
PATCH /api/packages/:id/archive
// Returns success message

// Get archived packages
GET /api/packages/archived
```

**Frontend Update:**
- Confirmation dialog before archiving
- Remove from active list after archiving
- Add "View Archived" tab/button (optional)

### 6. Callback Count Badge

**Purpose:** Show pending callback count on manage packages list

**Implementation:**
- Add callback count to package list query
- Display badge on "Call" button when count > 0
- Different colors for urgency (red for rescheduled callbacks due today)

**API Update:**

```typescript
// Modify GET /api/packages to include callback counts
Response: {
  data: [
    {
      ...packageData,
      _count: {
        callbackRequests: number,
        pendingCallbacks: number,
        urgentCallbacks: number
      }
    }
  ]
}
```

## Data Models

### Updated Package Model

```prisma
model Package {
  id             String         @id @default(uuid())
  title          String
  description    String
  duration       Int
  locationId     String?
  customCountry  String?
  customState    String?
  customArea     String?
  price          Float
  images         String[]
  hostId         String
  hostRole       UserRole
  approvalStatus ApprovalStatus @default(PENDING)
  isActive       Boolean        @default(true)        // NEW
  isArchived     Boolean        @default(false)       // NEW
  archivedAt     DateTime?                            // NEW
  archivedBy     String?                              // NEW
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  host             User                      @relation(fields: [hostId], references: [id])
  location         Location?                 @relation(fields: [locationId], references: [id])
  itinerary        ItineraryDay[]
  interestedUsers  PackageInterest[]
  callbackRequests PackageCallbackRequest[]

  @@map("packages")
}
```

### Updated PackageCallbackRequest Model

```prisma
model PackageCallbackRequest {
  id              String         @id @default(uuid())
  packageId       String
  name            String
  phone           String
  email           String?
  message         String?
  userId          String?
  status          CallbackStatus @default(PENDING)    // UPDATED
  notes           String?                              // NEW
  rescheduleDate  DateTime?                            // NEW
  contactedAt     DateTime?                            // NEW
  contactedBy     String?                              // NEW
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  package Package @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@map("package_callback_requests")
}

enum CallbackStatus {
  PENDING
  CONTACTED
  RESCHEDULED
  NOT_INTERESTED
  BOOKING_COMPLETED
}
```

### New CallbackStatusHistory Model

```prisma
model CallbackStatusHistory {
  id                String         @id @default(uuid())
  callbackRequestId String
  status            CallbackStatus
  notes             String?
  changedBy         String
  createdAt         DateTime       @default(now())

  callbackRequest PackageCallbackRequest @relation(fields: [callbackRequestId], references: [id], onDelete: Cascade)
  user            User                   @relation(fields: [changedBy], references: [id])

  @@map("callback_status_history")
}
```

## Error Handling

### Frontend Error Scenarios

1. **Failed to Load Package Details**
   - Show error message in modal
   - Provide retry button

2. **Failed to Update Callback Status**
   - Show error alert
   - Revert UI to previous state

3. **Failed to Save Package Edits**
   - Show validation errors
   - Keep form data intact

4. **Failed to Toggle Active Status**
   - Show error alert
   - Revert toggle state

5. **Failed to Archive Package**
   - Show error alert
   - Keep package in list

### Backend Error Scenarios

1. **Package Not Found**
   - Return 404 with message

2. **Unauthorized Access**
   - Return 403 for non-admin users

3. **Invalid Status Update**
   - Return 400 with validation errors

4. **Database Errors**
   - Return 500 with generic message
   - Log detailed error

## Testing Strategy

### Frontend Testing

1. **Package Detail Modal**
   - Test: Open modal with valid package ID
   - Test: Display all package information correctly
   - Test: Close modal functionality

2. **Callback Management**
   - Test: Load callback requests
   - Test: Filter by status
   - Test: Update status
   - Test: Add notes
   - Test: Reschedule callback

3. **Package Edit**
   - Test: Load existing package data
   - Test: Edit all fields
   - Test: Add/remove images
   - Test: Edit itinerary
   - Test: Save changes

4. **Active/Inactive Toggle**
   - Test: Toggle from active to inactive
   - Test: Toggle from inactive to active
   - Test: Verify frontend visibility

5. **Archive Package**
   - Test: Archive confirmation dialog
   - Test: Archive package
   - Test: Verify removal from list

### Backend Testing

1. **API Endpoints**
   - Test: Get package details
   - Test: Update callback status
   - Test: Update package
   - Test: Toggle active status
   - Test: Archive package

2. **Authorization**
   - Test: Admin can perform all actions
   - Test: Non-admin cannot access admin endpoints

3. **Data Integrity**
   - Test: Archived packages excluded from default queries
   - Test: Inactive packages not shown on frontend
   - Test: Callback status history recorded

## Implementation Notes

### Database Migration

```sql
-- Add new fields to packages table
ALTER TABLE packages 
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN is_archived BOOLEAN DEFAULT false,
ADD COLUMN archived_at TIMESTAMP,
ADD COLUMN archived_by VARCHAR;

-- Update callback_requests table
ALTER TABLE package_callback_requests
ADD COLUMN status VARCHAR DEFAULT 'PENDING',
ADD COLUMN notes TEXT,
ADD COLUMN reschedule_date TIMESTAMP,
ADD COLUMN contacted_at TIMESTAMP,
ADD COLUMN contacted_by VARCHAR;

-- Create callback_status_history table
CREATE TABLE callback_status_history (
  id VARCHAR PRIMARY KEY,
  callback_request_id VARCHAR REFERENCES package_callback_requests(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  notes TEXT,
  changed_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend Route Structure

```
/(admin)/
  packages.tsx              # Main manage packages page
  create-package.tsx        # Existing create page
  edit-package.tsx          # NEW: Edit package page
  package-callback-requests.tsx  # Existing callback requests page (enhance)
```

### Component File Structure

```
frontend/components/
  PackageDetailModal.tsx    # NEW: Package detail view
  CallbackManagementModal.tsx  # NEW: Callback management
  ImageUploadField.tsx      # Existing: Reuse for edit
```

## Security Considerations

1. **Authorization**: All admin endpoints require authentication and admin role
2. **Input Validation**: Validate all user inputs on backend
3. **SQL Injection**: Use Prisma parameterized queries
4. **XSS Prevention**: Sanitize user-generated content
5. **Rate Limiting**: Consider adding rate limits to prevent abuse

## Performance Considerations

1. **Pagination**: Already implemented for package list
2. **Lazy Loading**: Load callback requests only when modal opens
3. **Caching**: Consider caching package details for quick access
4. **Optimistic Updates**: Update UI immediately, rollback on error
5. **Database Indexes**: Add indexes on frequently queried fields (isActive, isArchived, status)

## Future Enhancements

1. **Bulk Operations**: Select multiple packages for bulk actions
2. **Export Data**: Export callback requests to CSV
3. **Analytics Dashboard**: Show callback conversion rates
4. **Automated Reminders**: Send reminders for rescheduled callbacks
5. **Restore Archived**: Ability to restore archived packages
6. **Audit Log**: Track all changes to packages

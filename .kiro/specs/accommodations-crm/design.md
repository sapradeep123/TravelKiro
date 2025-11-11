# Accommodations Module with CRM - Design Document

## Database Schema

### 1. Accommodation Model
```prisma
model Accommodation {
  id                String   @id @default(uuid())
  type              AccommodationType
  name              String
  slug              String   @unique
  description       String
  
  // Location (REQUIRED)
  country           String
  state             String
  area              String
  address           String?
  latitude          Float
  longitude         Float
  mapUrl            String?
  
  // Contact
  phone             String[]
  email             String?
  website           String?
  
  // Media
  images            String[]
  videos            String[]
  virtualTourUrl    String?
  
  // Pricing
  priceMin          Float?
  priceMax          Float?
  currency          String   @default("INR")
  priceCategory     PriceCategory?
  
  // Ratings
  starRating        Int?     // 1-5
  userRating        Float?   // Average user rating
  reviewCount       Int      @default(0)
  
  // Amenities
  amenities         String[] // Array of amenity IDs
  
  // Restaurant specific
  dietTypes         DietType[]
  cuisineTypes      String[]
  seatingCapacity   Int?
  
  // Home Stay specific
  homeStaySubtype   HomeStaySubtype?
  totalRooms        Int?
  sharedFacilities  String[]
  privateFacilities String[]
  houseRules        String?
  genderPreference  GenderPreference?
  
  // SEO
  metaTitle         String?
  metaDescription   String?
  keywords          String[]
  
  // Status
  isActive          Boolean  @default(true)
  isFeatured        Boolean  @default(false)
  approvalStatus    ApprovalStatus @default(PENDING)
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String
  approvedBy        String?
  approvedAt        DateTime?
  
  // Relations
  creator           User     @relation("AccommodationCreator", fields: [createdBy], references: [id])
  callRequests      AccommodationCallRequest[]
  reviews           AccommodationReview[]
}

enum AccommodationType {
  HOTEL
  RESORT
  RESTAURANT
  HOME_STAY
  SHARED_FLAT
}

enum PriceCategory {
  BUDGET
  MID_RANGE
  LUXURY
  PREMIUM
}

enum DietType {
  VEGETARIAN
  VEGAN
  NON_VEGETARIAN
  JAIN
  HALAL
  KOSHER
  GLUTEN_FREE
  ORGANIC
}

enum HomeStaySubtype {
  ENTIRE_HOME
  PRIVATE_ROOM
  SHARED_ROOM
  FARM_STAY
  HERITAGE_HOME
  ECO_STAY
  BEACH_HOUSE
  MOUNTAIN_COTTAGE
}

enum GenderPreference {
  MALE_ONLY
  FEMALE_ONLY
  MIXED
  NO_PREFERENCE
}
```

### 2. Call Request Model (CRM)
```prisma
model AccommodationCallRequest {
  id                String   @id @default(uuid())
  
  // Lead Information
  name              String
  phone             String
  email             String?
  preferredCallTime DateTime?
  message           String?
  
  // Source Tracking
  accommodationId   String
  sourceUrl         String?
  ipAddress         String?
  userAgent         String?
  
  // Assignment
  assignedTo        String?
  assignedAt        DateTime?
  
  // Status
  status            CallRequestStatus @default(NEW)
  priority          Priority @default(MEDIUM)
  
  // Scheduling
  scheduledCallDate DateTime?
  reminderSent      Boolean  @default(false)
  
  // Outcome
  outcome           CallOutcome?
  conversionValue   Float?
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastContactedAt   DateTime?
  convertedAt       DateTime?
  
  // Relations
  accommodation     Accommodation @relation(fields: [accommodationId], references: [id])
  assignedAdmin     User?    @relation("AssignedCallRequests", fields: [assignedTo], references: [id])
  interactions      CallInteraction[]
  statusHistory     CallStatusHistory[]
  
  @@index([status])
  @@index([assignedTo])
  @@index([scheduledCallDate])
}

enum CallRequestStatus {
  NEW
  CONTACTED
  QUALIFIED
  FOLLOW_UP
  SCHEDULED
  CONVERTED
  LOST
  INVALID
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum CallOutcome {
  CONNECTED
  NO_ANSWER
  BUSY
  WRONG_NUMBER
  VOICEMAIL
  CALLBACK_REQUESTED
}
```

### 3. Call Interaction Model
```prisma
model CallInteraction {
  id              String   @id @default(uuid())
  callRequestId   String
  
  // Interaction Details
  type            InteractionType
  outcome         CallOutcome?
  duration        Int?     // in minutes
  notes           String
  nextAction      String?
  
  // Scheduling
  followUpDate    DateTime?
  
  // Metadata
  createdAt       DateTime @default(now())
  createdBy       String
  
  // Relations
  callRequest     AccommodationCallRequest @relation(fields: [callRequestId], references: [id])
  admin           User     @relation("CallInteractions", fields: [createdBy], references: [id])
  
  @@index([callRequestId])
}

enum InteractionType {
  CALL
  EMAIL
  SMS
  WHATSAPP
  NOTE
  STATUS_CHANGE
}
```

### 4. Call Status History
```prisma
model CallStatusHistory {
  id              String   @id @default(uuid())
  callRequestId   String
  
  fromStatus      CallRequestStatus?
  toStatus        CallRequestStatus
  reason          String?
  notes           String?
  
  createdAt       DateTime @default(now())
  createdBy       String
  
  callRequest     AccommodationCallRequest @relation(fields: [callRequestId], references: [id])
  admin           User     @relation("CallStatusHistory", fields: [createdBy], references: [id])
  
  @@index([callRequestId])
}
```

### 5. Accommodation Review Model
```prisma
model AccommodationReview {
  id                String   @id @default(uuid())
  accommodationId   String
  userId            String
  
  rating            Int      // 1-5
  title             String?
  review            String
  
  // Moderation
  isApproved        Boolean  @default(false)
  approvedBy        String?
  approvedAt        DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  accommodation     Accommodation @relation(fields: [accommodationId], references: [id])
  user              User     @relation(fields: [userId], references: [id])
  
  @@index([accommodationId])
  @@index([isApproved])
}
```

## API Endpoints

### Public APIs (Read-Only)

#### 1. List Accommodations
```
GET /api/accommodations
Query Parameters:
  - type: AccommodationType
  - country: string
  - state: string
  - area: string
  - dietTypes: DietType[] (for restaurants)
  - homeStaySubtype: HomeStaySubtype
  - amenities: string[]
  - priceMin: number
  - priceMax: number
  - priceCategory: PriceCategory
  - starRating: number
  - lat: number (for nearby search)
  - lng: number (for nearby search)
  - radius: number (in km)
  - page: number
  - limit: number
  - sort: string (price, rating, distance)

Response: {
  data: Accommodation[],
  pagination: { page, limit, total, totalPages }
}
```

#### 2. Get Accommodation Details
```
GET /api/accommodations/:id
Response: { data: Accommodation }
```

#### 3. Search Accommodations
```
GET /api/accommodations/search?q=query
Response: { data: Accommodation[] }
```

#### 4. Nearby Accommodations
```
GET /api/accommodations/nearby?lat=10.0&lng=77.0&radius=10
Response: { data: Accommodation[] }
```

#### 5. Request Call
```
POST /api/accommodations/:id/request-call
Body: {
  name: string,
  phone: string,
  email?: string,
  preferredCallTime?: DateTime,
  message?: string
}
Response: { message: string, requestId: string }
```

### Admin APIs (Protected)

#### 1. Create Accommodation
```
POST /api/admin/accommodations
Body: AccommodationCreateInput
Response: { data: Accommodation }
```

#### 2. Update Accommodation
```
PUT /api/admin/accommodations/:id
Body: AccommodationUpdateInput
Response: { data: Accommodation }
```

#### 3. Delete Accommodation
```
DELETE /api/admin/accommodations/:id
Response: { message: string }
```

#### 4. Get Call Requests
```
GET /api/admin/call-requests
Query: status, assignedTo, priority, from, to
Response: { data: CallRequest[] }
```

#### 5. Assign Call Request
```
POST /api/admin/call-requests/:id/assign
Body: { assignedTo: string }
Response: { data: CallRequest }
```

#### 6. Update Call Status
```
PATCH /api/admin/call-requests/:id/status
Body: { status: CallRequestStatus, notes?: string }
Response: { data: CallRequest }
```

#### 7. Add Interaction
```
POST /api/admin/call-requests/:id/interactions
Body: {
  type: InteractionType,
  outcome?: CallOutcome,
  duration?: number,
  notes: string,
  followUpDate?: DateTime
}
Response: { data: CallInteraction }
```

#### 8. Schedule Callback
```
POST /api/admin/call-requests/:id/schedule
Body: { scheduledCallDate: DateTime }
Response: { data: CallRequest }
```

#### 9. Get Reports
```
GET /api/admin/reports/call-requests
Query: from, to, groupBy (status, admin, accommodation)
Response: { data: ReportData }
```

## Frontend Components

### Public Pages

1. **Accommodations List Page** (`/accommodations`)
   - Filter sidebar
   - Map view toggle
   - Grid/List view
   - Pagination
   - Sort options

2. **Accommodation Detail Page** (`/accommodations/:id`)
   - Image gallery
   - Property details
   - Amenities list
   - Location map
   - "Request a Call" button
   - Reviews section
   - Similar properties

3. **Request Call Modal**
   - Form with validation
   - Preferred time picker
   - Success confirmation

### Admin Pages

1. **Manage Accommodations** (`/admin/accommodations`)
   - List with filters
   - Quick actions (edit, delete, toggle active)
   - Bulk operations

2. **Create/Edit Accommodation** (`/admin/accommodations/create|edit`)
   - Multi-step form
   - Image upload
   - Location picker with map
   - Amenity selector
   - Preview mode

3. **Call Requests Dashboard** (`/admin/call-requests`)
   - Status pipeline view
   - Filters (status, assigned, priority)
   - Quick actions
   - Scheduled callbacks list

4. **Call Request Detail** (`/admin/call-requests/:id`)
   - Lead information
   - Interaction timeline
   - Add interaction form
   - Schedule callback
   - Update status
   - Notes section

5. **Reports** (`/admin/reports/accommodations`)
   - Lead metrics
   - Conversion funnel
   - Admin performance
   - Property performance
   - Charts and graphs

## UI/UX Design

### Filter Panel
- Collapsible sections
- Multi-select with checkboxes
- Range sliders for price
- Star rating selector
- Location autocomplete
- Clear all filters button

### Map Integration
- Clustered markers
- Info windows on hover
- Click to view details
- Draw radius for nearby search
- Current location button

### Call Request Form
- Clean, minimal design
- Phone number validation
- Time slot picker
- Character counter for message
- Privacy notice
- CAPTCHA integration

### Admin CRM Dashboard
- Kanban board for status pipeline
- Drag-and-drop status updates
- Color-coded priorities
- Overdue indicators
- Quick filters
- Search functionality

## SEO Implementation

### URL Structure
```
/accommodations/hotel/kerala/munnar/tea-valley-resort
/accommodations/restaurant/goa/panaji/spice-garden
/accommodations/homestay/himachal/manali/mountain-view-cottage
```

### Meta Tags Template
```html
<title>[Name] - [Type] in [Area], [State] | Butterfliy</title>
<meta name="description" content="[Description snippet with key features]">
<meta property="og:title" content="[Name] - [Type] in [Area]">
<meta property="og:description" content="[Description]">
<meta property="og:image" content="[Primary Image]">
<meta property="og:url" content="[Canonical URL]">
```

### Schema.org Markup
```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness" | "Restaurant",
  "name": "[Name]",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[Area]",
    "addressRegion": "[State]",
    "addressCountry": "[Country]"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[Lat]",
    "longitude": "[Lng]"
  },
  "image": "[Images]",
  "priceRange": "[Price Range]",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "[Rating]"
  }
}
```

## Security Considerations

1. **Rate Limiting**
   - Public APIs: 100 requests/hour per IP
   - Call request submission: 5 requests/hour per IP

2. **Input Validation**
   - Sanitize all user inputs
   - Validate phone numbers
   - Email format validation
   - XSS prevention

3. **CAPTCHA**
   - Required for call request submission
   - Prevent spam and bot submissions

4. **Admin Authentication**
   - JWT-based authentication
   - Role-based access control
   - Session management

5. **Data Privacy**
   - GDPR compliance
   - Data retention policies
   - User consent tracking
   - Secure data storage

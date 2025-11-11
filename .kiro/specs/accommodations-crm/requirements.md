# Accommodations Module with CRM Requirements

## Overview
Build an admin-curated, map-first Accommodations module with integrated CRM-style call management for lead tracking and conversion.

## Core Features

### 1. Accommodation Types
- **Hotels** - Standard hotel properties
- **Resorts** - Resort properties with amenities
- **Restaurants** - Dining establishments with diet taxonomy
- **Home Stays** - Residential accommodations with subtypes
- **Shared Flats** - Shared living spaces with clarity on sharing

### 2. Location Requirements (MANDATORY)
- Area/City (required)
- State/Province (required)
- Country (required)
- Latitude (required)
- Longitude (required)
- Map integration for visual display

### 3. Restaurant-Specific Features
**Diet Taxonomy:**
- Vegetarian
- Vegan
- Non-Vegetarian
- Jain
- Halal
- Kosher
- Gluten-Free
- Organic
- Multi-cuisine support

**Cuisine Types:**
- Indian (North, South, East, West)
- Chinese
- Continental
- Italian
- Mexican
- Thai
- Japanese
- Fusion
- Local/Regional

### 4. Home Stay Features
**Subtypes:**
- Entire Home
- Private Room
- Shared Room
- Farm Stay
- Heritage Home
- Eco Stay
- Beach House
- Mountain Cottage

**Shared Flat Clarity:**
- Number of rooms
- Number of occupants
- Shared facilities (kitchen, bathroom, living room)
- Private facilities
- House rules
- Gender preferences (if any)

### 5. Robust Filters
**Location Filters:**
- Country
- State
- Area/City
- Distance from current location
- Map bounds

**Type Filters:**
- Accommodation type
- Restaurant diet types
- Home stay subtypes
- Shared flat options

**Amenity Filters:**
- WiFi
- Parking
- Pool
- Gym
- Restaurant
- Room Service
- Pet Friendly
- AC
- Heating
- Kitchen

**Price Filters:**
- Price range slider
- Budget categories (Budget, Mid-range, Luxury)

**Rating Filters:**
- Star rating (1-5)
- User reviews rating

**Availability:**
- Check-in/Check-out dates
- Instant booking
- Available now

### 6. SEO-Ready Detail Pages
**Meta Information:**
- Dynamic title: "[Name] - [Type] in [Area], [State]"
- Meta description with key features
- Open Graph tags for social sharing
- Schema.org markup for rich snippets
- Canonical URLs
- Alt text for all images

**URL Structure:**
- `/accommodations/[type]/[state]/[area]/[slug]`
- Example: `/accommodations/hotel/kerala/munnar/tea-valley-resort`

**Content Structure:**
- H1: Property name
- H2: Key sections (About, Amenities, Location, Reviews)
- Breadcrumbs
- Structured data for local business

## CRM - Call Management Layer

### 1. Lead Capture
**"Request a Call" Form:**
- Name (required)
- Phone (required)
- Email (optional)
- Preferred time for callback
- Message/Requirements (optional)
- Source tracking (which listing)
- Auto-capture: timestamp, IP, user agent

### 2. Lead Assignment
- Auto-assign to available admin
- Manual reassignment capability
- Load balancing across admins
- Territory-based assignment (by state/area)
- Notification to assigned admin

### 3. Lead Status Workflow
**Status Pipeline:**
1. **New** - Just received
2. **Contacted** - First call made
3. **Qualified** - Genuine interest confirmed
4. **Follow-up** - Needs more information
5. **Scheduled** - Callback scheduled
6. **Converted** - Booking confirmed
7. **Lost** - Not interested
8. **Invalid** - Wrong number/spam

**Status Actions:**
- Update status with notes
- Schedule next callback
- Set reminders
- Add tags/labels

### 4. Scheduled Callbacks & Reminders
**Callback Scheduling:**
- Date and time picker
- Timezone handling
- Recurring callbacks option
- Calendar integration

**Reminders:**
- Email reminders (1 hour before)
- In-app notifications
- Dashboard alerts for overdue callbacks
- Daily digest of scheduled calls

### 5. Interaction Logging
**Call Log Entry:**
- Date & time
- Duration (manual entry)
- Outcome (Connected, No Answer, Busy, Wrong Number)
- Notes/Summary
- Next action required
- Attachments (if any)

**Activity Timeline:**
- Chronological view of all interactions
- Status changes
- Notes added
- Emails sent
- Callbacks scheduled

### 6. Reporting & Analytics
**Lead Metrics:**
- Total leads by source
- Leads by status
- Conversion rate
- Average time to conversion
- Lost lead reasons

**Admin Performance:**
- Calls made per admin
- Conversion rate per admin
- Average response time
- Callback completion rate

**Accommodation Performance:**
- Leads per listing
- Conversion rate per listing
- Popular properties
- Low-performing listings

**Time-based Reports:**
- Daily/Weekly/Monthly summaries
- Peak inquiry times
- Seasonal trends

## Data Management

### 1. Admin CMS
**Create/Edit Accommodations:**
- Rich text editor for descriptions
- Multiple image upload with drag-drop ordering
- Amenity checklist
- Location picker with map
- Pricing management
- Availability calendar

**Bulk Operations:**
- Import from CSV
- Bulk status updates
- Bulk pricing updates

### 2. Public APIs (Read-Only)
**Endpoints:**
- `GET /api/accommodations` - List with filters
- `GET /api/accommodations/:id` - Detail view
- `GET /api/accommodations/search` - Search with location
- `GET /api/accommodations/nearby` - Nearby listings
- `POST /api/accommodations/:id/request-call` - Lead capture

**Security:**
- Rate limiting
- CORS configuration
- No authentication required for read
- Captcha for lead submission

### 3. Data Ownership
- All data admin-owned
- No user-generated content
- Admin approval required for all listings
- Version control for changes
- Audit trail

## Technical Requirements

### Backend
- Prisma schema updates
- RESTful API endpoints
- Input validation
- Error handling
- Logging

### Frontend
- Responsive design
- Map integration (Google Maps/Mapbox)
- Filter UI with instant results
- Image galleries
- Mobile-optimized

### Database
- Efficient indexing
- Full-text search
- Geospatial queries
- Relationship management

## Success Metrics
- Lead capture rate
- Lead-to-conversion rate
- Average response time < 2 hours
- Callback completion rate > 90%
- User satisfaction with listings
- SEO ranking improvements

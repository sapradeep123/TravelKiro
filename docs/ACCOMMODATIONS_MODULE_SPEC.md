# Accommodations Module with CRM - Quick Reference

## Overview
Admin-curated, map-first Accommodations module (Hotels/Resorts/Restaurants/Home Stays) with integrated CRM-style call management for lead tracking and conversion.

## Key Features

### 🏨 Accommodation Types
- Hotels & Resorts
- Restaurants (with diet taxonomy)
- Home Stays (with subtypes)
- Shared Flats (with clarity on sharing)

### 📍 Location Requirements (MANDATORY)
- Area, State, Country
- Latitude & Longitude
- Map integration

### 🍽️ Restaurant Features
- Diet types: Vegetarian, Vegan, Non-Veg, Jain, Halal, Kosher, Gluten-Free, Organic
- Cuisine types: Indian, Chinese, Continental, Italian, etc.

### 🏡 Home Stay Features
- Subtypes: Entire Home, Private Room, Shared Room, Farm Stay, Heritage Home, etc.
- Shared facility clarity
- House rules & preferences

### 🔍 Robust Filters
- Location (Country, State, Area, Distance)
- Type & Subtypes
- Amenities (WiFi, Parking, Pool, etc.)
- Price range
- Star rating
- Diet types (for restaurants)

### 📞 CRM - Call Management
1. **Lead Capture** - "Request a Call" form on each listing
2. **Auto-Assignment** - Assign to available admins
3. **Status Workflow** - NEW → CONTACTED → QUALIFIED → FOLLOW_UP → SCHEDULED → CONVERTED/LOST
4. **Scheduled Callbacks** - Date/time scheduling with reminders
5. **Interaction Logging** - Track all calls, emails, notes
6. **Reporting** - Lead metrics, conversion rates, admin performance

### 🔒 Security & Data
- All data admin-owned
- Public read-only APIs
- Rate limiting
- CAPTCHA for lead submission
- No user-generated content

### 🎯 SEO-Ready
- Dynamic meta tags
- Schema.org markup
- SEO-friendly URLs
- Open Graph tags

## Quick Start

### 1. Review Specifications
```
.kiro/specs/accommodations-crm/
├── requirements.md  - Detailed requirements
├── design.md        - Database schema & API design
└── tasks.md         - Implementation tasks
```

### 2. Implementation Phases
1. **Phase 1:** Database & Backend Foundation (3-4 days)
2. **Phase 2:** CRM Backend (4-5 days)
3. **Phase 3:** Public Frontend (5-6 days)
4. **Phase 4:** Admin CMS (3-4 days)
5. **Phase 5:** CRM Dashboard (4-5 days)
6. **Phase 6:** SEO & Performance (2-3 days)
7. **Phase 7:** Testing & Documentation (2-3 days)

**Total Estimated Time:** 23-30 days

### 3. Key Models
- `Accommodation` - Main property model
- `AccommodationCallRequest` - Lead/call request
- `CallInteraction` - Call logs and interactions
- `CallStatusHistory` - Status change tracking
- `AccommodationReview` - User reviews

### 4. API Endpoints

**Public (No Auth):**
- `GET /api/accommodations` - List with filters
- `GET /api/accommodations/:id` - Detail view
- `POST /api/accommodations/:id/request-call` - Submit lead

**Admin (Auth Required):**
- `POST /api/admin/accommodations` - Create
- `PUT /api/admin/accommodations/:id` - Update
- `GET /api/admin/call-requests` - List leads
- `POST /api/admin/call-requests/:id/interactions` - Log interaction
- `GET /api/admin/reports/call-requests` - Reports

## CRM Workflow

```
Lead Captured
    ↓
Auto-Assigned to Admin
    ↓
Admin Contacted (logs interaction)
    ↓
Qualified/Follow-up
    ↓
Schedule Callback (with reminder)
    ↓
Converted/Lost (with reason)
    ↓
Reports & Analytics
```

## Dependencies
- Google Maps API (or Mapbox)
- reCAPTCHA
- Email service (for reminders)
- Image storage (AWS S3 or similar)

## Success Metrics
- Lead capture rate
- Lead-to-conversion rate
- Average response time < 2 hours
- Callback completion rate > 90%
- SEO ranking improvements

## Next Steps
1. Review detailed specifications in `.kiro/specs/accommodations-crm/`
2. Set up required services (Maps API, CAPTCHA, etc.)
3. Start with Phase 1: Database & Backend Foundation
4. Follow task list in `tasks.md`

---

**For detailed information, see:**
- Requirements: `.kiro/specs/accommodations-crm/requirements.md`
- Design: `.kiro/specs/accommodations-crm/design.md`
- Tasks: `.kiro/specs/accommodations-crm/tasks.md`

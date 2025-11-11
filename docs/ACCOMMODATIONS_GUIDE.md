# Accommodations Module - Complete Guide

> **Version:** 1.0.0  
> **Status:** Production Ready  
> **Last Updated:** November 2025

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Setup & Installation](#setup--installation)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Development](#development)

---

## Overview

The Accommodations Module is a comprehensive property management system with integrated CRM capabilities. It supports multiple accommodation types including hotels, resorts, restaurants, home stays, and shared flats.

### Key Capabilities

- **Property Management** - Full CRUD operations for accommodations
- **CRM System** - Lead tracking with 8-stage workflow
- **Analytics** - Conversion tracking and performance metrics
- **Multi-type Support** - Hotels, Resorts, Restaurants, Home Stays, Shared Flats
- **Geographic Search** - Location-based filtering with coordinates
- **Review System** - User reviews and ratings

### Technology Stack

- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React Native, Expo, TypeScript
- **Database:** PostgreSQL with PostGIS support

---

## Quick Start

### Prerequisites

- Node.js 16+ or 18+
- PostgreSQL 12+
- npm or yarn

### Installation (5 Minutes)

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup database
cd ../backend
npx prisma migrate dev

# 3. Seed sample data
npm run seed:accommodations

# 4. Start servers
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../frontend
npm start
```

### Verify Installation

```bash
# Test backend
curl http://localhost:3000/api/accommodations

# Should return 6 accommodations
```

---

## Features

### 1. Property Management

**Accommodation Types:**
- Hotels (Budget to Luxury)
- Resorts (Beach, Mountain, etc.)
- Restaurants (Fine Dining, Casual)
- Home Stays (Heritage, Farm, Eco)
- Shared Flats (Student, Professional)

**Key Fields:**
- Location (Country, State, Area, Coordinates)
- Pricing (Min/Max, Currency, Category)
- Amenities (WiFi, Pool, Parking, etc.)
- Media (Images, Videos, Virtual Tours)
- Contact (Phone, Email, Website)

### 2. CRM System

**Lead Workflow (8 Stages):**
1. **NEW** - Fresh inquiry
2. **CONTACTED** - Initial contact made
3. **QUALIFIED** - Budget/requirements confirmed
4. **FOLLOW_UP** - Needs additional touchpoints
5. **SCHEDULED** - Callback/meeting scheduled
6. **CONVERTED** - Booking confirmed
7. **LOST** - Opportunity lost
8. **INVALID** - Invalid/spam lead

**Features:**
- Auto-assignment to admins
- Interaction logging (Call, Email, SMS, WhatsApp)
- Status history tracking
- Callback scheduling
- Conversion value tracking

### 3. Analytics & Reporting

**Metrics:**
- Total leads and conversion rate
- Average response time
- Admin performance comparison
- Property performance analysis
- Conversion funnel visualization

**Filters:**
- Date range (7d, 30d, 90d, all time)
- Status-based filtering
- Priority-based filtering

---

## Architecture

### Database Schema

```
accommodations
├── Basic Info (name, type, description)
├── Location (country, state, area, lat/lng)
├── Contact (phone[], email, website)
├── Pricing (priceMin, priceMax, currency)
├── Media (images[], videos[])
├── Amenities (amenities[])
├── Type-specific fields
└── Status (isActive, approvalStatus)

accommodation_call_requests
├── Lead Info (name, phone, email)
├── Status & Priority
├── Assignment (assignedTo, assignedAt)
├── Scheduling (scheduledCallDate)
└── Outcome (conversionValue)

call_interactions
├── Type (CALL, EMAIL, SMS, etc.)
├── Outcome & Duration
├── Notes & Next Action
└── Follow-up Date

call_status_history
└── Status change audit trail

accommodation_reviews
└── User ratings and reviews
```

### API Endpoints

**Public Endpoints:**
```
GET    /api/accommodations              # List all
GET    /api/accommodations/:id          # Get one
GET    /api/accommodations/search       # Search
GET    /api/accommodations/nearby       # Geospatial
POST   /api/accommodations/:id/request-call
```

**Admin Endpoints:**
```
POST   /api/accommodations              # Create
PUT    /api/accommodations/:id          # Update
DELETE /api/accommodations/:id          # Delete
GET    /api/accommodations/admin/all    # Admin list

# CRM
GET    /api/accommodations/admin/call-requests
GET    /api/accommodations/admin/call-requests/:id
PATCH  /api/accommodations/admin/call-requests/:id/status
POST   /api/accommodations/admin/call-requests/:id/interactions

# Reports
GET    /api/accommodations/admin/reports/lead-metrics
GET    /api/accommodations/admin/reports/conversion-funnel
GET    /api/accommodations/admin/reports/admin-performance
GET    /api/accommodations/admin/reports/property-performance
```

### Frontend Routes

**Public:**
- `/accommodations` - Browse all
- `/accommodation-detail?id=xxx` - View details

**Admin:**
- `/admin/manage-accommodations` - Manage properties
- `/admin/create-accommodation` - Add new
- `/admin/edit-accommodation?id=xxx` - Edit existing
- `/admin/call-requests` - CRM dashboard
- `/admin/call-request-detail?id=xxx` - Lead details
- `/admin/accommodation-reports` - Analytics

---

## Setup & Installation

### 1. Database Setup

```bash
cd backend

# Create database
createdb travel_encyclopedia

# Run migrations
npx prisma migrate dev

# Verify
npx prisma studio
```

### 2. Seed Sample Data

```bash
# Seed 6 accommodations + 7 leads
npm run seed:accommodations
```

**What gets created:**
- 6 accommodations (all types)
- 7 call requests (all stages)
- 5 interactions
- 7 status history records
- 3 reviews

### 3. Environment Configuration

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5433/travel_encyclopedia"
PORT=3000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:8081
```

**Frontend (.env):**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
# Press 'w' for web
```

---

## Usage Guide

### For End Users

#### Browse Accommodations

1. Navigate to `/accommodations`
2. Use search bar to find by name/location
3. Filter by type, price, location
4. Click card to view details

#### Request Callback

1. Open accommodation detail page
2. Click "Request a Call" button
3. Fill in: Name, Phone, Email (optional), Message
4. Submit - Admin will contact you

### For Administrators

#### Manage Properties

1. Go to `/admin/manage-accommodations`
2. View all properties with stats
3. Search and filter
4. Actions: Edit, Deactivate, Delete

#### Create New Property

1. Click "+ Add New"
2. Fill required fields:
   - Name, Type, Description
   - Location (Country, State, Area, Lat/Lng)
   - Contact (Phone required)
   - Pricing (optional)
3. Add amenities and images
4. Save

#### Manage Leads (CRM)

1. Go to `/admin/call-requests`
2. View Kanban board with 8 columns
3. Click lead card to open details
4. Actions:
   - Change status
   - Update priority
   - Add interaction
   - Schedule callback
   - View history

#### Add Interaction

1. Open lead detail page
2. Click "+ Add Interaction"
3. Select type (Call, Email, SMS, etc.)
4. For calls: Add outcome and duration
5. Add notes (required)
6. Set next action and follow-up date
7. Submit

#### View Analytics

1. Go to `/admin/accommodation-reports`
2. Select date range
3. View:
   - Lead metrics (conversion rate, response time)
   - Conversion funnel
   - Admin performance
   - Property performance
4. Export reports (coming soon)

---

## API Reference

### Authentication

Admin endpoints require JWT token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/accommodations/admin/all
```

### Common Filters

```typescript
interface AccommodationFilters {
  type?: 'HOTEL' | 'RESORT' | 'RESTAURANT' | 'HOME_STAY' | 'SHARED_FLAT';
  country?: string;
  state?: string;
  area?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  priceCategory?: 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'PREMIUM';
  isActive?: boolean;
  page?: number;
  limit?: number;
}
```

### Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Example Requests

**Get all accommodations:**
```bash
curl http://localhost:3000/api/accommodations
```

**Search:**
```bash
curl "http://localhost:3000/api/accommodations/search?q=mumbai"
```

**Filter by type:**
```bash
curl "http://localhost:3000/api/accommodations?type=HOTEL"
```

**Request callback:**
```bash
curl -X POST http://localhost:3000/api/accommodations/123/request-call \
  -H "Content-Type: application/json" \
  -d '{"name":"John","phone":"+91-9876543210","email":"john@example.com"}'
```

---

## Troubleshooting

### Common Issues

#### 1. No Data Showing

**Symptoms:** Empty list, "No accommodations found"

**Solutions:**
```bash
# Check backend is running
curl http://localhost:3000/health

# Check data exists
curl http://localhost:3000/api/accommodations

# Re-seed if needed
cd backend && npm run seed:accommodations
```

#### 2. Frontend Not Loading

**Symptoms:** Blank page, Metro bundler page

**Solutions:**
```bash
cd frontend
rm -rf .expo node_modules/.cache
npm start -- --clear
# Press 'w' for web
```

#### 3. CORS Errors

**Symptoms:** Network errors in browser console

**Solutions:**
- Check `backend/.env` has correct `CORS_ORIGIN`
- Restart backend server
- Clear browser cache

#### 4. Database Connection Failed

**Symptoms:** Prisma errors, connection refused

**Solutions:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
# Verify port (usually 5432 or 5433)
```

### Debug Mode

Enable detailed logging:

```typescript
// In accommodations.tsx
console.log('Loading accommodations with filters:', filters);
console.log('Received accommodations:', result);
```

Check browser console (F12) for errors.

---

## Development

### Project Structure

```
backend/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── controllers/
│   │   ├── accommodationController.ts
│   │   ├── callRequestController.ts
│   │   └── reportingController.ts
│   ├── services/
│   │   ├── accommodationService.ts
│   │   ├── callRequestService.ts
│   │   └── reportingService.ts
│   ├── routes/
│   │   └── accommodations.ts
│   └── scripts/
│       └── seedAccommodations.ts
└── seed-accommodations.sql

frontend/
├── app/
│   ├── (tabs)/
│   │   ├── accommodations.tsx
│   │   └── accommodation-detail.tsx
│   └── (admin)/
│       ├── manage-accommodations.tsx
│       ├── create-accommodation.tsx
│       ├── edit-accommodation.tsx
│       ├── call-requests.tsx
│       ├── call-request-detail.tsx
│       └── accommodation-reports.tsx
└── src/
    ├── services/
    │   └── accommodationService.ts
    └── types/
        └── index.ts
```

### Adding New Features

#### 1. Add Database Field

```bash
# Edit prisma/schema.prisma
# Add field to Accommodation model

# Create migration
npx prisma migrate dev --name add_new_field

# Update TypeScript types
npx prisma generate
```

#### 2. Add API Endpoint

```typescript
// backend/src/controllers/accommodationController.ts
export const newEndpoint = async (req: Request, res: Response) => {
  // Implementation
};

// backend/src/routes/accommodations.ts
router.get('/new-endpoint', accommodationController.newEndpoint);
```

#### 3. Add Frontend Feature

```typescript
// frontend/src/services/accommodationService.ts
async newMethod() {
  const response = await api.get('/accommodations/new-endpoint');
  return response.data;
}

// Use in component
const data = await accommodationService.newMethod();
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

---

## Support & Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Database Schema](../backend/prisma/schema.prisma)
- [Seed Data](../backend/src/scripts/seedAccommodations.ts)

### Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# Seed data
cd backend && npm run seed:accommodations

# View database
cd backend && npx prisma studio

# Run migrations
cd backend && npx prisma migrate dev

# Test API
curl http://localhost:3000/api/accommodations
```

### Getting Help

1. Check browser console for errors (F12)
2. Check backend terminal for API errors
3. Verify environment variables
4. Ensure all services are running
5. Try clearing caches and restarting

---

## Changelog

### Version 1.0.0 (November 2025)
- ✅ Complete CRUD operations
- ✅ CRM system with 8-stage workflow
- ✅ Analytics and reporting
- ✅ Multi-type accommodation support
- ✅ Geographic search
- ✅ Review system
- ✅ Admin dashboard
- ✅ Seed data script

---

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Travel Encyclopedia**

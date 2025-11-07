# Design Document

## Overview

The Travel Encyclopedia is a cross-platform application built with a single codebase that deploys to web, Android, and iOS. The system uses a modern tech stack optimized for elegant UI/UX and seamless performance across all platforms. The architecture follows a client-server model with a RESTful API backend and a responsive frontend framework.

### Technology Stack

**Frontend (Cross-Platform):**
- **React Native with Expo** - Enables single codebase deployment to web, Android, and iOS
- **React Native Paper** - Material Design components for elegant UI
- **React Navigation** - Native navigation patterns
- **Expo Router** - File-based routing for web and mobile
- **NativeWind (Tailwind CSS)** - Utility-first styling with responsive design
- **React Native Reanimated** - Smooth animations and transitions
- **Expo Image** - Optimized image loading and caching

**Backend:**
- **Node.js with Express** - RESTful API server
- **PostgreSQL** - Relational database for structured data
- **Prisma ORM** - Type-safe database access
- **AWS S3 / Cloudinary** - Media storage for photos and videos
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time chat functionality

**Third-Party Integrations:**
- Configurable API adapters for booking services (hotels, flights, buses, trains, ships)
- Payment gateway integration (Stripe/Razorpay)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │   Web    │  │ Android  │  │        iOS           │  │
│  │ Browser  │  │   App    │  │        App           │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│         React Native with Expo (Single Codebase)        │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          │ WebSocket (Chat)
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│              (Express.js + JWT Auth)                     │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Business   │  │   Content    │  │   Booking    │
│    Logic     │  │  Management  │  │   Services   │
│   Services   │  │   Services   │  │   Adapter    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │   AWS S3 /   │  │  External    │  │
│  │   Database   │  │  Cloudinary  │  │  Booking     │  │
│  │              │  │  (Media)     │  │  APIs        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Application Layers

1. **Presentation Layer** - React Native components with platform-specific adaptations
2. **State Management** - React Context API with custom hooks for global state
3. **API Layer** - Axios-based HTTP client with interceptors for auth
4. **Business Logic Layer** - Express.js controllers and services
5. **Data Access Layer** - Prisma ORM with repository pattern
6. **External Integration Layer** - Adapter pattern for third-party APIs

## Components and Interfaces

### Frontend Components Structure

```
src/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── locations.tsx
│   │   ├── events.tsx
│   │   ├── packages.tsx
│   │   ├── accommodations.tsx
│   │   ├── community.tsx
│   │   ├── group-travel.tsx
│   │   └── plan-travel.tsx
│   ├── dashboard/                # Role-specific dashboards
│   │   ├── admin.tsx
│   │   ├── govt-dept.tsx
│   │   ├── tourist-guide.tsx
│   │   └── user.tsx
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── common/                   # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── locations/
│   │   ├── LocationCard.tsx
│   │   ├── LocationForm.tsx
│   │   └── LocationList.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   └── InterestButton.tsx
│   ├── packages/
│   │   ├── PackageCard.tsx
│   │   └── PackageForm.tsx
│   ├── accommodations/
│   │   ├── HotelCard.tsx
│   │   ├── RestaurantCard.tsx
│   │   └── ResortCard.tsx
│   ├── community/
│   │   ├── PostCard.tsx
│   │   ├── PostForm.tsx
│   │   ├── UserProfile.tsx
│   │   └── ChatInterface.tsx
│   ├── group-travel/
│   │   ├── GroupTravelCard.tsx
│   │   ├── BidForm.tsx
│   │   └── BidList.tsx
│   └── admin/
│       ├── ApprovalQueue.tsx
│       └── ContentReview.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useLocations.ts
│   ├── useEvents.ts
│   └── useChat.ts
├── services/                     # API service layer
│   ├── api.ts                    # Axios instance
│   ├── authService.ts
│   ├── locationService.ts
│   ├── eventService.ts
│   └── chatService.ts
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── types/                        # TypeScript types
│   └── index.ts
└── utils/                        # Utility functions
    ├── validation.ts
    └── formatters.ts
```

### Backend API Structure

```
server/
├── src/
│   ├── controllers/              # Request handlers
│   │   ├── authController.ts
│   │   ├── locationController.ts
│   │   ├── eventController.ts
│   │   ├── packageController.ts
│   │   ├── accommodationController.ts
│   │   ├── communityController.ts
│   │   ├── groupTravelController.ts
│   │   └── bookingController.ts
│   ├── services/                 # Business logic
│   │   ├── authService.ts
│   │   ├── contentService.ts
│   │   ├── approvalService.ts
│   │   ├── notificationService.ts
│   │   └── bookingAdapterService.ts
│   ├── middleware/               # Express middleware
│   │   ├── auth.ts
│   │   ├── roleCheck.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── routes/                   # API routes
│   │   ├── auth.ts
│   │   ├── locations.ts
│   │   ├── events.ts
│   │   ├── packages.ts
│   │   ├── accommodations.ts
│   │   ├── community.ts
│   │   ├── groupTravel.ts
│   │   └── bookings.ts
│   ├── models/                   # Prisma schema
│   │   └── schema.prisma
│   ├── utils/                    # Utility functions
│   │   ├── jwt.ts
│   │   ├── upload.ts
│   │   └── validators.ts
│   ├── config/                   # Configuration
│   │   ├── database.ts
│   │   └── apiAdapters.ts
│   └── index.ts                  # Server entry point
└── prisma/
    └── migrations/
```

### Key Interfaces

#### User Roles
```typescript
enum UserRole {
  SITE_ADMIN = 'SITE_ADMIN',
  GOVT_DEPARTMENT = 'GOVT_DEPARTMENT',
  TOURIST_GUIDE = 'TOURIST_GUIDE',
  USER = 'USER'
}

interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isCelebrity: boolean;
  isInfluencer: boolean;
  stateAssignment?: string; // For Govt Department
}
```

#### Location
```typescript
interface Location {
  id: string;
  country: string;
  state: string;
  area: string;
  description: string;
  images: string[];
  createdBy: string;
  createdByRole: UserRole;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Event
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  locationId?: string;
  customLocation?: CustomLocation;
  startDate: Date;
  endDate: Date;
  images: string[];
  hostId: string;
  hostRole: UserRole;
  approvalStatus: ApprovalStatus;
  interestedUsers: EventInterest[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventInterest {
  id: string;
  eventId: string;
  userId: string;
  contactShared: boolean;
  createdAt: Date;
}
```

#### Package
```typescript
interface Package {
  id: string;
  title: string;
  description: string;
  duration: number; // days
  locationId?: string;
  customLocation?: CustomLocation;
  itinerary: ItineraryDay[];
  price: number;
  images: string[];
  hostId: string;
  hostRole: UserRole;
  approvalStatus: ApprovalStatus;
  interestedUsers: PackageInterest[];
  createdAt: Date;
  updatedAt: Date;
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}
```

#### Accommodation
```typescript
enum AccommodationType {
  HOTEL = 'HOTEL',
  RESTAURANT = 'RESTAURANT',
  RESORT = 'RESORT'
}

interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  locationId: string;
  description: string;
  contactInfo: ContactInfo;
  images: string[];
  isGovtApproved: boolean;
  uploadedBy: string;
  uploadedByRole: UserRole;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
  address: string;
}
```

#### Community Post
```typescript
interface CommunityPost {
  id: string;
  userId: string;
  locationId?: string;
  customLocation?: CustomLocation;
  caption: string;
  mediaUrls: string[]; // photos and videos
  mediaTypes: MediaType[];
  likes: string[]; // user IDs
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date;
}
```

#### Group Travel
```typescript
interface GroupTravel {
  id: string;
  title: string;
  description: string;
  locationId?: string;
  customLocation?: CustomLocation;
  travelDate: Date;
  expiryDate: Date;
  creatorId: string;
  interestedUsers: string[];
  bids: TravelBid[];
  status: GroupTravelStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface TravelBid {
  id: string;
  groupTravelId: string;
  guideId: string;
  numberOfDays: number;
  dailyItinerary: DailyPlan[];
  accommodationDetails: string;
  foodDetails: string;
  transportDetails: string;
  totalCost: number;
  approvalStatus: BidApprovalStatus;
  canContact: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyPlan {
  day: number;
  activities: string;
  meals: string;
  accommodation: string;
}
```

#### Booking Configuration
```typescript
interface BookingAPIConfig {
  id: string;
  category: BookingCategory;
  provider: string; // e.g., "Booking.com", "MakeMyTrip"
  apiEndpoint: string;
  apiKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum BookingCategory {
  HOTEL = 'HOTEL',
  FLIGHT = 'FLIGHT',
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  SHIP = 'SHIP'
}
```

#### Approval System
```typescript
enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

interface ApprovalQueue {
  id: string;
  contentType: ContentType;
  contentId: string;
  submittedBy: string;
  submittedByRole: UserRole;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

enum ContentType {
  LOCATION = 'LOCATION',
  EVENT = 'EVENT',
  PACKAGE = 'PACKAGE',
  ACCOMMODATION = 'ACCOMMODATION'
}
```

## Data Models

### Database Schema (Prisma)

The database uses PostgreSQL with the following key tables:

- **users** - User accounts and authentication
- **user_profiles** - Extended user information
- **locations** - Geographic locations
- **events** - Travel events
- **event_interests** - User interest in events
- **packages** - Travel packages
- **package_interests** - User interest in packages
- **accommodations** - Hotels, restaurants, resorts
- **community_posts** - Social media posts
- **post_comments** - Comments on posts
- **post_likes** - Likes on posts
- **group_travels** - Group travel requests
- **travel_bids** - Tourist guide bids
- **follows** - User follow relationships
- **chat_conversations** - Chat threads
- **chat_messages** - Individual messages
- **chat_requests** - Pending chat approvals
- **booking_configs** - API configurations
- **approval_queue** - Content approval tracking
- **notifications** - User notifications

### Relationships

- User → UserProfile (1:1)
- User → Locations (1:N, as creator)
- User → Events (1:N, as host)
- User → Packages (1:N, as host)
- User → CommunityPosts (1:N)
- User → GroupTravels (1:N, as creator)
- Location → Events (1:N)
- Location → Packages (1:N)
- Location → Accommodations (1:N)
- Event → EventInterests (1:N)
- Package → PackageInterests (1:N)
- GroupTravel → TravelBids (1:N)
- User → TravelBids (1:N, as guide)
- User → Follows (M:N, self-referential)
- User → ChatConversations (M:N)

## Error Handling

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly error messages
   - Implement retry logic with exponential backoff
   - Show offline indicator when network is unavailable
   - Cache data locally for offline viewing

2. **Validation Errors**
   - Real-time form validation with clear error messages
   - Highlight invalid fields
   - Prevent submission until validation passes

3. **Authentication Errors**
   - Redirect to login on 401 Unauthorized
   - Refresh JWT tokens automatically
   - Clear session on 403 Forbidden

4. **API Errors**
   - Parse error responses and display appropriate messages
   - Log errors for debugging
   - Provide fallback UI for failed data loads

### Backend Error Handling

1. **Global Error Handler Middleware**
   ```typescript
   app.use((err, req, res, next) => {
     logger.error(err);
     res.status(err.status || 500).json({
       error: {
         message: err.message,
         code: err.code,
         ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
       }
     });
   });
   ```

2. **Custom Error Classes**
   - ValidationError (400)
   - UnauthorizedError (401)
   - ForbiddenError (403)
   - NotFoundError (404)
   - ConflictError (409)
   - InternalServerError (500)

3. **Database Error Handling**
   - Catch Prisma errors and convert to appropriate HTTP errors
   - Handle unique constraint violations
   - Manage transaction rollbacks

4. **Third-Party API Error Handling**
   - Wrap external API calls in try-catch
   - Implement circuit breaker pattern for failing services
   - Provide fallback responses when external services are down

## Testing Strategy

### Frontend Testing

1. **Unit Tests** (Jest + React Native Testing Library)
   - Test individual components in isolation
   - Test custom hooks
   - Test utility functions
   - Target: 70% code coverage

2. **Integration Tests**
   - Test component interactions
   - Test API service layer
   - Mock API responses

3. **E2E Tests** (Detox for mobile, Playwright for web)
   - Test critical user flows
   - Test authentication
   - Test content creation and approval workflows
   - Test booking flows

4. **Visual Regression Tests** (Storybook + Chromatic)
   - Ensure UI consistency across platforms
   - Catch unintended visual changes

### Backend Testing

1. **Unit Tests** (Jest)
   - Test service layer functions
   - Test utility functions
   - Test middleware
   - Target: 80% code coverage

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Use test database with seed data

3. **API Tests** (Supertest)
   - Test all REST endpoints
   - Test authentication and authorization
   - Test error responses

4. **Load Tests** (Artillery or k6)
   - Test API performance under load
   - Identify bottlenecks
   - Test concurrent user scenarios

### Testing Environments

- **Development** - Local testing with hot reload
- **Staging** - Pre-production testing with production-like data
- **Production** - Monitoring and error tracking (Sentry)

### CI/CD Pipeline

1. **On Pull Request**
   - Run linting (ESLint, Prettier)
   - Run unit tests
   - Run integration tests
   - Build for all platforms
   - Check bundle size

2. **On Merge to Main**
   - Run full test suite
   - Build production bundles
   - Deploy backend to staging
   - Deploy web app to staging
   - Generate preview builds for mobile

3. **On Release Tag**
   - Deploy backend to production
   - Deploy web app to production
   - Submit Android build to Google Play
   - Submit iOS build to App Store

## UI/UX Design Principles

### Design System

1. **Color Palette**
   - Primary: Travel-inspired blue (#2196F3)
   - Secondary: Warm orange (#FF9800)
   - Success: Green (#4CAF50)
   - Warning: Amber (#FFC107)
   - Error: Red (#F44336)
   - Neutral: Gray scale for text and backgrounds

2. **Typography**
   - Headings: Poppins (bold, modern)
   - Body: Inter (readable, clean)
   - Font sizes: Responsive scale (14px-32px)

3. **Spacing**
   - Base unit: 8px
   - Consistent padding and margins using multiples of 8

4. **Elevation**
   - Cards: Subtle shadows for depth
   - Modals: Higher elevation with backdrop
   - Floating action buttons: Prominent shadows

### Mobile-First Approach

1. **Touch Targets**
   - Minimum 44x44 points for all interactive elements
   - Adequate spacing between clickable items

2. **Navigation**
   - Bottom tab bar for primary navigation (mobile)
   - Drawer navigation for secondary options
   - Breadcrumbs for web

3. **Gestures**
   - Swipe to delete/archive
   - Pull to refresh
   - Pinch to zoom on images

4. **Performance**
   - Lazy load images and videos
   - Virtualized lists for long content
   - Skeleton screens during loading
   - Optimistic UI updates

### Platform-Specific Adaptations

1. **iOS**
   - Use iOS-style navigation (back button, swipe gestures)
   - Follow iOS typography and spacing
   - Use iOS-native date/time pickers

2. **Android**
   - Material Design components
   - Floating action buttons
   - Android-native date/time pickers
   - Bottom sheets for actions

3. **Web**
   - Responsive breakpoints (mobile, tablet, desktop)
   - Hover states for interactive elements
   - Keyboard navigation support
   - Accessible focus indicators

### Accessibility

1. **Screen Reader Support**
   - Semantic HTML elements
   - ARIA labels for custom components
   - Descriptive alt text for images

2. **Keyboard Navigation**
   - Tab order follows visual flow
   - Focus indicators visible
   - Keyboard shortcuts for common actions

3. **Color Contrast**
   - WCAG AA compliance (4.5:1 for text)
   - Don't rely solely on color for information

4. **Text Scaling**
   - Support dynamic type sizes
   - Layouts adapt to larger text

## Security Considerations

1. **Authentication**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Secure password hashing (bcrypt)

2. **Authorization**
   - Role-based access control (RBAC)
   - Verify permissions on every request
   - Prevent privilege escalation

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Sanitize user inputs
   - Prevent SQL injection (Prisma ORM)
   - Prevent XSS attacks

4. **API Security**
   - Rate limiting
   - CORS configuration
   - API key rotation for third-party services
   - Input validation on all endpoints

5. **Mobile Security**
   - Secure storage for tokens (Expo SecureStore)
   - Certificate pinning for API calls
   - Obfuscate sensitive code

## Performance Optimization

1. **Frontend**
   - Code splitting and lazy loading
   - Image optimization (WebP, compression)
   - Caching strategies (React Query)
   - Minimize bundle size
   - Use production builds

2. **Backend**
   - Database indexing
   - Query optimization
   - Caching (Redis for frequently accessed data)
   - Connection pooling
   - Horizontal scaling with load balancer

3. **Media Handling**
   - CDN for static assets
   - Image resizing and compression
   - Video transcoding for optimal streaming
   - Progressive image loading

## Deployment Architecture

### Backend Deployment
- **Platform**: AWS EC2 / DigitalOcean / Heroku
- **Database**: AWS RDS PostgreSQL / Managed PostgreSQL
- **Media Storage**: AWS S3 / Cloudinary
- **Load Balancer**: AWS ALB / Nginx
- **Monitoring**: CloudWatch / Datadog

### Frontend Deployment
- **Web**: Vercel / Netlify / AWS S3 + CloudFront
- **Android**: Google Play Store (via EAS Build)
- **iOS**: Apple App Store (via EAS Build)

### CI/CD
- **GitHub Actions** for automated builds and deployments
- **Expo Application Services (EAS)** for mobile builds

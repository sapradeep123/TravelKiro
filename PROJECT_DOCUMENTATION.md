# Butterfliy Travel Encyclopedia - Complete Project Documentation

**Last Updated**: November 18, 2025  
**Version**: 1.0  
**Repository**: https://github.com/sapradeep123/Butterfliy_Kiro.git

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Features Implemented](#features-implemented)
4. [Site Settings & Customization](#site-settings--customization)
5. [Group Travel Coordination](#group-travel-coordination)
6. [Messaging System](#messaging-system)
7. [Image Upload](#image-upload)
8. [Login Page Customization](#login-page-customization)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)
11. [API Reference](#api-reference)
12. [Security](#security)

---

## Project Overview

Butterfliy Travel Encyclopedia is a comprehensive travel platform that connects travelers, tourist guides, and government departments. The platform enables users to discover destinations, plan group travels, connect with guides, and share experiences.

### Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Frontend:**
- React Native (Expo)
- TypeScript
- Expo Router
- React Native Paper

### Key Features
- ✅ User authentication & authorization
- ✅ Role-based access control (User, Tourist Guide, Govt Dept, Site Admin)
- ✅ Group travel coordination with bidding system
- ✅ Real-time messaging
- ✅ Photo albums & community posts
- ✅ Site customization for administrators
- ✅ Legal pages (Terms & Privacy Policy)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sapradeep123/Butterfliy_Kiro.git
cd Butterfliy_Kiro
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Setup database:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

5. **Initialize site settings (optional):**
```bash
npx tsx src/scripts/init-site-settings.ts
```

### Running the Application

**Backend:**
```bash
cd backend
npm run dev
```
Server runs on: http://localhost:3000

**Frontend:**
```bash
cd frontend
npx expo start --port 8082
```
App runs on: http://localhost:8082

### Test Credentials

**Site Administrator:**
- Email: `admin@travelencyclopedia.com`
- Password: `admin123`

**Regular User:**
- Email: `user@travelencyclopedia.com`
- Password: `password123`

**Tourist Guide:**
- Email: `guide@butterfliy.com`
- Password: `password123`

---

## Features Implemented

### 1. Site Settings Management

Complete admin customization system allowing site administrators to configure:
- Site name and title
- Logo and favicon
- Welcome messages for login page
- Terms & Conditions
- Privacy Policy

**Access:** Admin Settings page (SITE_ADMIN role only)

**Files:**
- Backend: `backend/src/services/siteSettingsService.ts`
- Frontend: `frontend/app/admin-settings.tsx`

### 2. Group Travel Coordination

User-initiated travel proposals with tourist guide bidding system.

**Key Features:**
- Create group travel proposals
- Express interest in travels
- Submit structured bids with daily itineraries
- Approve contact for guides
- Automatic deactivation after travel date
- Bid visibility control (only creator and interested users)
- Date validation (5-day minimum before travel)

**Screens:**
- Group Travel List: `frontend/app/(tabs)/group-travel.tsx`
- Create Travel: `frontend/app/create-group-travel.tsx`
- Travel Details: `frontend/app/group-travel-detail.tsx`
- Submit Bid: `frontend/app/submit-bid.tsx`
- My Travels: `frontend/app/my-group-travels.tsx`
- My Bids: `frontend/app/my-bids.tsx`

### 3. Messaging System

Real-time one-on-one messaging between users.

**Features:**
- Send/receive messages
- Conversation list
- Message history
- Chat requests (optional)
- User profiles integration

**Screens:**
- Messages List: `frontend/app/(tabs)/messages.tsx`
- Chat: `frontend/app/chat.tsx`

### 4. Image Upload

Secure file upload system for logos and favicons.

**Features:**
- Direct image upload (no URL needed)
- Image preview and cropping
- File validation (5MB max, images only)
- Authentication required
- SITE_ADMIN authorization

**Endpoint:** `POST /api/upload`

### 5. Legal Pages

Professional legal content pages accessible from footer.

**Pages:**
- Terms & Conditions: `frontend/app/terms.tsx`
- Privacy Policy: `frontend/app/privacy.tsx`
- Footer Component: `frontend/components/Footer.tsx`

---

## Site Settings & Customization

### Admin Settings Interface

The admin settings page provides a tabbed interface with three sections:

#### General Tab
- **Site Name**: Name displayed next to logo
- **Site Title**: Browser tab title
- **Logo Upload**: Direct image upload with preview
- **Favicon Upload**: Direct image upload with preview

#### Login Page Tab
- **Welcome Message**: Main heading on login page
- **Welcome Subtitle**: Subtitle text below heading
- Info: Logo from General tab is used on login page

#### Legal Tab
- **Terms & Conditions**: Full legal text editor
- **Privacy Policy**: Full privacy policy text editor

### How to Customize

1. Login as SITE_ADMIN
2. Navigate to Admin Settings
3. Update desired fields
4. Click "Save Settings"
5. Changes apply immediately

### API Endpoints

**GET /api/site-settings** (Public)
- Returns current site settings

**PUT /api/site-settings** (SITE_ADMIN only)
- Updates site settings
- Fields: siteName, siteTitle, logoUrl, faviconUrl, welcomeMessage, welcomeSubtitle, termsAndConditions, privacyPolicy

---

## Group Travel Coordination

### User Flow

**For Travelers:**
1. Browse available group travels
2. Express interest in a travel
3. View bids from tourist guides
4. Approve contact for preferred guide
5. Communicate with guide

**For Tourist Guides:**
1. Browse group travel proposals
2. Submit detailed bid with itinerary
3. Wait for approval
4. Contact creator after approval

### Creating Group Travel

**Requirements:**
- Travel date must be at least 5 days from posting
- Expiry date must be before travel date
- All fields required: title, description, location, dates

**Form Fields:**
- Title
- Description
- Country, State, Area
- Travel Date
- Expiry Date

### Submitting Bids

**Bid Template Includes:**
- Number of days
- Accommodation details
- Food/meal plans
- Transportation details
- Total cost
- Daily itinerary (day-by-day breakdown)

**Daily Itinerary Fields:**
- Activities for the day
- Meals included
- Accommodation for the night

### Bid Visibility Rules

**Who Can See Bids:**
- ✅ Group travel creator (always)
- ✅ Users who expressed interest
- ❌ Other users (bids are hidden)

### Automatic Deactivation

- System automatically deactivates group travels after travel date passes
- Status changes to "COMPLETED"
- No further actions allowed
- Runs on every fetch operation

### API Endpoints

```
GET    /api/group-travel              - Get all group travels
GET    /api/group-travel/my-travels   - Get user's group travels
GET    /api/group-travel/my-bids      - Get guide's bids
GET    /api/group-travel/:id          - Get group travel details
POST   /api/group-travel              - Create group travel
POST   /api/group-travel/:id/interest - Express interest
POST   /api/group-travel/:id/bid      - Submit bid
POST   /api/group-travel/bids/:bidId/approve-contact - Approve contact
PUT    /api/group-travel/:id/close    - Close group travel
```

---

## Messaging System

### Features

- One-on-one conversations
- Message history with pagination
- Real-time message display
- User profile integration
- Chat requests (optional)

### How to Use

**Starting a Chat:**
1. Visit user profile
2. Click "Message" button
3. Chat screen opens
4. Start typing and send messages

**Viewing Conversations:**
1. Navigate to Messages tab
2. See list of all conversations
3. Click on conversation to open
4. View message history

### API Endpoints

```
GET    /api/messaging/conversations                      - Get all conversations
GET    /api/messaging/conversations/:userId              - Get/create conversation
GET    /api/messaging/conversations/:id/messages         - Get messages
POST   /api/messaging/conversations/:id/messages         - Send message
DELETE /api/messaging/conversations/:id                  - Delete conversation
POST   /api/messaging/requests                           - Send chat request
GET    /api/messaging/requests                           - Get pending requests
POST   /api/messaging/requests/:id/approve               - Approve request
POST   /api/messaging/requests/:id/reject                - Reject request
```

---

## Image Upload

### Features

- Direct file upload (no URL input)
- Image preview before saving
- Aspect ratio cropping (4:1 for logo, 1:1 for favicon)
- File size validation (5MB max)
- File type validation (jpeg, jpg, png, gif, ico, svg)
- Secure authentication
- Unique filename generation

### How to Upload

1. Go to Admin Settings → General tab
2. Click "Upload Logo" or "Upload Favicon"
3. Select image from device
4. Image is cropped automatically
5. Preview appears immediately
6. Click "Save Settings" to persist

### Technical Details

**Backend:**
- Route: `POST /api/upload`
- Authentication: Required (Bearer token)
- Authorization: SITE_ADMIN only
- Storage: `backend/uploads/` directory
- Serving: Static files at `/uploads/` endpoint

**Frontend:**
- Library: `expo-image-picker`
- Method: FormData with multipart/form-data
- Token: Injected from SecureStore/localStorage

### Security

- ✅ Authentication required
- ✅ SITE_ADMIN authorization
- ✅ File type validation
- ✅ File size limit
- ✅ Unique filenames prevent overwrites
- ✅ CORS properly configured

---

## Login Page Customization

### Dynamic Elements

The login page now loads settings from the database:

- **Logo**: Displays uploaded logo or default emoji
- **Welcome Message**: Customizable heading (default: "Welcome Back")
- **Welcome Subtitle**: Customizable text (default: "Sign in to explore the world")

### How It Works

1. Login page loads
2. Fetches site settings from API
3. Displays custom logo and messages
4. Falls back to defaults if loading fails

### Customization Steps

1. Login as SITE_ADMIN
2. Go to Admin Settings → Login Page tab
3. Update welcome message and subtitle
4. Go to General tab to upload logo
5. Click "Save Settings"
6. Logout and view login page to see changes

---

## Testing Guide

### Backend Testing

**Test Site Settings:**
```bash
cd backend
node test-site-settings.js
```

**Test Image Upload:**
```bash
node test-upload-simple.js
```

**Test Group Travel:**
```bash
node test-group-travel.js
```

### Frontend Testing

#### Site Settings
1. Login as admin
2. Navigate to Admin Settings
3. Test all 3 tabs
4. Upload images
5. Save settings
6. Verify changes persist

#### Group Travel
1. Login as regular user
2. Create new group travel
3. Express interest in existing travel
4. View bids
5. Login as guide
6. Submit bid
7. View "My Bids"

#### Messaging
1. Login as user A
2. Visit user B's profile
3. Click "Message"
4. Send messages
5. Login as user B (different browser)
6. Check Messages tab
7. Reply to messages

#### Image Upload
1. Login as admin
2. Go to Admin Settings → General
3. Upload logo
4. Upload favicon
5. Verify previews appear
6. Save settings
7. Check login page for logo

### Test Scenarios

**Scenario 1: Site Customization**
- Update site name and title
- Upload custom logo
- Customize welcome messages
- Update legal content
- Verify all changes persist

**Scenario 2: Group Travel Flow**
- Create group travel (validate dates)
- Express interest
- Submit bid as guide
- Approve contact as creator
- Verify bid visibility

**Scenario 3: Messaging**
- Start conversation
- Send multiple messages
- Check conversation list
- Delete conversation
- Verify messages persist

---

## Troubleshooting

### Common Issues

#### CORS Errors
**Problem:** Login fails with CORS policy error  
**Solution:** Verify `backend/.env` includes port 8082 in CORS_ORIGIN

#### TypeScript Errors
**Problem:** Property 'siteSettings' does not exist on PrismaClient  
**Solution:** 
```bash
cd backend
npx prisma generate
```
Restart VS Code window to refresh TypeScript server

#### Upload Fails
**Problem:** Image upload returns error  
**Solution:**
- Check if logged in as SITE_ADMIN
- Verify file size under 5MB
- Check file type is supported
- Ensure backend is running

#### Settings Not Saving
**Problem:** Changes don't persist  
**Solution:**
- Check browser console for errors
- Verify backend logs
- Hard refresh page (Ctrl+Shift+R)
- Clear browser cache

#### Navigation Errors
**Problem:** "Uncaught Error" on navigation  
**Solution:**
- Check router.canGoBack() before using router.back()
- Use router.replace() for fallback navigation
- Verify route parameters are correct

### Debug Steps

1. **Check Browser Console** (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests
   - Verify API responses

2. **Check Backend Logs**
   - Look for error messages
   - Verify database queries
   - Check authentication

3. **Verify Services Running**
   - Backend: http://localhost:3000/health
   - Frontend: http://localhost:8082

4. **Clear Cache**
   - Browser cache (Ctrl+Shift+Delete)
   - Expo cache (`npx expo start --clear`)

---

## API Reference

### Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

### Site Settings

**GET /api/site-settings**
- Public endpoint
- Returns current site settings

**PUT /api/site-settings**
- Protected (SITE_ADMIN only)
- Updates site settings
- Body: { siteName, siteTitle, logoUrl, faviconUrl, welcomeMessage, welcomeSubtitle, termsAndConditions, privacyPolicy }

### Group Travel

**GET /api/group-travel**
- Public endpoint
- Returns all open group travels
- Auto-deactivates expired travels

**POST /api/group-travel**
- Protected endpoint
- Creates new group travel
- Validates dates (5-day minimum)

**GET /api/group-travel/:id**
- Public endpoint
- Returns group travel details
- Bid visibility based on user context

**POST /api/group-travel/:id/interest**
- Protected endpoint
- Express interest in group travel

**POST /api/group-travel/:id/bid**
- Protected endpoint (TOURIST_GUIDE only)
- Submit bid with itinerary

**POST /api/group-travel/bids/:bidId/approve-contact**
- Protected endpoint (creator only)
- Approve guide to contact

### Messaging

**GET /api/messaging/conversations**
- Protected endpoint
- Returns user's conversations

**POST /api/messaging/conversations/:id/messages**
- Protected endpoint
- Send message in conversation

**GET /api/messaging/conversations/:id/messages**
- Protected endpoint
- Get messages (paginated, 50 per page)

### Upload

**POST /api/upload**
- Protected endpoint (SITE_ADMIN only)
- Upload image file
- Returns file URL

---

## Security

### Authentication & Authorization

**JWT Tokens:**
- Access token (1 hour expiry)
- Refresh token (7 days expiry)
- Stored in SecureStore (mobile) or localStorage (web)

**Role-Based Access:**
- USER: Basic access
- TOURIST_GUIDE: Can submit bids
- GOVT_DEPARTMENT: Government features
- SITE_ADMIN: Full admin access

### Data Protection

**Input Validation:**
- All user inputs validated
- SQL injection protection (Prisma)
- XSS prevention (sanitized inputs)

**File Upload Security:**
- File type validation
- File size limits
- Unique filenames
- Secure storage location

**API Security:**
- Authentication required
- Authorization checks
- Rate limiting (recommended)
- CORS properly configured

### Best Practices

1. **Never commit sensitive data**
   - Use environment variables
   - Keep .env files out of git

2. **Validate all inputs**
   - Frontend validation
   - Backend validation
   - Database constraints

3. **Use HTTPS in production**
   - SSL/TLS certificates
   - Secure cookies
   - HSTS headers

4. **Regular updates**
   - Keep dependencies updated
   - Security patches
   - Database backups

---

## Database Schema

### Key Models

**User**
- id, email, password, role
- profile (name, phone, bio, avatar)

**SiteSettings**
- siteName, siteTitle
- logoUrl, faviconUrl
- welcomeMessage, welcomeSubtitle
- termsAndConditions, privacyPolicy

**GroupTravel**
- title, description
- country, state, area
- travelDate, expiryDate
- status, createdBy

**TravelBid**
- groupTravelId, guideId
- numberOfDays, totalCost
- accommodation, food, transport
- dailyPlans, canContact

**ChatConversation**
- user1Id, user2Id
- lastMessageAt

**ChatMessage**
- conversationId, senderId
- message, createdAt

---

## Deployment

### Environment Variables

**Backend (.env):**
```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
PORT=3000
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend (.env):**
```
EXPO_PUBLIC_API_URL="https://api.yourdomain.com"
EXPO_PUBLIC_WS_URL="wss://api.yourdomain.com"
```

### Production Checklist

- [ ] Update environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure file storage (S3/Cloudinary)
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test all features
- [ ] Security audit

---

## Support & Contribution

### Getting Help

1. Check this documentation
2. Review troubleshooting section
3. Check GitHub issues
4. Contact development team

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## License

[Add your license information here]

---

## Changelog

### Version 1.0 (November 18, 2025)
- ✅ Site settings management system
- ✅ Login page customization
- ✅ Image upload functionality
- ✅ Group travel coordination
- ✅ Messaging system
- ✅ Legal pages (Terms & Privacy)
- ✅ Enhanced UI/UX
- ✅ Complete documentation

---

**End of Documentation**

For the latest updates, visit: https://github.com/sapradeep123/Butterfliy_Kiro.git

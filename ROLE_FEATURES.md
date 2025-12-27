# Role-Based Features and Functionalities

This document outlines all features and functionalities available for each user role in the Travel Encyclopedia application.

## User Roles

1. **SITE_ADMIN** - Super Administrator
2. **GOVT_DEPARTMENT** - Government Tourism Department
3. **TOURIST_GUIDE** - Tourist Guide
4. **USER** - Regular User

---

## USER Role Features

### Core Features (Available to all authenticated users)
- ✅ **Locations** - Browse and view tourist destinations
- ✅ **Community** - View and create posts, interact with community
- ✅ **Messages** - Send and receive messages with other users
- ✅ **Profile** - View and edit personal profile

### Group Travel Features
- ✅ **Create Group Travel** - Create group travel proposals
- ✅ **Express Interest** - Show interest in group travels
- ✅ **View Group Travels** - Browse all available group travels
- ✅ **My Group Travels** - View travels you created or expressed interest in
- ✅ **Approve Guide Contact** - Approve guides to contact you after bid submission

### Events Features
- ✅ **Browse Events** - View all events
- ✅ **Event Details** - View detailed event information
- ✅ **Express Interest** - Show interest in events (shares contact info)

### Packages Features
- ✅ **Browse Packages** - View all travel packages
- ✅ **Package Details** - View detailed package information
- ✅ **Express Interest** - Show interest in packages (shares contact info)

### Accommodations Features
- ✅ **Browse Accommodations** - View hotels, resorts, restaurants
- ✅ **Accommodation Details** - View detailed accommodation information
- ✅ **Search Accommodations** - Search by location, type, etc.

### Community Features
- ✅ **Create Posts** - Share travel experiences, photos
- ✅ **View Posts** - Browse community feed
- ✅ **Like/Comment** - Interact with posts
- ✅ **User Profiles** - View other user profiles
- ✅ **Follow Users** - Follow other travelers

### Restrictions
- ❌ Cannot access admin dashboard
- ❌ Cannot upload locations
- ❌ Cannot create packages
- ❌ Cannot submit bids for group travels
- ❌ Cannot manage accommodations

---

## TOURIST_GUIDE Role Features

### All USER Features Plus:

### Group Travel Features
- ✅ **Submit Bids** - Submit structured bids for group travels
- ✅ **My Bids** - View all bids you've submitted
- ✅ **Bid Management** - Track bid status and approvals
- ✅ **Contact Users** - Contact users after bid approval

### Packages Features
- ✅ **Create Packages** - Create and manage travel packages
- ✅ **Manage My Packages** - Edit and update your packages
- ✅ **View Package Interest** - See who expressed interest in your packages
- ✅ **Package Callbacks** - Manage callback requests for your packages

### Events Features
- ✅ **Create Events** - Create and manage events
- ✅ **Manage My Events** - Edit and update your events

### Accommodations Features
- ✅ **Create Accommodations** - Add hotels, resorts, restaurants
- ✅ **Manage My Accommodations** - Edit and manage your properties
- ✅ **CRM Dashboard** - Manage call requests and leads for your accommodations
- ✅ **Accommodation Reports** - View analytics for your properties

### Restrictions
- ❌ Cannot access admin dashboard
- ❌ Cannot upload locations (unless also GOVT_DEPARTMENT)
- ❌ Cannot approve content
- ❌ Cannot manage all users

---

## SITE_ADMIN Role Features

### All Features Plus:

### Admin Dashboard
- ✅ **User Management** - Manage all users, reset passwords
- ✅ **Content Approvals** - Approve/reject pending content
- ✅ **Manage All Locations** - View, edit, delete any location
- ✅ **Manage All Events** - View, edit, delete any event
- ✅ **Manage All Packages** - View, edit, delete any package
- ✅ **Manage All Accommodations** - View, edit, delete any accommodation
- ✅ **Event Types Management** - Manage event categories
- ✅ **Site Settings** - Configure site name, logo, terms, etc.
- ✅ **Analytics & Reports** - View platform-wide analytics

### Content Management
- ✅ **Upload Locations** - Add new tourist destinations
- ✅ **Approve Content** - Approve locations, events, packages
- ✅ **Edit Any Content** - Full edit access to all content

---

## GOVT_DEPARTMENT Role Features

### All USER Features Plus:

### Content Management
- ✅ **Upload Locations** - Add tourist destinations for their state
- ✅ **Create Events** - Create and manage events
- ✅ **Create Packages** - Create and manage travel packages
- ✅ **Create Accommodations** - Add hotels, resorts, restaurants
- ✅ **Manage My Content** - Edit content they created
- ✅ **CRM Dashboard** - Manage call requests for their accommodations

### Restrictions
- ❌ Cannot access admin dashboard (full)
- ❌ Cannot approve content (only SITE_ADMIN can)
- ❌ Cannot manage all users
- ❌ Cannot manage event types

---

## Test Credentials

### Admin
- Email: `admin@travelencyclopedia.com`
- Password: `admin123`
- Role: `SITE_ADMIN`

### User
- Email: `user@example.com`
- Password: `user123`
- Role: `USER`

### Guide
- Email: `guide@example.com`
- Password: `guide123`
- Role: `TOURIST_GUIDE`

---

## Navigation Flow

### After Login:
- **All Roles**: Redirected to `/(tabs)/locations` (Explore tab)
- **SITE_ADMIN & GOVT_DEPARTMENT**: Can access `/(admin)/dashboard` from profile
- **TOURIST_GUIDE**: Can access guide-specific features from profile and group travel pages
- **USER**: Can access all user features from tabs and profile

### Tab Navigation (Available to all authenticated users):
1. **Explore** - Locations
2. **Community** - Posts and social features
3. **Messages** - Direct messaging
4. **Profile** - User profile and settings

---

## Feature Access Matrix

| Feature | USER | TOURIST_GUIDE | GOVT_DEPARTMENT | SITE_ADMIN |
|---------|------|--------------|-----------------|------------|
| Browse Locations | ✅ | ✅ | ✅ | ✅ |
| Upload Locations | ❌ | ❌ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ | ✅ |
| Create Packages | ❌ | ✅ | ✅ | ✅ |
| Create Accommodations | ❌ | ✅ | ✅ | ✅ |
| Create Group Travel | ✅ | ✅ | ✅ | ✅ |
| Submit Bids (Guide) | ❌ | ✅ | ❌ | ❌ |
| Approve Content | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Site Settings | ❌ | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |

---

## Troubleshooting

If you cannot login as USER or TOURIST_GUIDE:

1. **Verify credentials** - Use the exact email and password from test credentials
2. **Check backend** - Ensure backend is running on port 5500
3. **Check frontend** - Ensure frontend is running and using HTTPS API URL
4. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
5. **Check console** - Look for any error messages in browser console

If login succeeds but features don't work:

1. **Check role** - Verify your role in the profile page
2. **Check permissions** - Some features require specific roles
3. **Check network** - Ensure API calls are successful (check Network tab)
4. **Check authentication** - Ensure tokens are being stored correctly


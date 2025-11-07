# Travel Encyclopedia API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Auth Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" // Optional: USER (default), TOURIST_GUIDE, GOVT_DEPARTMENT, SITE_ADMIN
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

## Users

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "bio": "Travel enthusiast",
  "isCelebrity": false,
  "isInfluencer": false
}
```

#### Get User by ID
```http
GET /users/:userId
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)
```http
GET /users/all?role=TOURIST_GUIDE
Authorization: Bearer <admin_token>
```

## Admin

#### Create Credentials (Admin Only)
```http
POST /admin/create-credentials
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "guide@example.com",
  "password": "temp123",
  "name": "Guide Name",
  "role": "TOURIST_GUIDE", // or GOVT_DEPARTMENT
  "phone": "+1234567890",
  "stateAssignment": "Kerala" // For GOVT_DEPARTMENT
}
```

#### Delete User (Admin Only)
```http
DELETE /admin/users/:userId
Authorization: Bearer <admin_token>
```

## Locations

#### Get All Locations
```http
GET /locations?country=India&state=Kerala&approvalStatus=APPROVED
```

#### Search Locations
```http
GET /locations/search?q=munnar
```

#### Get Location by ID
```http
GET /locations/:id
```

#### Create Location
```http
POST /locations
Authorization: Bearer <token>
Content-Type: application/json

{
  "country": "India",
  "state": "Kerala",
  "area": "Munnar",
  "description": "Beautiful hill station...",
  "images": ["https://example.com/image1.jpg"]
}
```

#### Update Location
```http
PUT /locations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description..."
}
```

#### Delete Location
```http
DELETE /locations/:id
Authorization: Bearer <token>
```

## Events

#### Get All Events
```http
GET /events?locationId=<location_id>&approvalStatus=APPROVED
```

#### Get Event by ID
```http
GET /events/:id
```

#### Create Event
```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Kerala Boat Race",
  "description": "Traditional boat race...",
  "locationId": "<location_id>",
  "startDate": "2024-09-01T10:00:00Z",
  "endDate": "2024-09-03T18:00:00Z",
  "images": ["https://example.com/event.jpg"]
}
```

#### Express Interest in Event
```http
POST /events/:id/interest
Authorization: Bearer <token>
```

#### Delete Event
```http
DELETE /events/:id
Authorization: Bearer <token>
```

## Packages

#### Get All Packages
```http
GET /packages?locationId=<location_id>&approvalStatus=APPROVED
```

#### Get Package by ID
```http
GET /packages/:id
```

#### Create Package
```http
POST /packages
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Kerala Backwaters - 3 Days",
  "description": "Explore the backwaters...",
  "duration": 3,
  "locationId": "<location_id>",
  "price": 15000,
  "images": ["https://example.com/package.jpg"],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival",
      "description": "Check-in and cruise",
      "activities": ["Houseboat boarding", "Lunch", "Cruise"]
    }
  ]
}
```

#### Express Interest in Package
```http
POST /packages/:id/interest
Authorization: Bearer <token>
```

#### Delete Package
```http
DELETE /packages/:id
Authorization: Bearer <token>
```

## Accommodations

#### Get All Accommodations
```http
GET /accommodations?locationId=<location_id>&type=HOTEL&approvalStatus=APPROVED
```

#### Get Accommodation by ID
```http
GET /accommodations/:id
```

#### Create Accommodation
```http
POST /accommodations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Taj Gateway Hotel",
  "type": "HOTEL", // HOTEL, RESTAURANT, RESORT
  "locationId": "<location_id>",
  "description": "Luxury hotel...",
  "contactPhone": "+91-1234567890",
  "contactEmail": "info@hotel.com",
  "contactWebsite": "https://hotel.com",
  "contactAddress": "123 Main St, City",
  "images": ["https://example.com/hotel.jpg"],
  "isGovtApproved": true
}
```

#### Update Accommodation
```http
PUT /accommodations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description..."
}
```

#### Delete Accommodation
```http
DELETE /accommodations/:id
Authorization: Bearer <token>
```

## Community

#### Get Feed
```http
GET /community/feed?following=true
Authorization: Bearer <token> (optional)
```

#### Get Post by ID
```http
GET /community/posts/:id
```

#### Create Post
```http
POST /community/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "locationId": "<location_id>",
  "caption": "Amazing view! 🌄",
  "mediaUrls": ["https://example.com/photo.jpg"],
  "mediaTypes": ["IMAGE"] // IMAGE or VIDEO
}
```

#### Like/Unlike Post
```http
POST /community/posts/:id/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /community/posts/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Great photo!"
}
```

#### Delete Post
```http
DELETE /community/posts/:id
Authorization: Bearer <token>
```

#### Follow User
```http
POST /community/follow/:userId
Authorization: Bearer <token>
```

#### Unfollow User
```http
DELETE /community/follow/:userId
Authorization: Bearer <token>
```

#### Get Followers
```http
GET /community/followers/:userId
```

#### Get Following
```http
GET /community/following/:userId
```

## Group Travel

#### Get All Group Travels
```http
GET /group-travel?status=OPEN
```

#### Get Group Travel by ID
```http
GET /group-travel/:id
```

#### Create Group Travel
```http
POST /group-travel
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Rajasthan Heritage Tour",
  "description": "Looking for 10 people...",
  "locationId": "<location_id>",
  "travelDate": "2024-12-15T00:00:00Z",
  "expiryDate": "2024-11-30T00:00:00Z"
}
```

#### Express Interest
```http
POST /group-travel/:id/interest
Authorization: Bearer <token>
```

#### Submit Bid (Tourist Guide Only)
```http
POST /group-travel/:id/bid
Authorization: Bearer <guide_token>
Content-Type: application/json

{
  "numberOfDays": 7,
  "accommodationDetails": "3-star hotels...",
  "foodDetails": "All meals included...",
  "transportDetails": "AC bus...",
  "totalCost": 50000,
  "dailyItinerary": [
    {
      "day": 1,
      "activities": "Arrival and city tour",
      "meals": "Lunch and dinner",
      "accommodation": "Hotel XYZ"
    }
  ]
}
```

#### Approve Bid Contact
```http
POST /group-travel/bids/:bidId/approve-contact
Authorization: Bearer <token>
```

#### Close Group Travel
```http
PUT /group-travel/:id/close
Authorization: Bearer <token>
```

## Approvals (Admin Only)

#### Get Pending Approvals
```http
GET /approvals/pending
Authorization: Bearer <admin_token>
```

#### Get Approval History
```http
GET /approvals/history
Authorization: Bearer <admin_token>
```

#### Approve Content
```http
POST /approvals/:approvalId/approve
Authorization: Bearer <admin_token>
```

#### Reject Content
```http
POST /approvals/:approvalId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Content does not meet quality standards"
}
```

## Notifications

#### Get User Notifications
```http
GET /notifications?unreadOnly=true
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

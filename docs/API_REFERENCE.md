# API Reference

Base URL: `http://localhost:3000`

## Authentication

### Register
```
POST /auth/register
Body: { email, password, role, name, phone }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }
```

### Refresh Token
```
POST /auth/refresh
Body: { refreshToken }
```

## Locations

### Get All Locations
```
GET /locations
Query: ?country=&state=&area=&approvalStatus=
```

### Get Location by ID
```
GET /locations/:id
```

### Create Location
```
POST /locations (Auth required)
Body: { country, state, area, description, images, ... }
```

## Events

### Get All Events
```
GET /events
Query: ?locationId=&approvalStatus=
```

### Get Event by ID
```
GET /events/:id
```

### Create Event
```
POST /events (Auth required)
Body: { title, description, startDate, endDate, ... }
```

### Request Callback
```
POST /events/:id/callback-request
Body: { name, phone, email, message }
```

## Packages

### Get All Packages
```
GET /packages
Query: ?locationId=&approvalStatus=
```

### Get Package by ID
```
GET /packages/:id
```

### Create Package
```
POST /packages (Auth required)
Body: { title, description, duration, price, itinerary, ... }
```

### Request Callback
```
POST /packages/:id/callback-request
Body: { name, phone, email, message }
```

## Community

### Get All Posts
```
GET /community
Query: ?locationId=
```

### Create Post
```
POST /community (Auth required)
Body: { caption, mediaUrls, mediaTypes, locationId }
```

### Like Post
```
POST /community/:id/like (Auth required)
```

### Add Comment
```
POST /community/:id/comment (Auth required)
Body: { text }
```

## Admin

### Get Approval Queue
```
GET /admin/approvals (Admin auth required)
Query: ?contentType=&status=
```

### Approve Content
```
POST /admin/approvals/:id/approve (Admin auth required)
```

### Reject Content
```
POST /admin/approvals/:id/reject (Admin auth required)
Body: { reason }
```

### Get All Users
```
GET /admin/users (Admin auth required)
Query: ?role=
```

## Authentication Headers
All authenticated requests require:
```
Authorization: Bearer <accessToken>
```

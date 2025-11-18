# Group Travel Coordination Feature

## Overview
The Group Travel Coordination feature allows users to propose group travel plans and receive bids from Tourist Guides, enabling cost-effective and organized group trips.

## Features Implemented

### 1. Group Travel Request Creation
- **User Story**: As a User, I want to propose group travel and receive bids from Tourist Guides
- **Requirements**:
  - ✅ Expiry date required for expressing interest
  - ✅ Minimum 5 days enforcement from posting time before travel date
  - ✅ Location details (country, state, area)
  - ✅ Title and description

### 2. Bid Submission System
- **User Story**: As a Tourist Guide, I want to submit structured bids for group travel requests
- **Requirements**:
  - ✅ Structured bid template with:
    - Number of days
    - Daily itinerary (activities, meals, accommodation per day)
    - Accommodation details
    - Food details
    - Transport details
    - Total cost
  - ✅ Only Tourist Guides can submit bids
  - ✅ One bid per guide per group travel

### 3. Bid Visibility & Privacy
- **Requirements**:
  - ✅ Bids visible only to:
    - Post owner (creator)
    - Interested group members
  - ✅ Bids hidden from unauthenticated users
  - ✅ Bids hidden from non-interested users

### 4. Contact Approval System
- **Requirements**:
  - ✅ User approval required before Tourist Guide can contact
  - ✅ Approval button for post owner
  - ✅ Visual indicator when contact is approved

### 5. Automatic Deactivation
- **Requirements**:
  - ✅ Auto-deactivate when travel date passes
  - ✅ Status changes to 'COMPLETED'
  - ✅ Prevents further actions on expired posts

### 6. Interest Expression
- **Requirements**:
  - ✅ Users can express interest in group travel
  - ✅ Interest tracked and displayed
  - ✅ Interested users can view bids

## API Endpoints

### Public Endpoints
- `GET /api/group-travel` - Get all open group travels
- `GET /api/group-travel/:id` - Get group travel details (bid visibility based on auth)

### Authenticated Endpoints
- `POST /api/group-travel` - Create group travel (any authenticated user)
- `POST /api/group-travel/:id/interest` - Express interest
- `POST /api/group-travel/:id/bid` - Submit bid (Tourist Guides only)
- `POST /api/group-travel/bids/:bidId/approve-contact` - Approve contact (creator only)
- `PUT /api/group-travel/:id/close` - Close group travel (creator only)
- `GET /api/group-travel/my-travels` - Get user's group travels
- `GET /api/group-travel/my-bids` - Get guide's submitted bids

## Database Schema

### GroupTravel Table
```prisma
model GroupTravel {
  id            String            @id @default(uuid())
  title         String
  description   String
  locationId    String?
  customCountry String?
  customState   String?
  customArea    String?
  travelDate    DateTime
  expiryDate    DateTime
  creatorId     String
  status        GroupTravelStatus @default(OPEN)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}
```

### TravelBid Table
```prisma
model TravelBid {
  id                   String            @id @default(uuid())
  groupTravelId        String
  guideId              String
  numberOfDays         Int
  accommodationDetails String
  foodDetails          String
  transportDetails     String
  totalCost            Float
  approvalStatus       BidApprovalStatus @default(PENDING)
  canContact           Boolean           @default(false)
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
}
```

### DailyPlan Table
```prisma
model DailyPlan {
  id            String @id @default(uuid())
  bidId         String
  day           Int
  activities    String
  meals         String
  accommodation String
}
```

## Frontend Screens

### 1. Group Travel List (`/group-travel`)
- Displays all open group travels
- Shows interested users count and bids count
- Create button for authenticated users
- My Travels and My Bids navigation buttons

### 2. Create Group Travel (`/create-group-travel`)
- Form with title, description, location
- Date pickers for travel date and expiry date
- Validation for 5-day minimum requirement
- Validation for expiry date before travel date

### 3. Group Travel Detail (`/group-travel-detail`)
- Full details of group travel
- List of interested users
- Bids section (visible to creator and interested users)
- Express Interest button
- Submit Bid button (for Tourist Guides)
- Approve Contact button (for creator on each bid)

### 4. Submit Bid (`/submit-bid`)
- Form for bid details
- Dynamic daily itinerary builder
- Add/remove days functionality
- Validation for all required fields

### 5. My Group Travels (`/my-group-travels`)
- List of user's created group travels
- Shows status and statistics
- Quick access to details

### 6. My Bids (`/my-bids`)
- List of Tourist Guide's submitted bids
- Shows approval status
- Quick access to group travel details

## Business Rules

### Date Validation
1. Travel date must be at least 5 days from posting time
2. Expiry date must be before travel date
3. Auto-deactivation when travel date passes

### Access Control
1. Any authenticated user can create group travel
2. Only Tourist Guides can submit bids
3. Only creator can approve contact
4. Only creator and interested users can view bids

### Bid Submission
1. One bid per guide per group travel
2. All bid fields are required
3. Daily itinerary must be complete for all days

### Status Management
- **OPEN**: Accepting interest and bids
- **CLOSED**: Manually closed by creator
- **COMPLETED**: Auto-closed after travel date

## Notifications
- Creator notified when someone expresses interest
- Creator notified when a bid is submitted
- Guide notified when contact is approved

## Testing Checklist

### Backend
- [ ] Create group travel with valid data
- [ ] Reject group travel with travel date < 5 days
- [ ] Reject group travel with expiry date >= travel date
- [ ] Express interest as authenticated user
- [ ] Submit bid as Tourist Guide
- [ ] Reject bid from non-Tourist Guide
- [ ] Approve contact as creator
- [ ] Reject contact approval from non-creator
- [ ] Auto-deactivate expired group travels
- [ ] Bid visibility restricted properly

### Frontend
- [ ] Display all open group travels
- [ ] Create group travel form validation
- [ ] Date picker constraints working
- [ ] Express interest button functionality
- [ ] Submit bid form with dynamic itinerary
- [ ] Bid visibility based on user role
- [ ] Approve contact button for creator
- [ ] My Travels screen displays correctly
- [ ] My Bids screen displays correctly

## Future Enhancements
1. Payment integration for bid acceptance
2. Chat integration between creator and approved guides
3. Review system for completed trips
4. Group member management
5. Itinerary sharing and collaboration
6. Budget calculator
7. Booking confirmation workflow
8. Cancellation and refund policies

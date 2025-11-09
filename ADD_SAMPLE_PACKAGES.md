# How to Add Sample Packages

The packages page is working correctly but showing "No packages found" because the database is empty.

## Option 1: Run SQL Script (Easiest)

1. Open pgAdmin or any PostgreSQL client
2. Connect to database: `travel_encyclopedia` on `localhost:5433`
3. Open and run the file: `backend/seed-packages.sql`
4. Refresh the packages page

## Option 2: Use API (via Postman/Thunder Client)

**Endpoint**: `POST http://localhost:3000/api/packages`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Kerala Backwaters Experience",
  "description": "Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and scenic beauty.",
  "duration": 5,
  "price": 25000,
  "images": [
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival in Kochi",
      "description": "Welcome to Kerala! Transfer to hotel and evening city tour.",
      "activities": ["Airport pickup", "Hotel check-in", "Fort Kochi visit"]
    },
    {
      "day": 2,
      "title": "Kochi to Alleppey",
      "description": "Drive to Alleppey and board traditional houseboat.",
      "activities": ["Houseboat cruise", "Backwater views", "Traditional lunch"]
    },
    {
      "day": 3,
      "title": "Alleppey Backwaters",
      "description": "Full day exploring the serene backwaters.",
      "activities": ["Houseboat stay", "Bird watching", "Local cuisine"]
    }
  ]
}
```

## Option 3: Create via Admin Panel

If you have an admin create package page:
1. Login as admin
2. Go to create package page
3. Fill in the form
4. Submit

## Quick Test

To verify packages are loading:
```bash
curl http://localhost:3000/api/packages
```

Should return packages in JSON format.

## Sample Package Data

Here are 5 ready-to-use packages:

### 1. Kerala Backwaters (₹25,000, 5 days)
### 2. Rajasthan Heritage (₹45,000, 7 days)
### 3. Himalayan Adventure (₹35,000, 6 days)
### 4. Goa Beach Paradise (₹20,000, 4 days)
### 5. Golden Triangle (₹30,000, 5 days)

All details are in `backend/seed-packages.sql`

## After Adding Packages

1. Refresh the packages page
2. You should see package cards
3. Click "Request Callback" to test the feature
4. Login as admin to see callback requests

---

**Note**: The packages page is working correctly - it just needs data!

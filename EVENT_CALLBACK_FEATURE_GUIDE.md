# Event Callback/Express Interest Feature Guide

## 🎉 Feature Overview

Users can now express interest in events by requesting a callback. Event hosts and admins can view and manage these requests.

---

## 📱 For Users - How to Request a Callback

### Step 1: Browse Events
1. Navigate to **Events** page: `http://localhost:8081/events`
2. Browse through available events
3. Find an event you're interested in

### Step 2: Request Callback
1. Click the **"Request Callback"** button on any event card
2. A modal form will appear with:
   - **Name** (required)
   - **Phone Number** (required)
   - **Email** (optional)
   - **Message** (optional)

### Step 3: Submit
1. Fill in your details
2. Click **"Submit Request"**
3. You'll receive a confirmation message
4. The event host will contact you soon!

---

## 👨‍💼 For Admins/Hosts - How to Manage Callbacks

### Access the Callback Management Page
**URL**: `http://localhost:8081/event-callbacks`

**Who can access:**
- ✅ Site Admins (see ALL requests)
- ✅ Government Tourism Departments (see requests for their events)
- ✅ Travel Guides (see requests for their events)
- ❌ Regular users (cannot access)

### Features Available:

#### 1. **Dashboard Stats**
- View total callback requests
- See pending vs contacted counts
- Quick overview of all requests

#### 2. **Request Details**
Each callback request shows:
- 👤 User's name
- 📞 Phone number (clickable to call)
- 📧 Email address (clickable to send email)
- 💬 Optional message from user
- 📅 Event details
- 🏷️ Status (Pending/Contacted)
- 📆 Request date/time

#### 3. **Actions**
- **Call**: Click phone number to initiate call
- **Email**: Click email to open email client
- **Mark as Contacted**: Update status after contacting user

---

## 🔐 Access Control

### Admins Can:
- View ALL callback requests from all events
- See which host created each event
- Mark any request as contacted

### Event Hosts (Govt/Travel Guides) Can:
- View callback requests for THEIR events only
- Contact interested users
- Mark requests as contacted

### Regular Users Can:
- Submit callback requests
- Cannot view the management page

---

## 🎯 Use Cases

### Example 1: Festival Event
1. User sees "Diwali Festival 2025" event
2. Clicks "Request Callback"
3. Enters: Name: "John Doe", Phone: "555-1234"
4. Tourism Department receives notification
5. Department calls John to provide details
6. Marks request as "Contacted"

### Example 2: Travel Package
1. User interested in "Rajasthan Tour Package"
2. Requests callback with message: "Interested in group booking"
3. Travel Guide sees request
4. Calls user to discuss group rates
5. Updates status to contacted

---

## 📊 Database Structure

The system stores:
- Event ID (which event)
- User details (name, phone, email)
- Optional message
- User ID (if logged in)
- Contact status (pending/contacted)
- Timestamps (when requested)

---

## 🚀 Quick Start

### For Testing:

1. **As a User:**
   ```
   1. Go to: http://localhost:8081/events
   2. Click "Request Callback" on any event
   3. Fill form and submit
   ```

2. **As an Admin:**
   ```
   1. Login as admin
   2. Go to: http://localhost:8081/event-callbacks
   3. View all requests
   4. Click phone/email to contact
   5. Mark as contacted
   ```

---

## 🎨 UI Features

### Events Page:
- ✅ Beautiful card layout
- ✅ "Request Callback" button on each card
- ✅ Modal form with validation
- ✅ Pre-filled user info (if logged in)
- ✅ Success confirmation

### Callback Management Page:
- ✅ Stats dashboard
- ✅ Pending/Contacted filters
- ✅ Clickable phone/email
- ✅ Event details display
- ✅ Host information (for admins)
- ✅ One-click status update

---

## 📝 Notes

- Phone numbers are clickable (opens phone dialer on mobile/desktop)
- Email addresses are clickable (opens default email client)
- Requests are sorted by newest first
- Event hosts receive notifications when someone requests callback
- All data is stored securely in the database

---

## 🔧 Technical Details

### API Endpoints:
- `POST /events/:id/callback-request` - Submit callback request
- `GET /events/:id/callback-requests` - Get requests for specific event
- `GET /events/callback-requests/all` - Get all requests (admin/hosts)
- `PATCH /events/callback-requests/:id/contacted` - Mark as contacted

### Frontend Pages:
- `/events` - Events listing with callback button
- `/event-callbacks` - Admin callback management

---

## ✅ Feature Complete!

The Event Callback/Express Interest feature is fully functional and ready to use! 🎉

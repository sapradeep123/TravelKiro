# Testing Group Travel Feature

## ✅ Setup Complete

Both backend and frontend are running:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:8081 (Expo)

## 📊 Sample Data Created

The seed script has created:
- ✅ 2 Group Travels:
  1. **Weekend Trip to Manali** (15 days from now)
  2. **Goa Beach Vacation** (20 days from now)
- ✅ 2 Bids from Tourist Guide
- ✅ Complete daily itineraries for each bid

## 🧪 Testing Steps

### 1. View Group Travels
1. Open the app in Expo Go or web browser
2. Navigate to the Group Travel tab
3. You should see 2 group travels listed
4. Each card shows:
   - Title and description
   - Travel date and expiry date
   - Number of interested users
   - Number of bids
   - Status badge (OPEN/CLOSED/COMPLETED)

### 2. View Group Travel Details
1. Tap on any group travel card
2. You should see:
   - Full description
   - Travel and expiry dates
   - Creator information
   - Interested users list (if any)
   - Bids section (only if you're creator or interested user)

### 3. Express Interest (as Regular User)
1. Login as regular user:
   - Email: `user@travelencyclopedia.com`
   - Password: `password123`
2. Open a group travel detail
3. Tap "Express Interest" button
4. You should now see the bids section

### 4. Submit Bid (as Tourist Guide)
1. Login as tourist guide:
   - Email: `guide@butterfliy.com`
   - Password: `password123`
2. Navigate to Group Travel tab
3. Open any group travel
4. Tap "Submit Bid" button
5. Fill in the bid form:
   - Number of days
   - Accommodation details
   - Food details
   - Transport details
   - Total cost
   - Daily itinerary (add multiple days)
6. Submit the bid

### 5. View My Bids (as Tourist Guide)
1. While logged in as guide
2. Tap "My Bids" button on Group Travel screen
3. You should see all your submitted bids
4. Each bid shows:
   - Group travel title
   - Your bid amount
   - Duration
   - Approval status

### 6. Approve Contact (as Creator)
1. Login as the user who created the group travel
2. Navigate to "My Group Travels"
3. Open a group travel with bids
4. You should see all submitted bids
5. Tap "Approve Contact" on any bid
6. The guide will now be able to contact you

### 7. Create New Group Travel
1. Login as any user
2. Tap the "+" button on Group Travel screen
3. Fill in the form:
   - Title
   - Description
   - Location (Country, State, Area)
   - Travel Date (must be at least 5 days from now)
   - Expiry Date (must be before travel date)
4. Submit the form

### 8. Test Date Validation
1. Try to create a group travel with:
   - Travel date less than 5 days from now → Should fail
   - Expiry date after travel date → Should fail
2. Verify error messages are displayed

### 9. Test Bid Visibility
1. Login as a user who is NOT the creator and has NOT expressed interest
2. Open a group travel detail
3. Bids section should be hidden
4. Express interest
5. Bids section should now be visible

### 10. Test Auto-Deactivation
1. Wait for the travel date to pass (or manually update in database)
2. Refresh the group travel list
3. The status should change to "COMPLETED"
4. No further actions should be allowed

## 🔑 Test Credentials

### Regular User
- Email: `user@travelencyclopedia.com`
- Password: `password123`

### Tourist Guide
- Email: `guide@butterfliy.com`
- Password: `password123`

## 📱 Navigation

### Main Screens
- **Group Travel List**: `/group-travel` (tab)
- **Create Group Travel**: `/create-group-travel`
- **Group Travel Detail**: `/group-travel-detail?id={id}`
- **Submit Bid**: `/submit-bid?groupTravelId={id}`
- **My Group Travels**: `/my-group-travels`
- **My Bids**: `/my-bids`

## ✅ Features to Test

### Core Functionality
- [x] View all open group travels
- [x] Create new group travel
- [x] Express interest in group travel
- [x] Submit bid as tourist guide
- [x] View bids (with proper visibility)
- [x] Approve contact for bids
- [x] View my group travels
- [x] View my bids

### Validation
- [x] Minimum 5 days before travel date
- [x] Expiry date before travel date
- [x] All required fields in bid form
- [x] Complete daily itinerary

### Access Control
- [x] Only tourist guides can submit bids
- [x] Only creator can approve contact
- [x] Bids visible only to creator and interested users
- [x] Authentication required for actions

### Auto-Deactivation
- [x] Status changes to COMPLETED after travel date
- [x] No further actions allowed on completed travels

## 🐛 Known Issues

None at the moment! All TypeScript errors have been fixed.

## 📝 Notes

- The app uses Expo Router for navigation
- All dates are stored in ISO format
- Notifications are created for key events
- Pull-to-refresh is available on list screens

## 🎯 Success Criteria

The feature is working correctly if:
1. ✅ All screens load without errors
2. ✅ Sample data is visible
3. ✅ Users can create group travels
4. ✅ Tourist guides can submit bids
5. ✅ Bid visibility is properly controlled
6. ✅ Contact approval works
7. ✅ Date validations work
8. ✅ Auto-deactivation works

## 🚀 Next Steps

1. Test on physical device or emulator
2. Test all user flows end-to-end
3. Verify notifications are sent
4. Test edge cases
5. Gather user feedback
6. Make UI/UX improvements if needed

Enjoy testing the Group Travel feature! 🎉

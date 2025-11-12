# Community Module UI Testing Guide

This document provides a comprehensive checklist for manually testing the Community Module UI across different devices and scenarios.

## Prerequisites

- Backend server running on http://localhost:3000
- Frontend app running (Expo)
- At least 2 test user accounts
- Test location data in database
- Test images/videos for media upload

## Test Environment Setup

### Test Users
Create the following test accounts:
1. **User A** (Public Profile) - Primary tester
2. **User B** (Private Profile) - For relationship testing
3. **Admin User** - For moderation testing

### Test Data
- At least 5 locations in the database
- Sample images (< 10MB each)
- Sample video (< 10MB)

---

## 1. Post Creation Flow Testing

### Test 1.1: Post Composer Access
- [ ] **Unauthenticated**: Navigate to post composer → Should redirect to login
- [ ] **Authenticated**: Click "Create Post" button → Should open composer screen
- [ ] **UI Elements**: Verify all fields are visible (caption, media, location)

### Test 1.2: Location Selection
- [ ] **Auto-detection**: Enable location → Should capture GPS coordinates
- [ ] **Auto-detection**: Verify location name is resolved and displayed
- [ ] **Manual selection**: Search for location → Should show autocomplete results
- [ ] **Manual selection**: Select location → Should populate location field
- [ ] **Custom location**: Enter custom country/state/area → Should accept input
- [ ] **Validation**: Try to submit without location → Should show error

### Test 1.3: Media Upload
- [ ] **Image upload**: Select 1 image → Should show preview
- [ ] **Multiple images**: Select 3 images → Should show all previews
- [ ] **Video upload**: Select 1 video → Should show video preview
- [ ] **Mixed media**: Select images + video → Should show all previews
- [ ] **Remove media**: Click remove on preview → Should remove from list
- [ ] **File validation**: Try to upload > 10MB file → Should show error
- [ ] **File validation**: Try to upload invalid file type → Should show error

### Test 1.4: Caption Input
- [ ] **Text entry**: Type caption → Should display character count
- [ ] **Long caption**: Type 2000+ characters → Should show limit warning
- [ ] **Hashtags**: Include #hashtags → Should be accepted
- [ ] **Mentions**: Include @mentions → Should be accepted
- [ ] **Emojis**: Include emojis → Should display correctly

### Test 1.5: Post Submission
- [ ] **Valid post**: Submit with all required fields → Should create post
- [ ] **Loading state**: During submission → Should show loading indicator
- [ ] **Success feedback**: After creation → Should show success message
- [ ] **Navigation**: After success → Should navigate to feed
- [ ] **Feed update**: Check feed → New post should appear at top

---

## 2. Feed Browsing Testing

### Test 2.1: Global Feed
- [ ] **Initial load**: Open feed → Should load first 20 posts
- [ ] **Post cards**: Verify all post elements visible (avatar, name, time, location, caption, media, interactions)
- [ ] **Pagination**: Scroll to bottom → Should load next page
- [ ] **Infinite scroll**: Continue scrolling → Should keep loading posts
- [ ] **Loading indicator**: During load → Should show spinner
- [ ] **Empty state**: If no posts → Should show "No posts yet" message

### Test 2.2: Feed Tabs
- [ ] **Global tab**: Click Global → Should show all posts
- [ ] **Following tab**: Click Following → Should show posts from followed users only
- [ ] **Saved tab**: Click Saved → Should show saved posts only
- [ ] **Tab switching**: Switch between tabs → Should maintain scroll position

### Test 2.3: Pull to Refresh
- [ ] **Pull down**: Pull down on feed → Should show refresh indicator
- [ ] **Release**: Release → Should reload feed
- [ ] **New posts**: After refresh → Should show any new posts

### Test 2.4: Post Card Display
- [ ] **User info**: Click avatar/name → Should navigate to user profile
- [ ] **Location**: Click location tag → Should navigate to location feed
- [ ] **Media gallery**: Swipe through images → Should show all media
- [ ] **Media gallery**: Tap on image → Should open full-screen view
- [ ] **Caption**: Long caption → Should be truncated with "Read more"
- [ ] **Interaction counts**: Verify like/comment/save counts display

---

## 3. Interaction Testing

### Test 3.1: Like Functionality
- [ ] **Like post**: Tap like button → Should turn red and increment count
- [ ] **Unlike post**: Tap like button again → Should turn gray and decrement count
- [ ] **Like animation**: When liking → Should show animation
- [ ] **Optimistic update**: Like should update immediately
- [ ] **Persistence**: Refresh feed → Like state should persist

### Test 3.2: Comment Functionality
- [ ] **Open comments**: Tap comment button → Should open post detail with comments
- [ ] **View comments**: Scroll through comments → Should show all comments
- [ ] **Add comment**: Type and submit comment → Should appear in list
- [ ] **Character count**: Type comment → Should show character count
- [ ] **Character limit**: Type 500+ characters → Should show error
- [ ] **Empty comment**: Try to submit empty → Should show error
- [ ] **Delete own comment**: Tap delete on own comment → Should remove from list
- [ ] **Delete others' comment**: Try to delete others' comment → Should not show delete option

### Test 3.3: Save Functionality
- [ ] **Save post**: Tap save button → Should turn filled and increment count
- [ ] **Unsave post**: Tap save button again → Should turn outline and decrement count
- [ ] **Saved tab**: Check Saved tab → Saved post should appear
- [ ] **Unsave from tab**: Unsave from Saved tab → Should remove from list

### Test 3.4: Post Menu
- [ ] **Own post**: Tap menu → Should show "Delete" option
- [ ] **Others' post**: Tap menu → Should show "Report" option
- [ ] **Delete post**: Confirm delete → Should remove from feed
- [ ] **Report post**: Select report → Should open report modal

---

## 4. User Relationship Testing

### Test 4.1: Follow Public Profile
- [ ] **Follow button**: On public profile → Should show "Follow" button
- [ ] **Follow action**: Tap Follow → Should change to "Following"
- [ ] **Follower count**: After follow → Should increment by 1
- [ ] **Unfollow**: Tap Following → Should show unfollow confirmation
- [ ] **Unfollow action**: Confirm unfollow → Should change back to "Follow"
- [ ] **Follower count**: After unfollow → Should decrement by 1

### Test 4.2: Follow Private Profile
- [ ] **Follow button**: On private profile → Should show "Follow" button
- [ ] **Follow action**: Tap Follow → Should change to "Requested"
- [ ] **No content**: Private profile without follow → Should hide post grid
- [ ] **Follow requests**: As profile owner → Should see pending request
- [ ] **Approve request**: Tap Approve → Should create follow relationship
- [ ] **Reject request**: Tap Reject → Should remove request
- [ ] **After approval**: Requester should see "Following" and post grid

### Test 4.3: Block User
- [ ] **Block option**: Tap profile menu → Should show "Block" option
- [ ] **Block action**: Confirm block → Should show success message
- [ ] **Profile access**: Try to view blocked profile → Should show "Profile not available"
- [ ] **Feed filtering**: Check feed → Blocked user posts should not appear
- [ ] **Interaction prevention**: Try to like blocked user post → Should show error
- [ ] **Mutual blocking**: Blocked user tries to view blocker → Should also be blocked
- [ ] **Unblock**: Tap Unblock → Should restore access

### Test 4.4: Mute User
- [ ] **Mute option**: Tap profile menu → Should show "Mute" option
- [ ] **Mute action**: Confirm mute → Should show success message
- [ ] **Feed filtering**: Check feed → Muted user posts should not appear
- [ ] **Profile access**: View muted profile → Should still be accessible
- [ ] **No notification**: Muted user → Should not be notified
- [ ] **Unmute**: Tap Unmute → Should restore posts in feed

---

## 5. Profile Viewing Testing

### Test 5.1: Own Profile
- [ ] **Profile access**: Navigate to own profile → Should show all info
- [ ] **Profile stats**: Verify follower/following/post counts
- [ ] **Post grid**: Should show all own posts in grid layout
- [ ] **Edit button**: Should show "Edit Profile" button
- [ ] **Privacy toggle**: Should show privacy toggle switch

### Test 5.2: Public Profile
- [ ] **Profile access**: Navigate to public profile → Should show all info
- [ ] **Profile stats**: Verify follower/following/post counts
- [ ] **Post grid**: Should show all user posts
- [ ] **Follow button**: Should show appropriate follow state
- [ ] **Profile menu**: Should show Block/Mute options

### Test 5.3: Private Profile (Not Following)
- [ ] **Profile access**: Navigate to private profile → Should show basic info
- [ ] **Post grid**: Should be hidden with "This account is private" message
- [ ] **Follow button**: Should show "Follow" or "Requested"
- [ ] **Stats**: Should show follower/following counts

### Test 5.4: Private Profile (Following)
- [ ] **Profile access**: Navigate to private profile (following) → Should show all info
- [ ] **Post grid**: Should show all user posts
- [ ] **Full access**: Should have same access as public profile

### Test 5.5: Profile Edit
- [ ] **Edit screen**: Tap Edit Profile → Should open edit screen
- [ ] **Name field**: Update name → Should save successfully
- [ ] **Bio field**: Update bio → Should save successfully
- [ ] **Avatar upload**: Upload new avatar → Should update profile picture
- [ ] **Character limit**: Bio > 500 characters → Should show error
- [ ] **Save button**: Tap Save → Should update profile and navigate back
- [ ] **Cancel button**: Tap Cancel → Should discard changes

### Test 5.6: Privacy Toggle
- [ ] **Toggle to private**: Switch on → Should show confirmation
- [ ] **Private mode**: After toggle → Profile should require follow approval
- [ ] **Toggle to public**: Switch off → Should show confirmation
- [ ] **Public mode**: After toggle → Anyone can follow immediately

---

## 6. Location Feed Testing

### Test 6.1: Location Feed Access
- [ ] **From post**: Tap location tag on post → Should navigate to location feed
- [ ] **Feed display**: Should show location name and post count
- [ ] **Filtered posts**: Should show only posts from that location
- [ ] **Pagination**: Scroll to bottom → Should load more posts
- [ ] **Empty state**: Location with no posts → Should show "No posts yet"

---

## 7. Reporting and Moderation Testing

### Test 7.1: Report Post
- [ ] **Report option**: Tap post menu → Should show "Report" option
- [ ] **Report modal**: Tap Report → Should open report modal
- [ ] **Categories**: Should show spam, harassment, inappropriate, other
- [ ] **Select category**: Select category → Should highlight selection
- [ ] **Optional reason**: Add reason text → Should accept input
- [ ] **Submit report**: Tap Submit → Should show success message
- [ ] **Duplicate report**: Try to report same post → Should show error

### Test 7.2: Moderation Screen (Admin Only)
- [ ] **Access**: Navigate to moderation → Should require admin role
- [ ] **Reports list**: Should show all pending reports
- [ ] **Report details**: Should show post content, reporter, category, reason
- [ ] **Hide post**: Tap Hide → Should hide post from all feeds
- [ ] **Unhide post**: Tap Unhide → Should restore post to feeds
- [ ] **Dismiss report**: Tap Dismiss → Should remove from queue
- [ ] **Pagination**: Scroll to bottom → Should load more reports

---

## 8. Responsive Design Testing

### Test 8.1: Mobile (< 768px)

#### iPhone (375px width)
- [ ] **Feed layout**: Single column, full width
- [ ] **Post cards**: Proper spacing and readability
- [ ] **Media display**: Images fit screen width
- [ ] **Touch targets**: Buttons at least 44x44px
- [ ] **Navigation**: Bottom tab bar accessible
- [ ] **Composer**: Full screen modal
- [ ] **Profile**: Single column layout

#### Android (360px width)
- [ ] **Feed layout**: Single column, full width
- [ ] **Post cards**: Proper spacing and readability
- [ ] **Media display**: Images fit screen width
- [ ] **Touch targets**: Buttons at least 44x44px
- [ ] **Navigation**: Bottom tab bar accessible
- [ ] **Composer**: Full screen modal
- [ ] **Profile**: Single column layout

### Test 8.2: Tablet (768px - 1024px)

#### iPad (768px width)
- [ ] **Feed layout**: Centered with max width
- [ ] **Post cards**: Proper spacing, not too wide
- [ ] **Media display**: Optimized for tablet
- [ ] **Touch targets**: Appropriate size
- [ ] **Navigation**: Tab bar or side navigation
- [ ] **Composer**: Modal with appropriate width
- [ ] **Profile**: Two column layout for post grid

### Test 8.3: Desktop (> 1024px)

#### Desktop (1920px width)
- [ ] **Feed layout**: Multi-column with sidebar
- [ ] **Post cards**: Fixed max width (600px)
- [ ] **Media display**: High quality, proper aspect ratio
- [ ] **Hover states**: Buttons show hover effects
- [ ] **Keyboard navigation**: Tab through interactive elements
- [ ] **Composer**: Inline or modal with appropriate width
- [ ] **Profile**: Multi-column post grid (4+ columns)

### Test 8.4: Orientation Changes
- [ ] **Portrait to landscape**: Layout adjusts appropriately
- [ ] **Landscape to portrait**: Layout adjusts appropriately
- [ ] **Media display**: Adapts to orientation
- [ ] **Navigation**: Remains accessible

---

## 9. Performance Testing

### Test 9.1: Load Times
- [ ] **Initial feed load**: < 2 seconds
- [ ] **Post creation**: < 3 seconds
- [ ] **Image upload**: < 5 seconds per image
- [ ] **Profile load**: < 1 second
- [ ] **Location feed**: < 2 seconds

### Test 9.2: Smooth Scrolling
- [ ] **Feed scroll**: 60fps, no jank
- [ ] **Image gallery**: Smooth swipe transitions
- [ ] **Infinite scroll**: Seamless loading

### Test 9.3: Memory Usage
- [ ] **Long session**: No memory leaks after 30 minutes
- [ ] **Image loading**: Images properly cached
- [ ] **Feed pagination**: Old posts released from memory

---

## 10. Error Handling Testing

### Test 10.1: Network Errors
- [ ] **Offline mode**: Disable network → Should show offline indicator
- [ ] **Failed request**: Network error during action → Should show error message
- [ ] **Retry logic**: After network restored → Should retry failed requests
- [ ] **Cached data**: Offline → Should show cached feed data

### Test 10.2: Validation Errors
- [ ] **Missing required field**: Submit without location → Should show error
- [ ] **Invalid data**: Submit invalid data → Should show specific error
- [ ] **File size**: Upload large file → Should show size error
- [ ] **Character limit**: Exceed limit → Should show limit error

### Test 10.3: Permission Errors
- [ ] **Unauthorized action**: Try to delete others' post → Should show error
- [ ] **Blocked user**: Try to interact with blocked user → Should show error
- [ ] **Private profile**: Try to view without follow → Should show restricted message
- [ ] **Admin only**: Try to access moderation without admin → Should show error

---

## 11. Edge Cases Testing

### Test 11.1: Empty States
- [ ] **No posts**: New user with no posts → Should show empty state
- [ ] **No followers**: Profile with no followers → Should show 0
- [ ] **No saved posts**: Saved tab with no posts → Should show empty state
- [ ] **No comments**: Post with no comments → Should show empty state
- [ ] **No follow requests**: No pending requests → Should show empty state

### Test 11.2: Boundary Conditions
- [ ] **Maximum media**: Upload 10 images → Should handle all
- [ ] **Long caption**: 2000 character caption → Should display properly
- [ ] **Many comments**: Post with 100+ comments → Should paginate
- [ ] **Many likes**: Post with 1000+ likes → Should display count
- [ ] **Long username**: Very long username → Should truncate properly

### Test 11.3: Concurrent Actions
- [ ] **Multiple likes**: Rapidly like/unlike → Should handle correctly
- [ ] **Simultaneous comments**: Multiple users comment → Should show all
- [ ] **Follow/unfollow**: Rapidly follow/unfollow → Should handle correctly
- [ ] **Delete during view**: Post deleted while viewing → Should handle gracefully

---

## Test Results Template

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Device**: _______________
- **OS Version**: _______________
- **App Version**: _______________
- **Backend Version**: _______________

### Summary
- **Total Tests**: _______________
- **Passed**: _______________
- **Failed**: _______________
- **Blocked**: _______________
- **Not Tested**: _______________

### Issues Found
| Issue # | Description | Severity | Steps to Reproduce | Status |
|---------|-------------|----------|-------------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Notes
_Add any additional observations or comments here_

---

## Severity Levels

- **Critical**: Blocks core functionality, app crashes
- **High**: Major feature broken, workaround exists
- **Medium**: Feature partially broken, minor impact
- **Low**: Cosmetic issue, no functional impact

## Status Values

- **Open**: Issue identified, not fixed
- **In Progress**: Being worked on
- **Fixed**: Resolved and verified
- **Won't Fix**: Accepted as-is
- **Duplicate**: Same as another issue

---

## Additional Manual Testing Notes

### Browser Testing (Web Version)
If testing web version, also test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast
- Focus indicators
- Alt text for images

### Localization Testing
- Different languages
- RTL languages
- Date/time formats
- Number formats

---

## Automated Testing Companion

This manual testing guide complements the automated E2E tests in `backend/test-community-e2e.js`.

Run automated tests first:
```bash
cd backend
node test-community-e2e.js
```

Then perform manual UI testing using this guide.

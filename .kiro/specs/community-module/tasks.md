# Implementation Plan

- [x] 1. Extend database schema with community module tables





  - Add new models to Prisma schema: SavedPost, FollowRequest, BlockedUser, MutedUser, PostReport
  - Extend UserProfile model with isPrivate, followerCount, followingCount, postCount fields
  - Extend CommunityPost model with isHidden, hiddenAt, hiddenBy, likeCount, commentCount, saveCount fields
  - Add necessary relations to User model for new tables
  - Create and run Prisma migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement backend post management service and API





  - [x] 2.1 Create communityService with post CRUD operations


    - Implement createPost method with location metadata handling
    - Implement getFeed method with pagination and filtering (exclude blocked/muted users)
    - Implement getPost method with user-specific flags (isLiked, isSaved)
    - Implement getLocationFeed method for location-specific posts
    - Implement deletePost method with ownership validation
    - _Requirements: 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 8.1, 8.2, 8.3, 8.4_
  - [x] 2.2 Create communityController with post endpoints


    - Implement POST /api/community/posts endpoint with authentication
    - Implement GET /api/community/posts endpoint with pagination
    - Implement GET /api/community/posts/:id endpoint
    - Implement GET /api/community/posts/location/:locationId endpoint
    - Implement DELETE /api/community/posts/:id endpoint with authorization
    - _Requirements: 1.1, 1.6, 1.7, 2.1, 2.2, 2.3, 8.1, 8.2, 8.3, 8.4_
  - [x] 2.3 Create community routes and register with Express app


    - Define routes in backend/src/routes/community.ts
    - Apply authentication middleware to protected routes
    - Register routes in main app.ts
    - _Requirements: 1.1, 10.1, 10.3_

- [x] 3. Implement backend interaction service and API





  - [x] 3.1 Add interaction methods to communityService


    - Implement toggleLike method with counter updates
    - Implement addComment method with validation
    - Implement deleteComment method with ownership check
    - Implement toggleSave method
    - Implement getSavedPosts method with pagination
    - Add block/mute filtering to all query methods
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_
  - [x] 3.2 Add interaction endpoints to communityController


    - Implement POST /api/community/posts/:id/like endpoint
    - Implement POST /api/community/posts/:id/comment endpoint
    - Implement DELETE /api/community/comments/:id endpoint
    - Implement POST /api/community/posts/:id/save endpoint
    - Implement GET /api/community/posts/saved endpoint
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Implement backend user relationship service and API





  - [x] 4.1 Add relationship methods to communityService


    - Implement followUser method with private profile handling
    - Implement unfollowUser method
    - Implement getFollowRequests method
    - Implement approveFollowRequest method with counter updates
    - Implement rejectFollowRequest method
    - Implement blockUser method with bidirectional blocking
    - Implement unblockUser method
    - Implement muteUser method
    - Implement unmuteUser method
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x] 4.2 Add relationship endpoints to communityController


    - Implement POST /api/community/users/:id/follow endpoint
    - Implement DELETE /api/community/users/:id/follow endpoint
    - Implement GET /api/community/follow-requests endpoint
    - Implement POST /api/community/follow-requests/:id/approve endpoint
    - Implement POST /api/community/follow-requests/:id/reject endpoint
    - Implement POST /api/community/users/:id/block endpoint
    - Implement DELETE /api/community/users/:id/block endpoint
    - Implement POST /api/community/users/:id/mute endpoint
    - Implement DELETE /api/community/users/:id/mute endpoint
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Implement backend user profile service and API






  - [x] 5.1 Add profile methods to communityService

    - Implement getUserProfile method with relationship flags
    - Implement getUserPosts method with privacy checks
    - Implement updateProfile method
    - Implement togglePrivateMode method
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 Add profile endpoints to communityController

    - Implement GET /api/community/users/:id/profile endpoint
    - Implement GET /api/community/users/:id/posts endpoint
    - Implement PATCH /api/community/profile endpoint
    - Implement PATCH /api/community/profile/privacy endpoint
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. Implement backend reporting and moderation service and API




  - [x] 6.1 Add reporting and moderation methods to communityService


    - Implement reportPost method with duplicate prevention
    - Implement getReports method for admin (paginated)
    - Implement hidePost method with admin authorization
    - Implement unhidePost method with admin authorization
    - Implement dismissReport method with admin authorization
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 6.2 Add reporting and moderation endpoints to communityController


    - Implement POST /api/community/posts/:id/report endpoint
    - Implement GET /api/community/admin/reports endpoint with admin middleware
    - Implement POST /api/community/admin/posts/:id/hide endpoint with admin middleware
    - Implement POST /api/community/admin/posts/:id/unhide endpoint with admin middleware
    - Implement POST /api/community/admin/reports/:id/dismiss endpoint with admin middleware
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Implement frontend community service





  - Create frontend/src/services/communityService.ts with all API methods
  - Implement post management methods (createPost, getFeed, getPost, getLocationFeed, deletePost)
  - Implement interaction methods (toggleLike, addComment, deleteComment, toggleSave, getSavedPosts)
  - Implement relationship methods (followUser, unfollowUser, getFollowRequests, approveFollowRequest, rejectFollowRequest, blockUser, unblockUser, muteUser, unmuteUser)
  - Implement profile methods (getUserProfile, getUserPosts, updateProfile, togglePrivateMode)
  - Implement reporting methods (reportPost, getReports, hidePost, unhidePost, dismissReport)
  - Add TypeScript interfaces for all request/response types
  - _Requirements: 10.2, 10.3_

- [x] 8. Implement frontend post composer component and screen





  - [x] 8.1 Create MediaUploader component


    - Implement image/video picker with multi-select
    - Add file type and size validation
    - Display media previews with remove option
    - Show upload progress indicator
    - _Requirements: 1.5, 9.3, 9.4_
  - [x] 8.2 Create LocationPicker component


    - Implement auto-detection with device GPS
    - Add manual location search with autocomplete
    - Display selected location with edit option
    - Handle location permissions
    - _Requirements: 1.3, 1.4, 9.4_
  - [x] 8.3 Create PostComposerScreen


    - Build form with caption input, media uploader, location picker
    - Add character count for caption
    - Implement form validation
    - Handle post submission with loading state
    - Show success/error feedback
    - Navigate to feed on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 9.3, 9.4_

- [x] 9. Implement frontend feed components and screens





  - [x] 9.1 Create PostCard component



    - Display user avatar, name, timestamp, location
    - Render caption with proper formatting
    - Show media gallery with swipe/pagination
    - Add InteractionBar with like, comment, save buttons
    - Show interaction counts
    - Add menu with report/delete options
    - Handle navigation to post detail and user profile
    - _Requirements: 2.2, 2.3, 3.5, 9.1, 9.2, 9.3_


  - [x] 9.2 Create CommentList component





    - Display list of comments with user info
    - Add comment input with submit button
    - Show character count
    - Add delete option for own comments


    - Handle empty state
    - _Requirements: 3.2, 3.3, 9.3_
  - [x] 9.3 Create CommunityFeedScreen















    - Implement tab navigation (Global, Following, Saved)
    - Add infinite scroll with pagination
    - Show loading indicators


    - Handle empty states for each tab
    - Add pull-to-refresh
    - Include floating action button for post composer


    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2_
  - [x] 9.4 Create PostDetailScreen





    - Display full post with PostCard component
    - Show CommentList below post
    - Handle navigation from feed
    - _Requirements: 2.2, 3.2, 3.3, 9.3_
  - [x] 9.5 Create LocationFeedScreen





    - Display location name and post count header
    - Show filtered posts for location
    - Implement pagination
    - Handle empty state
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2_

- [x] 10. Implement frontend user profile components and screen





  - [x] 10.1 Create ProfileHeader component


    - Display user avatar, name, bio
    - Show follower, following, post counts
    - Add FollowButton with request handling
    - Show block/mute options in menu
    - Display private profile indicator
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 9.3_
  - [x] 10.2 Create PostGrid component


    - Display posts in grid layout (3 columns mobile, 4+ desktop)
    - Show post thumbnails
    - Handle navigation to post detail
    - Show empty state for no posts
    - _Requirements: 5.3, 5.4, 9.1, 9.2_
  - [x] 10.3 Create UserProfileScreen


    - Combine ProfileHeader and PostGrid
    - Handle own profile vs other user profiles
    - Show edit profile option for own profile
    - Implement privacy checks for private profiles
    - Add pagination for post grid
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.1, 9.2_
  - [x] 10.4 Create ProfileEditScreen


    - Add form for name, bio, avatar update
    - Include private mode toggle
    - Implement form validation
    - Handle save with loading state
    - _Requirements: 5.5, 5.6, 9.3, 9.4_

- [x] 11. Implement frontend reporting and moderation





  - [x] 11.1 Create ReportModal component


    - Display report categories (spam, harassment, inappropriate, other)
    - Add optional reason text input
    - Implement submit with confirmation
    - Show success feedback
    - _Requirements: 6.1, 6.2, 6.3, 9.3, 9.4_
  - [x] 11.2 Create ModerationScreen (admin only)


    - Display list of pending reports
    - Show post content and reporter info
    - Add hide/unhide and dismiss actions
    - Implement pagination
    - Show empty state for no reports
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2_

- [x] 12. Implement responsive design and styling





  - Create theme configuration with design tokens
  - Apply mobile-first responsive styles to all components
  - Implement touch-optimized interactions for mobile
  - Add hover states and keyboard navigation for desktop
  - Ensure proper spacing and typography across devices
  - Test on multiple screen sizes (mobile, tablet, desktop)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Add navigation and integrate with app





  - Add Community tab to main tab navigator
  - Configure navigation routes for all community screens
  - Implement deep linking for posts and profiles
  - Add navigation guards for authentication
  - Test navigation flow between all screens
  - _Requirements: 1.1, 9.5_

- [x] 14. Implement error handling and validation





  - Add input validation for all forms (post composer, comments, profile edit)
  - Implement error boundaries for component failures
  - Add toast notifications for user feedback
  - Handle network errors with retry logic
  - Add loading states for all async operations
  - Implement offline mode indicators
  - _Requirements: 10.5_

- [x] 15. Add database indexes for performance





  - Create indexes on community_posts (user_id, location_id, created_at, is_hidden)
  - Create indexes on post_likes (user_id, post_id)
  - Create indexes on comments (post_id)
  - Create indexes on saved_posts (user_id)
  - Create indexes on blocked_users (blocker_id)
  - Create indexes on muted_users (muter_id)
  - Create indexes on follow_requests (following_id, status)
  - _Requirements: 10.4_

- [x] 16. End-to-end integration testing





  - Test complete post creation flow (auth, location, media, publish)
  - Test feed browsing with pagination and filtering
  - Test all interaction types (like, comment, save)
  - Test user relationship flows (follow, block, mute)
  - Test profile viewing with privacy modes
  - Test reporting and moderation workflow
  - Test blocking enforcement (mutual invisibility)
  - Verify responsive design on mobile and desktop
  - _Requirements: All requirements_

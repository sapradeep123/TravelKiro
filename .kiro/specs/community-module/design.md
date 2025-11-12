# Community Module Design Document

## Overview

The Community Module is a social travel platform that enables authenticated users to create location-based posts with media, interact through likes/comments/saves, manage user relationships (follow/block/mute), view public profiles, and report inappropriate content. The system includes admin moderation capabilities and location-based feed browsing. The architecture follows a three-tier pattern with React Native (Expo) frontend, Express.js backend, and PostgreSQL database using Prisma ORM.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React Native)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Post Composer│  │  Feed Views  │  │User Profiles │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Interactions │  │ Relationships│  │  Moderation  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Middleware   │  │  Validation  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Posts     │  │ Interactions │  │Relationships │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Reports    │  │    Saves     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React Native (Expo), TypeScript, React Navigation
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens (existing auth system)
- **File Storage**: Local filesystem with URL references (expandable to S3)
- **API**: RESTful JSON endpoints

## Components and Interfaces

### Database Schema Extensions

The existing Prisma schema already includes `CommunityPost`, `Comment`, `PostLike`, and `Follow` models. We need to extend the schema with additional models for the complete feature set:

```prisma
// Extend UserProfile model
model UserProfile {
  // ... existing fields ...
  isPrivate         Boolean  @default(false)
  followerCount     Int      @default(0)
  followingCount    Int      @default(0)
  postCount         Int      @default(0)
}

// New model for saved posts
model SavedPost {
  id        String   @id @default(uuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@map("saved_posts")
}

// New model for follow requests (private profiles)
model FollowRequest {
  id          String         @id @default(uuid())
  followerId  String
  followingId String
  status      ApprovalStatus @default(PENDING)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  follower  User @relation("FollowRequestSender", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("FollowRequestReceiver", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follow_requests")
}

// New model for blocked users
model BlockedUser {
  id        String   @id @default(uuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())

  blocker User @relation("UserBlocking", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked User @relation("UserBlocked", fields: [blockedId], references: [id], onDelete: Cascade)

  @@unique([blockerId, blockedId])
  @@map("blocked_users")
}

// New model for muted users
model MutedUser {
  id       String   @id @default(uuid())
  muterId  String
  mutedId  String
  createdAt DateTime @default(now())

  muter User @relation("UserMuting", fields: [muterId], references: [id], onDelete: Cascade)
  muted User @relation("UserMuted", fields: [mutedId], references: [id], onDelete: Cascade)

  @@unique([muterId, mutedId])
  @@map("muted_users")
}

// New model for post reports
model PostReport {
  id         String   @id @default(uuid())
  postId     String
  reporterId String
  category   String   // spam, harassment, inappropriate, other
  reason     String?
  status     String   @default("pending") // pending, reviewed, dismissed
  reviewedBy String?
  reviewedAt DateTime?
  createdAt  DateTime @default(now())

  post     CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  reporter User          @relation("PostReporter", fields: [reporterId], references: [id], onDelete: Cascade)
  reviewer User?         @relation("PostReviewer", fields: [reviewedBy], references: [id])

  @@unique([postId, reporterId])
  @@map("post_reports")
}

// Extend CommunityPost model
model CommunityPost {
  // ... existing fields ...
  isHidden      Boolean      @default(false)
  hiddenAt      DateTime?
  hiddenBy      String?
  likeCount     Int          @default(0)
  commentCount  Int          @default(0)
  saveCount     Int          @default(0)
  
  savedBy       SavedPost[]
  reports       PostReport[]
}
```

### Backend API Endpoints

#### Post Management
- `POST /api/community/posts` - Create new post (auth required)
- `GET /api/community/posts` - Get global feed (paginated)
- `GET /api/community/posts/:id` - Get single post
- `GET /api/community/posts/location/:locationId` - Get location-specific feed
- `DELETE /api/community/posts/:id` - Delete own post (auth required)

#### Interactions
- `POST /api/community/posts/:id/like` - Toggle like (auth required)
- `POST /api/community/posts/:id/comment` - Add comment (auth required)
- `DELETE /api/community/comments/:id` - Delete own comment (auth required)
- `POST /api/community/posts/:id/save` - Toggle save (auth required)
- `GET /api/community/posts/saved` - Get saved posts (auth required)

#### User Relationships
- `POST /api/community/users/:id/follow` - Follow user (auth required)
- `DELETE /api/community/users/:id/follow` - Unfollow user (auth required)
- `GET /api/community/follow-requests` - Get pending follow requests (auth required)
- `POST /api/community/follow-requests/:id/approve` - Approve follow request (auth required)
- `POST /api/community/follow-requests/:id/reject` - Reject follow request (auth required)
- `POST /api/community/users/:id/block` - Block user (auth required)
- `DELETE /api/community/users/:id/block` - Unblock user (auth required)
- `POST /api/community/users/:id/mute` - Mute user (auth required)
- `DELETE /api/community/users/:id/mute` - Unmute user (auth required)

#### User Profiles
- `GET /api/community/users/:id/profile` - Get user profile
- `GET /api/community/users/:id/posts` - Get user's posts
- `PATCH /api/community/profile` - Update own profile (auth required)
- `PATCH /api/community/profile/privacy` - Toggle private mode (auth required)

#### Reporting & Moderation
- `POST /api/community/posts/:id/report` - Report post (auth required)
- `GET /api/community/admin/reports` - Get all reports (admin only)
- `POST /api/community/admin/posts/:id/hide` - Hide post (admin only)
- `POST /api/community/admin/posts/:id/unhide` - Unhide post (admin only)
- `POST /api/community/admin/reports/:id/dismiss` - Dismiss report (admin only)

### Frontend Components

#### Screens
- `CommunityFeedScreen` - Main feed with tabs (Global, Following, Saved)
- `PostComposerScreen` - Create new post modal
- `PostDetailScreen` - Single post view with comments
- `UserProfileScreen` - User profile with post grid
- `LocationFeedScreen` - Location-specific posts
- `ModerationScreen` - Admin moderation queue (admin only)

#### Components
- `PostCard` - Individual post display with interactions
- `CommentList` - List of comments with input
- `LocationPicker` - Location search and selection
- `MediaUploader` - Image/video upload with preview
- `UserAvatar` - User profile picture with navigation
- `InteractionBar` - Like, comment, save, share buttons
- `FollowButton` - Follow/unfollow with request handling
- `ReportModal` - Report submission form
- `ProfileHeader` - User stats and bio
- `PostGrid` - Grid layout for profile posts

### Frontend Services

```typescript
// communityService.ts
interface CommunityService {
  // Posts
  createPost(data: CreatePostData): Promise<Post>;
  getFeed(page: number, filter?: FeedFilter): Promise<PaginatedPosts>;
  getPost(id: string): Promise<Post>;
  getLocationFeed(locationId: string, page: number): Promise<PaginatedPosts>;
  deletePost(id: string): Promise<void>;
  
  // Interactions
  toggleLike(postId: string): Promise<void>;
  addComment(postId: string, text: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  toggleSave(postId: string): Promise<void>;
  getSavedPosts(page: number): Promise<PaginatedPosts>;
  
  // Relationships
  followUser(userId: string): Promise<void>;
  unfollowUser(userId: string): Promise<void>;
  getFollowRequests(): Promise<FollowRequest[]>;
  approveFollowRequest(requestId: string): Promise<void>;
  rejectFollowRequest(requestId: string): Promise<void>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  muteUser(userId: string): Promise<void>;
  unmuteUser(userId: string): Promise<void>;
  
  // Profiles
  getUserProfile(userId: string): Promise<UserProfile>;
  getUserPosts(userId: string, page: number): Promise<PaginatedPosts>;
  updateProfile(data: ProfileUpdateData): Promise<UserProfile>;
  togglePrivateMode(): Promise<void>;
  
  // Reporting
  reportPost(postId: string, category: string, reason?: string): Promise<void>;
  
  // Moderation (admin)
  getReports(page: number): Promise<PaginatedReports>;
  hidePost(postId: string): Promise<void>;
  unhidePost(postId: string): Promise<void>;
  dismissReport(reportId: string): Promise<void>;
}
```

## Data Models

### Post Data Structure

```typescript
interface Post {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  locationId: string | null;
  customCountry: string | null;
  customState: string | null;
  customArea: string | null;
  locationDisplay: string; // Formatted location string
  caption: string;
  mediaUrls: string[];
  mediaTypes: ('IMAGE' | 'VIDEO')[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked: boolean; // For current user
  isSaved: boolean; // For current user
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  text: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean; // For current user
  isFollowedBy: boolean; // For current user
  isBlocked: boolean; // For current user
  isMuted: boolean; // For current user
  hasRequestedFollow: boolean; // For current user
}
```

### Location Detection

```typescript
interface LocationData {
  type: 'auto' | 'manual';
  locationId?: string; // Reference to existing Location
  customCountry?: string;
  customState?: string;
  customArea?: string;
  latitude?: number;
  longitude?: number;
}

// Auto-detection flow:
// 1. Request device location permission
// 2. Get coordinates from device GPS
// 3. Reverse geocode to get place name (use external API or Location table)
// 4. Store coordinates and resolved location

// Manual selection flow:
// 1. Search existing Location table
// 2. Allow custom text input for country/state/area
// 3. Store selected or custom location data
```

## Error Handling

### Backend Error Responses

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Common error scenarios:
// - 401: Unauthenticated (no token or invalid token)
// - 403: Forbidden (blocked user, private profile without follow)
// - 404: Resource not found (post, user, comment)
// - 409: Conflict (duplicate like, already following)
// - 422: Validation error (missing required fields, invalid data)
// - 500: Server error (database failure, unexpected error)
```

### Frontend Error Handling

- Display toast notifications for user-facing errors
- Log detailed errors to console for debugging
- Retry logic for network failures
- Graceful degradation for missing data
- Offline mode indicators

## Testing Strategy

### Backend Testing

**Unit Tests** (Optional - marked in tasks):
- Service layer methods (post creation, interactions, relationships)
- Validation logic (input sanitization, permission checks)
- Utility functions (location formatting, query builders)

**Integration Tests** (Optional - marked in tasks):
- API endpoint responses
- Database operations through Prisma
- Authentication middleware
- Block/mute filtering logic

### Frontend Testing

**Component Tests** (Optional - marked in tasks):
- PostCard rendering with different states
- CommentList interaction
- LocationPicker search functionality
- MediaUploader validation

**Integration Tests** (Optional - marked in tasks):
- Feed loading and pagination
- Post creation flow
- User relationship actions
- Profile navigation

### Manual Testing Scenarios

1. **Post Creation**: Create post with auto-location, manual location, multiple images, video
2. **Feed Browsing**: Scroll through global feed, location feed, saved posts
3. **Interactions**: Like/unlike, comment, save/unsave on various posts
4. **Relationships**: Follow public user, request follow on private user, block user, mute user
5. **Profiles**: View own profile, public profile, private profile (with/without follow)
6. **Reporting**: Report post, view moderation queue, hide/unhide post
7. **Blocking**: Verify blocked users cannot see each other's content
8. **Responsive Design**: Test on mobile (iOS/Android) and web (desktop/tablet)

## Security Considerations

### Authentication & Authorization

- All write operations require valid JWT token
- User can only delete own posts and comments
- Admin role required for moderation actions
- Block relationships enforced at query level

### Data Validation

- Sanitize user input (caption, comments, custom location)
- Validate media file types and sizes
- Limit caption length (e.g., 2000 characters)
- Limit comment length (e.g., 500 characters)
- Rate limiting on post creation (e.g., 10 posts per hour)

### Privacy & Safety

- Blocked users completely hidden from each other
- Private profiles require follow approval
- Muted users hidden without notification
- Report submissions anonymous to reported user
- Admin actions logged for audit trail

### Media Handling

- Validate file types (images: jpg, png, gif; videos: mp4, mov)
- Enforce file size limits (10MB per file, 50MB total per post)
- Generate thumbnails for images
- Store media with unique filenames to prevent collisions
- Implement virus scanning for uploaded files (future enhancement)

## Performance Optimization

### Database Indexing

```sql
-- Indexes for common queries
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_location_id ON community_posts(location_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_hidden ON community_posts(is_hidden);
CREATE INDEX idx_post_likes_user_post ON post_likes(user_id, post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_muted_users_muter ON muted_users(muter_id);
CREATE INDEX idx_follow_requests_following ON follow_requests(following_id, status);
```

### Query Optimization

- Use pagination for all list endpoints (20 items per page)
- Eager load related data (user, location) to avoid N+1 queries
- Cache user profile stats (update on write operations)
- Use database transactions for multi-step operations
- Implement query result caching for popular content (future enhancement)

### Frontend Optimization

- Lazy load images with placeholders
- Implement virtual scrolling for long feeds
- Cache API responses with React Query or SWR
- Debounce search inputs
- Optimize image sizes before upload
- Use memoization for expensive computations

## Responsive Design Guidelines

### Mobile (< 768px)

- Single column layout
- Full-width post cards
- Bottom tab navigation
- Touch-optimized buttons (min 44x44px)
- Swipe gestures for interactions
- Modal overlays for composer and detail views

### Desktop (>= 768px)

- Multi-column layout (sidebar + feed + suggestions)
- Fixed-width post cards (max 600px)
- Hover states for interactive elements
- Keyboard shortcuts for navigation
- Inline composer in feed
- Side panel for post details

### Design Tokens

```typescript
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 22, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 14, fontWeight: 'normal' },
    small: { fontSize: 12, fontWeight: 'normal' },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};
```

## Future Extensibility

The architecture is designed to support future enhancements without major refactoring:

### Hashtags
- Add `hashtags` field to `CommunityPost` model (string array)
- Create `Hashtag` model with usage count
- Add hashtag search endpoint
- Implement hashtag autocomplete in composer

### Map View
- Add map component with post markers
- Cluster nearby posts
- Filter by map bounds
- Show post preview on marker click

### Advanced Moderation
- Add user reputation scores
- Implement auto-moderation rules
- Add moderator roles and permissions
- Create moderation action history
- Add appeal system for hidden posts

### Analytics
- Track post engagement metrics
- User activity analytics
- Popular locations dashboard
- Content performance insights

### Notifications
- Real-time notifications for likes, comments, follows
- Push notifications for mobile
- Email digests for activity
- Notification preferences

### Direct Messaging
- Extend existing chat system for community users
- Message requests for non-followers
- Share posts in messages

## Implementation Notes

- Reuse existing authentication system (JWT tokens, AuthContext)
- Leverage existing Location model for location data
- Follow existing code patterns (service/controller/route layers)
- Use existing error handling middleware
- Maintain consistency with existing UI components
- Ensure compatibility with both mobile (Expo) and web frontends

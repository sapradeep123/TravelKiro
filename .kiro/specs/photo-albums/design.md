# Photo Albums Feature - Design Document

## Overview

The Photo Albums feature enables users to organize their community photos into collections (albums) with full CRUD operations, comment management, and moderation capabilities. This design integrates with the existing community posts system while adding a new layer of photo organization.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React Native)                  │
├─────────────────────────────────────────────────────────────┤
│  Albums Screen  │  Album Detail  │  Photo Viewer  │  Admin  │
│  - Album List   │  - Photo Grid  │  - Full View   │  - Queue│
│  - Create/Edit  │  - Add Photos  │  - Comments    │  - Review│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/albums/*  │  /api/album-photos/*  │  /api/reports/*   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer (Business Logic)             │
├─────────────────────────────────────────────────────────────┤
│  AlbumService   │  AlbumPhotoService  │  CommentService     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  Albums  │  AlbumPhotos  │  PhotoComments  │  CommentReports│
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### Database Schema (Prisma)

```prisma
enum AlbumPrivacy {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}

enum CommentStatus {
  ENABLED
  DISABLED
  HIDDEN
}

enum ReportCategory {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  HATE_SPEECH
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  DISMISSED
  ACTION_TAKEN
}

model Album {
  id                    String        @id @default(uuid())
  userId                String
  name                  String
  description           String?
  privacy               AlbumPrivacy  @default(PUBLIC)
  defaultCommentStatus  CommentStatus @default(ENABLED)
  coverPhotoUrl         String?
  photoCount            Int           @default(0)
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  user                  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  photos                AlbumPhoto[]
  
  @@index([userId])
  @@index([privacy])
  @@index([createdAt])
  @@map("albums")
}

model AlbumPhoto {
  id                String        @id @default(uuid())
  albumId           String
  postId            String
  photoUrl          String
  commentStatus     CommentStatus @default(ENABLED)
  order             Int           @default(0)
  addedAt           DateTime      @default(now())
  
  album             Album         @relation(fields: [albumId], references: [id], onDelete: Cascade)
  post              CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  comments          PhotoComment[]
  
  @@unique([albumId, postId])
  @@index([albumId])
  @@index([postId])
  @@map("album_photos")
}

model PhotoComment {
  id              String         @id @default(uuid())
  albumPhotoId    String
  userId          String
  text            String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  albumPhoto      AlbumPhoto     @relation(fields: [albumPhotoId], references: [id], onDelete: Cascade)
  user            User           @relation("PhotoComments", fields: [userId], references: [id], onDelete: Cascade)
  reports         CommentReport[]
  
  @@index([albumPhotoId])
  @@index([userId])
  @@index([createdAt])
  @@map("photo_comments")
}

model CommentReport {
  id              String         @id @default(uuid())
  commentId       String
  reporterId      String
  category        ReportCategory
  reason          String?
  status          ReportStatus   @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  actionTaken     String?
  createdAt       DateTime       @default(now())
  
  comment         PhotoComment   @relation(fields: [commentId], references: [id], onDelete: Cascade)
  reporter        User           @relation("CommentReporter", fields: [reporterId], references: [id])
  reviewer        User?          @relation("CommentReviewer", fields: [reviewedBy], references: [id])
  
  @@unique([commentId, reporterId])
  @@index([commentId])
  @@index([reporterId])
  @@index([status])
  @@map("comment_reports")
}
```

### Additional Relations to Existing Models

```prisma
// Add to User model
model User {
  // ... existing fields
  albums            Album[]
  photoComments     PhotoComment[]     @relation("PhotoComments")
  commentReports    CommentReport[]    @relation("CommentReporter")
  reviewedReports   CommentReport[]    @relation("CommentReviewer")
}

// Add to CommunityPost model
model CommunityPost {
  // ... existing fields
  albumPhotos       AlbumPhoto[]
}
```

## Components and Interfaces

### Frontend Components

#### 1. Albums Screen (`frontend/app/(tabs)/albums.tsx`)
- Displays grid of user's albums
- Create new album button
- Album cards with cover photo, name, photo count
- Privacy indicator icons

#### 2. Album Detail Screen (`frontend/app/album/[id].tsx`)
- Album header with name, description, edit button
- Photo grid layout
- Add photos button
- Photo management (remove from album)

#### 3. Photo Viewer Modal (`frontend/components/albums/PhotoViewerModal.tsx`)
- Full-screen photo display
- Previous/Next navigation
- Comments section
- Comment controls (for owner)
- Report button (for non-owners)

#### 4. Create/Edit Album Modal (`frontend/components/albums/AlbumFormModal.tsx`)
- Album name input
- Description textarea
- Privacy selector
- Default comment status selector
- Save/Cancel buttons

#### 5. Add Photos Modal (`frontend/components/albums/AddPhotosModal.tsx`)
- Grid of user's community post photos
- Multi-select functionality
- Filter/search options
- Add selected button

#### 6. Comment Section (`frontend/components/albums/PhotoComments.tsx`)
- Comment list with avatars
- Comment input field
- Delete button (own comments)
- Report button (others' comments)
- Comment status indicator

#### 7. Report Comment Modal (`frontend/components/albums/ReportCommentModal.tsx`)
- Report category selector
- Optional reason textarea
- Submit/Cancel buttons

#### 8. Admin Moderation Queue (`frontend/app/(admin)/comment-reports.tsx`)
- List of reported comments
- Filter by status
- Comment context display
- Action buttons (Delete, Warn, Ban, Dismiss)

### Backend API Endpoints

#### Album Management
```
POST   /api/albums                    - Create album
GET    /api/albums                    - Get user's albums
GET    /api/albums/:id                - Get album details
PUT    /api/albums/:id                - Update album
DELETE /api/albums/:id                - Delete album
GET    /api/albums/:id/photos         - Get album photos
```

#### Photo Management
```
POST   /api/albums/:id/photos         - Add photos to album
DELETE /api/albums/:id/photos/:photoId - Remove photo from album
PUT    /api/albums/:id/photos/:photoId/comment-status - Update comment status
PUT    /api/albums/:id/photos/:photoId/order - Reorder photo
```

#### Comment Management
```
GET    /api/album-photos/:id/comments - Get photo comments
POST   /api/album-photos/:id/comments - Add comment
DELETE /api/photo-comments/:id        - Delete comment
```

#### Reporting
```
POST   /api/photo-comments/:id/report - Report comment
GET    /api/admin/comment-reports     - Get all reports (admin)
PUT    /api/admin/comment-reports/:id - Review report (admin)
```

## Service Layer

### AlbumService (`backend/src/services/albumService.ts`)

```typescript
class AlbumService {
  async createAlbum(data: CreateAlbumDto): Promise<Album>
  async getAlbums(userId: string, viewerId?: string): Promise<Album[]>
  async getAlbum(albumId: string, viewerId?: string): Promise<Album>
  async updateAlbum(albumId: string, userId: string, data: UpdateAlbumDto): Promise<Album>
  async deleteAlbum(albumId: string, userId: string): Promise<void>
  async checkPermission(albumId: string, userId: string): Promise<boolean>
}
```

### AlbumPhotoService (`backend/src/services/albumPhotoService.ts`)

```typescript
class AlbumPhotoService {
  async addPhotos(albumId: string, postIds: string[], userId: string): Promise<AlbumPhoto[]>
  async removePhoto(albumPhotoId: string, userId: string): Promise<void>
  async getAlbumPhotos(albumId: string, viewerId?: string): Promise<AlbumPhoto[]>
  async updateCommentStatus(albumPhotoId: string, status: CommentStatus, userId: string): Promise<AlbumPhoto>
  async reorderPhoto(albumPhotoId: string, newOrder: number, userId: string): Promise<void>
}
```

### PhotoCommentService (`backend/src/services/photoCommentService.ts`)

```typescript
class PhotoCommentService {
  async getComments(albumPhotoId: string, viewerId?: string): Promise<PhotoComment[]>
  async addComment(albumPhotoId: string, userId: string, text: string): Promise<PhotoComment>
  async deleteComment(commentId: string, userId: string): Promise<void>
  async canViewComments(albumPhotoId: string, userId?: string): Promise<boolean>
}
```

### CommentReportService (`backend/src/services/commentReportService.ts`)

```typescript
class CommentReportService {
  async reportComment(commentId: string, reporterId: string, data: ReportDto): Promise<CommentReport>
  async getReports(filters: ReportFilters): Promise<CommentReport[]>
  async reviewReport(reportId: string, adminId: string, action: ReviewAction): Promise<CommentReport>
  async dismissReport(reportId: string, adminId: string): Promise<CommentReport>
}
```

## Error Handling

### Error Types
- `AlbumNotFoundError` - Album doesn't exist
- `UnauthorizedError` - User doesn't have permission
- `AlbumPrivacyError` - User can't access private album
- `PhotoAlreadyInAlbumError` - Photo already added
- `CommentDisabledError` - Comments are disabled
- `DuplicateReportError` - User already reported this comment

### Error Responses
```typescript
{
  error: string,
  message: string,
  statusCode: number
}
```

## Testing Strategy

### Unit Tests
- Service layer methods
- Permission checking logic
- Comment status validation
- Report duplicate detection

### Integration Tests
- Album CRUD operations
- Photo add/remove operations
- Comment management
- Report submission and review

### E2E Tests
- Create album and add photos flow
- Comment on photo and report flow
- Admin moderation workflow
- Privacy settings enforcement

## Security Considerations

1. **Authorization**
   - Verify album ownership for edit/delete operations
   - Check privacy settings before displaying albums
   - Validate user permissions for comment operations

2. **Input Validation**
   - Sanitize album names and descriptions
   - Validate comment text length
   - Verify report categories

3. **Rate Limiting**
   - Limit album creation (5 per hour)
   - Limit comment posting (20 per hour)
   - Limit report submissions (10 per hour)

4. **Data Privacy**
   - Respect album privacy settings
   - Hide reported comments from public view during review
   - Anonymize reporter information in some contexts

## Performance Optimization

1. **Database Indexing**
   - Index on userId, albumId, postId
   - Index on privacy and status fields
   - Composite index on (albumId, order) for photo ordering

2. **Caching**
   - Cache album metadata (5 minutes)
   - Cache photo counts
   - Cache permission checks (1 minute)

3. **Pagination**
   - Paginate album lists (20 per page)
   - Paginate photo grids (50 per page)
   - Paginate comments (30 per page)

4. **Lazy Loading**
   - Load album covers first, then details
   - Load comments on demand
   - Infinite scroll for photo grids

## Migration Strategy

1. Create new database tables (Album, AlbumPhoto, PhotoComment, CommentReport)
2. Add relations to existing User and CommunityPost tables
3. Run migration to create tables and indexes
4. Deploy backend API endpoints
5. Deploy frontend components
6. Monitor for errors and performance issues

## Future Enhancements

- Collaborative albums (multiple owners)
- Album sharing via link
- Photo tagging and search
- Album templates
- Bulk photo operations
- Export album as PDF/slideshow

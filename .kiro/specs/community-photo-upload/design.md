# Design Document: Community Photo Upload

## Overview

This design implements a comprehensive photo upload feature for the community feed, enabling users to create rich photo posts with camera/gallery access, multiple image uploads, location tagging, captions, and preview functionality. The solution leverages existing upload infrastructure while adding community-specific features like location picker and enhanced preview capabilities.

## Architecture

### High-Level Flow

```
User taps create post → Select camera/gallery → Pick multiple images (up to 10) →
Add location tag (optional) → Write caption (optional) → Preview screen →
Reorder images → Submit → Upload to backend → Create community post → Display in feed
```

### Components

1. **Photo Upload Modal** (React Native/Expo)
   - Camera and gallery access via expo-image-picker
   - Multi-image selection (up to 10 images)
   - Image preview grid with remove functionality
   - Image reordering with drag-and-drop

2. **Location Picker Component**
   - Searchable location dropdown
   - Integration with existing location database
   - Display selected location with remove option

3. **Caption Input Component**
   - Multi-line text input
   - Character counter (2000 max)
   - Emoji support

4. **Preview Screen**
   - Full post preview before submission
   - Edit capabilities for all fields
   - Upload progress indicator

5. **Backend Upload Service** (Express + Multer)
   - Reuse existing package upload infrastructure
   - Create community-specific upload endpoint
   - Image optimization with sharp
   - Integration with community post creation

## Components and Interfaces

### Frontend Component Structure

#### CreatePhotoPostModal Component

```typescript
interface CreatePhotoPostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

interface PhotoUploadState {
  images: SelectedImage[];
  caption: string;
  selectedLocation: Location | null;
  isPreview: boolean;
  uploading: boolean;
  uploadProgress: number;
}

interface SelectedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  order: number; // For maintaining user-defined order
}
```

**Responsibilities:**
- Manage photo upload workflow state
- Handle camera/gallery access
- Coordinate between sub-components
- Submit final post to backend

#### ImagePickerSection Component

```typescript
interface ImagePickerSectionProps {
  images: SelectedImage[];
  onImagesSelected: (images: SelectedImage[]) => void;
  onImageRemoved: (index: number) => void;
  onImagesReordered: (images: SelectedImage[]) => void;
  maxImages: number;
}
```

**Responsibilities:**
- Display camera and gallery buttons
- Handle image selection from camera or gallery
- Validate file types (JPEG, PNG, WebP) and sizes (10MB max)
- Display image grid with thumbnails
- Provide remove functionality
- Enable drag-and-drop reordering

#### LocationPickerSection Component

```typescript
interface LocationPickerSectionProps {
  selectedLocation: Location | null;
  onLocationSelected: (location: Location) => void;
  onLocationRemoved: () => void;
}

interface Location {
  id: string;
  country: string;
  state: string;
  area: string;
  displayName: string; // Formatted as "Area, State, Country"
}
```

**Responsibilities:**
- Display location search input
- Fetch and filter locations from backend
- Show searchable dropdown with results
- Display selected location with remove button

#### CaptionInputSection Component

```typescript
interface CaptionInputSectionProps {
  caption: string;
  onCaptionChange: (text: string) => void;
  maxLength: number;
}
```

**Responsibilities:**
- Multi-line text input
- Character counter display
- Warning when approaching limit
- Emoji keyboard support

#### PhotoPostPreview Component

```typescript
interface PhotoPostPreviewProps {
  images: SelectedImage[];
  caption: string;
  location: Location | null;
  onEdit: () => void;
  onSubmit: () => void;
  uploading: boolean;
  uploadProgress: number;
}
```

**Responsibilities:**
- Display post as it will appear in feed
- Show all images in scrollable carousel
- Display caption and location
- Provide edit and submit buttons
- Show upload progress during submission

### Backend API Design

#### Community Photo Upload Endpoint

**POST /api/community/upload-images**

Request:
- Content-Type: multipart/form-data
- Body: Multiple files with field name "images"
- Authentication: Required (JWT token)

Response:
```json
{
  "success": true,
  "urls": [
    "http://localhost:3000/uploads/community/1234567890-image1.jpg",
    "http://localhost:3000/uploads/community/1234567890-image2.jpg"
  ],
  "count": 2,
  "message": "Successfully uploaded and optimized 2 image(s)"
}
```

Error Response:
```json
{
  "error": "File size exceeds 10MB limit",
  "message": "image1.jpg is 12.5MB",
  "details": "Please select images under 10MB"
}
```

#### Modified Community Post Creation

The existing `POST /api/community/posts` endpoint already supports:
- `mediaUrls: string[]` - Array of image URLs
- `mediaTypes: ('IMAGE' | 'VIDEO')[]` - Array of media types
- `locationId?: string` - Optional location reference
- `caption: string` - Post caption

No backend changes needed for post creation, only add the upload endpoint.

### Backend Implementation Details

#### Multer Configuration for Community

```typescript
// backend/src/middleware/upload.ts

// Add community upload directory
const communityUploadDir = path.join(__dirname, '../../uploads/community');
if (!fs.existsSync(communityUploadDir)) {
  fs.mkdirSync(communityUploadDir, { recursive: true });
}

const communityStorage = multer.diskStorage({
  destination: communityUploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}-${nameWithoutExt}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

export const communityImageUpload = multer({
  storage: communityStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per upload
  }
});
```

#### Upload Controller Extension

```typescript
// backend/src/controllers/uploadController.ts

export class UploadController {
  // ... existing uploadPackageImages method ...

  async uploadCommunityImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          error: 'No files uploaded',
          message: 'Please select at least one image to upload'
        });
      }

      const uploadDir = path.join(__dirname, '../../uploads/community');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const urls: string[] = [];

      // Process each image with optimization
      for (const file of files) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const filename = `${uniqueSuffix}-${nameWithoutExt}.jpg`;
        const filepath = path.join(uploadDir, filename);

        // Compress and optimize image for mobile viewing
        await sharp(file.path)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85, progressive: true })
          .toFile(filepath);

        // Delete original file
        fs.unlinkSync(file.path);

        urls.push(`${baseUrl}/uploads/community/${filename}`);
      }

      res.status(200).json({ 
        success: true, 
        urls,
        count: urls.length,
        message: `Successfully uploaded and optimized ${urls.length} image(s)`
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          error: 'Upload failed',
          message: error.message
        });
      } else {
        res.status(500).json({ 
          error: 'Upload failed',
          message: 'An unexpected error occurred during upload'
        });
      }
    }
  }
}
```

#### Community Routes Extension

```typescript
// backend/src/routes/community.ts

import { communityImageUpload } from '../middleware/upload';
import uploadController from '../controllers/uploadController';

// Add upload endpoint
router.post(
  '/upload-images',
  authenticate,
  communityImageUpload.array('images', 10),
  handleMulterError,
  uploadController.uploadCommunityImages
);
```

## Data Models

No database schema changes required. The existing `CommunityPost` model already supports:

```prisma
model CommunityPost {
  id          String   @id @default(uuid())
  userId      String
  locationId  String?
  caption     String
  mediaUrls   String[]
  mediaTypes  MediaType[]
  // ... other fields
}
```

## User Experience Flow

### 1. Create Post Flow

```
1. User taps "Create Post" button in community feed
2. Modal opens with two options: "Take Photo" and "Choose from Gallery"
3. User selects option:
   - Take Photo: Opens camera, captures photo, returns to modal
   - Choose from Gallery: Opens gallery with multi-select, returns to modal
4. Selected images appear in grid (up to 10)
5. User can:
   - Remove individual images by tapping X button
   - Add more images (if under 10 limit)
   - Reorder images by drag-and-drop
6. User taps "Add Location" (optional)
   - Search input appears
   - User types to filter locations
   - Selects location from dropdown
   - Location tag appears with remove option
7. User taps caption field and types (optional)
   - Character counter shows remaining characters
   - Warning appears when approaching 2000 limit
8. User taps "Preview" button
9. Preview screen shows post as it will appear
10. User reviews and taps "Post"
11. Upload progress indicator appears
12. On success: Modal closes, feed refreshes, new post appears
13. On error: Error message with retry option
```

### 2. Image Selection Validation

```
- File type check: Only JPEG, PNG, WebP allowed
- File size check: Maximum 10MB per image
- Count check: Maximum 10 images per post
- Display appropriate error messages for violations
```

### 3. Location Search Flow

```
1. User taps "Add Location"
2. Search input appears with placeholder "Search locations..."
3. User types query (e.g., "Kerala")
4. Frontend debounces input (300ms)
5. API call to /api/locations/search?q=Kerala
6. Results appear in dropdown (formatted as "Area, State, Country")
7. User taps location
8. Location tag appears below images
9. User can remove by tapping X on tag
```

## Error Handling

### Frontend Error Scenarios

1. **Camera Permission Denied**
   - Detection: expo-image-picker returns permission error
   - Action: Show alert explaining camera permission needed

2. **Gallery Permission Denied**
   - Detection: expo-image-picker returns permission error
   - Action: Show alert explaining gallery permission needed

3. **Invalid File Type**
   - Detection: Check mimeType against allowed types
   - Action: Show alert listing allowed formats

4. **File Size Exceeds Limit**
   - Detection: Check fileSize > 10MB
   - Action: Show alert with file name and size

5. **Too Many Images**
   - Detection: Check images.length >= 10
   - Action: Disable add button, show message

6. **Upload Network Error**
   - Detection: Catch axios error
   - Action: Show error alert with retry button, preserve draft

7. **Caption Too Long**
   - Detection: Check caption.length > 2000
   - Action: Show warning, prevent submission

### Backend Error Scenarios

1. **Invalid File Type**
   - Handled by: Multer fileFilter
   - Response: 400 with error message

2. **File Size Exceeds Limit**
   - Handled by: Multer limits
   - Response: 400 with error message

3. **Too Many Files**
   - Handled by: Multer limits
   - Response: 400 with error message

4. **Disk Space Error**
   - Handled by: Try-catch in controller
   - Response: 500 with error message

5. **Image Processing Error**
   - Handled by: Try-catch around sharp operations
   - Response: 500 with error message

## Testing Strategy

### Frontend Testing

1. **Image Selection**
   - Test: Open camera and capture photo
   - Test: Open gallery and select single image
   - Test: Open gallery and select multiple images (up to 10)
   - Test: Attempt to select more than 10 images
   - Test: Select invalid file type
   - Test: Select oversized file (>10MB)

2. **Image Management**
   - Test: Remove individual images
   - Test: Reorder images via drag-and-drop
   - Test: Add more images after initial selection

3. **Location Picker**
   - Test: Search for locations
   - Test: Select location from results
   - Test: Remove selected location
   - Test: Submit without location (optional)

4. **Caption Input**
   - Test: Type caption under 2000 characters
   - Test: Type caption exceeding 2000 characters
   - Test: Submit without caption (optional)
   - Test: Multi-line caption formatting

5. **Preview and Submission**
   - Test: Preview displays all content correctly
   - Test: Edit from preview returns to edit mode
   - Test: Submit uploads images and creates post
   - Test: Handle upload errors gracefully
   - Test: Preserve draft on error

### Backend Testing

1. **Upload Endpoint**
   - Test: Upload single image
   - Test: Upload multiple images (up to 10)
   - Test: Reject invalid file types
   - Test: Reject oversized files
   - Test: Reject more than 10 files
   - Test: Require authentication

2. **Image Processing**
   - Test: Images are optimized and compressed
   - Test: Images maintain aspect ratio
   - Test: Images are resized appropriately
   - Test: Original files are cleaned up

3. **Integration**
   - Test: Complete post creation flow with images
   - Test: Post displays correctly in feed
   - Test: Images load with proper caching

## Implementation Notes

### Frontend Dependencies

```json
{
  "expo-image-picker": "~14.x.x",
  "react-native-draggable-flatlist": "^4.0.1"
}
```

### Permissions Required

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Butterfliy to access your photos to share travel memories",
          "cameraPermission": "Allow Butterfliy to access your camera to capture travel moments"
        }
      ]
    ]
  }
}
```

### Backend Directory Structure

```
backend/
  uploads/
    community/
      [timestamp]-[random]-image.jpg
      [timestamp]-[random]-image.png
    packages/
      [existing package images]
```

### Performance Considerations

1. **Image Optimization**
   - Resize to max 1200x1200 (mobile-optimized)
   - JPEG compression at 85% quality
   - Progressive JPEG for faster loading

2. **Upload Performance**
   - Upload images before creating post
   - Show progress indicator during upload
   - Parallel upload processing on backend

3. **Location Search**
   - Debounce search input (300ms)
   - Limit results to 20 locations
   - Cache recent searches

4. **Image Reordering**
   - Use optimized drag-and-drop library
   - Update order state immediately
   - No backend call until submission

### Security Considerations

1. **File Validation**: Both client and server-side
2. **File Size Limits**: Enforced by multer (10MB)
3. **Authentication**: Required for upload endpoint
4. **Filename Sanitization**: Use generated names, not user-provided
5. **Rate Limiting**: Reuse existing rate limiting middleware
6. **MIME Type Validation**: Check actual file content, not just extension

### Accessibility Considerations

1. **Screen Reader Support**: Label all buttons and inputs
2. **Keyboard Navigation**: Support tab navigation in web view
3. **Color Contrast**: Ensure text is readable on all backgrounds
4. **Touch Targets**: Minimum 44x44 points for all interactive elements
5. **Error Messages**: Clear, descriptive error messages

## Alternative Approaches Considered

### Cloud Storage (AWS S3, Cloudinary)

**Pros:**
- Scalable
- CDN integration
- Advanced image transformations

**Cons:**
- Additional service dependency
- Cost considerations
- More complex setup

**Decision:** Start with local storage for MVP, migrate to cloud storage in future if needed. The existing package upload already uses local storage successfully.

### Direct Camera Integration

**Pros:**
- More control over camera features
- Custom camera UI

**Cons:**
- More complex implementation
- Platform-specific code
- Maintenance overhead

**Decision:** Use expo-image-picker for simplicity and cross-platform support.

### Inline Upload vs Separate Endpoint

**Pros of Inline:**
- Single API call
- Simpler flow

**Cons of Inline:**
- Larger payload
- Harder to handle errors
- No progress tracking

**Decision:** Use separate upload endpoint (like package upload) for better error handling and progress tracking.

## Migration and Rollout

### Phase 1: Core Upload Feature
- Implement image picker and upload
- Basic caption input
- Simple submission flow

### Phase 2: Enhanced Features
- Location picker integration
- Image reordering
- Preview screen

### Phase 3: Polish
- Upload progress indicator
- Error handling improvements
- Performance optimizations

### Backward Compatibility

- Existing posts without images continue to work
- Existing posts with external URLs continue to work
- No database migration required

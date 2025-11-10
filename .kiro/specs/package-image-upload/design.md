# Design Document: Package Image Upload

## Overview

This design implements a complete image upload solution for the package creation system, replacing the current URL-based approach with direct file uploads. The solution includes frontend file selection and preview, backend file handling with multer, and file storage in a dedicated uploads directory.

## Architecture

### High-Level Flow

```
User selects images → Frontend validates → Preview displayed → 
Form submitted → Images uploaded to backend → Files stored → 
URLs returned → Package created with image URLs
```

### Components

1. **Frontend Image Upload Component** (React Native/Expo)
   - File picker integration using expo-image-picker
   - Image preview grid with remove functionality
   - Client-side validation (file type, size)
   - Multi-file upload support

2. **Backend Upload Endpoint** (Express + Multer)
   - Multipart form data handling
   - Server-side validation
   - File storage management
   - URL generation for stored files

3. **File Storage System**
   - Local filesystem storage in `backend/uploads/packages/`
   - Unique filename generation
   - Static file serving via Express

## Components and Interfaces

### Frontend Component Structure

#### ImageUploadField Component

```typescript
interface ImageUploadFieldProps {
  images: SelectedImage[];
  onImagesChange: (images: SelectedImage[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

interface SelectedImage {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}
```

**Responsibilities:**
- Display upload button and image grid
- Handle image selection via expo-image-picker
- Validate file types (JPEG, PNG, WebP) and sizes (max 5MB)
- Display thumbnail previews with remove buttons
- Manage selected images state

#### Modified CreatePackage Component

**Changes:**
- Replace images text input with ImageUploadField component
- Handle FormData submission instead of JSON
- Include image files in multipart/form-data request
- Display upload progress indicator

### Backend API Design

#### New Upload Endpoint

**POST /api/packages/upload-images**

Request:
- Content-Type: multipart/form-data
- Body: Multiple files with field name "images"
- Authentication: Required (JWT token)

Response:
```json
{
  "success": true,
  "urls": [
    "http://localhost:3000/uploads/packages/1234567890-image1.jpg",
    "http://localhost:3000/uploads/packages/1234567890-image2.jpg"
  ]
}
```

Error Response:
```json
{
  "error": "File size exceeds 5MB limit",
  "details": ["image1.jpg is 6.2MB"]
}
```

#### Modified Package Creation Endpoint

**POST /api/packages**

The existing endpoint will be updated to:
1. Accept multipart/form-data instead of JSON
2. Handle image uploads inline with package creation
3. Store uploaded image URLs in the package record

Alternative approach: Use the separate upload endpoint first, then submit package data with URLs.

### Backend Implementation Details

#### Multer Configuration

```typescript
// backend/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/packages/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

export const packageImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

#### Upload Controller

```typescript
// backend/src/controllers/uploadController.ts
export class UploadController {
  async uploadPackageImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const urls = files.map(file => 
        `${req.protocol}://${req.get('host')}/uploads/packages/${file.filename}`
      );

      res.status(200).json({ success: true, urls });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  }
}
```

#### Static File Serving

```typescript
// backend/src/index.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## Data Models

No database schema changes required. The Package model already supports an `images` field as an array of strings (URLs).

### Existing Package Model (Prisma)

```prisma
model Package {
  id          String   @id @default(uuid())
  title       String
  description String
  images      String[] // Already supports array of image URLs
  // ... other fields
}
```

## Error Handling

### Frontend Error Scenarios

1. **File Type Invalid**
   - Detection: Check file.mimeType against allowed types
   - Action: Show alert, don't add to selection

2. **File Size Exceeds Limit**
   - Detection: Check file.fileSize > 5MB
   - Action: Show alert with file name and size

3. **Upload Network Error**
   - Detection: Catch axios error
   - Action: Show error alert, keep form editable

4. **No Images Selected**
   - Detection: Check if images array is empty on submit
   - Action: Allow submission (images are optional)

### Backend Error Scenarios

1. **Invalid File Type**
   - Handled by: Multer fileFilter
   - Response: 400 with error message

2. **File Size Exceeds Limit**
   - Handled by: Multer limits
   - Response: 400 with error message

3. **Disk Space Error**
   - Handled by: Try-catch in controller
   - Response: 500 with generic error

4. **Missing Upload Directory**
   - Prevention: Create directory on server startup
   - Fallback: Multer will create if missing

## Testing Strategy

### Frontend Testing

1. **Image Selection**
   - Test: Select single image
   - Test: Select multiple images
   - Test: Cancel selection

2. **Validation**
   - Test: Select invalid file type (PDF, etc.)
   - Test: Select oversized file (>5MB)
   - Test: Select valid images

3. **Preview Display**
   - Test: Thumbnails render correctly
   - Test: Remove button functionality
   - Test: Multiple images display in grid

4. **Form Submission**
   - Test: Submit with images
   - Test: Submit without images
   - Test: Handle upload errors

### Backend Testing

1. **Upload Endpoint**
   - Test: Upload single image
   - Test: Upload multiple images
   - Test: Reject invalid file types
   - Test: Reject oversized files
   - Test: Require authentication

2. **File Storage**
   - Test: Files saved with unique names
   - Test: Files accessible via URL
   - Test: Directory structure maintained

3. **Integration**
   - Test: Complete package creation flow with images
   - Test: Package record contains correct image URLs

## Implementation Notes

### Frontend Dependencies

```json
{
  "expo-image-picker": "~14.x.x"
}
```

### Backend Directory Structure

```
backend/
  uploads/
    packages/
      [timestamp]-[random]-image.jpg
      [timestamp]-[random]-image.png
```

### Security Considerations

1. **File Type Validation**: Both client and server-side
2. **File Size Limits**: Enforced by multer
3. **Authentication**: Required for upload endpoint
4. **Filename Sanitization**: Use generated names, not user-provided
5. **Rate Limiting**: Consider adding to prevent abuse (future enhancement)

### Performance Considerations

1. **Image Optimization**: Consider adding image compression (future enhancement)
2. **CDN Integration**: For production, consider cloud storage (future enhancement)
3. **Lazy Loading**: Frontend should lazy load image previews
4. **Chunked Upload**: Not needed for 5MB limit, but consider for larger files

## Alternative Approaches Considered

### Cloud Storage (AWS S3, Cloudinary)

**Pros:**
- Scalable
- CDN integration
- No server disk space concerns

**Cons:**
- Additional service dependency
- Cost considerations
- More complex setup

**Decision:** Start with local storage for MVP, migrate to cloud storage in future if needed.

### Base64 Encoding

**Pros:**
- Simple implementation
- No separate upload endpoint

**Cons:**
- Large payload sizes
- Poor performance
- Database bloat

**Decision:** Rejected in favor of proper file upload.

## Migration Path

Since the current system uses URL strings, the migration is seamless:
1. Deploy backend with upload endpoint
2. Deploy frontend with new upload component
3. Old packages with external URLs continue to work
4. New packages use uploaded images
5. No data migration required

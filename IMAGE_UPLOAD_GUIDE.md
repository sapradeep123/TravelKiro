# Image Upload Feature Guide

## Overview
The image upload functionality is now fully implemented in the Admin Settings page. Site administrators can upload logos and favicons directly through the interface.

## Features
- ✅ Direct image upload (no URL input needed)
- ✅ Image preview before saving
- ✅ Image cropping with aspect ratio control
- ✅ File size validation (5MB limit)
- ✅ File type validation (jpeg, jpg, png, gif, ico, svg)
- ✅ Secure upload with authentication
- ✅ Automatic file naming with timestamps

## How to Use

### 1. Access Admin Settings
- Navigate to the Admin Settings page (only accessible to SITE_ADMIN users)
- Go to the "General" tab

### 2. Upload Logo
- Click the "Upload Logo" button
- Select an image from your device
- The image will be cropped to 4:1 aspect ratio (recommended: 200x50px)
- Preview will appear immediately
- Click "Save Settings" to persist the change

### 3. Upload Favicon
- Click the "Upload Favicon" button
- Select an image from your device
- The image will be cropped to 1:1 aspect ratio (recommended: 32x32px)
- Preview will appear immediately
- Click "Save Settings" to persist the change

## Technical Details

### Backend
- **Route**: `POST /api/upload`
- **Authentication**: Required (Bearer token)
- **Authorization**: SITE_ADMIN role only
- **File Storage**: Local filesystem in `backend/uploads/` directory
- **File Serving**: Static files served at `/uploads/` endpoint
- **Validation**: 
  - Max file size: 5MB
  - Allowed types: jpeg, jpg, png, gif, ico, svg

### Frontend
- **Component**: `frontend/app/admin-settings.tsx`
- **Image Picker**: Uses `expo-image-picker` library
- **Permissions**: Requests media library access
- **Upload Method**: FormData with multipart/form-data
- **Preview**: Real-time image preview after upload

### File Structure
```
backend/
  uploads/           # Uploaded files stored here
  src/
    routes/
      upload.ts      # Upload route handler
    middleware/
      auth.ts        # Authentication middleware

frontend/
  app/
    admin-settings.tsx  # Admin settings page with upload UI
```

## Troubleshooting

### Upload Fails
1. Check if backend server is running on port 3000
2. Verify user has SITE_ADMIN role
3. Check browser console for error messages
4. Ensure file size is under 5MB
5. Verify file type is supported

### Image Not Displaying
1. Check if uploads directory exists: `backend/uploads/`
2. Verify static file serving is configured in `backend/src/index.ts`
3. Check CORS settings in backend `.env` file
4. Ensure API_URL is correctly set in frontend `.env` file

### Permission Denied
1. Verify user is logged in
2. Check user role is SITE_ADMIN
3. Verify authentication token is valid

## API Response Format

### Success Response
```json
{
  "message": "File uploaded successfully",
  "url": "/uploads/logo-1234567890.png",
  "filename": "logo-1234567890.png"
}
```

### Error Response
```json
{
  "error": "Only site administrators can upload files"
}
```

## Security Considerations
- Only authenticated SITE_ADMIN users can upload files
- File type validation prevents malicious uploads
- File size limit prevents DoS attacks
- Files are stored with unique timestamps to prevent overwrites
- CORS headers properly configured for cross-origin requests

## Future Enhancements
- Cloud storage integration (AWS S3, Cloudinary)
- Image optimization and compression
- Multiple file upload
- Drag and drop interface
- Progress bar for large uploads

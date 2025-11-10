import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/packages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - use memory storage for processing with sharp
const storage = multer.memoryStorage();

// File filter for image validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, PNG, and WebP are allowed. Received: ${file.mimetype}`));
  }
};

// Configure multer
export const packageImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files per upload
  }
});

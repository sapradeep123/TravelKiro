import { Router } from 'express';
import packageController from '../controllers/packageController';
import uploadController from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { packageImageUpload } from '../middleware/upload';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size exceeds limit',
        message: 'Each image must be less than 5MB',
        details: 'Please compress your images or select smaller files'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 images allowed per upload',
        details: 'Please select fewer images'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field',
        message: 'Invalid form field name',
        details: 'Images must be uploaded with field name "images"'
      });
    }
    
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: err.message,
        details: 'Only JPEG, PNG, and WebP images are supported'
      });
    }
    
    return res.status(500).json({
      error: 'Upload error',
      message: err.message || 'An error occurred during file upload',
      details: 'Please try again or contact support if the problem persists'
    });
  }
  next();
};

// Upload route (must come before /:id routes)
router.post('/upload-images', authenticate, packageImageUpload.array('images', 10), handleMulterError, uploadController.uploadPackageImages);

// Callback request routes (must come before /:id routes)
router.get('/callback-requests/all', authenticate, packageController.getAllCallbackRequests);
router.patch('/callback-requests/:requestId/status', authenticate, packageController.updateCallbackStatus);
router.patch('/callback-requests/:requestId/contacted', authenticate, packageController.markAsContacted);

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.get('/:id/callback-requests', authenticate, packageController.getPackageCallbackRequests);
router.post('/', authenticate, packageController.createPackage);
router.patch('/:id', authenticate, packageController.updatePackage);
router.patch('/:id/active-status', authenticate, packageController.togglePackageActiveStatus);
router.post('/:id/interest', authenticate, packageController.expressInterest);
router.post('/:id/callback-request', packageController.createCallbackRequest);
router.patch('/:id/status', authenticate, packageController.updatePackageStatus);
router.patch('/:id/archive', authenticate, packageController.archivePackage);
router.delete('/:id', authenticate, packageController.deletePackage);

export default router;

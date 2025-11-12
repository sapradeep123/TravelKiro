import { Router } from 'express';
import multer from 'multer';
import communityController from '../controllers/communityController';
import uploadController from '../controllers/uploadController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { communityImageUpload } from '../middleware/upload';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Multer error handler for community uploads
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'One or more files exceed the 10MB size limit',
        details: 'Please select smaller images'
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
  }
  
  if (err) {
    return res.status(500).json({
      error: 'Upload error',
      message: err.message || 'An error occurred during file upload',
      details: 'Please try again or contact support if the problem persists'
    });
  }
  
  next();
};

// Image Upload Route (must come before other routes)
// POST /api/community/upload-images - Upload images for community posts (auth required)
router.post('/upload-images', authenticate, communityImageUpload.array('images', 10), handleMulterError, uploadController.uploadCommunityImages);

// Post Management Routes
// POST /api/community/posts - Create new post (auth required)
router.post('/posts', authenticate, communityController.createPost);

// GET /api/community/posts - Get global feed with pagination
router.get('/posts', communityController.getFeed);

// GET /api/community/posts/saved - Get saved posts (auth required) - MUST come before /posts/:id
router.get('/posts/saved', authenticate, communityController.getSavedPosts);

// GET /api/community/posts/location/:locationId - Get location-specific feed
router.get('/posts/location/:locationId', communityController.getLocationFeed);

// GET /api/community/posts/:id - Get single post
router.get('/posts/:id', communityController.getPost);

// DELETE /api/community/posts/:id - Delete own post (auth required)
router.delete('/posts/:id', authenticate, communityController.deletePost);

// Interaction Routes
router.post('/posts/:id/like', authenticate, communityController.toggleLike);
router.post('/posts/:id/comment', authenticate, communityController.addComment);
router.delete('/comments/:id', authenticate, communityController.deleteComment);
router.post('/posts/:id/save', authenticate, communityController.toggleSave);

// User Relationship Routes
// Follow/Unfollow
router.post('/users/:id/follow', authenticate, communityController.followUser);
router.delete('/users/:id/follow', authenticate, communityController.unfollowUser);

// Follow Requests
router.get('/follow-requests', authenticate, communityController.getFollowRequests);
router.post('/follow-requests/:id/approve', authenticate, communityController.approveFollowRequest);
router.post('/follow-requests/:id/reject', authenticate, communityController.rejectFollowRequest);

// Block/Unblock
router.post('/users/:id/block', authenticate, communityController.blockUser);
router.delete('/users/:id/block', authenticate, communityController.unblockUser);

// Mute/Unmute
router.post('/users/:id/mute', authenticate, communityController.muteUser);
router.delete('/users/:id/mute', authenticate, communityController.unmuteUser);

// User Profile Routes
router.get('/users/:id/profile', communityController.getUserProfile);
router.get('/users/:id/posts', communityController.getUserPosts);
router.patch('/profile', authenticate, communityController.updateProfile);
router.patch('/profile/privacy', authenticate, communityController.togglePrivateMode);

// Legacy Follow Routes (kept for backward compatibility)
router.post('/follow/:userId', authenticate, communityController.followUser);
router.delete('/follow/:userId', authenticate, communityController.unfollowUser);
router.get('/followers/:userId', communityController.getFollowers);
router.get('/following/:userId', communityController.getFollowing);

// Legacy route - kept for backward compatibility
router.get('/feed', communityController.getFeed);

// Reporting and Moderation Routes
// POST /api/community/posts/:id/report - Report post (auth required)
router.post('/posts/:id/report', authenticate, communityController.reportPost);

// Admin-only moderation routes
// GET /api/community/admin/reports - Get all reports (admin only)
router.get('/admin/reports', authenticate, requireAdmin, communityController.getReports);

// POST /api/community/admin/posts/:id/hide - Hide post (admin only)
router.post('/admin/posts/:id/hide', authenticate, requireAdmin, communityController.hidePost);

// POST /api/community/admin/posts/:id/unhide - Unhide post (admin only)
router.post('/admin/posts/:id/unhide', authenticate, requireAdmin, communityController.unhidePost);

// POST /api/community/admin/reports/:id/dismiss - Dismiss report (admin only)
router.post('/admin/reports/:id/dismiss', authenticate, requireAdmin, communityController.dismissReport);

export default router;

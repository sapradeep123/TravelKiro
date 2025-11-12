import { Router } from 'express';
import communityController from '../controllers/communityController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

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

import { Router } from 'express';
import communityController from '../controllers/communityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Posts
router.get('/feed', communityController.getFeed);
router.get('/posts/:id', communityController.getPostById);
router.post('/posts', authenticate, communityController.createPost);
router.post('/posts/:id/like', authenticate, communityController.likePost);
router.post('/posts/:id/comment', authenticate, communityController.addComment);
router.delete('/posts/:id', authenticate, communityController.deletePost);

// Follow
router.post('/follow/:userId', authenticate, communityController.followUser);
router.delete('/follow/:userId', authenticate, communityController.unfollowUser);
router.get('/followers/:userId', communityController.getFollowers);
router.get('/following/:userId', communityController.getFollowing);

export default router;

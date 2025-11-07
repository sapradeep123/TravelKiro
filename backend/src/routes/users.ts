import { Router } from 'express';
import userController from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/all', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:userId', authenticate, userController.getUserById);

export default router;

import { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.post('/create-credentials', adminController.createCredentials);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.post('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

export default router;

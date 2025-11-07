import { Router } from 'express';
import adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.post('/create-credentials', adminController.createCredentials);
router.delete('/users/:userId', adminController.deleteUser);

export default router;

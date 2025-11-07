import { Router } from 'express';
import approvalController from '../controllers/approvalController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All approval routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.get('/pending', approvalController.getPendingApprovals);
router.get('/history', approvalController.getApprovalHistory);
router.post('/:approvalId/approve', approvalController.approveContent);
router.post('/:approvalId/reject', approvalController.rejectContent);

export default router;

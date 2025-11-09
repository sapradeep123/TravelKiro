import { Router } from 'express';
import packageController from '../controllers/packageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Callback request routes (must come before /:id routes)
router.get('/callback-requests/all', authenticate, packageController.getAllCallbackRequests);
router.patch('/callback-requests/:requestId/contacted', authenticate, packageController.markAsContacted);

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.get('/:id/callback-requests', authenticate, packageController.getPackageCallbackRequests);
router.post('/', authenticate, packageController.createPackage);
router.post('/:id/interest', authenticate, packageController.expressInterest);
router.post('/:id/callback-request', packageController.createCallbackRequest);
router.delete('/:id', authenticate, packageController.deletePackage);

export default router;

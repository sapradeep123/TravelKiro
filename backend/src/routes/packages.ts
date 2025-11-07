import { Router } from 'express';
import packageController from '../controllers/packageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.post('/', authenticate, packageController.createPackage);
router.post('/:id/interest', authenticate, packageController.expressInterest);
router.delete('/:id', authenticate, packageController.deletePackage);

export default router;

import { Router } from 'express';
import siteSettingsController from '../controllers/siteSettingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', siteSettingsController.getSettings);
router.put('/', authenticate, siteSettingsController.updateSettings);

export default router;

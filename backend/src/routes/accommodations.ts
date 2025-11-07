import { Router } from 'express';
import accommodationController from '../controllers/accommodationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', accommodationController.getAllAccommodations);
router.get('/:id', accommodationController.getAccommodationById);
router.post('/', authenticate, accommodationController.createAccommodation);
router.put('/:id', authenticate, accommodationController.updateAccommodation);
router.delete('/:id', authenticate, accommodationController.deleteAccommodation);

export default router;

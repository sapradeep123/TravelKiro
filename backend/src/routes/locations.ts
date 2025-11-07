import { Router } from 'express';
import locationController from '../controllers/locationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/search', locationController.searchLocations);
router.get('/:id', locationController.getLocationById);

// Protected routes
router.post('/', authenticate, locationController.createLocation);
router.put('/:id', authenticate, locationController.updateLocation);
router.delete('/:id', authenticate, locationController.deleteLocation);

export default router;

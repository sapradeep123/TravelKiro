import { Router } from 'express';
import seedController from '../controllers/seedController';

const router = Router();

router.post('/users', seedController.seedUsers);
router.post('/event-types', seedController.seedEventTypes);
router.post('/locations', seedController.seedLocations);
router.post('/events', seedController.seedEvents);
router.post('/packages', seedController.seedPackages);

export default router;

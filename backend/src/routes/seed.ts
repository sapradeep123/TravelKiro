import { Router } from 'express';
import seedController from '../controllers/seedController';

const router = Router();

router.post('/event-types', seedController.seedEventTypes);
router.post('/events', seedController.seedEvents);

export default router;

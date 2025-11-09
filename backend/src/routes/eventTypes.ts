import { Router } from 'express';
import eventTypeController from '../controllers/eventTypeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', eventTypeController.getAllEventTypes);
router.post('/', authenticate, eventTypeController.createEventType);
router.put('/:id', authenticate, eventTypeController.updateEventType);
router.delete('/:id', authenticate, eventTypeController.deleteEventType);

export default router;

import { Router } from 'express';
import eventController from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', authenticate, eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.patch('/:id/status', authenticate, eventController.toggleEventStatus);
router.post('/:id/interest', authenticate, eventController.expressInterest);
router.delete('/:id', authenticate, eventController.deleteEvent);

// Callback request routes
router.post('/:id/callback-request', eventController.createCallbackRequest);
router.get('/:id/callback-requests', authenticate, eventController.getEventCallbackRequests);
router.get('/callback-requests/all', authenticate, eventController.getAllCallbackRequests);
router.patch('/callback-requests/:requestId/contacted', authenticate, eventController.markAsContacted);

export default router;

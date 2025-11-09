import { Router } from 'express';
import eventController from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Callback request routes (must come before /:id routes)
router.get('/callback-requests/all', authenticate, eventController.getAllCallbackRequests);
router.patch('/callback-requests/:requestId/contacted', authenticate, eventController.markAsContacted);

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/callback-requests', authenticate, eventController.getEventCallbackRequests);
router.post('/', authenticate, eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.patch('/:id/status', authenticate, eventController.toggleEventStatus);
router.post('/:id/interest', authenticate, eventController.expressInterest);
router.post('/:id/callback-request', eventController.createCallbackRequest);
router.delete('/:id', authenticate, eventController.deleteEvent);

export default router;

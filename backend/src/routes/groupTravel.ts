import { Router } from 'express';
import groupTravelController from '../controllers/groupTravelController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', groupTravelController.getAllGroupTravels);
router.get('/my-travels', authenticate, groupTravelController.getMyGroupTravels);
router.get('/my-bids', authenticate, groupTravelController.getMyBids);
router.get('/:id', groupTravelController.getGroupTravelById);
router.post('/', authenticate, groupTravelController.createGroupTravel);
router.post('/:id/interest', authenticate, groupTravelController.expressInterest);
router.post('/:id/bid', authenticate, groupTravelController.submitBid);
router.post('/bids/:bidId/approve-contact', authenticate, groupTravelController.approveBidContact);
router.put('/:id/close', authenticate, groupTravelController.closeGroupTravel);

export default router;

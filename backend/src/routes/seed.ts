import { Router } from 'express';
import seedController from '../controllers/seedController';

const router = Router();

router.post('/events', seedController.seedEvents);

export default router;

import { Router } from 'express';
import messagingController from '../controllers/messagingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All messaging routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', messagingController.getConversations.bind(messagingController));
router.get('/conversations/:userId', messagingController.getOrCreateConversation.bind(messagingController));
router.get('/conversations/:conversationId/messages', messagingController.getMessages.bind(messagingController));
router.post('/conversations/:conversationId/messages', messagingController.sendMessage.bind(messagingController));
router.delete('/conversations/:conversationId', messagingController.deleteConversation.bind(messagingController));

// Chat Requests
router.post('/requests', messagingController.sendChatRequest.bind(messagingController));
router.get('/requests', messagingController.getChatRequests.bind(messagingController));
router.post('/requests/:requestId/approve', messagingController.approveChatRequest.bind(messagingController));
router.post('/requests/:requestId/reject', messagingController.rejectChatRequest.bind(messagingController));

export default router;

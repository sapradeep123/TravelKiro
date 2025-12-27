import { Router, Request, Response } from 'express';
import chatbotService from '../services/chatbotService';

const router = Router();

// POST /api/chatbot/message - Send a message to the chatbot
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message too long. Maximum 1000 characters.' });
    }

    const response = await chatbotService.chat(message, history || []);

    res.status(200).json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chatbot route error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chatbot/status - Check if chatbot is configured
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    configured: chatbotService.isConfigured(),
    name: 'Butterfliy Travel Assistant'
  });
});

export default router;

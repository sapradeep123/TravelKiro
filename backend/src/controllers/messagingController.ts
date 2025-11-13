import { Request, Response } from 'express';
import messagingService from '../services/messagingService';
import { AuthRequest } from '../middleware/auth';

export class MessagingController {
  // GET /api/messaging/conversations - Get all conversations
  async getConversations(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const conversations = await messagingService.getUserConversations(user.userId);

      res.status(200).json({ data: conversations });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/messaging/conversations/:userId - Get or create conversation with user
  async getOrCreateConversation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (user.userId === userId) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
      }

      const conversation = await messagingService.getOrCreateConversation(user.userId, userId);

      res.status(200).json({ data: conversation });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/messaging/conversations/:conversationId/messages - Get messages
  async getMessages(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await messagingService.getConversationMessages(conversationId, user.userId, page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized access to conversation') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/messaging/conversations/:conversationId/messages - Send message
  async sendMessage(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { conversationId } = req.params;
      const { message } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      const newMessage = await messagingService.sendMessage(conversationId, user.userId, message);

      res.status(201).json({
        message: 'Message sent successfully',
        data: newMessage,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to send message in this conversation') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/messaging/requests - Send chat request
  async sendChatRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { receiverId } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID is required' });
      }

      const chatRequest = await messagingService.sendChatRequest(user.userId, receiverId);

      res.status(201).json({
        message: 'Chat request sent successfully',
        data: chatRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/messaging/requests - Get pending chat requests
  async getChatRequests(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const requests = await messagingService.getPendingChatRequests(user.userId);

      res.status(200).json({ data: requests });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/messaging/requests/:requestId/approve - Approve chat request
  async approveChatRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { requestId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await messagingService.approveChatRequest(requestId, user.userId);

      res.status(200).json({
        message: 'Chat request approved',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Chat request not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to approve this request') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/messaging/requests/:requestId/reject - Reject chat request
  async rejectChatRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { requestId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await messagingService.rejectChatRequest(requestId, user.userId);

      res.status(200).json({
        message: 'Chat request rejected',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Chat request not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to reject this request') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/messaging/conversations/:conversationId - Delete conversation
  async deleteConversation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { conversationId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await messagingService.deleteConversation(conversationId, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Conversation not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to delete this conversation') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new MessagingController();

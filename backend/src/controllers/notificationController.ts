import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  async getUserNotifications(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { unreadOnly } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notifications = await notificationService.getUserNotifications(
        user.userId,
        unreadOnly === 'true'
      );

      res.status(200).json({ data: notifications });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await notificationService.markAsRead(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await notificationService.markAllAsRead(user.userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await notificationService.getUnreadCount(user.userId);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new NotificationController();

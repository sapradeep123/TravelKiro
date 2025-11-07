import { Request, Response } from 'express';
import userService from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      const { name, phone, avatar, bio, isCelebrity, isInfluencer } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await userService.updateProfile(userId, {
        name,
        phone,
        avatar,
        bio,
        isCelebrity,
        isInfluencer,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await userService.getProfile(userId);

      res.status(200).json({ data: profile });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await userService.getUserById(userId);

      res.status(200).json({ data: user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { role } = req.query;

      const users = await userService.getAllUsers(role as string);

      res.status(200).json({ data: users });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UserController();

import { Request, Response } from 'express';
import adminService from '../services/adminService';
import { UserRole } from '@prisma/client';

export class AdminController {
  async createCredentials(req: Request, res: Response) {
    try {
      const { email, password, name, role, phone, stateAssignment } = req.body;

      // Validate input
      if (!email || !password || !name || !role) {
        return res.status(400).json({
          error: 'Email, password, name, and role are required',
        });
      }

      const result = await adminService.createCredentials({
        email,
        password,
        name,
        role: role as UserRole,
        phone,
        stateAssignment,
      });

      res.status(201).json({
        message: 'Credentials created successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const result = await adminService.deleteUser(userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await adminService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async resetUserPassword(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await adminService.resetUserPassword(userId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, email, role, phone, stateAssignment } = req.body;
      
      const result = await adminService.updateUser(userId, {
        name,
        email,
        role,
        phone,
        stateAssignment,
      });

      res.status(200).json({
        message: 'User updated successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const result = await adminService.toggleUserStatus(userId);
      
      res.status(200).json({
        message: `User ${result.isActive ? 'activated' : 'deactivated'} successfully`,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new AdminController();

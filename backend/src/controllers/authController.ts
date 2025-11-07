import { Request, Response } from 'express';
import authService from '../services/authService';
import { UserRole } from '@prisma/client';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, password, and name are required',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters long',
        });
      }

      const result = await authService.register(email, password, name, role as UserRole);

      res.status(201).json({
        message: 'User registered successfully',
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

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
        });
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const profile = await authService.getProfile(userId);

      res.status(200).json({
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async logout(req: Request, res: Response) {
    // In a stateless JWT system, logout is handled client-side by removing tokens
    // Here we just send a success response
    res.status(200).json({
      message: 'Logout successful',
    });
  }
}

export default new AuthController();

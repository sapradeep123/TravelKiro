import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    (req as AuthRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isActive: decoded.isActive !== false, // Default to true if not present
    };

    // Check if user is active
    if (decoded.isActive === false) {
      return res.status(403).json({
        error: 'Account is inactive. Please contact administrator.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Specific role checks
export const requireAdmin = authorize('SITE_ADMIN');
export const requireGovtDept = authorize('SITE_ADMIN', 'GOVT_DEPARTMENT');
export const requireGuide = authorize('SITE_ADMIN', 'TOURIST_GUIDE');
export const requireUser = authorize('SITE_ADMIN', 'GOVT_DEPARTMENT', 'TOURIST_GUIDE', 'USER');

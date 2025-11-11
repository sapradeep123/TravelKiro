import { Request, Response } from 'express';
import callRequestService from '../services/callRequestService';
import { AuthRequest } from '../middleware/auth';
import { CallRequestStatus, Priority, CallOutcome, InteractionType } from '@prisma/client';

export class CallRequestController {
  // Public endpoint - Request a call
  async createCallRequest(req: Request, res: Response) {
    try {
      const { id } = req.params; // accommodation ID
      const { name, phone, email, preferredCallTime, message } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      // Get IP and user agent for tracking
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');
      const sourceUrl = req.get('referer');

      const callRequest = await callRequestService.createCallRequest({
        name,
        phone,
        email,
        preferredCallTime: preferredCallTime ? new Date(preferredCallTime) : undefined,
        message,
        accommodationId: id,
        sourceUrl,
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        message: 'Call request submitted successfully. We will contact you soon!',
        requestId: callRequest.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Admin endpoints
  async getAllCallRequests(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { status, assignedTo, priority, accommodationId, from, to, page, limit } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (status) filters.status = status as CallRequestStatus;
      if (assignedTo) filters.assignedTo = assignedTo as string;
      if (priority) filters.priority = priority as Priority;
      if (accommodationId) filters.accommodationId = accommodationId as string;
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await callRequestService.getAllCallRequests(filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting call requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCallRequestById(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const callRequest = await callRequestService.getCallRequestById(id);

      res.status(200).json({ data: callRequest });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async assignCallRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!assignedTo) {
        return res.status(400).json({ error: 'assignedTo is required' });
      }

      const callRequest = await callRequestService.assignCallRequest(id, assignedTo, user.userId);

      res.status(200).json({
        message: 'Call request assigned successfully',
        data: callRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateCallStatus(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { status, notes, reason } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP', 'SCHEDULED', 'CONVERTED', 'LOST', 'INVALID'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const callRequest = await callRequestService.updateCallStatus(
        id,
        status as CallRequestStatus,
        user.userId,
        notes,
        reason
      );

      res.status(200).json({
        message: 'Status updated successfully',
        data: callRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async addInteraction(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { type, outcome, duration, notes, nextAction, followUpDate } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!type || !notes) {
        return res.status(400).json({ error: 'Type and notes are required' });
      }

      const interaction = await callRequestService.addInteraction({
        callRequestId: id,
        type: type as InteractionType,
        outcome: outcome as CallOutcome | undefined,
        duration: duration ? parseInt(duration) : undefined,
        notes,
        nextAction,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        createdBy: user.userId,
      });

      res.status(201).json({
        message: 'Interaction added successfully',
        data: interaction,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async scheduleCallback(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { scheduledCallDate } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!scheduledCallDate) {
        return res.status(400).json({ error: 'Scheduled call date is required' });
      }

      const callRequest = await callRequestService.scheduleCallback(
        id,
        new Date(scheduledCallDate),
        user.userId
      );

      res.status(200).json({
        message: 'Callback scheduled successfully',
        data: callRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updatePriority(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { priority } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!priority || !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
        return res.status(400).json({ error: 'Valid priority is required' });
      }

      const callRequest = await callRequestService.updatePriority(
        id,
        priority as Priority,
        user.userId
      );

      res.status(200).json({
        message: 'Priority updated successfully',
        data: callRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getScheduledCallbacks(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // If userId provided and user is admin, get for that user, otherwise get for current user
      const targetUserId = user.role === 'SITE_ADMIN' && userId ? userId as string : user.userId;

      const callbacks = await callRequestService.getScheduledCallbacks(targetUserId);

      res.status(200).json({ data: callbacks });
    } catch (error) {
      console.error('Error getting scheduled callbacks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getOverdueCallbacks(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const targetUserId = user.role === 'SITE_ADMIN' && userId ? userId as string : user.userId;

      const callbacks = await callRequestService.getOverdueCallbacks(targetUserId);

      res.status(200).json({ data: callbacks });
    } catch (error) {
      console.error('Error getting overdue callbacks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new CallRequestController();

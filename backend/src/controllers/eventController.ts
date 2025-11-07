import { Request, Response } from 'express';
import eventService from '../services/eventService';
import { AuthRequest } from '../middleware/auth';
import { ApprovalStatus } from '@prisma/client';

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { title, description, locationId, customCountry, customState, customArea, startDate, endDate, images } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Title, description, start date, and end date are required',
        });
      }

      const event = await eventService.createEvent({
        title,
        description,
        locationId,
        customCountry,
        customState,
        customArea,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        images: images || [],
        hostId: user.userId,
        hostRole: user.role,
      });

      res.status(201).json({
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllEvents(req: Request, res: Response) {
    try {
      const { locationId, approvalStatus } = req.query;

      const events = await eventService.getAllEvents({
        locationId: locationId as string,
        approvalStatus: approvalStatus as ApprovalStatus,
      });

      res.status(200).json({ data: events });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const event = await eventService.getEventById(id);

      res.status(200).json({ data: event });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async expressInterest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const interest = await eventService.expressInterest(id, user.userId);

      res.status(201).json({
        message: 'Interest expressed successfully',
        data: interest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await eventService.deleteEvent(id, user.userId, user.role);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new EventController();

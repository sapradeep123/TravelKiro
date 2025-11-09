import { Request, Response } from 'express';
import eventService from '../services/eventService';
import { AuthRequest } from '../middleware/auth';
import { ApprovalStatus } from '@prisma/client';

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { 
        title, description, eventType, locationId, customCountry, customState, customArea, 
        venue, startDate, endDate, images, nearestAirport, airportDistance,
        nearestRailway, railwayDistance, nearestBusStation, busStationDistance
      } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !description || !eventType || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Title, description, event type, start date, and end date are required',
        });
      }

      // Validate dates are in the future
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      
      if (start < now) {
        return res.status(400).json({ error: 'Start date must be in the future' });
      }
      
      if (end < start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      const event = await eventService.createEvent({
        title,
        description,
        eventType,
        locationId,
        customCountry,
        customState,
        customArea,
        venue,
        startDate: start,
        endDate: end,
        images: images || [],
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
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
      const { locationId, approvalStatus, isActive } = req.query;

      const events = await eventService.getAllEvents({
        locationId: locationId as string,
        approvalStatus: approvalStatus as ApprovalStatus | string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
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

  async updateEvent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { 
        title, description, eventType, locationId, customCountry, customState, customArea,
        venue, startDate, endDate, images, nearestAirport, airportDistance,
        nearestRailway, railwayDistance, nearestBusStation, busStationDistance
      } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate dates if provided
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        const now = new Date();
        
        if (start && start < now) {
          return res.status(400).json({ error: 'Start date must be in the future' });
        }
        
        if (start && end && end < start) {
          return res.status(400).json({ error: 'End date must be after start date' });
        }
      }

      const event = await eventService.updateEvent(id, user.userId, user.role, {
        title,
        description,
        eventType,
        locationId,
        customCountry,
        customState,
        customArea,
        venue,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        images,
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
      });

      res.status(200).json({
        message: 'Event updated successfully',
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

  async toggleEventStatus(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { isActive } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean' });
      }

      const event = await eventService.toggleEventStatus(id, isActive, user.userId, user.role);

      res.status(200).json({
        message: `Event ${isActive ? 'activated' : 'deactivated'} successfully`,
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

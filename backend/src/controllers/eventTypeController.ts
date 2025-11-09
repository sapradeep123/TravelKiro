import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class EventTypeController {
  async getAllEventTypes(req: Request, res: Response) {
    try {
      const { isActive } = req.query;
      
      const where: any = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const eventTypes = await prisma.eventType.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      res.status(200).json({ data: eventTypes });
    } catch (error) {
      console.error('Error fetching event types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createEventType(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { name, description } = req.body;

      if (!user || user.role !== 'SITE_ADMIN') {
        return res.status(403).json({ error: 'Only admins can create event types' });
      }

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const eventType = await prisma.eventType.create({
        data: {
          name,
          description: description || null,
          isActive: true
        }
      });

      res.status(201).json({
        message: 'Event type created successfully',
        data: eventType
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Event type already exists' });
      }
      console.error('Error creating event type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEventType(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      if (!user || user.role !== 'SITE_ADMIN') {
        return res.status(403).json({ error: 'Only admins can update event types' });
      }

      const eventType = await prisma.eventType.update({
        where: { id },
        data: {
          name,
          description,
          isActive
        }
      });

      res.status(200).json({
        message: 'Event type updated successfully',
        data: eventType
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Event type not found' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Event type name already exists' });
      }
      console.error('Error updating event type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteEventType(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user || user.role !== 'SITE_ADMIN') {
        return res.status(403).json({ error: 'Only admins can delete event types' });
      }

      await prisma.eventType.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Event type deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Event type not found' });
      }
      console.error('Error deleting event type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EventTypeController();

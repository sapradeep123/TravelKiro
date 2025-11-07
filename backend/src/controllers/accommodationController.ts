import { Request, Response } from 'express';
import accommodationService from '../services/accommodationService';
import { AuthRequest } from '../middleware/auth';
import { AccommodationType, ApprovalStatus } from '@prisma/client';

export class AccommodationController {
  async createAccommodation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { name, type, locationId, description, contactPhone, contactEmail, contactWebsite, contactAddress, images, isGovtApproved } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name || !type || !locationId || !description || !contactPhone || !contactAddress) {
        return res.status(400).json({
          error: 'Name, type, location, description, contact phone, and address are required',
        });
      }

      const accommodation = await accommodationService.createAccommodation({
        name,
        type: type as AccommodationType,
        locationId,
        description,
        contactPhone,
        contactEmail,
        contactWebsite,
        contactAddress,
        images: images || [],
        isGovtApproved: isGovtApproved || false,
        uploadedBy: user.userId,
        uploadedByRole: user.role,
      });

      res.status(201).json({
        message: 'Accommodation created successfully',
        data: accommodation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllAccommodations(req: Request, res: Response) {
    try {
      const { locationId, type, approvalStatus } = req.query;

      const accommodations = await accommodationService.getAllAccommodations({
        locationId: locationId as string,
        type: type as AccommodationType,
        approvalStatus: approvalStatus as ApprovalStatus,
      });

      res.status(200).json({ data: accommodations });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAccommodationById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const accommodation = await accommodationService.getAccommodationById(id);

      res.status(200).json({ data: accommodation });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateAccommodation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { name, description, contactPhone, contactEmail, contactWebsite, contactAddress, images } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accommodation = await accommodationService.updateAccommodation(id, user.userId, {
        name,
        description,
        contactPhone,
        contactEmail,
        contactWebsite,
        contactAddress,
        images,
      });

      res.status(200).json({
        message: 'Accommodation updated successfully',
        data: accommodation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteAccommodation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await accommodationService.deleteAccommodation(id, user.userId, user.role);

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

export default new AccommodationController();

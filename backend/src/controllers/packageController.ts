import { Request, Response } from 'express';
import packageService from '../services/packageService';
import { AuthRequest } from '../middleware/auth';
import { ApprovalStatus } from '@prisma/client';

export class PackageController {
  async createPackage(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { title, description, duration, locationId, customCountry, customState, customArea, price, images, itinerary } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !description || !duration || !price || !itinerary) {
        return res.status(400).json({
          error: 'Title, description, duration, price, and itinerary are required',
        });
      }

      const pkg = await packageService.createPackage({
        title,
        description,
        duration,
        locationId,
        customCountry,
        customState,
        customArea,
        price,
        images: images || [],
        hostId: user.userId,
        hostRole: user.role,
        itinerary,
      });

      res.status(201).json({
        message: 'Package created successfully',
        data: pkg,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllPackages(req: Request, res: Response) {
    try {
      const { locationId, approvalStatus } = req.query;

      const packages = await packageService.getAllPackages({
        locationId: locationId as string,
        approvalStatus: approvalStatus as ApprovalStatus,
      });

      res.status(200).json({ data: packages });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPackageById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const pkg = await packageService.getPackageById(id);

      res.status(200).json({ data: pkg });
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

      const interest = await packageService.expressInterest(id, user.userId);

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

  async deletePackage(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await packageService.deletePackage(id, user.userId, user.role);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async createCallbackRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, phone, email, message } = req.body;
      const user = (req as AuthRequest).user;

      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const callbackRequest = await packageService.createCallbackRequest({
        packageId: id,
        name,
        phone,
        email,
        message,
        userId: user?.userId,
      });

      res.status(201).json({
        message: 'Callback request submitted successfully',
        data: callbackRequest,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getPackageCallbackRequests(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const requests = await packageService.getPackageCallbackRequests(id, user.userId, user.role);

      res.status(200).json({ data: requests });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllCallbackRequests(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const requests = await packageService.getAllCallbackRequests(user.userId, user.role);

      res.status(200).json({ data: requests });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async markAsContacted(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { requestId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const request = await packageService.markAsContacted(requestId, user.userId, user.role);

      res.status(200).json({
        message: 'Marked as contacted',
        data: request,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
  async updatePackageStatus(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { approvalStatus } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!approvalStatus || !['APPROVED', 'PENDING', 'REJECTED'].includes(approvalStatus)) {
        return res.status(400).json({ error: 'Valid approval status is required' });
      }

      const pkg = await packageService.updatePackageStatus(id, approvalStatus, user.userId, user.role);

      res.status(200).json({
        message: 'Package status updated successfully',
        data: pkg,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new PackageController();

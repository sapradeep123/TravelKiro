import { Request, Response } from 'express';
import groupTravelService from '../services/groupTravelService';
import { AuthRequest } from '../middleware/auth';
import { GroupTravelStatus } from '@prisma/client';

export class GroupTravelController {
  async createGroupTravel(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { title, description, locationId, customCountry, customState, customArea, travelDate, expiryDate } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !description || !travelDate || !expiryDate) {
        return res.status(400).json({
          error: 'Title, description, travel date, and expiry date are required',
        });
      }

      const groupTravel = await groupTravelService.createGroupTravel({
        title,
        description,
        locationId,
        customCountry,
        customState,
        customArea,
        travelDate: new Date(travelDate),
        expiryDate: new Date(expiryDate),
        creatorId: user.userId,
      });

      res.status(201).json({
        message: 'Group travel created successfully',
        data: groupTravel,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllGroupTravels(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const groupTravels = await groupTravelService.getAllGroupTravels({
        status: status as GroupTravelStatus,
      });

      res.status(200).json({ data: groupTravels });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGroupTravelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as AuthRequest).user;

      const groupTravel = await groupTravelService.getGroupTravelById(id, user?.userId);

      res.status(200).json({ data: groupTravel });
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

      const result = await groupTravelService.expressInterest(id, user.userId);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async submitBid(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { numberOfDays, accommodationDetails, foodDetails, transportDetails, totalCost, dailyItinerary } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (user.role !== 'TOURIST_GUIDE') {
        return res.status(403).json({ error: 'Only tourist guides can submit bids' });
      }

      if (!numberOfDays || !accommodationDetails || !foodDetails || !transportDetails || !totalCost || !dailyItinerary) {
        return res.status(400).json({
          error: 'All bid details are required',
        });
      }

      const bid = await groupTravelService.submitBid({
        groupTravelId: id,
        guideId: user.userId,
        numberOfDays,
        accommodationDetails,
        foodDetails,
        transportDetails,
        totalCost,
        dailyItinerary,
      });

      res.status(201).json({
        message: 'Bid submitted successfully',
        data: bid,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async approveBidContact(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { bidId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await groupTravelService.approveBidContact(bidId, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async closeGroupTravel(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await groupTravelService.closeGroupTravel(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getMyGroupTravels(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const groupTravels = await groupTravelService.getMyGroupTravels(user.userId);

      res.status(200).json({ data: groupTravels });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMyBids(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bids = await groupTravelService.getMyBids(user.userId);

      res.status(200).json({ data: bids });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new GroupTravelController();

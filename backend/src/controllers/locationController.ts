import { Request, Response } from 'express';
import locationService from '../services/locationService';
import { AuthRequest } from '../middleware/auth';
import { ApprovalStatus } from '@prisma/client';

export class LocationController {
  async createLocation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { 
        country, 
        state, 
        area, 
        description, 
        images,
        latitude,
        longitude,
        howToReach,
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
        attractions,
        kidsAttractions
      } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!country || !state || !area || !description) {
        return res.status(400).json({
          error: 'Country, state, area, and description are required',
        });
      }

      const location = await locationService.createLocation({
        country,
        state,
        area,
        description,
        images: images || [],
        latitude,
        longitude,
        howToReach,
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
        attractions,
        kidsAttractions,
        createdBy: user.userId,
        createdByRole: user.role,
      });

      res.status(201).json({
        message: 'Location created successfully',
        data: location,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllLocations(req: Request, res: Response) {
    try {
      const { country, state, approvalStatus } = req.query;

      const locations = await locationService.getAllLocations({
        country: country as string,
        state: state as string,
        approvalStatus: approvalStatus as ApprovalStatus,
      });

      res.status(200).json({ data: locations });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLocationById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const location = await locationService.getLocationById(id);

      res.status(200).json({ data: location });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { 
        country, 
        state, 
        area, 
        description, 
        images,
        latitude,
        longitude,
        howToReach,
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
        attractions,
        kidsAttractions
      } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const location = await locationService.updateLocation(id, user.userId, {
        country,
        state,
        area,
        description,
        images,
        latitude,
        longitude,
        howToReach,
        nearestAirport,
        airportDistance,
        nearestRailway,
        railwayDistance,
        nearestBusStation,
        busStationDistance,
        attractions,
        kidsAttractions,
      });

      res.status(200).json({
        message: 'Location updated successfully',
        data: location,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteLocation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await locationService.deleteLocation(id, user.userId, user.role);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async searchLocations(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const locations = await locationService.searchLocations(q as string);

      res.status(200).json({ data: locations });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new LocationController();

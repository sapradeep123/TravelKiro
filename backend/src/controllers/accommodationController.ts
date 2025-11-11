import { Request, Response } from 'express';
import accommodationService from '../services/accommodationService';
import { AuthRequest } from '../middleware/auth';
import { 
  AccommodationType, 
  ApprovalStatus,
  PriceCategory,
  DietType,
  HomeStaySubtype
} from '@prisma/client';

export class AccommodationController {
  // Public endpoints
  async getAllAccommodations(req: Request, res: Response) {
    try {
      const {
        type,
        country,
        state,
        area,
        dietTypes,
        homeStaySubtype,
        amenities,
        priceMin,
        priceMax,
        priceCategory,
        starRating,
        lat,
        lng,
        radius,
        page,
        limit,
        sort,
      } = req.query;

      const filters: any = {};

      if (type) filters.type = type as AccommodationType;
      if (country) filters.country = country as string;
      if (state) filters.state = state as string;
      if (area) filters.area = area as string;
      if (dietTypes) filters.dietTypes = (dietTypes as string).split(',') as DietType[];
      if (homeStaySubtype) filters.homeStaySubtype = homeStaySubtype as HomeStaySubtype;
      if (amenities) filters.amenities = (amenities as string).split(',');
      if (priceMin) filters.priceMin = parseFloat(priceMin as string);
      if (priceMax) filters.priceMax = parseFloat(priceMax as string);
      if (priceCategory) filters.priceCategory = priceCategory as PriceCategory;
      if (starRating) filters.starRating = parseInt(starRating as string);
      if (lat) filters.lat = parseFloat(lat as string);
      if (lng) filters.lng = parseFloat(lng as string);
      if (radius) filters.radius = parseFloat(radius as string);
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (sort) filters.sort = sort as string;

      // Only show approved and active by default for public
      filters.approvalStatus = 'APPROVED';
      filters.isActive = true;

      const result = await accommodationService.getAllAccommodations(filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting accommodations:', error);
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

  async getAccommodationBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const accommodation = await accommodationService.getAccommodationBySlug(slug);

      res.status(200).json({ data: accommodation });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async searchAccommodations(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const accommodations = await accommodationService.searchAccommodations(q as string);

      res.status(200).json({ data: accommodations });
    } catch (error) {
      console.error('Error searching accommodations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNearbyAccommodations(req: Request, res: Response) {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = radius ? parseFloat(radius as string) : 10;

      const accommodations = await accommodationService.getNearbyAccommodations(
        latitude,
        longitude,
        searchRadius
      );

      res.status(200).json({ data: accommodations });
    } catch (error) {
      console.error('Error getting nearby accommodations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin endpoints
  async createAccommodation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const {
        type,
        name,
        description,
        country,
        state,
        area,
        address,
        latitude,
        longitude,
        mapUrl,
        phone,
        email,
        website,
        images,
        videos,
        virtualTourUrl,
        priceMin,
        priceMax,
        currency,
        priceCategory,
        starRating,
        amenities,
        dietTypes,
        cuisineTypes,
        seatingCapacity,
        homeStaySubtype,
        totalRooms,
        sharedFacilities,
        privateFacilities,
        houseRules,
        genderPreference,
        metaTitle,
        metaDescription,
        keywords,
        isFeatured,
      } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate required fields
      if (!type || !name || !description || !country || !state || !area || !latitude || !longitude) {
        return res.status(400).json({
          error: 'Type, name, description, country, state, area, latitude, and longitude are required',
        });
      }

      if (!phone || !Array.isArray(phone) || phone.length === 0) {
        return res.status(400).json({
          error: 'At least one phone number is required',
        });
      }

      const accommodation = await accommodationService.createAccommodation({
        type,
        name,
        description,
        country,
        state,
        area,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        mapUrl,
        phone,
        email,
        website,
        images: images || [],
        videos: videos || [],
        virtualTourUrl,
        priceMin: priceMin ? parseFloat(priceMin) : undefined,
        priceMax: priceMax ? parseFloat(priceMax) : undefined,
        currency,
        priceCategory,
        starRating: starRating ? parseInt(starRating) : undefined,
        amenities: amenities || [],
        dietTypes: dietTypes || [],
        cuisineTypes: cuisineTypes || [],
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : undefined,
        homeStaySubtype,
        totalRooms: totalRooms ? parseInt(totalRooms) : undefined,
        sharedFacilities: sharedFacilities || [],
        privateFacilities: privateFacilities || [],
        houseRules,
        genderPreference,
        metaTitle,
        metaDescription,
        keywords: keywords || [],
        isFeatured: isFeatured || false,
        createdBy: user.userId,
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

  async updateAccommodation(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const updateData = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Parse numeric fields if present
      if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
      if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
      if (updateData.priceMin) updateData.priceMin = parseFloat(updateData.priceMin);
      if (updateData.priceMax) updateData.priceMax = parseFloat(updateData.priceMax);
      if (updateData.starRating) updateData.starRating = parseInt(updateData.starRating);
      if (updateData.seatingCapacity) updateData.seatingCapacity = parseInt(updateData.seatingCapacity);
      if (updateData.totalRooms) updateData.totalRooms = parseInt(updateData.totalRooms);

      const accommodation = await accommodationService.updateAccommodation(
        id,
        user.userId,
        user.role,
        updateData
      );

      res.status(200).json({
        message: 'Accommodation updated successfully',
        data: accommodation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
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
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateApprovalStatus(req: Request, res: Response) {
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

      const accommodation = await accommodationService.updateApprovalStatus(
        id,
        approvalStatus as ApprovalStatus,
        user.userId,
        user.role
      );

      res.status(200).json({
        message: 'Approval status updated successfully',
        data: accommodation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async toggleActiveStatus(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { isActive } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean value' });
      }

      const accommodation = await accommodationService.toggleActiveStatus(
        id,
        isActive,
        user.userId,
        user.role
      );

      res.status(200).json({
        message: `Accommodation ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: accommodation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAdminAccommodations(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { approvalStatus, isActive, page, limit } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (approvalStatus) filters.approvalStatus = approvalStatus as ApprovalStatus;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await accommodationService.getAllAccommodations(filters);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting admin accommodations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AccommodationController();

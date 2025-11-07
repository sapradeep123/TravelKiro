import prisma from '../config/database';
import { UserRole, ApprovalStatus } from '@prisma/client';

export class LocationService {
  async createLocation(data: {
    country: string;
    state: string;
    area: string;
    description: string;
    images: string[];
    createdBy: string;
    createdByRole: UserRole;
  }) {
    // Determine approval status based on role
    let approvalStatus: ApprovalStatus = 'PENDING';
    let approvedBy: string | undefined;
    let approvedAt: Date | undefined;

    if (data.createdByRole === 'SITE_ADMIN' || data.createdByRole === 'GOVT_DEPARTMENT') {
      approvalStatus = 'APPROVED';
      approvedBy = data.createdBy;
      approvedAt = new Date();
    }

    const location = await prisma.location.create({
      data: {
        ...data,
        approvalStatus,
        approvedBy,
        approvedAt,
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // If pending, add to approval queue
    if (approvalStatus === 'PENDING') {
      await prisma.approvalQueue.create({
        data: {
          contentType: 'LOCATION',
          contentId: location.id,
          submittedBy: data.createdBy,
          submittedByRole: data.createdByRole,
          status: 'PENDING',
        },
      });
    }

    return location;
  }

  async getAllLocations(filters?: {
    country?: string;
    state?: string;
    approvalStatus?: ApprovalStatus;
  }) {
    const where: any = {};

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.state) {
      where.state = filters.state;
    }

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    } else {
      // By default, only show approved locations
      where.approvalStatus = 'APPROVED';
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return locations;
  }

  async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
        events: {
          where: {
            approvalStatus: 'APPROVED',
          },
        },
        packages: {
          where: {
            approvalStatus: 'APPROVED',
          },
        },
        accommodations: {
          where: {
            approvalStatus: 'APPROVED',
          },
        },
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  }

  async updateLocation(id: string, userId: string, data: {
    country?: string;
    state?: string;
    area?: string;
    description?: string;
    images?: string[];
  }) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    if (location.createdBy !== userId) {
      throw new Error('Unauthorized to update this location');
    }

    const updated = await prisma.location.update({
      where: { id },
      data,
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteLocation(id: string, userId: string, userRole: UserRole) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    // Only creator or admin can delete
    if (location.createdBy !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to delete this location');
    }

    await prisma.location.delete({
      where: { id },
    });

    return { message: 'Location deleted successfully' };
  }

  async searchLocations(query: string) {
    const locations = await prisma.location.findMany({
      where: {
        AND: [
          { approvalStatus: 'APPROVED' },
          {
            OR: [
              { country: { contains: query, mode: 'insensitive' } },
              { state: { contains: query, mode: 'insensitive' } },
              { area: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return locations;
  }
}

export default new LocationService();

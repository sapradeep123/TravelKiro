import prisma from '../config/database';
import { UserRole, AccommodationType, ApprovalStatus } from '@prisma/client';

export class AccommodationService {
  async createAccommodation(data: {
    name: string;
    type: AccommodationType;
    locationId: string;
    description: string;
    contactPhone: string;
    contactEmail?: string;
    contactWebsite?: string;
    contactAddress: string;
    images: string[];
    isGovtApproved: boolean;
    uploadedBy: string;
    uploadedByRole: UserRole;
  }) {
    const accommodation = await prisma.accommodation.create({
      data: {
        ...data,
        approvalStatus: 'PENDING',
      },
      include: {
        uploader: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    await prisma.approvalQueue.create({
      data: {
        contentType: 'ACCOMMODATION',
        contentId: accommodation.id,
        submittedBy: data.uploadedBy,
        submittedByRole: data.uploadedByRole,
        status: 'PENDING',
      },
    });

    return accommodation;
  }

  async getAllAccommodations(filters?: {
    locationId?: string;
    type?: AccommodationType;
    approvalStatus?: ApprovalStatus;
  }) {
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    } else {
      where.approvalStatus = 'APPROVED';
    }

    const accommodations = await prisma.accommodation.findMany({
      where,
      include: {
        uploader: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return accommodations;
  }

  async getAccommodationById(id: string) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        uploader: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    return accommodation;
  }

  async updateAccommodation(id: string, userId: string, data: {
    name?: string;
    description?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactWebsite?: string;
    contactAddress?: string;
    images?: string[];
  }) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    if (accommodation.uploadedBy !== userId) {
      throw new Error('Unauthorized to update this accommodation');
    }

    const updated = await prisma.accommodation.update({
      where: { id },
      data,
      include: {
        uploader: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    return updated;
  }

  async deleteAccommodation(id: string, userId: string, userRole: UserRole) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    if (accommodation.uploadedBy !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to delete this accommodation');
    }

    await prisma.accommodation.delete({
      where: { id },
    });

    return { message: 'Accommodation deleted successfully' };
  }
}

export default new AccommodationService();

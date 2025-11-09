import prisma from '../config/database';
import { UserRole, ApprovalStatus } from '@prisma/client';

export class EventService {
  async createEvent(data: {
    title: string;
    description: string;
    eventType: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    venue?: string;
    startDate: Date;
    endDate: Date;
    images: string[];
    nearestAirport?: string;
    airportDistance?: string;
    nearestRailway?: string;
    railwayDistance?: string;
    nearestBusStation?: string;
    busStationDistance?: string;
    hostId: string;
    hostRole: UserRole;
  }) {
    let approvalStatus: ApprovalStatus = 'PENDING';

    if (data.hostRole === 'SITE_ADMIN' || data.hostRole === 'GOVT_DEPARTMENT') {
      approvalStatus = 'APPROVED';
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        approvalStatus,
        isActive: true,
      },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    if (approvalStatus === 'PENDING') {
      await prisma.approvalQueue.create({
        data: {
          contentType: 'EVENT',
          contentId: event.id,
          submittedBy: data.hostId,
          submittedByRole: data.hostRole,
          status: 'PENDING',
        },
      });
    }

    return event;
  }

  async getAllEvents(filters?: {
    locationId?: string;
    approvalStatus?: ApprovalStatus | string;
    isActive?: boolean;
  }) {
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
      where.approvalStatus = filters.approvalStatus;
    } else if (!filters?.approvalStatus) {
      where.approvalStatus = 'APPROVED';
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        interestedUsers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return events;
  }

  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        interestedUsers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  async expressInterest(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.approvalStatus !== 'APPROVED') {
      throw new Error('Cannot express interest in unapproved event');
    }

    const existing = await prisma.eventInterest.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error('Already expressed interest in this event');
    }

    const interest = await prisma.eventInterest.create({
      data: {
        eventId,
        userId,
        contactShared: true,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create notification for host
    await prisma.notification.create({
      data: {
        userId: event.hostId,
        title: 'New Event Interest',
        message: `Someone expressed interest in your event: ${event.title}`,
      },
    });

    return interest;
  }

  async updateEvent(id: string, userId: string, userRole: UserRole, data: {
    title?: string;
    description?: string;
    eventType?: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    venue?: string;
    startDate?: Date;
    endDate?: Date;
    images?: string[];
    nearestAirport?: string;
    airportDistance?: string;
    nearestRailway?: string;
    railwayDistance?: string;
    nearestBusStation?: string;
    busStationDistance?: string;
  }) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this event');
    }

    const updated = await prisma.event.update({
      where: { id },
      data,
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    return updated;
  }

  async toggleEventStatus(id: string, isActive: boolean, userId: string, userRole: UserRole) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this event');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { isActive },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    return updated;
  }

  async deleteEvent(id: string, userId: string, userRole: UserRole) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to delete this event');
    }

    await prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}

export default new EventService();

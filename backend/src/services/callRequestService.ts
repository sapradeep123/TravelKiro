import prisma from '../config/database';
import { 
  CallRequestStatus, 
  Priority, 
  CallOutcome, 
  InteractionType,
  UserRole 
} from '@prisma/client';

export class CallRequestService {
  // Auto-assign logic: find admin with least active requests
  private async autoAssignAdmin(): Promise<string | null> {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['SITE_ADMIN', 'GOVT_DEPARTMENT'] },
        isActive: true,
      },
      include: {
        _count: {
          select: {
            assignedCallRequests: {
              where: {
                status: { in: ['NEW', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP', 'SCHEDULED'] },
              },
            },
          },
        },
      },
    });

    if (admins.length === 0) return null;

    // Find admin with least active requests
    const leastBusyAdmin = admins.reduce((prev, current) => 
      prev._count.assignedCallRequests < current._count.assignedCallRequests ? prev : current
    );

    return leastBusyAdmin.id;
  }

  async createCallRequest(data: {
    name: string;
    phone: string;
    email?: string;
    preferredCallTime?: Date;
    message?: string;
    accommodationId: string;
    sourceUrl?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Verify accommodation exists
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: data.accommodationId },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    if (accommodation.approvalStatus !== 'APPROVED' || !accommodation.isActive) {
      throw new Error('Cannot request call for this accommodation');
    }

    // Auto-assign to admin
    const assignedTo = await this.autoAssignAdmin();

    const callRequest = await prisma.accommodationCallRequest.create({
      data: {
        ...data,
        assignedTo,
        assignedAt: assignedTo ? new Date() : null,
        status: 'NEW',
        priority: 'MEDIUM',
      },
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create status history
    await prisma.callStatusHistory.create({
      data: {
        callRequestId: callRequest.id,
        toStatus: 'NEW',
        notes: 'Call request created',
        createdBy: assignedTo || accommodation.createdBy,
      },
    });

    // Notify assigned admin
    if (assignedTo) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          title: 'New Call Request Assigned',
          message: `New call request from ${data.name} for ${accommodation.name}`,
        },
      });
    }

    return callRequest;
  }

  async getAllCallRequests(filters?: {
    status?: CallRequestStatus;
    assignedTo?: string;
    priority?: Priority;
    accommodationId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.accommodationId) {
      where.accommodationId = filters.accommodationId;
    }

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = filters.from;
      }
      if (filters.to) {
        where.createdAt.lte = filters.to;
      }
    }

    const callRequests = await prisma.accommodationCallRequest.findMany({
      where,
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            interactions: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const total = await prisma.accommodationCallRequest.count({ where });

    return {
      data: callRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCallRequestById(id: string) {
    const callRequest = await prisma.accommodationCallRequest.findUnique({
      where: { id },
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
        interactions: {
          include: {
            admin: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          include: {
            admin: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!callRequest) {
      throw new Error('Call request not found');
    }

    return callRequest;
  }

  async assignCallRequest(id: string, assignedTo: string, assignedBy: string) {
    const callRequest = await prisma.accommodationCallRequest.findUnique({
      where: { id },
    });

    if (!callRequest) {
      throw new Error('Call request not found');
    }

    const updated = await prisma.accommodationCallRequest.update({
      where: { id },
      data: {
        assignedTo,
        assignedAt: new Date(),
      },
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create interaction log
    await prisma.callInteraction.create({
      data: {
        callRequestId: id,
        type: 'NOTE',
        notes: `Reassigned to ${updated.assignedAdmin?.profile?.name || 'admin'}`,
        createdBy: assignedBy,
      },
    });

    // Notify new assignee
    await prisma.notification.create({
      data: {
        userId: assignedTo,
        title: 'Call Request Assigned',
        message: `Call request from ${callRequest.name} has been assigned to you`,
      },
    });

    return updated;
  }

  async updateCallStatus(
    id: string,
    status: CallRequestStatus,
    userId: string,
    notes?: string,
    reason?: string
  ) {
    const callRequest = await prisma.accommodationCallRequest.findUnique({
      where: { id },
    });

    if (!callRequest) {
      throw new Error('Call request not found');
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'CONTACTED') {
      updateData.lastContactedAt = new Date();
    }

    if (status === 'CONVERTED') {
      updateData.convertedAt = new Date();
    }

    const updated = await prisma.accommodationCallRequest.update({
      where: { id },
      data: updateData,
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create status history
    await prisma.callStatusHistory.create({
      data: {
        callRequestId: id,
        fromStatus: callRequest.status,
        toStatus: status,
        reason,
        notes,
        createdBy: userId,
      },
    });

    // Create interaction log
    await prisma.callInteraction.create({
      data: {
        callRequestId: id,
        type: 'STATUS_CHANGE',
        notes: notes || `Status changed to ${status}`,
        createdBy: userId,
      },
    });

    return updated;
  }

  async addInteraction(data: {
    callRequestId: string;
    type: InteractionType;
    outcome?: CallOutcome;
    duration?: number;
    notes: string;
    nextAction?: string;
    followUpDate?: Date;
    createdBy: string;
  }) {
    const callRequest = await prisma.accommodationCallRequest.findUnique({
      where: { id: data.callRequestId },
    });

    if (!callRequest) {
      throw new Error('Call request not found');
    }

    const interaction = await prisma.callInteraction.create({
      data,
      include: {
        admin: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Update last contacted if it's a call
    if (data.type === 'CALL') {
      await prisma.accommodationCallRequest.update({
        where: { id: data.callRequestId },
        data: { lastContactedAt: new Date() },
      });
    }

    return interaction;
  }

  async scheduleCallback(
    id: string,
    scheduledCallDate: Date,
    userId: string
  ) {
    const callRequest = await prisma.accommodationCallRequest.findUnique({
      where: { id },
    });

    if (!callRequest) {
      throw new Error('Call request not found');
    }

    const updated = await prisma.accommodationCallRequest.update({
      where: { id },
      data: {
        scheduledCallDate,
        reminderSent: false,
        status: 'SCHEDULED',
      },
    });

    // Create interaction log
    await prisma.callInteraction.create({
      data: {
        callRequestId: id,
        type: 'NOTE',
        notes: `Callback scheduled for ${scheduledCallDate.toLocaleString()}`,
        followUpDate: scheduledCallDate,
        createdBy: userId,
      },
    });

    return updated;
  }

  async updatePriority(id: string, priority: Priority, userId: string) {
    const updated = await prisma.accommodationCallRequest.update({
      where: { id },
      data: { priority },
    });

    // Create interaction log
    await prisma.callInteraction.create({
      data: {
        callRequestId: id,
        type: 'NOTE',
        notes: `Priority changed to ${priority}`,
        createdBy: userId,
      },
    });

    return updated;
  }

  async getScheduledCallbacks(userId?: string) {
    const where: any = {
      status: 'SCHEDULED',
      scheduledCallDate: {
        gte: new Date(),
      },
    };

    if (userId) {
      where.assignedTo = userId;
    }

    const callbacks = await prisma.accommodationCallRequest.findMany({
      where,
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { scheduledCallDate: 'asc' },
    });

    return callbacks;
  }

  async getOverdueCallbacks(userId?: string) {
    const where: any = {
      status: 'SCHEDULED',
      scheduledCallDate: {
        lt: new Date(),
      },
    };

    if (userId) {
      where.assignedTo = userId;
    }

    const callbacks = await prisma.accommodationCallRequest.findMany({
      where,
      include: {
        accommodation: true,
        assignedAdmin: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { scheduledCallDate: 'asc' },
    });

    return callbacks;
  }

  async sendReminders() {
    // Get callbacks scheduled for next hour that haven't been reminded
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const now = new Date();

    const callbacks = await prisma.accommodationCallRequest.findMany({
      where: {
        status: 'SCHEDULED',
        reminderSent: false,
        scheduledCallDate: {
          gte: now,
          lte: oneHourFromNow,
        },
        assignedTo: { not: null },
      },
      include: {
        accommodation: true,
        assignedAdmin: true,
      },
    });

    for (const callback of callbacks) {
      if (callback.assignedTo) {
        // Create notification
        await prisma.notification.create({
          data: {
            userId: callback.assignedTo,
            title: 'Upcoming Callback Reminder',
            message: `Callback scheduled with ${callback.name} for ${callback.accommodation.name} in 1 hour`,
          },
        });

        // Mark reminder as sent
        await prisma.accommodationCallRequest.update({
          where: { id: callback.id },
          data: { reminderSent: true },
        });
      }
    }

    return { sent: callbacks.length };
  }
}

export default new CallRequestService();

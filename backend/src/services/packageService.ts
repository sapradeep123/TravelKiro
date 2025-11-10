import prisma from '../config/database';
import { UserRole, ApprovalStatus } from '@prisma/client';

export class PackageService {
  async createPackage(data: {
    title: string;
    description: string;
    duration: number;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    price: number;
    images: string[];
    hostId: string;
    hostRole: UserRole;
    itinerary: Array<{
      day: number;
      title: string;
      description: string;
      activities: string[];
    }>;
  }) {
    const approvalStatus: ApprovalStatus = 'PENDING';

    const pkg = await prisma.package.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        locationId: data.locationId,
        customCountry: data.customCountry,
        customState: data.customState,
        customArea: data.customArea,
        price: data.price,
        images: data.images,
        hostId: data.hostId,
        hostRole: data.hostRole,
        approvalStatus,
        itinerary: {
          create: data.itinerary,
        },
      },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: true,
      },
    });

    await prisma.approvalQueue.create({
      data: {
        contentType: 'PACKAGE',
        contentId: pkg.id,
        submittedBy: data.hostId,
        submittedByRole: data.hostRole,
        status: 'PENDING',
      },
    });

    return pkg;
  }

  async getAllPackages(filters?: {
    locationId?: string;
    approvalStatus?: ApprovalStatus;
    includeArchived?: boolean;
  }) {
    const where: any = {
      // Exclude archived packages by default
      isArchived: filters?.includeArchived ? undefined : false,
    };

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    }
    // Don't default to APPROVED - return all packages if no status specified

    const packages = await prisma.package.findMany({
      where,
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: {
          orderBy: {
            day: 'asc',
          },
        },
        interestedUsers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        _count: {
          select: {
            callbackRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add additional callback counts (pending and urgent)
    const packagesWithCounts = await Promise.all(
      packages.map(async (pkg) => {
        const pendingCallbacks = await prisma.packageCallbackRequest.count({
          where: {
            packageId: pkg.id,
            status: 'PENDING',
          },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const urgentCallbacks = await prisma.packageCallbackRequest.count({
          where: {
            packageId: pkg.id,
            status: 'RESCHEDULED',
            rescheduleDate: {
              gte: today,
              lt: tomorrow,
            },
          },
        });

        return {
          ...pkg,
          _count: {
            ...pkg._count,
            pendingCallbacks,
            urgentCallbacks,
          },
        };
      })
    );

    return packagesWithCounts;
  }

  async getPackageById(id: string) {
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: {
          orderBy: {
            day: 'asc',
          },
        },
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

    if (!pkg) {
      throw new Error('Package not found');
    }

    return pkg;
  }

  async expressInterest(packageId: string, userId: string) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    if (pkg.approvalStatus !== 'APPROVED') {
      throw new Error('Cannot express interest in unapproved package');
    }

    const existing = await prisma.packageInterest.findUnique({
      where: {
        packageId_userId: {
          packageId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error('Already expressed interest in this package');
    }

    const interest = await prisma.packageInterest.create({
      data: {
        packageId,
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

    await prisma.notification.create({
      data: {
        userId: pkg.hostId,
        title: 'New Package Interest',
        message: `Someone expressed interest in your package: ${pkg.title}`,
      },
    });

    return interest;
  }

  async archivePackage(id: string, userId: string, userRole: UserRole) {
    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    if (pkg.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to archive this package');
    }

    const archivedPackage = await prisma.package.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedBy: userId,
      },
    });

    return { message: 'Package archived successfully', data: archivedPackage };
  }

  async deletePackage(id: string, userId: string, userRole: UserRole) {
    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    if (pkg.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to delete this package');
    }

    await prisma.package.delete({
      where: { id },
    });

    return { message: 'Package deleted successfully' };
  }

  async createCallbackRequest(data: {
    packageId: string;
    name: string;
    phone: string;
    email?: string;
    message?: string;
    userId?: string;
  }) {
    const pkg = await prisma.package.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    if (pkg.approvalStatus !== 'APPROVED') {
      throw new Error('Cannot request callback for unapproved package');
    }

    const callbackRequest = await prisma.packageCallbackRequest.create({
      data: {
        packageId: data.packageId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message,
        userId: data.userId,
      },
    });

    // Create notification for package host
    await prisma.notification.create({
      data: {
        userId: pkg.hostId,
        title: 'New Callback Request',
        message: `${data.name} requested a callback for your package: ${pkg.title}`,
      },
    });

    return callbackRequest;
  }

  async getPackageCallbackRequests(
    packageId: string,
    userId: string,
    userRole: UserRole,
    statusFilter?: string
  ) {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    // Only package host or admin can view callback requests
    if (pkg.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to view callback requests');
    }

    const where: any = { packageId };
    
    if (statusFilter) {
      where.status = statusFilter;
    }

    const requests = await prisma.packageCallbackRequest.findMany({
      where,
      include: {
        statusHistory: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  async getAllCallbackRequests(userId: string, userRole: UserRole) {
    if (userRole === 'SITE_ADMIN') {
      // Admin can see all callback requests
      const requests = await prisma.packageCallbackRequest.findMany({
        include: {
          package: {
            include: {
              host: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } else if (userRole === 'GOVT_DEPARTMENT' || userRole === 'TOURIST_GUIDE') {
      // Hosts can see callback requests for their packages
      const requests = await prisma.packageCallbackRequest.findMany({
        where: {
          package: {
            hostId: userId,
          },
        },
        include: {
          package: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return requests;
    } else {
      throw new Error('Unauthorized to view callback requests');
    }
  }

  async updateCallbackStatus(
    requestId: string,
    userId: string,
    userRole: UserRole,
    data: {
      status: string;
      notes?: string;
      rescheduleDate?: Date;
    }
  ) {
    const request = await prisma.packageCallbackRequest.findUnique({
      where: { id: requestId },
      include: {
        package: true,
      },
    });

    if (!request) {
      throw new Error('Callback request not found');
    }

    // Only package host or admin can update callback status
    if (request.package.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this callback request');
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONTACTED', 'RESCHEDULED', 'NOT_INTERESTED', 'BOOKING_COMPLETED'];
    if (!validStatuses.includes(data.status)) {
      throw new Error('Invalid callback status');
    }

    // Prepare update data
    const updateData: any = {
      status: data.status,
      notes: data.notes,
    };

    if (data.status === 'CONTACTED') {
      updateData.contactedAt = new Date();
      updateData.contactedBy = userId;
    }

    if (data.status === 'RESCHEDULED' && data.rescheduleDate) {
      updateData.rescheduleDate = data.rescheduleDate;
    }

    // Update callback request
    const updated = await prisma.packageCallbackRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Create status history record
    await prisma.callbackStatusHistory.create({
      data: {
        callbackRequestId: requestId,
        status: data.status as any,
        notes: data.notes,
        changedBy: userId,
      },
    });

    return updated;
  }

  async markAsContacted(requestId: string, userId: string, userRole: UserRole) {
    const request = await prisma.packageCallbackRequest.findUnique({
      where: { id: requestId },
      include: {
        package: true,
      },
    });

    if (!request) {
      throw new Error('Callback request not found');
    }

    // Only package host or admin can mark as contacted
    if (request.package.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this callback request');
    }

    const updated = await prisma.packageCallbackRequest.update({
      where: { id: requestId },
      data: { 
        status: 'CONTACTED',
        contactedAt: new Date(),
        contactedBy: userId,
      },
    });

    return updated;
  }
  async updatePackage(
    id: string,
    userId: string,
    userRole: UserRole,
    data: {
      title?: string;
      description?: string;
      duration?: number;
      locationId?: string;
      customCountry?: string;
      customState?: string;
      customArea?: string;
      price?: number;
      images?: string[];
      itinerary?: Array<{
        day: number;
        title: string;
        description: string;
        activities: string[];
      }>;
    }
  ) {
    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    // Only package host or admin can update
    if (pkg.hostId !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this package');
    }

    // If itinerary is being updated, delete old itinerary and create new one
    if (data.itinerary) {
      await prisma.itineraryDay.deleteMany({
        where: { packageId: id },
      });
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.duration && { duration: data.duration }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        ...(data.customCountry !== undefined && { customCountry: data.customCountry }),
        ...(data.customState !== undefined && { customState: data.customState }),
        ...(data.customArea !== undefined && { customArea: data.customArea }),
        ...(data.price && { price: data.price }),
        ...(data.images && { images: data.images }),
        ...(data.itinerary && {
          itinerary: {
            create: data.itinerary,
          },
        }),
      },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: {
          orderBy: {
            day: 'asc',
          },
        },
      },
    });

    return updatedPackage;
  }

  async togglePackageActiveStatus(id: string, isActive: boolean, userId: string, userRole: UserRole) {
    if (userRole !== 'SITE_ADMIN') {
      throw new Error('Only administrators can toggle package active status');
    }

    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: { isActive },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: true,
      },
    });

    return updatedPackage;
  }

  async updatePackageStatus(id: string, approvalStatus: ApprovalStatus, userId: string, userRole: UserRole) {
    if (userRole !== 'SITE_ADMIN' && userRole !== 'GOVT_DEPARTMENT') {
      throw new Error('Unauthorized to update package status');
    }

    const pkg = await prisma.package.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: { approvalStatus },
      include: {
        host: {
          include: {
            profile: true,
          },
        },
        location: true,
        itinerary: true,
      },
    });

    // Update approval queue
    await prisma.approvalQueue.updateMany({
      where: {
        contentType: 'PACKAGE',
        contentId: id,
      },
      data: {
        status: approvalStatus,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Notify package host
    await prisma.notification.create({
      data: {
        userId: pkg.hostId,
        title: 'Package Status Updated',
        message: `Your package "${pkg.title}" has been ${approvalStatus.toLowerCase()}`,
      },
    });

    return updatedPackage;
  }
}

export default new PackageService();

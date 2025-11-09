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
  }) {
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    } else {
      where.approvalStatus = 'APPROVED';
    }

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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return packages;
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

  async getPackageCallbackRequests(packageId: string, userId: string, userRole: UserRole) {
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

    const requests = await prisma.packageCallbackRequest.findMany({
      where: { packageId },
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
      data: { isContacted: true },
    });

    return updated;
  }
}

export default new PackageService();

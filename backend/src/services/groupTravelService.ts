import prisma from '../config/database';
import { GroupTravelStatus, BidApprovalStatus } from '@prisma/client';

export class GroupTravelService {
  async createGroupTravel(data: {
    title: string;
    description: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    travelDate: Date;
    expiryDate: Date;
    creatorId: string;
  }) {
    // Validate dates
    const now = new Date();
    const minTravelDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

    if (data.travelDate < minTravelDate) {
      throw new Error('Travel date must be at least 5 days from now');
    }

    if (data.expiryDate >= data.travelDate) {
      throw new Error('Expiry date must be before travel date');
    }

    const groupTravel = await prisma.groupTravel.create({
      data: {
        ...data,
        status: 'OPEN',
      },
      include: {
        creator: {
          include: {
            profile: true,
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
        bids: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
            dailyItinerary: true,
          },
        },
      },
    });

    return groupTravel;
  }

  async getAllGroupTravels(filters?: {
    status?: GroupTravelStatus;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = 'OPEN';
    }

    const groupTravels = await prisma.groupTravel.findMany({
      where,
      include: {
        creator: {
          include: {
            profile: true,
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
        bids: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        travelDate: 'asc',
      },
    });

    return groupTravels;
  }

  async getGroupTravelById(id: string) {
    const groupTravel = await prisma.groupTravel.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            profile: true,
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
        bids: {
          include: {
            guide: {
              include: {
                profile: true,
              },
            },
            dailyItinerary: {
              orderBy: {
                day: 'asc',
              },
            },
          },
        },
      },
    });

    if (!groupTravel) {
      throw new Error('Group travel not found');
    }

    return groupTravel;
  }

  async expressInterest(groupTravelId: string, userId: string) {
    const groupTravel = await prisma.groupTravel.findUnique({
      where: { id: groupTravelId },
    });

    if (!groupTravel) {
      throw new Error('Group travel not found');
    }

    if (groupTravel.status !== 'OPEN') {
      throw new Error('This group travel is no longer accepting interest');
    }

    const existing = await prisma.groupTravelInterest.findUnique({
      where: {
        groupTravelId_userId: {
          groupTravelId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error('Already expressed interest in this group travel');
    }

    await prisma.groupTravelInterest.create({
      data: {
        groupTravelId,
        userId,
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: groupTravel.creatorId,
        title: 'New Group Travel Interest',
        message: `Someone expressed interest in your group travel: ${groupTravel.title}`,
      },
    });

    return { message: 'Interest expressed successfully' };
  }

  async submitBid(data: {
    groupTravelId: string;
    guideId: string;
    numberOfDays: number;
    accommodationDetails: string;
    foodDetails: string;
    transportDetails: string;
    totalCost: number;
    dailyItinerary: Array<{
      day: number;
      activities: string;
      meals: string;
      accommodation: string;
    }>;
  }) {
    const groupTravel = await prisma.groupTravel.findUnique({
      where: { id: data.groupTravelId },
    });

    if (!groupTravel) {
      throw new Error('Group travel not found');
    }

    if (groupTravel.status !== 'OPEN') {
      throw new Error('This group travel is no longer accepting bids');
    }

    // Check if guide already submitted a bid
    const existingBid = await prisma.travelBid.findFirst({
      where: {
        groupTravelId: data.groupTravelId,
        guideId: data.guideId,
      },
    });

    if (existingBid) {
      throw new Error('You have already submitted a bid for this group travel');
    }

    const bid = await prisma.travelBid.create({
      data: {
        groupTravelId: data.groupTravelId,
        guideId: data.guideId,
        numberOfDays: data.numberOfDays,
        accommodationDetails: data.accommodationDetails,
        foodDetails: data.foodDetails,
        transportDetails: data.transportDetails,
        totalCost: data.totalCost,
        approvalStatus: 'PENDING',
        canContact: false,
        dailyItinerary: {
          create: data.dailyItinerary,
        },
      },
      include: {
        guide: {
          include: {
            profile: true,
          },
        },
        dailyItinerary: {
          orderBy: {
            day: 'asc',
          },
        },
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: groupTravel.creatorId,
        title: 'New Bid Received',
        message: `A tourist guide submitted a bid for your group travel: ${groupTravel.title}`,
      },
    });

    return bid;
  }

  async approveBidContact(bidId: string, creatorId: string) {
    const bid = await prisma.travelBid.findUnique({
      where: { id: bidId },
      include: {
        groupTravel: true,
      },
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.groupTravel.creatorId !== creatorId) {
      throw new Error('Only the group travel creator can approve contact');
    }

    await prisma.travelBid.update({
      where: { id: bidId },
      data: {
        canContact: true,
      },
    });

    // Notify guide
    await prisma.notification.create({
      data: {
        userId: bid.guideId,
        title: 'Contact Approved',
        message: 'The group travel creator approved your contact request',
      },
    });

    return { message: 'Contact approved successfully' };
  }

  async closeGroupTravel(id: string, creatorId: string) {
    const groupTravel = await prisma.groupTravel.findUnique({
      where: { id },
    });

    if (!groupTravel) {
      throw new Error('Group travel not found');
    }

    if (groupTravel.creatorId !== creatorId) {
      throw new Error('Only the creator can close this group travel');
    }

    await prisma.groupTravel.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
    });

    return { message: 'Group travel closed successfully' };
  }
}

export default new GroupTravelService();

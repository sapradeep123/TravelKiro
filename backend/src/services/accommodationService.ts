import prisma from '../config/database';
import { 
  UserRole, 
  AccommodationType, 
  ApprovalStatus,
  PriceCategory,
  DietType,
  HomeStaySubtype,
  GenderPreference
} from '@prisma/client';

export class AccommodationService {
  // Generate slug from name
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async createAccommodation(data: {
    type: AccommodationType;
    name: string;
    description: string;
    country: string;
    state: string;
    area: string;
    address?: string;
    latitude: number;
    longitude: number;
    mapUrl?: string;
    phone: string[];
    email?: string;
    website?: string;
    images: string[];
    videos?: string[];
    virtualTourUrl?: string;
    priceMin?: number;
    priceMax?: number;
    currency?: string;
    priceCategory?: PriceCategory;
    starRating?: number;
    amenities?: string[];
    dietTypes?: DietType[];
    cuisineTypes?: string[];
    seatingCapacity?: number;
    homeStaySubtype?: HomeStaySubtype;
    totalRooms?: number;
    sharedFacilities?: string[];
    privateFacilities?: string[];
    houseRules?: string;
    genderPreference?: GenderPreference;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    isFeatured?: boolean;
    createdBy: string;
  }) {
    // Generate unique slug
    let slug = this.generateSlug(data.name);
    let slugExists = await prisma.accommodation.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${this.generateSlug(data.name)}-${counter}`;
      slugExists = await prisma.accommodation.findUnique({ where: { slug } });
      counter++;
    }

    const accommodation = await prisma.accommodation.create({
      data: {
        ...data,
        slug,
        approvalStatus: 'PENDING',
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Create approval queue entry
    await prisma.approvalQueue.create({
      data: {
        contentType: 'ACCOMMODATION',
        contentId: accommodation.id,
        submittedBy: data.createdBy,
        submittedByRole: UserRole.SITE_ADMIN, // Will be dynamic based on user
        status: 'PENDING',
      },
    });

    return accommodation;
  }

  async getAllAccommodations(filters?: {
    type?: AccommodationType;
    country?: string;
    state?: string;
    area?: string;
    dietTypes?: DietType[];
    homeStaySubtype?: HomeStaySubtype;
    amenities?: string[];
    priceMin?: number;
    priceMax?: number;
    priceCategory?: PriceCategory;
    starRating?: number;
    lat?: number;
    lng?: number;
    radius?: number; // in km
    approvalStatus?: ApprovalStatus;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: filters?.isActive !== undefined ? filters.isActive : true,
      approvalStatus: filters?.approvalStatus || 'APPROVED',
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }

    if (filters?.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters?.area) {
      where.area = { contains: filters.area, mode: 'insensitive' };
    }

    if (filters?.dietTypes && filters.dietTypes.length > 0) {
      where.dietTypes = { hasSome: filters.dietTypes };
    }

    if (filters?.homeStaySubtype) {
      where.homeStaySubtype = filters.homeStaySubtype;
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      where.amenities = { hasEvery: filters.amenities };
    }

    if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
      where.AND = where.AND || [];
      if (filters.priceMin !== undefined) {
        where.AND.push({ priceMin: { gte: filters.priceMin } });
      }
      if (filters.priceMax !== undefined) {
        where.AND.push({ priceMax: { lte: filters.priceMax } });
      }
    }

    if (filters?.priceCategory) {
      where.priceCategory = filters.priceCategory;
    }

    if (filters?.starRating) {
      where.starRating = { gte: filters.starRating };
    }

    // Get accommodations
    let accommodations = await prisma.accommodation.findMany({
      where,
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            callRequests: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: this.getSortOrder(filters?.sort),
    });

    // Filter by distance if lat/lng provided
    if (filters?.lat && filters?.lng && filters?.radius) {
      accommodations = accommodations.filter(acc => {
        const distance = this.calculateDistance(
          filters.lat!,
          filters.lng!,
          acc.latitude,
          acc.longitude
        );
        return distance <= filters.radius!;
      });
    }

    const total = await prisma.accommodation.count({ where });

    return {
      data: accommodations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getSortOrder(sort?: string) {
    switch (sort) {
      case 'price-asc':
        return { priceMin: 'asc' as const };
      case 'price-desc':
        return { priceMin: 'desc' as const };
      case 'rating':
        return { userRating: 'desc' as const };
      case 'name':
        return { name: 'asc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  async getAccommodationById(id: string) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reviews: true,
            callRequests: true,
          },
        },
      },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    return accommodation;
  }

  async getAccommodationBySlug(slug: string) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { slug },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    return accommodation;
  }

  async searchAccommodations(query: string) {
    const accommodations = await prisma.accommodation.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { area: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
      take: 20,
    });

    return accommodations;
  }

  async getNearbyAccommodations(lat: number, lng: number, radius: number = 10) {
    // Get all accommodations within a bounding box first (for performance)
    const latDelta = radius / 111; // 1 degree latitude ≈ 111 km
    const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));

    const accommodations = await prisma.accommodation.findMany({
      where: {
        isActive: true,
        approvalStatus: 'APPROVED',
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Filter by actual distance
    const nearby = accommodations
      .map(acc => ({
        ...acc,
        distance: this.calculateDistance(lat, lng, acc.latitude, acc.longitude),
      }))
      .filter(acc => acc.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }

  async updateAccommodation(
    id: string,
    userId: string,
    userRole: UserRole,
    data: Partial<{
      type: AccommodationType;
      name: string;
      description: string;
      country: string;
      state: string;
      area: string;
      address: string;
      latitude: number;
      longitude: number;
      mapUrl: string;
      phone: string[];
      email: string;
      website: string;
      images: string[];
      videos: string[];
      virtualTourUrl: string;
      priceMin: number;
      priceMax: number;
      currency: string;
      priceCategory: PriceCategory;
      starRating: number;
      amenities: string[];
      dietTypes: DietType[];
      cuisineTypes: string[];
      seatingCapacity: number;
      homeStaySubtype: HomeStaySubtype;
      totalRooms: number;
      sharedFacilities: string[];
      privateFacilities: string[];
      houseRules: string;
      genderPreference: GenderPreference;
      metaTitle: string;
      metaDescription: string;
      keywords: string[];
      isFeatured: boolean;
      isActive: boolean;
    }>
  ) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    // Check permissions
    if (accommodation.createdBy !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this accommodation');
    }

    // Update slug if name changed
    let updateData: any = { ...data };
    if (data.name && data.name !== accommodation.name) {
      let slug = this.generateSlug(data.name);
      let slugExists = await prisma.accommodation.findFirst({
        where: { slug, id: { not: id } },
      });
      let counter = 1;
      while (slugExists) {
        slug = `${this.generateSlug(data.name)}-${counter}`;
        slugExists = await prisma.accommodation.findFirst({
          where: { slug, id: { not: id } },
        });
        counter++;
      }
      updateData.slug = slug;
    }

    const updated = await prisma.accommodation.update({
      where: { id },
      data: updateData,
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

  async deleteAccommodation(id: string, userId: string, userRole: UserRole) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    if (accommodation.createdBy !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to delete this accommodation');
    }

    await prisma.accommodation.delete({
      where: { id },
    });

    return { message: 'Accommodation deleted successfully' };
  }

  async updateApprovalStatus(
    id: string,
    status: ApprovalStatus,
    userId: string,
    userRole: UserRole
  ) {
    if (userRole !== 'SITE_ADMIN' && userRole !== 'GOVT_DEPARTMENT') {
      throw new Error('Unauthorized to update approval status');
    }

    const accommodation = await prisma.accommodation.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Update approval queue
    await prisma.approvalQueue.updateMany({
      where: {
        contentType: 'ACCOMMODATION',
        contentId: id,
      },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: accommodation.createdBy,
        title: 'Accommodation Status Updated',
        message: `Your accommodation "${accommodation.name}" has been ${status.toLowerCase()}`,
      },
    });

    return accommodation;
  }

  async toggleActiveStatus(id: string, isActive: boolean, userId: string, userRole: UserRole) {
    const accommodation = await prisma.accommodation.findUnique({
      where: { id },
    });

    if (!accommodation) {
      throw new Error('Accommodation not found');
    }

    if (accommodation.createdBy !== userId && userRole !== 'SITE_ADMIN') {
      throw new Error('Unauthorized to update this accommodation');
    }

    const updated = await prisma.accommodation.update({
      where: { id },
      data: { isActive },
    });

    return updated;
  }
}

export default new AccommodationService();

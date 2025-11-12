export type UserRole = 'SITE_ADMIN' | 'GOVT_DEPARTMENT' | 'TOURIST_GUIDE' | 'USER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isCelebrity: boolean;
  isInfluencer: boolean;
  stateAssignment?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Location {
  id: string;
  country: string;
  state: string;
  area: string;
  description: string;
  images: string[];
  latitude?: number;
  longitude?: number;
  howToReach?: string;
  nearestAirport?: string;
  airportDistance?: string;
  nearestRailway?: string;
  railwayDistance?: string;
  nearestBusStation?: string;
  busStationDistance?: string;
  attractions?: string[];
  kidsAttractions?: string[];
  createdByRole: UserRole;
  approvalStatus: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  locationId?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  venue?: string;
  startDate: string;
  endDate: string;
  images: string[];
  hostRole: UserRole;
  approvalStatus: string;
  isActive?: boolean;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  images: string[];
  itinerary: ItineraryDay[];
  approvalStatus: string;
  locationId?: string;
  location?: Location;
  customCountry?: string;
  customState?: string;
  customArea?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}



export interface CommunityPost {
  id: string;
  caption: string;
  mediaUrls: string[];
  mediaTypes: ('IMAGE' | 'VIDEO')[];
  user: User;
  likes: any[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  user: User;
  createdAt: string;
}

export interface GroupTravel {
  id: string;
  title: string;
  description: string;
  travelDate: string;
  expiryDate: string;
  status: string;
  creator: User;
  interestedUsers: any[];
  bids: TravelBid[];
}

export interface TravelBid {
  id: string;
  numberOfDays: number;
  accommodationDetails: string;
  foodDetails: string;
  transportDetails: string;
  totalCost: number;
  guide: User;
  dailyItinerary: DailyPlan[];
  canContact: boolean;
}

export interface DailyPlan {
  day: number;
  activities: string;
  meals: string;
  accommodation: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}


// Accommodation Types
export type AccommodationType = 'HOTEL' | 'RESORT' | 'RESTAURANT' | 'HOME_STAY' | 'SHARED_FLAT';
export type PriceCategory = 'BUDGET' | 'MID_RANGE' | 'LUXURY' | 'PREMIUM';
export type DietType = 'VEGETARIAN' | 'VEGAN' | 'NON_VEGETARIAN' | 'JAIN' | 'HALAL' | 'KOSHER' | 'GLUTEN_FREE' | 'ORGANIC';
export type HomeStaySubtype = 'ENTIRE_HOME' | 'PRIVATE_ROOM' | 'SHARED_ROOM' | 'FARM_STAY' | 'HERITAGE_HOME' | 'ECO_STAY' | 'BEACH_HOUSE' | 'MOUNTAIN_COTTAGE';
export type GenderPreference = 'MALE_ONLY' | 'FEMALE_ONLY' | 'MIXED' | 'NO_PREFERENCE';
export type CallRequestStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'FOLLOW_UP' | 'SCHEDULED' | 'CONVERTED' | 'LOST' | 'INVALID';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CallOutcome = 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'WRONG_NUMBER' | 'VOICEMAIL' | 'CALLBACK_REQUESTED';
export type InteractionType = 'CALL' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'NOTE' | 'STATUS_CHANGE';

export interface Accommodation {
  id: string;
  type: AccommodationType;
  name: string;
  slug: string;
  description: string;
  
  // Location
  country: string;
  state: string;
  area: string;
  address?: string;
  latitude: number;
  longitude: number;
  mapUrl?: string;
  
  // Contact
  phone: string[];
  email?: string;
  website?: string;
  
  // Media
  images: string[];
  videos?: string[];
  virtualTourUrl?: string;
  
  // Pricing
  priceMin?: number;
  priceMax?: number;
  currency: string;
  priceCategory?: PriceCategory;
  
  // Ratings
  starRating?: number;
  userRating?: number;
  reviewCount: number;
  
  // Amenities
  amenities: string[];
  
  // Restaurant specific
  dietTypes?: DietType[];
  cuisineTypes?: string[];
  seatingCapacity?: number;
  
  // Home Stay specific
  homeStaySubtype?: HomeStaySubtype;
  totalRooms?: number;
  sharedFacilities?: string[];
  privateFacilities?: string[];
  houseRules?: string;
  genderPreference?: GenderPreference;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  approvalStatus: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  creator?: User;
  reviews?: AccommodationReview[];
  _count?: {
    reviews: number;
    callRequests: number;
  };
  
  // For nearby search
  distance?: number;
}

export interface AccommodationReview {
  id: string;
  accommodationId: string;
  userId: string;
  rating: number;
  title?: string;
  review: string;
  isApproved: boolean;
  createdAt: string;
  user?: User;
}

export interface AccommodationCallRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferredCallTime?: string;
  message?: string;
  accommodationId: string;
  status: CallRequestStatus;
  priority: Priority;
  scheduledCallDate?: string;
  createdAt: string;
  accommodation?: Accommodation;
  assignedAdmin?: User;
  interactions?: CallInteraction[];
  statusHistory?: CallStatusHistory[];
  _count?: {
    interactions: number;
  };
}

export interface CallInteraction {
  id: string;
  callRequestId: string;
  type: InteractionType;
  outcome?: CallOutcome;
  duration?: number;
  notes: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
  admin?: User;
}

export interface CallStatusHistory {
  id: string;
  callRequestId: string;
  fromStatus?: CallRequestStatus;
  toStatus: CallRequestStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  admin?: User;
}

export interface AccommodationFilters {
  type?: AccommodationType;
  country?: string;
  state?: string;
  area?: string;
  search?: string;
  dietTypes?: DietType[];
  homeStaySubtype?: HomeStaySubtype;
  amenities?: string[];
  priceMin?: number;
  priceMax?: number;
  priceCategory?: PriceCategory;
  starRating?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

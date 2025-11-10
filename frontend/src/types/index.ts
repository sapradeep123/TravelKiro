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
  locationId?: string;
  startDate: string;
  endDate: string;
  images: string[];
  hostRole: UserRole;
  approvalStatus: string;
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

export interface Accommodation {
  id: string;
  name: string;
  type: 'HOTEL' | 'RESTAURANT' | 'RESORT';
  description: string;
  contactPhone: string;
  contactEmail?: string;
  contactWebsite?: string;
  contactAddress: string;
  images: string[];
  isGovtApproved: boolean;
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

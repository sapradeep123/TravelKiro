export type UserRole = 'USER' | 'TOURIST_GUIDE' | 'GOVT_DEPARTMENT' | 'SITE_ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  bio?: string;
  avatar?: string;
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
  createdBy: string;
  createdByRole: UserRole;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  locationId?: string;
  location?: Location;
  startDate: string;
  endDate: string;
  images: string[];
  hostId: string;
  hostRole: UserRole;
  approvalStatus: ApprovalStatus;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  locationId?: string;
  location?: Location;
  price: number;
  images: string[];
  hostId: string;
  hostRole: UserRole;
  approvalStatus: ApprovalStatus;
  itinerary: ItineraryDay[];
}

export interface ItineraryDay {
  id: string;
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'HOTEL' | 'RESTAURANT' | 'HOSPITAL';
  locationId?: string;
  location?: Location;
  description: string;
  contactPhone: string;
  contactEmail?: string;
  contactWebsite?: string;
  contactAddress: string;
  images: string[];
  isGovtApproved: boolean;
  uploadedBy: string;
  uploadedByRole: UserRole;
  approvalStatus: ApprovalStatus;
}

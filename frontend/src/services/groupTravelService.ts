import api from './api';

export interface CreateGroupTravelData {
  title: string;
  description: string;
  locationId?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  travelDate: string;
  expiryDate: string;
}

export interface SubmitBidData {
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
}

export const groupTravelService = {
  async getAllGroupTravels(status?: string) {
    const response = await api.get('/group-travel', {
      params: { status },
    });
    return response.data;
  },

  async getGroupTravelById(id: string) {
    const response = await api.get(`/group-travel/${id}`);
    return response.data;
  },

  async createGroupTravel(data: CreateGroupTravelData) {
    const response = await api.post('/group-travel', data);
    return response.data;
  },

  async expressInterest(groupTravelId: string) {
    const response = await api.post(`/group-travel/${groupTravelId}/interest`, {});
    return response.data;
  },

  async submitBid(groupTravelId: string, data: SubmitBidData) {
    const response = await api.post(`/group-travel/${groupTravelId}/bid`, data);
    return response.data;
  },

  async approveBidContact(bidId: string) {
    const response = await api.post(`/group-travel/bids/${bidId}/approve-contact`, {});
    return response.data;
  },

  async closeGroupTravel(id: string) {
    const response = await api.put(`/group-travel/${id}/close`, {});
    return response.data;
  },

  async getMyGroupTravels() {
    const response = await api.get('/group-travel/my-travels');
    return response.data;
  },

  async getMyBids() {
    const response = await api.get('/group-travel/my-bids');
    return response.data;
  },
};

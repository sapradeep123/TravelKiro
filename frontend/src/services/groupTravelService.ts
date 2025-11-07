import api from './api';
import { GroupTravel } from '../types';

export const groupTravelService = {
  async getAllGroupTravels(filters?: {
    status?: string;
  }): Promise<GroupTravel[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/group-travel?${params.toString()}`);
    return response.data.data;
  },

  async getGroupTravelById(id: string): Promise<GroupTravel> {
    const response = await api.get(`/group-travel/${id}`);
    return response.data.data;
  },

  async createGroupTravel(data: {
    title: string;
    description: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    travelDate: string;
    expiryDate: string;
  }): Promise<GroupTravel> {
    const response = await api.post('/group-travel', data);
    return response.data.data;
  },

  async expressInterest(groupTravelId: string): Promise<void> {
    await api.post(`/group-travel/${groupTravelId}/interest`);
  },

  async submitBid(groupTravelId: string, data: {
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
  }): Promise<any> {
    const response = await api.post(`/group-travel/${groupTravelId}/bid`, data);
    return response.data.data;
  },

  async approveBidContact(bidId: string): Promise<void> {
    await api.post(`/group-travel/bids/${bidId}/approve-contact`);
  },

  async closeGroupTravel(groupTravelId: string): Promise<void> {
    await api.put(`/group-travel/${groupTravelId}/close`);
  },
};

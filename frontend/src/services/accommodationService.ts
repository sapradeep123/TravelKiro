import api from './api';
import { Accommodation } from '../types';

export const accommodationService = {
  async getAllAccommodations(filters?: {
    locationId?: string;
    type?: 'HOTEL' | 'RESTAURANT' | 'RESORT';
  }): Promise<Accommodation[]> {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get(`/accommodations?${params.toString()}`);
    return response.data.data;
  },

  async getAccommodationById(id: string): Promise<Accommodation> {
    const response = await api.get(`/accommodations/${id}`);
    return response.data.data;
  },

  async createAccommodation(data: {
    name: string;
    type: 'HOTEL' | 'RESTAURANT' | 'RESORT';
    locationId: string;
    description: string;
    contactPhone: string;
    contactEmail?: string;
    contactWebsite?: string;
    contactAddress: string;
    images: string[];
    isGovtApproved: boolean;
  }): Promise<Accommodation> {
    const response = await api.post('/accommodations', data);
    return response.data.data;
  },
};

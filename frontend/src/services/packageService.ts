import api from './api';
import { Package } from '../types';

export const packageService = {
  async getAllPackages(filters?: {
    locationId?: string;
  }): Promise<Package[]> {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append('locationId', filters.locationId);

    const response = await api.get(`/packages?${params.toString()}`);
    return response.data.data;
  },

  async getPackageById(id: string): Promise<Package> {
    const response = await api.get(`/packages/${id}`);
    return response.data.data;
  },

  async expressInterest(packageId: string): Promise<void> {
    await api.post(`/packages/${packageId}/interest`);
  },

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
    itinerary: Array<{
      day: number;
      title: string;
      description: string;
      activities: string[];
    }>;
  }): Promise<Package> {
    const response = await api.post('/packages', data);
    return response.data.data;
  },
};

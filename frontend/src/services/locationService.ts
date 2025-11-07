import api from './api';
import { Location } from '../types';

export const locationService = {
  async getAllLocations(filters?: {
    country?: string;
    state?: string;
  }): Promise<Location[]> {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.state) params.append('state', filters.state);

    const response = await api.get(`/locations?${params.toString()}`);
    return response.data.data;
  },

  async getLocationById(id: string): Promise<Location> {
    const response = await api.get(`/locations/${id}`);
    return response.data.data;
  },

  async searchLocations(query: string): Promise<Location[]> {
    const response = await api.get(`/locations/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async createLocation(data: {
    country: string;
    state: string;
    area: string;
    description: string;
    images: string[];
  }): Promise<Location> {
    const response = await api.post('/locations', data);
    return response.data.data;
  },
};

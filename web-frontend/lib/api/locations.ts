import apiClient from './client';
import { Location } from '@/types';

export interface LocationFilters {
  country?: string;
  state?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  search?: string;
}

export const locationsApi = {
  // Get all locations
  getLocations: async (filters?: LocationFilters): Promise<Location[]> => {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await apiClient.get<{ data: Location[] }>(`/locations?${params.toString()}`);
    return response.data.data;
  },

  // Get location by ID
  getLocationById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<Location>(`/locations/${id}`);
    return response.data;
  },

  // Create location
  createLocation: async (data: Partial<Location>): Promise<Location> => {
    const response = await apiClient.post<Location>('/locations', data);
    return response.data;
  },

  // Update location
  updateLocation: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await apiClient.patch<Location>(`/locations/${id}`, data);
    return response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },
};

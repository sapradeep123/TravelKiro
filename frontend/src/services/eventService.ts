import api from './api';
import { Event } from '../types';

export const eventService = {
  async getAllEvents(filters?: {
    locationId?: string;
  }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.locationId) params.append('locationId', filters.locationId);

    const response = await api.get(`/events?${params.toString()}`);
    return response.data.data;
  },

  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  async expressInterest(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/interest`);
  },

  async createEvent(data: {
    title: string;
    description: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    startDate: string;
    endDate: string;
    images: string[];
  }): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data.data;
  },

  async createCallbackRequest(eventId: string, data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  }): Promise<void> {
    await api.post(`/events/${eventId}/callback-request`, data);
  },

  async getEventCallbackRequests(eventId: string): Promise<any[]> {
    const response = await api.get(`/events/${eventId}/callback-requests`);
    return response.data.data;
  },

  async getAllCallbackRequests(): Promise<any[]> {
    const response = await api.get('/events/callback-requests/all');
    return response.data.data;
  },

  async markAsContacted(requestId: string): Promise<void> {
    await api.patch(`/events/callback-requests/${requestId}/contacted`);
  },
};

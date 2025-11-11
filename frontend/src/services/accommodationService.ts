import api from './api';
import { 
  Accommodation, 
  AccommodationFilters, 
  PaginatedResponse,
  AccommodationCallRequest 
} from '../types';

export const accommodationService = {
  // Public APIs
  async getAllAccommodations(filters?: AccommodationFilters): Promise<PaginatedResponse<Accommodation>> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.area) params.append('area', filters.area);
    if (filters?.dietTypes) params.append('dietTypes', filters.dietTypes.join(','));
    if (filters?.homeStaySubtype) params.append('homeStaySubtype', filters.homeStaySubtype);
    if (filters?.amenities) params.append('amenities', filters.amenities.join(','));
    if (filters?.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
    if (filters?.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
    if (filters?.priceCategory) params.append('priceCategory', filters.priceCategory);
    if (filters?.starRating) params.append('starRating', filters.starRating.toString());
    if (filters?.lat) params.append('lat', filters.lat.toString());
    if (filters?.lng) params.append('lng', filters.lng.toString());
    if (filters?.radius) params.append('radius', filters.radius.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await api.get(`/accommodations?${params.toString()}`);
    return response.data;
  },

  async getAccommodationById(id: string): Promise<Accommodation> {
    const response = await api.get(`/accommodations/${id}`);
    return response.data.data;
  },

  async getAccommodationBySlug(slug: string): Promise<Accommodation> {
    const response = await api.get(`/accommodations/slug/${slug}`);
    return response.data.data;
  },

  async searchAccommodations(query: string): Promise<Accommodation[]> {
    const response = await api.get(`/accommodations/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async getNearbyAccommodations(lat: number, lng: number, radius?: number): Promise<Accommodation[]> {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());

    const response = await api.get(`/accommodations/nearby?${params.toString()}`);
    return response.data.data;
  },

  async requestCall(accommodationId: string, data: {
    name: string;
    phone: string;
    email?: string;
    preferredCallTime?: string;
    message?: string;
  }): Promise<{ message: string; requestId: string }> {
    const response = await api.post(`/accommodations/${accommodationId}/request-call`, data);
    return response.data;
  },

  // Admin APIs
  async createAccommodation(data: any): Promise<Accommodation> {
    const response = await api.post('/accommodations', data);
    return response.data.data;
  },

  async updateAccommodation(id: string, data: any): Promise<Accommodation> {
    const response = await api.put(`/accommodations/${id}`, data);
    return response.data.data;
  },

  async deleteAccommodation(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/accommodations/${id}`);
    return response.data;
  },

  async updateApprovalStatus(id: string, approvalStatus: string): Promise<Accommodation> {
    const response = await api.patch(`/accommodations/${id}/approval-status`, { approvalStatus });
    return response.data.data;
  },

  async toggleActiveStatus(id: string, isActive: boolean): Promise<Accommodation> {
    const response = await api.patch(`/accommodations/${id}/active-status`, { isActive });
    return response.data.data;
  },

  async getAdminAccommodations(filters?: {
    approvalStatus?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Accommodation>> {
    const params = new URLSearchParams();
    if (filters?.approvalStatus) params.append('approvalStatus', filters.approvalStatus);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/accommodations/admin/all?${params.toString()}`);
    return response.data;
  },

  // Call Request APIs
  async getAllCallRequests(filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    accommodationId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AccommodationCallRequest>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.accommodationId) params.append('accommodationId', filters.accommodationId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/accommodations/admin/call-requests?${params.toString()}`);
    return response.data;
  },

  async getCallRequestById(id: string): Promise<AccommodationCallRequest> {
    const response = await api.get(`/accommodations/admin/call-requests/${id}`);
    return response.data.data;
  },

  async assignCallRequest(id: string, assignedTo: string): Promise<AccommodationCallRequest> {
    const response = await api.post(`/accommodations/admin/call-requests/${id}/assign`, { assignedTo });
    return response.data.data;
  },

  async updateCallStatus(id: string, status: string, notes?: string, reason?: string): Promise<AccommodationCallRequest> {
    const response = await api.patch(`/accommodations/admin/call-requests/${id}/status`, { status, notes, reason });
    return response.data.data;
  },

  async updatePriority(id: string, priority: string): Promise<AccommodationCallRequest> {
    const response = await api.patch(`/accommodations/admin/call-requests/${id}/priority`, { priority });
    return response.data.data;
  },

  async addInteraction(id: string, data: {
    type: string;
    outcome?: string;
    duration?: number;
    notes: string;
    nextAction?: string;
    followUpDate?: string;
  }): Promise<any> {
    const response = await api.post(`/accommodations/admin/call-requests/${id}/interactions`, data);
    return response.data.data;
  },

  async scheduleCallback(id: string, scheduledCallDate: string): Promise<AccommodationCallRequest> {
    const response = await api.post(`/accommodations/admin/call-requests/${id}/schedule`, { scheduledCallDate });
    return response.data.data;
  },

  async getScheduledCallbacks(userId?: string): Promise<AccommodationCallRequest[]> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/accommodations/admin/call-requests/scheduled${params}`);
    return response.data.data;
  },

  async getOverdueCallbacks(userId?: string): Promise<AccommodationCallRequest[]> {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/accommodations/admin/call-requests/overdue${params}`);
    return response.data.data;
  },

  // Reporting APIs
  async getLeadMetrics(filters?: {
    from?: string;
    to?: string;
    accommodationId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.accommodationId) params.append('accommodationId', filters.accommodationId);

    const response = await api.get(`/accommodations/admin/reports/lead-metrics?${params.toString()}`);
    return response.data.data;
  },

  async getConversionFunnel(filters?: {
    from?: string;
    to?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const response = await api.get(`/accommodations/admin/reports/conversion-funnel?${params.toString()}`);
    return response.data.data;
  },

  async getAdminPerformance(filters?: {
    from?: string;
    to?: string;
    adminId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.adminId) params.append('adminId', filters.adminId);

    const response = await api.get(`/accommodations/admin/reports/admin-performance?${params.toString()}`);
    return response.data.data;
  },

  async getPropertyPerformance(filters?: {
    from?: string;
    to?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const response = await api.get(`/accommodations/admin/reports/property-performance?${params.toString()}`);
    return response.data.data;
  },

  async getTimeBasedReport(filters?: {
    from?: string;
    to?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    const response = await api.get(`/accommodations/admin/reports/time-based?${params.toString()}`);
    return response.data.data;
  },

  async getLostLeadReasons(filters?: {
    from?: string;
    to?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const response = await api.get(`/accommodations/admin/reports/lost-lead-reasons?${params.toString()}`);
    return response.data.data;
  },
};

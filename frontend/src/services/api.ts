import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Storage wrapper that works on both web and native
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh for logout and auth endpoints (except refresh-token itself)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/logout') || 
                          originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          await storage.setItem('accessToken', accessToken);
          await storage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          // No refresh token, clear everything and force re-login
          await storage.deleteItem('accessToken');
          await storage.deleteItem('refreshToken');
          await storage.deleteItem('user');
          
          // Redirect to login on web
          if (Platform.OS === 'web') {
            if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
              (globalThis as any).location.href = '/login';
            }
          }
        }
      } catch (refreshError: any) {
        // Refresh failed (401 or other error), clear tokens silently
        // Don't throw error for logout - just clear tokens
        if (originalRequest.url?.includes('/auth/logout')) {
          await storage.deleteItem('accessToken');
          await storage.deleteItem('refreshToken');
          await storage.deleteItem('user');
          // Return a resolved promise for logout to prevent error
          return Promise.resolve({ data: { message: 'Logged out' } });
        }
        
        // For other endpoints, clear tokens and reject
        await storage.deleteItem('accessToken');
        await storage.deleteItem('refreshToken');
        await storage.deleteItem('user');
        
        // Redirect to login on web
        if (Platform.OS === 'web') {
          if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
            (globalThis as any).location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For logout endpoints with 401, clear tokens and resolve gracefully
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/logout')) {
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
      await storage.deleteItem('user');
      return Promise.resolve({ data: { message: 'Logged out' } });
    }

    return Promise.reject(error);
  }
);

export default api;

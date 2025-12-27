import api from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthResponse, UserRole } from '../types';

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

export const authService = {
  async register(email: string, password: string, name: string, role?: UserRole): Promise<AuthResponse> {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      role,
    });
    return response.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  async logout(): Promise<void> {
    // Always clear tokens, even if API call fails
    // The API interceptor will handle 401 errors gracefully for logout
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      // Ignore errors during logout - tokens will be cleared anyway
      // This prevents uncaught errors when tokens are already invalid
      if (error.response?.status !== 401) {
        // Only log non-401 errors (401 is expected for expired tokens)
        console.warn('Logout API call failed:', error.message);
      }
    } finally {
      // Always clear tokens regardless of API call success/failure
      await storage.deleteItem('accessToken');
      await storage.deleteItem('refreshToken');
      await storage.deleteItem('user');
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  async saveTokens(accessToken: string, refreshToken: string, user: any): Promise<void> {
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    await storage.setItem('user', JSON.stringify(user));
  },

  async getStoredUser() {
    const userStr = await storage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

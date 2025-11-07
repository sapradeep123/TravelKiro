import api from './api';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse, UserRole } from '../types';

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
    try {
      await api.post('/auth/logout');
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  async saveTokens(accessToken: string, refreshToken: string, user: any): Promise<void> {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
  },

  async getStoredUser() {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

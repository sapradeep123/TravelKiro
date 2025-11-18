import api from './api';

export interface SiteSettings {
  id: string;
  siteName: string;
  siteTitle: string;
  logoUrl?: string;
  faviconUrl?: string;
  welcomeMessage?: string;
  welcomeSubtitle?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export const siteSettingsService = {
  async getSettings() {
    const response = await api.get('/site-settings');
    return response.data;
  },

  async updateSettings(data: {
    siteName?: string;
    siteTitle?: string;
    logoUrl?: string;
    faviconUrl?: string;
    welcomeMessage?: string;
    welcomeSubtitle?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
  }) {
    const response = await api.put('/site-settings', data);
    return response.data;
  },
};

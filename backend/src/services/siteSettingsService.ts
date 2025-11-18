import prisma from '../config/database';

export class SiteSettingsService {
  async getSettings() {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.siteSettings.create({
        data: {
          siteName: 'Butterfliy',
          siteTitle: 'Travel Encyclopedia',
        },
      });
    }
    
    return settings;
  }

  async updateSettings(data: {
    siteName?: string;
    siteTitle?: string;
    logoUrl?: string;
    faviconUrl?: string;
    welcomeMessage?: string;
    welcomeSubtitle?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
    updatedBy?: string;
  }) {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteName: data.siteName || 'Butterfliy',
          siteTitle: data.siteTitle || 'Travel Encyclopedia',
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          welcomeMessage: data.welcomeMessage || 'Welcome Back',
          welcomeSubtitle: data.welcomeSubtitle || 'Sign in to explore the world',
          termsAndConditions: data.termsAndConditions,
          privacyPolicy: data.privacyPolicy,
          updatedBy: data.updatedBy,
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    }
    
    return settings;
  }
}

export default new SiteSettingsService();

import { Request, Response } from 'express';
import siteSettingsService from '../services/siteSettingsService';
import { AuthRequest } from '../middleware/auth';

export class SiteSettingsController {
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await siteSettingsService.getSettings();
      res.status(200).json({ data: settings });
    } catch (error) {
      console.error('Error getting site settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user || user.role !== 'SITE_ADMIN') {
        return res.status(403).json({ error: 'Only site administrators can update settings' });
      }

      const { siteName, siteTitle, logoUrl, faviconUrl, welcomeMessage, welcomeSubtitle, termsAndConditions, privacyPolicy } = req.body;

      const settings = await siteSettingsService.updateSettings({
        siteName,
        siteTitle,
        logoUrl,
        faviconUrl,
        welcomeMessage,
        welcomeSubtitle,
        termsAndConditions,
        privacyPolicy,
        updatedBy: user.userId,
      });

      res.status(200).json({
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      console.error('Error updating site settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new SiteSettingsController();

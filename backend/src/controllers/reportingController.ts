import { Request, Response } from 'express';
import reportingService from '../services/reportingService';
import { AuthRequest } from '../middleware/auth';

export class ReportingController {
  async getLeadMetrics(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to, accommodationId } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (accommodationId) filters.accommodationId = accommodationId as string;

      const metrics = await reportingService.getLeadMetrics(filters);

      res.status(200).json({ data: metrics });
    } catch (error) {
      console.error('Error getting lead metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getConversionFunnel(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const funnel = await reportingService.getConversionFunnel(filters);

      res.status(200).json({ data: funnel });
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAdminPerformance(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to, adminId } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (adminId) filters.adminId = adminId as string;

      const performance = await reportingService.getAdminPerformance(filters);

      res.status(200).json({ data: performance });
    } catch (error) {
      console.error('Error getting admin performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPropertyPerformance(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const performance = await reportingService.getPropertyPerformance(filters);

      res.status(200).json({ data: performance });
    } catch (error) {
      console.error('Error getting property performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTimeBasedReport(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to, groupBy } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (groupBy) filters.groupBy = groupBy as 'day' | 'week' | 'month';

      const report = await reportingService.getTimeBasedReport(filters);

      res.status(200).json({ data: report });
    } catch (error) {
      console.error('Error getting time-based report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLostLeadReasons(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { from, to } = req.query;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);

      const reasons = await reportingService.getLostLeadReasons(filters);

      res.status(200).json({ data: reasons });
    } catch (error) {
      console.error('Error getting lost lead reasons:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ReportingController();

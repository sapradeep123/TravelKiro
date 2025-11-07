import { Request, Response } from 'express';
import approvalService from '../services/approvalService';
import { AuthRequest } from '../middleware/auth';

export class ApprovalController {
  async getPendingApprovals(req: Request, res: Response) {
    try {
      const approvals = await approvalService.getPendingApprovals();

      res.status(200).json({ data: approvals });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async approveContent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { approvalId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await approvalService.approveContent(approvalId, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async rejectContent(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { approvalId } = req.params;
      const { reason } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const result = await approvalService.rejectContent(approvalId, user.userId, reason);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getApprovalHistory(req: Request, res: Response) {
    try {
      const history = await approvalService.getApprovalHistory();

      res.status(200).json({ data: history });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ApprovalController();

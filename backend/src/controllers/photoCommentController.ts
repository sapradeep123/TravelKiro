import { Request, Response } from 'express';
import photoCommentService from '../services/photoCommentService';
import { AuthRequest } from '../middleware/auth';
import { ReportCategory } from '@prisma/client';

export class PhotoCommentController {
  // GET /api/album-photos/:id/comments - Get photo comments
  async getComments(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      const comments = await photoCommentService.getComments(id, user?.userId);

      res.status(200).json({ data: comments });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/album-photos/:id/comments - Add comment
  async addComment(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { text } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const comment = await photoCommentService.addComment({
        albumPhotoId: id,
        userId: user.userId,
        text,
      });

      res.status(201).json({
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('disabled') || error.message.includes('hidden')) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/photo-comments/:id - Delete comment
  async deleteComment(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await photoCommentService.deleteComment(id, user.userId);

      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          res.status(403).json({ error: error.message });
        } else if (error.message === 'Comment not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/photo-comments/:id/report - Report comment
  async reportComment(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { category, reason } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!category || !['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'HATE_SPEECH', 'OTHER'].includes(category)) {
        return res.status(400).json({ error: 'Invalid report category' });
      }

      const report = await photoCommentService.reportComment({
        commentId: id,
        reporterId: user.userId,
        category: category as ReportCategory,
        reason,
      });

      res.status(201).json({
        message: 'Comment reported successfully',
        data: report,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already reported')) {
          res.status(409).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/admin/comment-reports - Get all reports (admin)
  async getReports(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const reports = await photoCommentService.getReports(
        status ? { status: status as any } : undefined
      );

      res.status(200).json({ data: reports });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // PUT /api/admin/comment-reports/:id - Review report (admin)
  async reviewReport(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { action, actionTaken } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!action || !['delete', 'dismiss'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      await photoCommentService.reviewReport(id, user.userId, action, actionTaken);

      res.status(200).json({ message: 'Report reviewed successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new PhotoCommentController();

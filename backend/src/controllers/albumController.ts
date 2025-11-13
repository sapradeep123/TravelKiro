import { Request, Response } from 'express';
import albumService from '../services/albumService';
import { AuthRequest } from '../middleware/auth';
import { AlbumPrivacy, CommentStatus } from '@prisma/client';

export class AlbumController {
  // POST /api/albums - Create album
  async createAlbum(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { name, description, privacy, defaultCommentStatus } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Album name is required' });
      }

      const album = await albumService.createAlbum({
        userId: user.userId,
        name: name.trim(),
        description: description?.trim(),
        privacy: privacy as AlbumPrivacy,
        defaultCommentStatus: defaultCommentStatus as CommentStatus,
      });

      res.status(201).json({
        message: 'Album created successfully',
        data: album,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/albums - Get user's albums
  async getAlbums(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const albums = await albumService.getAlbums(
        userId as string,
        user?.userId
      );

      res.status(200).json({ data: albums });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/albums/:id - Get album details
  async getAlbum(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      const album = await albumService.getAlbum(id, user?.userId);

      res.status(200).json({ data: album });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Album not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Access denied') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(500).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // PUT /api/albums/:id - Update album
  async updateAlbum(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { name, description, privacy, defaultCommentStatus } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const album = await albumService.updateAlbum(id, user.userId, {
        name: name?.trim(),
        description: description?.trim(),
        privacy: privacy as AlbumPrivacy,
        defaultCommentStatus: defaultCommentStatus as CommentStatus,
      });

      res.status(200).json({
        message: 'Album updated successfully',
        data: album,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Album not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/albums/:id - Delete album
  async deleteAlbum(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await albumService.deleteAlbum(id, user.userId);

      res.status(200).json({ message: 'Album deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Album not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/albums/:id/photos - Add photos to album
  async addPhotos(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { postIds } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({ error: 'Post IDs are required' });
      }

      const albumPhotos = await albumService.addPhotos(id, postIds, user.userId);

      res.status(200).json({
        message: `Added ${albumPhotos.length} photo(s) to album`,
        data: albumPhotos,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/albums/:id/photos/:photoId - Remove photo from album
  async removePhoto(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { photoId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await albumService.removePhoto(photoId, user.userId);

      res.status(200).json({ message: 'Photo removed from album' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // PUT /api/albums/:id/photos/:photoId/comment-status - Update comment status
  async updateCommentStatus(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { photoId } = req.params;
      const { status } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!status || !['ENABLED', 'DISABLED', 'HIDDEN'].includes(status)) {
        return res.status(400).json({ error: 'Invalid comment status' });
      }

      const albumPhoto = await albumService.updateCommentStatus(
        photoId,
        status as CommentStatus,
        user.userId
      );

      res.status(200).json({
        message: 'Comment status updated',
        data: albumPhoto,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new AlbumController();

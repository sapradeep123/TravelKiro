import { Request, Response } from 'express';
import communityService from '../services/communityService';
import { AuthRequest } from '../middleware/auth';
import { MediaType } from '@prisma/client';

export class CommunityController {
  async createPost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { locationId, customCountry, customState, customArea, caption, mediaUrls, mediaTypes } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!caption || !mediaUrls || !mediaTypes) {
        return res.status(400).json({
          error: 'Caption, media URLs, and media types are required',
        });
      }

      const post = await communityService.createPost({
        userId: user.userId,
        locationId,
        customCountry,
        customState,
        customArea,
        caption,
        mediaUrls,
        mediaTypes: mediaTypes as MediaType[],
      });

      res.status(201).json({
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getFeed(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { following } = req.query;

      const posts = await communityService.getFeed(
        user?.userId,
        following === 'true'
      );

      res.status(200).json({ data: posts });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await communityService.getPostById(id);

      res.status(200).json({ data: post });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async likePost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.likePost(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { text } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const comment = await communityService.addComment(id, user.userId, text);

      res.status(201).json({
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.deletePost(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.followUser(user.userId, userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { userId } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.unfollowUser(user.userId, userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const followers = await communityService.getFollowers(userId);

      res.status(200).json({ data: followers });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const following = await communityService.getFollowing(userId);

      res.status(200).json({ data: following });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new CommunityController();

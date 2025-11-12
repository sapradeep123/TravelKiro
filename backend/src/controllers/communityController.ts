import { Request, Response } from 'express';
import communityService from '../services/communityService';
import { AuthRequest } from '../middleware/auth';
import { MediaType } from '@prisma/client';

export class CommunityController {
  // POST /api/community/posts - Create new post (auth required)
  async createPost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { locationId, customCountry, customState, customArea, caption, mediaUrls, mediaTypes } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Caption is optional - posts can be created with just images

      if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
        return res.status(400).json({
          error: 'At least one media URL is required',
        });
      }

      if (!mediaTypes || !Array.isArray(mediaTypes) || mediaTypes.length === 0) {
        return res.status(400).json({
          error: 'Media types are required',
        });
      }

      if (mediaUrls.length !== mediaTypes.length) {
        return res.status(400).json({
          error: 'Number of media URLs must match number of media types',
        });
      }

      // Validate location data
      // Location data is optional - posts can be created without location

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

  // GET /api/community/posts - Get global feed with pagination
  async getFeed(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }

      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'Page size must be between 1 and 100' });
      }

      const result = await communityService.getFeed(user?.userId, page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/posts/:id - Get single post
  async getPost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      const post = await communityService.getPost(id, user?.userId);

      res.status(200).json({ data: post });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/posts/location/:locationId - Get location-specific feed
  async getLocationFeed(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { locationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }

      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'Page size must be between 1 and 100' });
      }

      const result = await communityService.getLocationFeed(locationId, user?.userId, page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/community/posts/:id - Delete own post (auth required)
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
        if (error.message === 'Unauthorized to delete this post') {
          res.status(403).json({ error: error.message });
        } else if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Legacy method - kept for backward compatibility
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

  // POST /api/community/posts/:id/like - Toggle like (auth required)
  async toggleLike(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.toggleLike(id, user.userId);

      res.status(200).json({
        message: result.liked ? 'Post liked successfully' : 'Post unliked successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot interact with this post') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Legacy method - kept for backward compatibility
  async likePost(req: Request, res: Response) {
    return this.toggleLike(req, res);
  }

  // POST /api/community/posts/:id/comment - Add comment (auth required)
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
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot interact with this post') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/community/comments/:id - Delete own comment (auth required)
  async deleteComment(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.deleteComment(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Unauthorized to delete this comment') {
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

  // POST /api/community/posts/:id/save - Toggle save (auth required)
  async toggleSave(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.toggleSave(id, user.userId);

      res.status(200).json({
        message: result.saved ? 'Post saved successfully' : 'Post unsaved successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot interact with this post') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/posts/saved - Get saved posts (auth required)
  async getSavedPosts(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }

      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'Page size must be between 1 and 100' });
      }

      const result = await communityService.getSavedPosts(user.userId, page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // User Relationship Endpoints
  // POST /api/community/users/:id/follow - Follow user (auth required)
  async followUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.followUser(user.userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot follow this user') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/community/users/:id/follow - Unfollow user (auth required)
  async unfollowUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.unfollowUser(user.userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/follow-requests - Get pending follow requests (auth required)
  async getFollowRequests(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const requests = await communityService.getFollowRequests(user.userId);

      res.status(200).json({ data: requests });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/follow-requests/:id/approve - Approve follow request (auth required)
  async approveFollowRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.approveFollowRequest(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Follow request not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to approve this request') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/follow-requests/:id/reject - Reject follow request (auth required)
  async rejectFollowRequest(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.rejectFollowRequest(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Follow request not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Unauthorized to reject this request') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/users/:id/block - Block user (auth required)
  async blockUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.blockUser(user.userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/community/users/:id/block - Unblock user (auth required)
  async unblockUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.unblockUser(user.userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/users/:id/mute - Mute user (auth required)
  async muteUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.muteUser(user.userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // DELETE /api/community/users/:id/mute - Unmute user (auth required)
  async unmuteUser(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.unmuteUser(user.userId, id);

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

  // User Profile Endpoints
  // GET /api/community/users/:id/profile - Get user profile
  async getUserProfile(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      const profile = await communityService.getUserProfile(id, user?.userId);

      res.status(200).json({ data: profile });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/users/:id/posts - Get user's posts
  async getUserPosts(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }

      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'Page size must be between 1 and 100' });
      }

      const result = await communityService.getUserPosts(id, user?.userId, page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'This profile is private' || error.message === 'Profile not available') {
          res.status(403).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // PATCH /api/community/profile - Update own profile (auth required)
  async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { name, bio, avatar } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await communityService.updateProfile(user.userId, {
        name,
        bio,
        avatar,
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // PATCH /api/community/profile/privacy - Toggle private mode (auth required)
  async togglePrivateMode(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.togglePrivateMode(user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User profile not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // Reporting and Moderation Endpoints
  // POST /api/community/posts/:id/report - Report post (auth required)
  async reportPost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;
      const { category, reason } = req.body;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!category) {
        return res.status(400).json({ error: 'Report category is required' });
      }

      const report = await communityService.reportPost(id, user.userId, category, reason);

      res.status(201).json({
        message: 'Report submitted successfully. Our team will review it shortly.',
        data: report,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot report this post') {
          res.status(403).json({ error: error.message });
        } else if (error.message === 'You have already reported this post') {
          res.status(409).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // GET /api/community/admin/reports - Get all reports (admin only)
  async getReports(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      // Validate pagination parameters
      if (page < 1) {
        return res.status(400).json({ error: 'Page must be greater than 0' });
      }

      if (pageSize < 1 || pageSize > 100) {
        return res.status(400).json({ error: 'Page size must be between 1 and 100' });
      }

      const result = await communityService.getReports(page, pageSize);

      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/admin/posts/:id/hide - Hide post (admin only)
  async hidePost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.hidePost(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/admin/posts/:id/unhide - Unhide post (admin only)
  async unhidePost(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.unhidePost(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  // POST /api/community/admin/reports/:id/dismiss - Dismiss report (admin only)
  async dismissReport(req: Request, res: Response) {
    try {
      const user = (req as AuthRequest).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await communityService.dismissReport(id, user.userId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Report not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new CommunityController();

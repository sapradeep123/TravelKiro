import api from './api';
import { withRetry, getUserFriendlyErrorMessage } from '../utils/networkError';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

// Post Types
export interface Post {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  locationId: string | null;
  customCountry: string | null;
  customState: string | null;
  customArea: string | null;
  locationDisplay: string;
  caption: string;
  mediaUrls: string[];
  mediaTypes: ('IMAGE' | 'VIDEO')[];
  likeCount: number;
  commentCount: number;
  saveCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  caption: string;
  mediaUrls: string[];
  mediaTypes: ('IMAGE' | 'VIDEO')[];
  locationId?: string;
  customCountry?: string;
  customState?: string;
  customArea?: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginatedPosts {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type FeedFilter = 'global' | 'following' | 'saved';

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  text: string;
  createdAt: string;
}

export interface AddCommentData {
  text: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isMuted: boolean;
  hasRequestedFollow: boolean;
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  avatar?: string;
}

// Relationship Types
export interface FollowRequest {
  id: string;
  followerId: string;
  followingId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  follower: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// Reporting Types
export interface ReportPostData {
  category: 'spam' | 'harassment' | 'inappropriate' | 'other';
  reason?: string;
}

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  category: string;
  reason: string | null;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  post: Post;
  reporter: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface PaginatedReports {
  data: PostReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Community Service
// ============================================================================

export const communityService = {
  // ============================================================================
  // Post Management Methods
  // ============================================================================

  /**
   * Create a new post with location, text, and media
   */
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const response = await api.post('/community/posts', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Get global feed with pagination and optional filtering
   */
  async getFeed(page: number = 1, filter?: FeedFilter): Promise<PaginatedPosts> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (filter) params.append('filter', filter);

      const response = await withRetry(() => api.get(`/community/posts?${params.toString()}`));
      // Backend returns { data: { posts: [...], pagination: {...} } }
      // Transform to { data: [...], pagination: {...} }
      return {
        data: response.data.data.posts,
        pagination: response.data.data.pagination
      };
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Get a single post by ID
   */
  async getPost(id: string): Promise<Post> {
    try {
      const response = await withRetry(() => api.get(`/community/posts/${id}`));
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Get posts filtered by location
   */
  async getLocationFeed(locationId: string, page: number = 1): Promise<PaginatedPosts> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/community/posts/location/${locationId}?${params.toString()}`);
    return response.data;
  },

  /**
   * Delete own post
   */
  async deletePost(id: string): Promise<void> {
    await api.delete(`/community/posts/${id}`);
  },

  // ============================================================================
  // Interaction Methods
  // ============================================================================

  /**
   * Toggle like on a post
   */
  async toggleLike(postId: string): Promise<void> {
    try {
      await api.post(`/community/posts/${postId}/like`);
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, text: string): Promise<Comment> {
    try {
      const response = await api.post(`/community/posts/${postId}/comment`, { text });
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Delete own comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/community/comments/${commentId}`);
  },

  /**
   * Toggle save on a post
   */
  async toggleSave(postId: string): Promise<void> {
    await api.post(`/community/posts/${postId}/save`);
  },

  /**
   * Get saved posts with pagination
   */
  async getSavedPosts(page: number = 1): Promise<PaginatedPosts> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/community/posts/saved?${params.toString()}`);
    return response.data;
  },

  // ============================================================================
  // User Relationship Methods
  // ============================================================================

  /**
   * Follow a user (creates follow request for private profiles)
   */
  async followUser(userId: string): Promise<void> {
    await api.post(`/community/users/${userId}/follow`);
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/community/users/${userId}/follow`);
  },

  /**
   * Get pending follow requests for current user
   */
  async getFollowRequests(): Promise<FollowRequest[]> {
    const response = await api.get('/community/follow-requests');
    return response.data.data;
  },

  /**
   * Approve a follow request
   */
  async approveFollowRequest(requestId: string): Promise<void> {
    await api.post(`/community/follow-requests/${requestId}/approve`);
  },

  /**
   * Reject a follow request
   */
  async rejectFollowRequest(requestId: string): Promise<void> {
    await api.post(`/community/follow-requests/${requestId}/reject`);
  },

  /**
   * Block a user (bidirectional blocking)
   */
  async blockUser(userId: string): Promise<void> {
    await api.post(`/community/users/${userId}/block`);
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    await api.delete(`/community/users/${userId}/block`);
  },

  /**
   * Mute a user (hide their content)
   */
  async muteUser(userId: string): Promise<void> {
    await api.post(`/community/users/${userId}/mute`);
  },

  /**
   * Unmute a user
   */
  async unmuteUser(userId: string): Promise<void> {
    await api.delete(`/community/users/${userId}/mute`);
  },

  // ============================================================================
  // User Profile Methods
  // ============================================================================

  /**
   * Get user profile with relationship flags
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/community/users/${userId}/profile`);
    return response.data.data;
  },

  /**
   * Get user's posts with privacy checks
   */
  async getUserPosts(userId: string, page: number = 1): Promise<PaginatedPosts> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/community/users/${userId}/posts?${params.toString()}`);
    return response.data;
  },

  /**
   * Update own profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await api.patch('/community/profile', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Toggle private mode for own profile
   */
  async togglePrivateMode(): Promise<void> {
    await api.patch('/community/profile/privacy');
  },

  // ============================================================================
  // Reporting Methods
  // ============================================================================

  /**
   * Report a post
   */
  async reportPost(postId: string, data: ReportPostData): Promise<void> {
    await api.post(`/community/posts/${postId}/report`, data);
  },

  // ============================================================================
  // Admin Moderation Methods
  // ============================================================================

  /**
   * Get all reports (admin only)
   */
  async getReports(page: number = 1): Promise<PaginatedReports> {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    const response = await api.get(`/community/admin/reports?${params.toString()}`);
    return response.data;
  },

  /**
   * Hide a post (admin only)
   */
  async hidePost(postId: string): Promise<void> {
    await api.post(`/community/admin/posts/${postId}/hide`);
  },

  /**
   * Unhide a post (admin only)
   */
  async unhidePost(postId: string): Promise<void> {
    await api.post(`/community/admin/posts/${postId}/unhide`);
  },

  /**
   * Dismiss a report (admin only)
   */
  async dismissReport(reportId: string): Promise<void> {
    await api.post(`/community/admin/reports/${reportId}/dismiss`);
  },
};

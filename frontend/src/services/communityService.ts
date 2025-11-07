import api from './api';
import { CommunityPost } from '../types';

export const communityService = {
  async getFeed(following: boolean = false): Promise<CommunityPost[]> {
    const params = following ? '?following=true' : '';
    const response = await api.get(`/community/feed${params}`);
    return response.data.data;
  },

  async getPostById(id: string): Promise<CommunityPost> {
    const response = await api.get(`/community/posts/${id}`);
    return response.data.data;
  },

  async createPost(data: {
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    caption: string;
    mediaUrls: string[];
    mediaTypes: ('IMAGE' | 'VIDEO')[];
  }): Promise<CommunityPost> {
    const response = await api.post('/community/posts', data);
    return response.data.data;
  },

  async likePost(postId: string): Promise<{ liked: boolean }> {
    const response = await api.post(`/community/posts/${postId}/like`);
    return response.data;
  },

  async addComment(postId: string, text: string): Promise<any> {
    const response = await api.post(`/community/posts/${postId}/comment`, { text });
    return response.data.data;
  },

  async followUser(userId: string): Promise<void> {
    await api.post(`/community/follow/${userId}`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/community/follow/${userId}`);
  },

  async getFollowers(userId: string): Promise<any[]> {
    const response = await api.get(`/community/followers/${userId}`);
    return response.data.data;
  },

  async getFollowing(userId: string): Promise<any[]> {
    const response = await api.get(`/community/following/${userId}`);
    return response.data.data;
  },
};

import api from './api';
import { getUserFriendlyErrorMessage } from '../utils/networkError';
import {
  Album,
  AlbumPhoto,
  CreateAlbumData,
  UpdateAlbumData,
  AddPhotosData,
  CommentStatus,
} from '../types';

// ============================================================================
// Album Service
// ============================================================================

export const albumService = {
  // ============================================================================
  // Album CRUD Operations
  // ============================================================================

  /**
   * Create a new album
   */
  async createAlbum(data: CreateAlbumData): Promise<Album> {
    try {
      const response = await api.post('/albums', data);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Get albums for a specific user
   */
  async getAlbums(userId: string): Promise<Album[]> {
    try {
      const response = await api.get(`/albums?userId=${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Get a single album by ID
   */
  async getAlbum(albumId: string): Promise<Album> {
    try {
      const response = await api.get(`/albums/${albumId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Update an album
   */
  async updateAlbum(albumId: string, data: UpdateAlbumData): Promise<Album> {
    try {
      const response = await api.put(`/albums/${albumId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Delete an album
   */
  async deleteAlbum(albumId: string): Promise<void> {
    try {
      await api.delete(`/albums/${albumId}`);
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  // ============================================================================
  // Photo Management Operations
  // ============================================================================

  /**
   * Add photos to an album
   */
  async addPhotos(albumId: string, data: AddPhotosData): Promise<AlbumPhoto[]> {
    try {
      const response = await api.post(`/albums/${albumId}/photos`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Remove a photo from an album
   */
  async removePhoto(albumId: string, photoId: string): Promise<void> {
    try {
      await api.delete(`/albums/${albumId}/photos/${photoId}`);
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Update comment status for a photo in an album
   */
  async updateCommentStatus(
    albumId: string,
    photoId: string,
    status: CommentStatus
  ): Promise<AlbumPhoto> {
    try {
      const response = await api.put(`/albums/${albumId}/photos/${photoId}/comment-status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  // ============================================================================
  // Photo Comment Operations
  // ============================================================================

  /**
   * Get comments for a photo
   */
  async getComments(albumPhotoId: string) {
    try {
      const response = await api.get(`/album-photos/${albumPhotoId}/comments`);
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Add a comment to a photo
   */
  async addComment(albumPhotoId: string, text: string) {
    try {
      const response = await api.post(`/album-photos/${albumPhotoId}/comments`, { text });
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string) {
    try {
      await api.delete(`/photo-comments/${commentId}`);
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },

  /**
   * Report a comment
   */
  async reportComment(commentId: string, category: string, reason?: string) {
    try {
      const response = await api.post(`/photo-comments/${commentId}/report`, {
        category,
        reason,
      });
      return response.data.data;
    } catch (error) {
      throw new Error(getUserFriendlyErrorMessage(error));
    }
  },
};

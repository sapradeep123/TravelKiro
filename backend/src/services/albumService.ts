import prisma from '../config/database';
import { AlbumPrivacy, CommentStatus } from '@prisma/client';

interface CreateAlbumDto {
  userId: string;
  name: string;
  description?: string;
  privacy?: AlbumPrivacy;
  defaultCommentStatus?: CommentStatus;
}

interface UpdateAlbumDto {
  name?: string;
  description?: string;
  privacy?: AlbumPrivacy;
  defaultCommentStatus?: CommentStatus;
}

class AlbumService {
  async createAlbum(data: CreateAlbumDto) {
    const album = await prisma.album.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        privacy: data.privacy || 'PUBLIC',
        defaultCommentStatus: data.defaultCommentStatus || 'ENABLED',
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return album;
  }

  async getAlbums(userId: string, viewerId?: string) {
    const albums = await prisma.album.findMany({
      where: {
        userId,
        // Privacy filtering
        OR: [
          { privacy: 'PUBLIC' },
          { userId: viewerId }, // Owner can see all their albums
          // TODO: Add FRIENDS_ONLY logic when friend system is implemented
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return albums;
  }

  async getAlbum(albumId: string, viewerId?: string) {
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        photos: {
          include: {
            post: {
              select: {
                id: true,
                caption: true,
                mediaUrls: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!album) {
      throw new Error('Album not found');
    }

    // Check privacy
    if (album.privacy === 'PRIVATE' && album.userId !== viewerId) {
      throw new Error('Access denied');
    }

    // TODO: Add FRIENDS_ONLY check when friend system is implemented

    return album;
  }

  async updateAlbum(albumId: string, userId: string, data: UpdateAlbumDto) {
    // Check ownership
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      throw new Error('Album not found');
    }

    if (album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.album.update({
      where: { id: albumId },
      data,
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async deleteAlbum(albumId: string, userId: string) {
    // Check ownership
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      throw new Error('Album not found');
    }

    if (album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.album.delete({
      where: { id: albumId },
    });
  }

  async addPhotos(albumId: string, postIds: string[], userId: string) {
    // Check ownership
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      throw new Error('Album not found');
    }

    if (album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Get posts to extract photo URLs
    const posts = await prisma.communityPost.findMany({
      where: {
        id: { in: postIds },
        userId, // Only allow adding own posts
      },
    });

    if (posts.length === 0) {
      throw new Error('No valid posts found');
    }

    // Create album photos
    const albumPhotos = [];
    for (const post of posts) {
      // Check if already in album
      const existing = await prisma.albumPhoto.findUnique({
        where: {
          albumId_postId: {
            albumId,
            postId: post.id,
          },
        },
      });

      if (!existing && post.mediaUrls.length > 0) {
        const albumPhoto = await prisma.albumPhoto.create({
          data: {
            albumId,
            postId: post.id,
            photoUrl: post.mediaUrls[0], // Use first photo
            commentStatus: album.defaultCommentStatus,
            order: album.photoCount,
          },
        });
        albumPhotos.push(albumPhoto);
      }
    }

    // Update photo count
    await prisma.album.update({
      where: { id: albumId },
      data: {
        photoCount: { increment: albumPhotos.length },
        coverPhotoUrl: album.coverPhotoUrl || albumPhotos[0]?.photoUrl,
      },
    });

    return albumPhotos;
  }

  async removePhoto(albumPhotoId: string, userId: string) {
    const albumPhoto = await prisma.albumPhoto.findUnique({
      where: { id: albumPhotoId },
      include: {
        album: true,
      },
    });

    if (!albumPhoto) {
      throw new Error('Photo not found in album');
    }

    if (albumPhoto.album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.albumPhoto.delete({
      where: { id: albumPhotoId },
    });

    // Update photo count
    await prisma.album.update({
      where: { id: albumPhoto.albumId },
      data: {
        photoCount: { decrement: 1 },
      },
    });
  }

  async updateCommentStatus(albumPhotoId: string, status: CommentStatus, userId: string) {
    const albumPhoto = await prisma.albumPhoto.findUnique({
      where: { id: albumPhotoId },
      include: {
        album: true,
      },
    });

    if (!albumPhoto) {
      throw new Error('Photo not found in album');
    }

    if (albumPhoto.album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.albumPhoto.update({
      where: { id: albumPhotoId },
      data: { commentStatus: status },
    });

    return updated;
  }
}

export default new AlbumService();

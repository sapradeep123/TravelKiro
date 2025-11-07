import prisma from '../config/database';
import { MediaType } from '@prisma/client';

export class CommunityService {
  async createPost(data: {
    userId: string;
    locationId?: string;
    customCountry?: string;
    customState?: string;
    customArea?: string;
    caption: string;
    mediaUrls: string[];
    mediaTypes: MediaType[];
  }) {
    const post = await prisma.communityPost.create({
      data,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        location: true,
        likes: true,
        comments: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return post;
  }

  async getFeed(userId?: string, following?: boolean) {
    const where: any = {};

    if (following && userId) {
      const followingUsers = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      where.userId = {
        in: followingUsers.map(f => f.followingId),
      };
    }

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        location: true,
        likes: true,
        comments: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return posts;
  }

  async getPostById(id: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        location: true,
        likes: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  }

  async likePost(postId: string, userId: string) {
    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, text: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        text,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Notify post owner
    if (post.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          title: 'New Comment',
          message: 'Someone commented on your post',
        },
      });
    }

    return comment;
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await prisma.communityPost.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      throw new Error('Already following this user');
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Notify the followed user
    await prisma.notification.create({
      data: {
        userId: followingId,
        title: 'New Follower',
        message: 'Someone started following you',
      },
    });

    return { message: 'User followed successfully' };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existing) {
      throw new Error('Not following this user');
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'User unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
    });

    return followers.map(f => f.follower);
  }

  async getFollowing(userId: string) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: {
            profile: true,
          },
        },
      },
    });

    return following.map(f => f.following);
  }
}

export default new CommunityService();

import prisma from '../config/database';
import { MediaType } from '@prisma/client';

export class CommunityService {
  // Helper method to get blocked and muted user IDs
  private async getBlockedAndMutedUserIds(userId: string): Promise<string[]> {
    try {
      // Check if the tables exist by trying to query them
      const [blockedByMe, blockedMe, mutedByMe] = await Promise.all([
        (prisma as any).blockedUser?.findMany({
          where: { blockerId: userId },
          select: { blockedId: true },
        }) || Promise.resolve([]),
        (prisma as any).blockedUser?.findMany({
          where: { blockedId: userId },
          select: { blockerId: true },
        }) || Promise.resolve([]),
        (prisma as any).mutedUser?.findMany({
          where: { muterId: userId },
          select: { mutedId: true },
        }) || Promise.resolve([]),
      ]);

      const excludedUserIds = [
        ...blockedByMe.map((b: any) => b.blockedId),
        ...blockedMe.map((b: any) => b.blockerId),
        ...mutedByMe.map((m: any) => m.mutedId),
      ];

      return excludedUserIds;
    } catch (error) {
      // If tables don't exist yet, return empty array
      return [];
    }
  }

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
    // Location data is optional - posts can be created without location

    const post = await prisma.communityPost.create({
      data: {
        userId: data.userId,
        locationId: data.locationId,
        customCountry: data.customCountry,
        customState: data.customState,
        customArea: data.customArea,
        caption: data.caption,
        mediaUrls: data.mediaUrls,
        mediaTypes: data.mediaTypes,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        location: true,
      },
    });

    // Update user's post count if the field exists
    try {
      await prisma.userProfile.update({
        where: { userId: data.userId },
        data: { postCount: { increment: 1 } } as any,
      });
    } catch (error) {
      // Ignore if postCount field doesn't exist yet
    }

    return post;
  }

  async getPublicFeed(limit: number = 12) {
    const where: any = {};

    // Only show non-hidden posts
    try {
      where.isHidden = false;
    } catch (error) {
      // Field doesn't exist yet
    }

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: {
          include: {
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Return simplified posts for public view
    return posts.map((post: any) => ({
      id: post.id,
      caption: post.caption,
      mediaUrls: post.mediaUrls,
      mediaTypes: post.mediaTypes,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      createdAt: post.createdAt,
      user: {
        profile: {
          name: post.user?.profile?.name || 'Traveler',
          avatar: post.user?.profile?.avatar,
        },
      },
    }));
  }

  async getFeed(userId?: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    // Check if isHidden field exists
    try {
      where.isHidden = false;
    } catch (error) {
      // Field doesn't exist yet
    }

    // Exclude blocked and muted users if userId is provided
    if (userId) {
      const excludedUserIds = await this.getBlockedAndMutedUserIds(userId);
      if (excludedUserIds.length > 0) {
        where.userId = { notIn: excludedUserIds };
      }
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          location: true,
          likes: userId ? {
            where: { userId },
          } : true,
          savedBy: userId ? {
            where: { userId },
          } : false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.communityPost.count({ where }),
    ]);

    // Transform posts to include user-specific flags
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      isLiked: userId ? post.likes?.some((like: any) => like.userId === userId) : false,
      isSaved: userId ? post.savedBy?.some((save: any) => save.userId === userId) : false,
      likes: undefined,
      savedBy: undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getPost(postId: string, userId?: string) {
    const post: any = await prisma.communityPost.findUnique({
      where: { id: postId },
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
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if post is hidden (if field exists)
    if (post.isHidden) {
      throw new Error('Post not found');
    }

    // Check if user is blocked
    if (userId && post.userId !== userId) {
      try {
        const isBlocked = await (prisma as any).blockedUser?.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: post.userId },
              { blockerId: post.userId, blockedId: userId },
            ],
          },
        });

        if (isBlocked) {
          throw new Error('Post not found');
        }
      } catch (error) {
        // BlockedUser table doesn't exist yet, skip check
      }
    }

    // Check if user has saved this post
    let isSaved = false;
    if (userId) {
      const savedPost = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      isSaved = !!savedPost;
    }

    // Transform post to include user-specific flags
    return {
      ...post,
      isLiked: userId ? post.likes?.some((like: any) => like.userId === userId) : false,
      isSaved,
      likes: undefined,
    };
  }

  async getLocationFeed(locationId: string, userId?: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const where: any = {
      locationId,
    };

    // Check if isHidden field exists
    try {
      where.isHidden = false;
    } catch (error) {
      // Field doesn't exist yet
    }

    // Exclude blocked and muted users if userId is provided
    if (userId) {
      const excludedUserIds = await this.getBlockedAndMutedUserIds(userId);
      if (excludedUserIds.length > 0) {
        where.userId = { notIn: excludedUserIds };
      }
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          location: true,
          likes: userId ? {
            where: { userId },
          } : true,
          savedBy: userId ? {
            where: { userId },
          } : false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.communityPost.count({ where }),
    ]);

    // Transform posts to include user-specific flags
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      isLiked: userId ? post.likes?.some((like: any) => like.userId === userId) : false,
      isSaved: userId ? post.savedBy?.some((save: any) => save.userId === userId) : false,
      likes: undefined,
      savedBy: undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Validate ownership
    if (post.userId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await prisma.communityPost.delete({
      where: { id: postId },
    });

    // Update user's post count if the field exists
    try {
      await prisma.userProfile.update({
        where: { userId },
        data: { postCount: { decrement: 1 } } as any,
      });
    } catch (error) {
      // Ignore if postCount field doesn't exist yet
    }

    return { message: 'Post deleted successfully' };
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

  async toggleLike(postId: string, userId: string) {
    // Check if post exists and is not hidden
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isHidden) {
      throw new Error('Post not found');
    }

    // Check if users are blocked
    const isBlocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: post.userId },
          { blockerId: post.userId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      throw new Error('Cannot interact with this post');
    }

    const existing = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existing) {
      // Unlike - use transaction to update counter
      await prisma.$transaction([
        prisma.postLike.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    } else {
      // Like - use transaction to update counter
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            postId,
            userId,
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      // Notify post owner if not liking own post
      if (post.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            title: 'New Like',
            message: 'Someone liked your post',
          },
        });
      }

      return { liked: true };
    }
  }

  // Legacy method - kept for backward compatibility
  async likePost(postId: string, userId: string) {
    return this.toggleLike(postId, userId);
  }

  async addComment(postId: string, userId: string, text: string) {
    // Validate comment text
    if (!text || text.trim().length === 0) {
      throw new Error('Comment text is required');
    }

    if (text.length > 500) {
      throw new Error('Comment text must be 500 characters or less');
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isHidden) {
      throw new Error('Post not found');
    }

    // Check if users are blocked
    const isBlocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: post.userId },
          { blockerId: post.userId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      throw new Error('Cannot interact with this post');
    }

    // Create comment and update counter in transaction
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          userId,
          text: text.trim(),
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    // Notify post owner if not commenting on own post
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

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Validate ownership
    if (comment.userId !== userId) {
      throw new Error('Unauthorized to delete this comment');
    }

    // Delete comment and update counter in transaction
    await prisma.$transaction([
      prisma.comment.delete({
        where: { id: commentId },
      }),
      prisma.communityPost.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment deleted successfully' };
  }

  async toggleSave(postId: string, userId: string) {
    // Check if post exists and is not hidden
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isHidden) {
      throw new Error('Post not found');
    }

    // Check if users are blocked
    const isBlocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: post.userId },
          { blockerId: post.userId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) {
      throw new Error('Cannot interact with this post');
    }

    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      // Unsave - use transaction to update counter
      await prisma.$transaction([
        prisma.savedPost.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { saveCount: { decrement: 1 } },
        }),
      ]);
      return { saved: false };
    } else {
      // Save - use transaction to update counter
      await prisma.$transaction([
        prisma.savedPost.create({
          data: {
            userId,
            postId,
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { saveCount: { increment: 1 } },
        }),
      ]);
      return { saved: true };
    }
  }

  async getSavedPosts(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    // Get blocked and muted user IDs
    const excludedUserIds = await this.getBlockedAndMutedUserIds(userId);

    const where: any = {
      userId,
    };

    // Exclude posts from blocked/muted users
    if (excludedUserIds.length > 0) {
      where.post = {
        userId: { notIn: excludedUserIds },
        isHidden: false,
      };
    } else {
      where.post = {
        isHidden: false,
      };
    }

    const [savedPosts, total] = await Promise.all([
      prisma.savedPost.findMany({
        where,
        include: {
          post: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
              location: true,
              likes: {
                where: { userId },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.savedPost.count({ where }),
    ]);

    // Transform posts to include user-specific flags
    const transformedPosts = savedPosts.map((savedPost: any) => ({
      ...savedPost.post,
      isLiked: savedPost.post.likes?.some((like: any) => like.userId === userId) || false,
      isSaved: true, // Always true for saved posts
      likes: undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // User Relationship Methods
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    // Check if users are blocked
    const isBlocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: followerId, blockedId: followingId },
          { blockerId: followingId, blockedId: followerId },
        ],
      },
    });

    if (isBlocked) {
      throw new Error('Cannot follow this user');
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('Already following this user');
    }

    // Check if there's already a pending follow request
    const existingRequest = await prisma.followRequest.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingRequest) {
      throw new Error('Follow request already sent');
    }

    // Get target user's profile to check if private
    const targetProfile = await prisma.userProfile.findUnique({
      where: { userId: followingId },
    });

    if (!targetProfile) {
      throw new Error('User not found');
    }

    // If profile is private, create a follow request
    if (targetProfile.isPrivate) {
      await prisma.followRequest.create({
        data: {
          followerId,
          followingId,
          status: 'PENDING',
        },
      });

      // Notify the user about the follow request
      await prisma.notification.create({
        data: {
          userId: followingId,
          title: 'New Follow Request',
          message: 'Someone wants to follow you',
        },
      });

      return { message: 'Follow request sent', requiresApproval: true };
    }

    // If profile is public, create follow relationship immediately
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      }),
      prisma.userProfile.update({
        where: { userId: followingId },
        data: { followerCount: { increment: 1 } },
      }),
      prisma.userProfile.update({
        where: { userId: followerId },
        data: { followingCount: { increment: 1 } },
      }),
    ]);

    // Notify the followed user
    await prisma.notification.create({
      data: {
        userId: followingId,
        title: 'New Follower',
        message: 'Someone started following you',
      },
    });

    return { message: 'User followed successfully', requiresApproval: false };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      // Check if there's a pending follow request to cancel
      const existingRequest = await prisma.followRequest.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (existingRequest) {
        await prisma.followRequest.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId,
            },
          },
        });
        return { message: 'Follow request cancelled successfully' };
      }

      throw new Error('Not following this user');
    }

    // Delete follow relationship and update counters
    await prisma.$transaction([
      prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      }),
      prisma.userProfile.update({
        where: { userId: followingId },
        data: { followerCount: { decrement: 1 } },
      }),
      prisma.userProfile.update({
        where: { userId: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'User unfollowed successfully' };
  }

  async getFollowRequests(userId: string) {
    const requests = await prisma.followRequest.findMany({
      where: {
        followingId: userId,
        status: 'PENDING',
      },
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }

  async approveFollowRequest(requestId: string, userId: string) {
    const request = await prisma.followRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Follow request not found');
    }

    // Verify that the user is the one being followed
    if (request.followingId !== userId) {
      throw new Error('Unauthorized to approve this request');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Follow request already processed');
    }

    // Create follow relationship, update counters, and update request status in transaction
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId: request.followerId,
          followingId: request.followingId,
        },
      }),
      prisma.userProfile.update({
        where: { userId: request.followingId },
        data: { followerCount: { increment: 1 } },
      }),
      prisma.userProfile.update({
        where: { userId: request.followerId },
        data: { followingCount: { increment: 1 } },
      }),
      prisma.followRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      }),
    ]);

    // Notify the requester
    await prisma.notification.create({
      data: {
        userId: request.followerId,
        title: 'Follow Request Approved',
        message: 'Your follow request was approved',
      },
    });

    return { message: 'Follow request approved successfully' };
  }

  async rejectFollowRequest(requestId: string, userId: string) {
    const request = await prisma.followRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Follow request not found');
    }

    // Verify that the user is the one being followed
    if (request.followingId !== userId) {
      throw new Error('Unauthorized to reject this request');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Follow request already processed');
    }

    // Update request status to rejected
    await prisma.followRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return { message: 'Follow request rejected successfully' };
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      throw new Error('User already blocked');
    }

    // Block user and remove any existing follow relationships in transaction
    const operations: any[] = [
      prisma.blockedUser.create({
        data: {
          blockerId,
          blockedId,
        },
      }),
    ];

    // Remove follow relationship if blocker follows blocked
    const blockerFollowsBlocked = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: blockerId,
          followingId: blockedId,
        },
      },
    });

    if (blockerFollowsBlocked) {
      operations.push(
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: blockerId,
              followingId: blockedId,
            },
          },
        }),
        prisma.userProfile.update({
          where: { userId: blockedId },
          data: { followerCount: { decrement: 1 } },
        }),
        prisma.userProfile.update({
          where: { userId: blockerId },
          data: { followingCount: { decrement: 1 } },
        })
      );
    }

    // Remove follow relationship if blocked follows blocker
    const blockedFollowsBlocker = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: blockedId,
          followingId: blockerId,
        },
      },
    });

    if (blockedFollowsBlocker) {
      operations.push(
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: blockedId,
              followingId: blockerId,
            },
          },
        }),
        prisma.userProfile.update({
          where: { userId: blockerId },
          data: { followerCount: { decrement: 1 } },
        }),
        prisma.userProfile.update({
          where: { userId: blockedId },
          data: { followingCount: { decrement: 1 } },
        })
      );
    }

    // Remove any pending follow requests
    const pendingRequests = await prisma.followRequest.findMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId },
        ],
        status: 'PENDING',
      },
    });

    for (const request of pendingRequests) {
      operations.push(
        prisma.followRequest.delete({
          where: { id: request.id },
        })
      );
    }

    await prisma.$transaction(operations);

    return { message: 'User blocked successfully' };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!existingBlock) {
      throw new Error('User is not blocked');
    }

    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    return { message: 'User unblocked successfully' };
  }

  async muteUser(muterId: string, mutedId: string) {
    if (muterId === mutedId) {
      throw new Error('Cannot mute yourself');
    }

    // Check if already muted
    const existingMute = await prisma.mutedUser.findUnique({
      where: {
        muterId_mutedId: {
          muterId,
          mutedId,
        },
      },
    });

    if (existingMute) {
      throw new Error('User already muted');
    }

    await prisma.mutedUser.create({
      data: {
        muterId,
        mutedId,
      },
    });

    return { message: 'User muted successfully' };
  }

  async unmuteUser(muterId: string, mutedId: string) {
    const existingMute = await prisma.mutedUser.findUnique({
      where: {
        muterId_mutedId: {
          muterId,
          mutedId,
        },
      },
    });

    if (!existingMute) {
      throw new Error('User is not muted');
    }

    await prisma.mutedUser.delete({
      where: {
        muterId_mutedId: {
          muterId,
          mutedId,
        },
      },
    });

    return { message: 'User unmuted successfully' };
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

  // User Profile Methods
  async getUserProfile(userId: string, currentUserId?: string) {
    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      throw new Error('User not found');
    }

    // Initialize relationship flags
    let isFollowing = false;
    let isFollowedBy = false;
    let isBlocked = false;
    let isMuted = false;
    let hasRequestedFollow = false;

    // If currentUserId is provided, check relationships
    if (currentUserId && currentUserId !== userId) {
      // Check if current user is following this user
      const followRelation = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!followRelation;

      // Check if this user is following current user
      const followedByRelation = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: currentUserId,
          },
        },
      });
      isFollowedBy = !!followedByRelation;

      // Check if users are blocked (bidirectional)
      const blockRelation = await prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: currentUserId, blockedId: userId },
            { blockerId: userId, blockedId: currentUserId },
          ],
        },
      });
      isBlocked = !!blockRelation;

      // Check if current user has muted this user
      const muteRelation = await prisma.mutedUser.findUnique({
        where: {
          muterId_mutedId: {
            muterId: currentUserId,
            mutedId: userId,
          },
        },
      });
      isMuted = !!muteRelation;

      // Check if current user has a pending follow request
      const followRequest = await prisma.followRequest.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      hasRequestedFollow = followRequest?.status === 'PENDING';
    }

    return {
      id: user.id,
      name: user.profile.name,
      email: user.email,
      avatar: user.profile.avatar,
      bio: user.profile.bio,
      isPrivate: user.profile.isPrivate || false,
      followerCount: user.profile.followerCount || 0,
      followingCount: user.profile.followingCount || 0,
      postCount: user.profile.postCount || 0,
      isFollowing,
      isFollowedBy,
      isBlocked,
      isMuted,
      hasRequestedFollow,
    };
  }

  async getUserPosts(userId: string, currentUserId?: string, page: number = 1, pageSize: number = 20) {
    // Get user profile to check privacy settings
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      throw new Error('User not found');
    }

    // Check if profile is private and current user is not following
    if (userProfile.isPrivate && currentUserId !== userId) {
      // Check if current user is following
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId || '',
            followingId: userId,
          },
        },
      });

      if (!isFollowing) {
        throw new Error('This profile is private');
      }
    }

    // Check if users are blocked
    if (currentUserId && currentUserId !== userId) {
      const isBlocked = await prisma.blockedUser.findFirst({
        where: {
          OR: [
            { blockerId: currentUserId, blockedId: userId },
            { blockerId: userId, blockedId: currentUserId },
          ],
        },
      });

      if (isBlocked) {
        throw new Error('Profile not available');
      }
    }

    const skip = (page - 1) * pageSize;
    const where: any = {
      userId,
      isHidden: false,
    };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          location: true,
          likes: currentUserId ? {
            where: { userId: currentUserId },
          } : true,
          savedBy: currentUserId ? {
            where: { userId: currentUserId },
          } : false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.communityPost.count({ where }),
    ]);

    // Transform posts to include user-specific flags
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      isLiked: currentUserId ? post.likes?.some((like: any) => like.userId === currentUserId) : false,
      isSaved: currentUserId ? post.savedBy?.some((save: any) => save.userId === currentUserId) : false,
      likes: undefined,
      savedBy: undefined,
    }));

    return {
      posts: transformedPosts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateProfile(userId: string, data: {
    name?: string;
    bio?: string;
    avatar?: string;
  }) {
    // Validate bio length if provided
    if (data.bio && data.bio.length > 500) {
      throw new Error('Bio must be 500 characters or less');
    }

    // Update user name if provided
    const userUpdateData: any = {};
    if (data.name) {
      userUpdateData.name = data.name.trim();
    }

    // Update profile data
    const profileUpdateData: any = {};
    if (data.bio !== undefined) {
      profileUpdateData.bio = data.bio.trim() || null;
    }
    if (data.avatar !== undefined) {
      profileUpdateData.avatar = data.avatar || null;
    }

    // Perform updates in transaction
    const [user, profile] = await prisma.$transaction([
      Object.keys(userUpdateData).length > 0
        ? prisma.user.update({
            where: { id: userId },
            data: userUpdateData,
          })
        : prisma.user.findUnique({ where: { id: userId } }),
      Object.keys(profileUpdateData).length > 0
        ? prisma.userProfile.update({
            where: { userId },
            data: profileUpdateData,
          })
        : prisma.userProfile.findUnique({ where: { userId } }),
    ]);

    if (!user || !profile) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: profile.name,
      email: user.email,
      avatar: profile.avatar,
      bio: profile.bio,
      isPrivate: profile.isPrivate || false,
      followerCount: profile.followerCount || 0,
      followingCount: profile.followingCount || 0,
      postCount: profile.postCount || 0,
    };
  }

  async togglePrivateMode(userId: string) {
    // Get current profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Toggle private mode
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        isPrivate: !profile.isPrivate,
      },
    });

    return {
      isPrivate: updatedProfile.isPrivate,
      message: updatedProfile.isPrivate
        ? 'Profile is now private. New followers will need your approval.'
        : 'Profile is now public. Anyone can follow you.',
    };
  }

  // Reporting and Moderation Methods
  async reportPost(postId: string, reporterId: string, category: string, reason?: string) {
    // Validate category
    const validCategories = ['spam', 'harassment', 'inappropriate', 'other'];
    if (!validCategories.includes(category)) {
      throw new Error('Invalid report category. Must be one of: spam, harassment, inappropriate, other');
    }

    // Check if post exists and is not hidden
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isHidden) {
      throw new Error('Post not found');
    }

    // Check if users are blocked
    const isBlocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: reporterId, blockedId: post.userId },
          { blockerId: post.userId, blockedId: reporterId },
        ],
      },
    });

    if (isBlocked) {
      throw new Error('Cannot report this post');
    }

    // Check for duplicate report (unique constraint will handle this, but we provide a better error message)
    const existingReport = await prisma.postReport.findUnique({
      where: {
        postId_reporterId: {
          postId,
          reporterId,
        },
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this post');
    }

    // Create report
    const report = await prisma.postReport.create({
      data: {
        postId,
        reporterId,
        category,
        reason: reason?.trim() || null,
        status: 'pending',
      },
      include: {
        post: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        reporter: {
          include: {
            profile: true,
          },
        },
      },
    });

    return report;
  }

  async getReports(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [reports, total] = await Promise.all([
      prisma.postReport.findMany({
        where: {
          status: 'pending',
        },
        include: {
          post: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
              location: true,
            },
          },
          reporter: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.postReport.count({
        where: {
          status: 'pending',
        },
      }),
    ]);

    return {
      reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async hidePost(postId: string, adminId: string) {
    // Check if post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.isHidden) {
      throw new Error('Post is already hidden');
    }

    // Hide the post
    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isHidden: true,
        hiddenAt: new Date(),
        hiddenBy: adminId,
      },
    });

    // Update all related reports to 'reviewed' status
    await prisma.postReport.updateMany({
      where: {
        postId,
        status: 'pending',
      },
      data: {
        status: 'reviewed',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    return {
      message: 'Post hidden successfully',
      post: updatedPost,
    };
  }

  async unhidePost(postId: string, adminId: string) {
    // Check if post exists
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (!post.isHidden) {
      throw new Error('Post is not hidden');
    }

    // Unhide the post
    const updatedPost = await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isHidden: false,
        hiddenAt: null,
        hiddenBy: null,
      },
    });

    return {
      message: 'Post unhidden successfully',
      post: updatedPost,
    };
  }

  async dismissReport(reportId: string, adminId: string) {
    // Check if report exists
    const report = await prisma.postReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status !== 'pending') {
      throw new Error('Report has already been processed');
    }

    // Dismiss the report
    const updatedReport = await prisma.postReport.update({
      where: { id: reportId },
      data: {
        status: 'dismissed',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: {
        post: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        reporter: {
          include: {
            profile: true,
          },
        },
      },
    });

    return {
      message: 'Report dismissed successfully',
      report: updatedReport,
    };
  }
}

export default new CommunityService();

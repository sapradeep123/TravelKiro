import prisma from '../config/database';
import { ReportCategory, ReportStatus } from '@prisma/client';

interface CreateCommentDto {
  albumPhotoId: string;
  userId: string;
  text: string;
}

interface ReportCommentDto {
  commentId: string;
  reporterId: string;
  category: ReportCategory;
  reason?: string;
}

class PhotoCommentService {
  async getComments(albumPhotoId: string, viewerId?: string) {
    // Get album photo with album info to check permissions
    const albumPhoto = await prisma.albumPhoto.findUnique({
      where: { id: albumPhotoId },
      include: {
        album: true,
      },
    });

    if (!albumPhoto) {
      throw new Error('Photo not found');
    }

    // Check comment status
    if (albumPhoto.commentStatus === 'HIDDEN' && albumPhoto.album.userId !== viewerId) {
      return []; // Non-owners can't see hidden comments
    }

    const comments = await prisma.photoComment.findMany({
      where: { albumPhotoId },
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
        reports: {
          where: {
            status: 'PENDING',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments;
  }

  async addComment(data: CreateCommentDto) {
    // Check if comments are enabled
    const albumPhoto = await prisma.albumPhoto.findUnique({
      where: { id: data.albumPhotoId },
      include: {
        album: true,
      },
    });

    if (!albumPhoto) {
      throw new Error('Photo not found');
    }

    if (albumPhoto.commentStatus === 'DISABLED') {
      throw new Error('Comments are disabled for this photo');
    }

    if (albumPhoto.commentStatus === 'HIDDEN' && albumPhoto.album.userId !== data.userId) {
      throw new Error('Comments are hidden for this photo');
    }

    const comment = await prisma.photoComment.create({
      data: {
        albumPhotoId: data.albumPhotoId,
        userId: data.userId,
        text: data.text.trim(),
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

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.photoComment.findUnique({
      where: { id: commentId },
      include: {
        albumPhoto: {
          include: {
            album: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Only comment owner or album owner can delete
    if (comment.userId !== userId && comment.albumPhoto.album.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.photoComment.delete({
      where: { id: commentId },
    });
  }

  async reportComment(data: ReportCommentDto) {
    // Check if comment exists
    const comment = await prisma.photoComment.findUnique({
      where: { id: data.commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if already reported by this user
    const existingReport = await prisma.commentReport.findUnique({
      where: {
        commentId_reporterId: {
          commentId: data.commentId,
          reporterId: data.reporterId,
        },
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this comment');
    }

    const report = await prisma.commentReport.create({
      data: {
        commentId: data.commentId,
        reporterId: data.reporterId,
        category: data.category,
        reason: data.reason?.trim(),
      },
    });

    return report;
  }

  async getReports(filters?: { status?: ReportStatus }) {
    const reports = await prisma.commentReport.findMany({
      where: filters,
      include: {
        comment: {
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
            albumPhoto: {
              include: {
                album: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        reporter: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reports;
  }

  async reviewReport(reportId: string, adminId: string, action: 'delete' | 'dismiss', actionTaken?: string) {
    const report = await prisma.commentReport.findUnique({
      where: { id: reportId },
      include: {
        comment: true,
      },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (action === 'delete') {
      // Delete the comment
      await prisma.photoComment.delete({
        where: { id: report.commentId },
      });

      // Update report status
      await prisma.commentReport.update({
        where: { id: reportId },
        data: {
          status: 'ACTION_TAKEN',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          actionTaken: actionTaken || 'Comment deleted',
        },
      });
    } else {
      // Dismiss report
      await prisma.commentReport.update({
        where: { id: reportId },
        data: {
          status: 'DISMISSED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          actionTaken: actionTaken || 'Report dismissed',
        },
      });
    }

    return report;
  }
}

export default new PhotoCommentService();

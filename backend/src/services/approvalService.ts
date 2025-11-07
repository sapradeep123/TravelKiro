import prisma from '../config/database';
import { ApprovalStatus, ContentType } from '@prisma/client';

export class ApprovalService {
  async getPendingApprovals() {
    const approvals = await prisma.approvalQueue.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch the actual content for each approval
    const approvalsWithContent = await Promise.all(
      approvals.map(async (approval) => {
        let content = null;

        switch (approval.contentType) {
          case 'LOCATION':
            content = await prisma.location.findUnique({
              where: { id: approval.contentId },
              include: {
                creator: {
                  include: {
                    profile: true,
                  },
                },
              },
            });
            break;
          case 'EVENT':
            content = await prisma.event.findUnique({
              where: { id: approval.contentId },
              include: {
                host: {
                  include: {
                    profile: true,
                  },
                },
                location: true,
              },
            });
            break;
          case 'PACKAGE':
            content = await prisma.package.findUnique({
              where: { id: approval.contentId },
              include: {
                host: {
                  include: {
                    profile: true,
                  },
                },
                location: true,
                itinerary: true,
              },
            });
            break;
          case 'ACCOMMODATION':
            content = await prisma.accommodation.findUnique({
              where: { id: approval.contentId },
              include: {
                uploader: {
                  include: {
                    profile: true,
                  },
                },
                location: true,
              },
            });
            break;
        }

        return {
          ...approval,
          content,
        };
      })
    );

    return approvalsWithContent;
  }

  async approveContent(approvalId: string, adminId: string) {
    const approval = await prisma.approvalQueue.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error('Approval request not found');
    }

    if (approval.status !== 'PENDING') {
      throw new Error('This content has already been reviewed');
    }

    // Update the content approval status
    switch (approval.contentType) {
      case 'LOCATION':
        await prisma.location.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'APPROVED',
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });
        break;
      case 'EVENT':
        await prisma.event.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'APPROVED',
          },
        });
        break;
      case 'PACKAGE':
        await prisma.package.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'APPROVED',
          },
        });
        break;
      case 'ACCOMMODATION':
        await prisma.accommodation.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'APPROVED',
          },
        });
        break;
    }

    // Update approval queue
    await prisma.approvalQueue.update({
      where: { id: approvalId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Create notification for submitter
    await prisma.notification.create({
      data: {
        userId: approval.submittedBy,
        title: 'Content Approved',
        message: `Your ${approval.contentType.toLowerCase()} has been approved and is now visible to users.`,
      },
    });

    return { message: 'Content approved successfully' };
  }

  async rejectContent(approvalId: string, adminId: string, reason: string) {
    const approval = await prisma.approvalQueue.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      throw new Error('Approval request not found');
    }

    if (approval.status !== 'PENDING') {
      throw new Error('This content has already been reviewed');
    }

    // Update the content approval status
    switch (approval.contentType) {
      case 'LOCATION':
        await prisma.location.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'REJECTED',
          },
        });
        break;
      case 'EVENT':
        await prisma.event.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'REJECTED',
          },
        });
        break;
      case 'PACKAGE':
        await prisma.package.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'REJECTED',
          },
        });
        break;
      case 'ACCOMMODATION':
        await prisma.accommodation.update({
          where: { id: approval.contentId },
          data: {
            approvalStatus: 'REJECTED',
          },
        });
        break;
    }

    // Update approval queue
    await prisma.approvalQueue.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Create notification for submitter
    await prisma.notification.create({
      data: {
        userId: approval.submittedBy,
        title: 'Content Rejected',
        message: `Your ${approval.contentType.toLowerCase()} was rejected. Reason: ${reason}`,
      },
    });

    return { message: 'Content rejected successfully' };
  }

  async getApprovalHistory() {
    const approvals = await prisma.approvalQueue.findMany({
      where: {
        status: {
          in: ['APPROVED', 'REJECTED'],
        },
      },
      orderBy: {
        reviewedAt: 'desc',
      },
      take: 50,
    });

    return approvals;
  }
}

export default new ApprovalService();

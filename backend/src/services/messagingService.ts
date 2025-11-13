import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MessagingService {
  // Get all conversations for a user
  async getUserConversations(userId: string) {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          include: {
            profile: true,
          },
        },
        user2: {
          include: {
            profile: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format conversations to show the other user
    return conversations.map((conv) => {
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.profile?.name || 'User',
          avatar: otherUser.profile?.avatar,
        },
        lastMessage: lastMessage
          ? {
              text: lastMessage.message,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: conv.updatedAt,
      };
    });
  }

  // Get or create a conversation between two users
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Ensure consistent ordering (smaller ID first)
    const [smallerId, largerId] = [user1Id, user2Id].sort();

    let conversation = await prisma.chatConversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: smallerId,
          user2Id: largerId,
        },
      },
      include: {
        user1: {
          include: {
            profile: true,
          },
        },
        user2: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          user1Id: smallerId,
          user2Id: largerId,
        },
        include: {
          user1: {
            include: {
              profile: true,
            },
          },
          user2: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    return conversation;
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId: string, userId: string, page: number = 1, pageSize: number = 50) {
    // Verify user is part of the conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    const skip = (page - 1) * pageSize;

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        include: {
          sender: {
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
      prisma.chatMessage.count({
        where: { conversationId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Send a message
  async sendMessage(conversationId: string, senderId: string, message: string) {
    // Verify user is part of the conversation
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      throw new Error('Unauthorized to send message in this conversation');
    }

    // Create message and update conversation timestamp
    const [newMessage] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          conversationId,
          senderId,
          message,
        },
        include: {
          sender: {
            include: {
              profile: true,
            },
          },
        },
      }),
      prisma.chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return newMessage;
  }

  // Send chat request
  async sendChatRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new Error('Cannot send chat request to yourself');
    }

    // Check if request already exists
    const existingRequest = await prisma.chatRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new Error('Chat request already sent');
      }
      if (existingRequest.status === 'APPROVED') {
        throw new Error('Chat request already approved');
      }
      // If rejected, allow resending
      await prisma.chatRequest.update({
        where: { id: existingRequest.id },
        data: { status: 'PENDING', updatedAt: new Date() },
      });
      return existingRequest;
    }

    const chatRequest = await prisma.chatRequest.create({
      data: {
        senderId,
        receiverId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    return chatRequest;
  }

  // Get pending chat requests
  async getPendingChatRequests(userId: string) {
    const requests = await prisma.chatRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
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

  // Approve chat request
  async approveChatRequest(requestId: string, userId: string) {
    const request = await prisma.chatRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Chat request not found');
    }

    if (request.receiverId !== userId) {
      throw new Error('Unauthorized to approve this request');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Chat request already processed');
    }

    // Approve request and create conversation
    const [updatedRequest, conversation] = await prisma.$transaction([
      prisma.chatRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      }),
      prisma.chatConversation.create({
        data: {
          user1Id: request.senderId < request.receiverId ? request.senderId : request.receiverId,
          user2Id: request.senderId < request.receiverId ? request.receiverId : request.senderId,
        },
      }),
    ]);

    return { request: updatedRequest, conversation };
  }

  // Reject chat request
  async rejectChatRequest(requestId: string, userId: string) {
    const request = await prisma.chatRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Chat request not found');
    }

    if (request.receiverId !== userId) {
      throw new Error('Unauthorized to reject this request');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Chat request already processed');
    }

    const updatedRequest = await prisma.chatRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return updatedRequest;
  }

  // Delete conversation
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new Error('Unauthorized to delete this conversation');
    }

    await prisma.chatConversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversation deleted successfully' };
  }
}

export default new MessagingService();

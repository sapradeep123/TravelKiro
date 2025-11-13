import api from './api';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    profile: {
      name: string;
      avatar: string | null;
    };
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export interface ChatRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    profile: {
      name: string;
      avatar: string | null;
    };
  };
}

export const messagingService = {
  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messaging/conversations');
    return response.data.data;
  },

  // Get or create conversation with a user
  async getOrCreateConversation(userId: string): Promise<any> {
    const response = await api.get(`/messaging/conversations/${userId}`);
    return response.data.data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, page: number = 1): Promise<{ messages: Message[]; pagination: any }> {
    const response = await api.get(`/messaging/conversations/${conversationId}/messages`, {
      params: { page, pageSize: 50 },
    });
    return response.data.data;
  },

  // Send a message
  async sendMessage(conversationId: string, message: string): Promise<Message> {
    const response = await api.post(`/messaging/conversations/${conversationId}/messages`, { message });
    return response.data.data;
  },

  // Send chat request
  async sendChatRequest(receiverId: string): Promise<ChatRequest> {
    const response = await api.post('/messaging/requests', { receiverId });
    return response.data.data;
  },

  // Get pending chat requests
  async getChatRequests(): Promise<ChatRequest[]> {
    const response = await api.get('/messaging/requests');
    return response.data.data;
  },

  // Approve chat request
  async approveChatRequest(requestId: string): Promise<any> {
    const response = await api.post(`/messaging/requests/${requestId}/approve`);
    return response.data.data;
  },

  // Reject chat request
  async rejectChatRequest(requestId: string): Promise<any> {
    const response = await api.post(`/messaging/requests/${requestId}/reject`);
    return response.data.data;
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/messaging/conversations/${conversationId}`);
  },
};

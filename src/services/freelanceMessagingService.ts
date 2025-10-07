// @ts-nocheck
import { FreelanceMessage, Profile } from "@/types/freelance";

export interface FreelanceMessageWithSender extends FreelanceMessage {
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface SendMessageRequest {
  projectId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  messageType?: "text" | "file" | "milestone" | "payment";
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Mock data for development
const mockMessages: FreelanceMessageWithSender[] = [
  {
    id: "msg_1",
    projectId: "project_1",
    senderId: "client_1",
    content:
      "Hi! I'm excited to start working on this project. When can we schedule a kickoff call?",
    attachments: [],
    messageType: "text",
    read: true,
    createdAt: new Date("2024-01-15T09:00:00Z"),
    sender: {
      id: "client_1",
      name: "Alice Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
    },
  },
  {
    id: "msg_2",
    projectId: "project_1",
    senderId: "freelancer_1",
    content:
      "Hello Alice! I'm excited too. I'm available for a call today or tomorrow. What time works best for you?",
    attachments: [],
    messageType: "text",
    read: true,
    createdAt: new Date("2024-01-15T09:15:00Z"),
    sender: {
      id: "freelancer_1",
      name: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    },
  },
  {
    id: "msg_3",
    projectId: "project_1",
    senderId: "client_1",
    content:
      "Perfect! How about tomorrow at 2 PM EST? I've also attached the project requirements document.",
    attachments: ["requirements.pdf"],
    messageType: "file",
    read: false,
    createdAt: new Date("2024-01-15T10:30:00Z"),
    sender: {
      id: "client_1",
      name: "Alice Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
    },
  },
];

const mockAttachments: MessageAttachment[] = [
  {
    id: "att_1",
    name: "requirements.pdf",
    url: "/api/files/requirements.pdf",
    type: "application/pdf",
    size: 245760,
  },
  {
    id: "att_2",
    name: "wireframes.sketch",
    url: "/api/files/wireframes.sketch",
    type: "application/sketch",
    size: 1245760,
  },
];

export const freelanceMessagingService = {
  // Get messages for a project
  async getProjectMessages(
    projectId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    messages: FreelanceMessageWithSender[];
    total: number;
    hasMore: boolean;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const projectMessages = mockMessages.filter(
      (msg) => msg.projectId === projectId,
    );
    const total = projectMessages.length;
    const messages = projectMessages
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .slice(offset, offset + limit);

    return {
      messages,
      total,
      hasMore: total > offset + limit,
    };
  },

  // Send a message
  async sendMessage(
    request: SendMessageRequest,
  ): Promise<FreelanceMessageWithSender> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get sender info (mock)
    const senderProfiles = {
      client_1: {
        name: "Alice Johnson",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      },
      freelancer_1: {
        name: "John Smith",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      },
    };

    const sender = senderProfiles[
      request.senderId as keyof typeof senderProfiles
    ] || {
      name: "Unknown User",
      avatar: "/placeholder.svg",
    };

    const newMessage: FreelanceMessageWithSender = {
      id: `msg_${Date.now()}`,
      projectId: request.projectId,
      senderId: request.senderId,
      content: request.content,
      attachments: request.attachments || [],
      messageType: request.messageType || "text",
      read: false,
      createdAt: new Date(),
      sender: {
        id: request.senderId,
        ...sender,
      },
    };

    mockMessages.push(newMessage);
    return newMessage;
  },

  // Mark messages as read
  async markMessagesAsRead(projectId: string, userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    mockMessages.forEach((msg) => {
      if (msg.projectId === projectId && msg.senderId !== userId) {
        msg.read = true;
      }
    });
  },

  // Get unread message count for a project
  async getUnreadCount(projectId: string, userId: string): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return mockMessages.filter(
      (msg) =>
        msg.projectId === projectId && msg.senderId !== userId && !msg.read,
    ).length;
  },

  // Upload file attachment
  async uploadAttachment(
    file: File,
    projectId: string,
  ): Promise<MessageAttachment> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const attachment: MessageAttachment = {
      id: `att_${Date.now()}`,
      name: file.name,
      url: `/api/files/${projectId}/${file.name}`,
      type: file.type,
      size: file.size,
    };

    mockAttachments.push(attachment);
    return attachment;
  },

  // Get attachment info
  async getAttachment(attachmentId: string): Promise<MessageAttachment | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockAttachments.find((att) => att.id === attachmentId) || null;
  },

  // Delete message (only sender can delete)
  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const messageIndex = mockMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) {
      return { success: false, message: "Message not found" };
    }

    const message = mockMessages[messageIndex];
    if (message.senderId !== userId) {
      return {
        success: false,
        message: "Unauthorized: Can only delete your own messages",
      };
    }

    mockMessages.splice(messageIndex, 1);
    return { success: true, message: "Message deleted successfully" };
  },

  // Get recent messages for all user's projects
  async getRecentMessages(
    userId: string,
    limit: number = 10,
  ): Promise<FreelanceMessageWithSender[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Get projects where user is involved (mock)
    const userProjects = ["project_1", "project_2"]; // This would come from actual user projects

    const recentMessages = mockMessages
      .filter((msg) => userProjects.includes(msg.projectId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);

    return recentMessages;
  },

  // Send system message (for milestones, payments, etc.)
  async sendSystemMessage(
    projectId: string,
    type: "milestone" | "payment" | "contract",
    content: string,
    metadata?: any,
  ): Promise<FreelanceMessageWithSender> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const systemMessage: FreelanceMessageWithSender = {
      id: `sys_${Date.now()}`,
      projectId,
      senderId: "system",
      content,
      attachments: [],
      messageType: type,
      read: false,
      createdAt: new Date(),
      sender: {
        id: "system",
        name: "Eloity System",
        avatar: "/system-avatar.svg",
      },
    };

    mockMessages.push(systemMessage);
    return systemMessage;
  },

  // Search messages in a project
  async searchMessages(
    projectId: string,
    query: string,
    limit: number = 20,
  ): Promise<FreelanceMessageWithSender[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedQuery = query.toLowerCase();
    const projectMessages = mockMessages.filter(
      (msg) =>
        msg.projectId === projectId &&
        msg.content.toLowerCase().includes(normalizedQuery),
    );

    return projectMessages
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  },

  // Get message statistics for a project
  async getMessageStats(projectId: string): Promise<{
    totalMessages: number;
    unreadMessages: number;
    lastActivity: string;
    participantCount: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const projectMessages = mockMessages.filter(
      (msg) => msg.projectId === projectId,
    );
    const totalMessages = projectMessages.length;
    const unreadMessages = projectMessages.filter((msg) => !msg.read).length;
    const lastActivity =
      projectMessages.length > 0
        ? projectMessages[projectMessages.length - 1].createdAt.toISOString()
        : new Date().toISOString();

    const uniqueSenders = new Set(projectMessages.map((msg) => msg.senderId));
    const participantCount = uniqueSenders.size;

    return {
      totalMessages,
      unreadMessages,
      lastActivity,
      participantCount,
    };
  },

  // Real-time message subscription (mock)
  subscribeToProjectMessages(
    projectId: string,
    onMessage: (message: FreelanceMessageWithSender) => void,
  ): () => void {
    // Mock real-time subscription
    const interval = setInterval(() => {
      // Simulate receiving new messages occasionally
      if (Math.random() < 0.1) {
        const mockNewMessage: FreelanceMessageWithSender = {
          id: `msg_${Date.now()}`,
          projectId,
          senderId: "freelancer_1",
          content: "New message update",
          attachments: [],
          messageType: "text",
          read: false,
          createdAt: new Date(),
          sender: {
            id: "freelancer_1",
            name: "John Smith",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          },
        };
        onMessage(mockNewMessage);
      }
    }, 5000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  },
};

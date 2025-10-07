// @ts-nocheck
import {
  ChatThread,
  ChatMessage,
  StartChatRequest,
  SendMessageRequest,
  ChatFilter,
  ChatNotification,
  TypingIndicator,
} from "@/types/chat";
import { generateThreadId, generateMessageId } from "@/chat/utils/chatHelpers";

// Mock data for development
const mockThreads: ChatThread[] = [
  {
    id: "thread_1",
    type: "freelance",
    referenceId: "job_123",
    participants: ["user_1", "user_2"],
    lastMessage: "I'm excited to work on this project! When can we start?",
    lastMessageAt: "2024-01-20T15:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    isGroup: false,
    createdAt: "2024-01-20T10:00:00Z",
    unreadCount: 2,
    contextData: {
      jobTitle: "E-commerce Website Development",
      jobBudget: 5000,
      projectStatus: "negotiation",
    },
  },
  {
    id: "thread_2",
    type: "marketplace",
    referenceId: "product_456",
    participants: ["user_1", "user_3"],
    lastMessage: "Is this item still available?",
    lastMessageAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
    isGroup: false,
    createdAt: "2024-01-20T14:00:00Z",
    unreadCount: 1,
    contextData: {
      productName: "MacBook Pro 16-inch",
      productPrice: 2500,
      productImage:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
    },
  },
  {
    id: "thread_3",
    type: "p2p",
    referenceId: "trade_789",
    participants: ["user_1", "user_4"],
    lastMessage: "Payment sent! Please confirm receipt.",
    lastMessageAt: "2024-01-20T16:45:00Z",
    updatedAt: "2024-01-20T16:45:00Z",
    isGroup: false,
    createdAt: "2024-01-20T16:00:00Z",
    unreadCount: 0,
    contextData: {
      tradeAmount: 0.5,
      cryptoType: "BTC",
      tradeStatus: "payment_sent",
    },
  },
  {
    id: "thread_4",
    type: "social",
    referenceId: null,
    participants: ["user_1", "user_5"],
    lastMessage: "Hey! How was your weekend?",
    lastMessageAt: "2024-01-20T12:00:00Z",
    updatedAt: "2024-01-20T12:00:00Z",
    isGroup: false,
    createdAt: "2024-01-19T20:00:00Z",
    unreadCount: 0,
    contextData: {
      relationshipType: "friend",
    },
  },
  {
    id: "thread_5",
    type: "social",
    referenceId: null,
    participants: ["user_1", "user_2", "user_5", "user_6"],
    lastMessage: "Let's plan the family dinner!",
    lastMessageAt: "2024-01-20T11:30:00Z",
    updatedAt: "2024-01-20T11:30:00Z",
    isGroup: true,
    groupName: "Family Group",
    groupAvatar:
      "https://images.unsplash.com/photo-1511895426328-dc8714efa8ed?w=100",
    createdAt: "2024-01-15T10:00:00Z",
    unreadCount: 3,
    contextData: {
      relationshipType: "family",
    },
  },
];

const mockMessages: { [threadId: string]: ChatMessage[] } = {
  thread_1: [
    {
      id: "msg_1",
      threadId: "thread_1",
      senderId: "user_2",
      content:
        "Hi! I saw your job posting for the e-commerce website. I have 5+ years of experience with React and Node.js.",
      timestamp: "2024-01-20T10:05:00Z",
      readBy: ["user_1", "user_2"],
      messageType: "text",
    },
    {
      id: "msg_2",
      threadId: "thread_1",
      senderId: "user_1",
      content:
        "Great! Your portfolio looks impressive. What's your estimated timeline for this project?",
      timestamp: "2024-01-20T10:30:00Z",
      readBy: ["user_1", "user_2"],
      messageType: "text",
    },
    {
      id: "msg_3",
      threadId: "thread_1",
      senderId: "user_2",
      content:
        "I can complete this in 8-10 weeks. Would you like to schedule a call to discuss the requirements in detail?",
      timestamp: "2024-01-20T15:00:00Z",
      readBy: ["user_2"],
      messageType: "text",
    },
    {
      id: "msg_4",
      threadId: "thread_1",
      senderId: "user_2",
      content: "I'm excited to work on this project! When can we start?",
      timestamp: "2024-01-20T15:30:00Z",
      readBy: ["user_2"],
      messageType: "text",
    },
  ],
  thread_2: [
    {
      id: "msg_5",
      threadId: "thread_2",
      senderId: "user_1",
      content: "Is this item still available?",
      timestamp: "2024-01-20T14:15:00Z",
      readBy: ["user_1"],
      messageType: "text",
    },
  ],
  thread_3: [
    {
      id: "msg_6",
      threadId: "thread_3",
      senderId: "user_1",
      content:
        "Ready to proceed with the trade. Please send your wallet address.",
      timestamp: "2024-01-20T16:15:00Z",
      readBy: ["user_1", "user_4"],
      messageType: "text",
    },
    {
      id: "msg_7",
      threadId: "thread_3",
      senderId: "user_4",
      content: "Here's my wallet: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      timestamp: "2024-01-20T16:30:00Z",
      readBy: ["user_1", "user_4"],
      messageType: "text",
    },
    {
      id: "msg_8",
      threadId: "thread_3",
      senderId: "user_1",
      content: "Payment sent! Please confirm receipt.",
      timestamp: "2024-01-20T16:45:00Z",
      readBy: ["user_1", "user_4"],
      messageType: "text",
    },
  ],
  thread_4: [
    {
      id: "msg_9",
      threadId: "thread_4",
      senderId: "user_5",
      content: "Hey! How was your weekend?",
      timestamp: "2024-01-20T12:00:00Z",
      readBy: ["user_1", "user_5"],
      messageType: "text",
    },
  ],
  thread_5: [
    {
      id: "msg_10",
      threadId: "thread_5",
      senderId: "user_2",
      content: "Welcome to our family group! 👨‍👩‍👧‍👦",
      timestamp: "2024-01-15T10:05:00Z",
      readBy: ["user_1", "user_2", "user_5", "user_6"],
      messageType: "text",
    },
    {
      id: "msg_11",
      threadId: "thread_5",
      senderId: "user_5",
      content: "Thanks for creating this! Much easier to coordinate now.",
      timestamp: "2024-01-15T10:10:00Z",
      readBy: ["user_1", "user_2", "user_5", "user_6"],
      messageType: "text",
    },
    {
      id: "msg_12",
      threadId: "thread_5",
      senderId: "user_6",
      content: "Let's plan the family dinner!",
      timestamp: "2024-01-20T11:30:00Z",
      readBy: ["user_6"],
      messageType: "text",
    },
  ],
};

const mockNotifications: ChatNotification[] = [
  {
    id: "notif_1",
    threadId: "thread_1",
    senderId: "user_2",
    senderName: "John Smith",
    message: "I'm excited to work on this project!",
    timestamp: "2024-01-20T15:30:00Z",
    type: "freelance",
    contextInfo: "replied to your job",
    isRead: false,
  },
  {
    id: "notif_2",
    threadId: "thread_2",
    senderId: "user_1",
    senderName: "Alice Johnson",
    message: "Is this item still available?",
    timestamp: "2024-01-20T14:15:00Z",
    type: "marketplace",
    contextInfo: "asked about MacBook Pro",
    isRead: false,
  },
];

// User profiles for mock data
const mockUsers: {
  [userId: string]: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  };
} = {
  user_1: {
    id: "user_1",
    name: "You",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    isOnline: true,
  },
  user_2: {
    id: "user_2",
    name: "John Smith",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    isOnline: true,
  },
  user_3: {
    id: "user_3",
    name: "Sarah Wilson",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
    isOnline: false,
  },
  user_4: {
    id: "user_4",
    name: "Mike Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    isOnline: true,
  },
  user_5: {
    id: "user_5",
    name: "Emma Davis",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    isOnline: false,
  },
  user_6: {
    id: "user_6",
    name: "David Brown",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100",
    isOnline: true,
  },
};

export const chatService = {
  // Get all chat threads for a user
  async getChatThreads(filter?: ChatFilter): Promise<ChatThread[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let threads = [...mockThreads];

    if (filter) {
      if (filter.type && filter.type !== "all") {
        threads = threads.filter((thread) => thread.type === filter.type);
      }

      if (filter.unreadOnly) {
        threads = threads.filter((thread) => (thread.unreadCount || 0) > 0);
      }

      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        threads = threads.filter(
          (thread) =>
            thread.lastMessage.toLowerCase().includes(query) ||
            thread.contextData?.jobTitle?.toLowerCase().includes(query) ||
            thread.contextData?.productName?.toLowerCase().includes(query) ||
            thread.groupName?.toLowerCase().includes(query),
        );
      }
    }

    return threads.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );
  },

  // Get a specific chat thread
  async getChatThread(threadId: string): Promise<ChatThread | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockThreads.find((thread) => thread.id === threadId) || null;
  },

  // Create a new chat thread
  async createChatThread(request: StartChatRequest): Promise<ChatThread> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newThread: ChatThread = {
      id: generateThreadId(),
      type: request.type,
      referenceId: request.referenceId,
      participants: request.participants,
      lastMessage: request.initialMessage || "",
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: request.participants.length > 2 || !!request.groupName,
      groupName: request.groupName,
      createdAt: new Date().toISOString(),
      unreadCount: 0,
      contextData: request.contextData,
    };

    mockThreads.unshift(newThread);

    // If there's an initial message, send it
    if (request.initialMessage) {
      await this.sendMessage({
        threadId: newThread.id,
        content: request.initialMessage,
        messageType: "text",
      });
    }

    return newThread;
  },

  // Create a group chat thread
  async createGroupChatThread(request: StartChatRequest): Promise<ChatThread> {
    return this.createChatThread({ ...request, groupName: request.groupName });
  },

  // Get messages for a thread
  async getMessages(
    threadId: string,
    limit: number = 50,
    offset: number = 0,
    currentUserId?: string,
  ): Promise<ChatMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let messages = mockMessages[threadId] || [];

    // If we have a current user ID, update the mock messages to use it
    if (currentUserId) {
      messages = messages.map(msg => ({
        ...msg,
        senderId: msg.senderId === "user_1" ? currentUserId : msg.senderId,
        readBy: msg.readBy.map(id => id === "user_1" ? currentUserId : id)
      }));
    }

    return messages
      .slice(offset, offset + limit)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  },

  // Send a message
  async sendMessage(request: SendMessageRequest & { currentUserId?: string }): Promise<ChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const currentUserId = request.currentUserId || "user_1";
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      threadId: request.threadId,
      senderId: currentUserId, // Current user
      content: request.content,
      attachments: request.attachments,
      timestamp: new Date().toISOString(),
      readBy: [currentUserId],
      messageType: request.messageType || "text",
      replyTo: request.replyTo,
      metadata: request.metadata,
    };

    // Add message to mock data
    if (!mockMessages[request.threadId]) {
      mockMessages[request.threadId] = [];
    }
    mockMessages[request.threadId].push(newMessage);

    // Update thread's last message
    const threadIndex = mockThreads.findIndex((t) => t.id === request.threadId);
    if (threadIndex !== -1) {
      mockThreads[threadIndex].lastMessage = request.content;
      mockThreads[threadIndex].lastMessageAt = newMessage.timestamp;
      mockThreads[threadIndex].updatedAt = newMessage.timestamp;
    }

    return newMessage;
  },

  // Mark messages as read
  async markAsRead(threadId: string, userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const messages = mockMessages[threadId] || [];
    messages.forEach((message) => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    });

    // Reset unread count for the thread
    const threadIndex = mockThreads.findIndex((t) => t.id === threadId);
    if (threadIndex !== -1) {
      mockThreads[threadIndex].unreadCount = 0;
    }
  },

  // Get notifications
  async getNotifications(userId: string): Promise<ChatNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockNotifications.filter((notif) => notif.senderId !== userId);
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  },

  // Search messages
  async searchMessages(
    query: string,
    threadId?: string,
  ): Promise<ChatMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const searchIn = threadId ? [threadId] : Object.keys(mockMessages);
    const results: ChatMessage[] = [];

    searchIn.forEach((tId) => {
      const messages = mockMessages[tId] || [];
      const matches = messages.filter((msg) =>
        msg.content.toLowerCase().includes(query.toLowerCase()),
      );
      results.push(...matches);
    });

    return results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  // Get user profile
  async getUserProfile(userId: string) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockUsers[userId] || null;
  },

  // Send typing indicator
  async sendTypingIndicator(threadId: string, userId: string): Promise<void> {
    // In real implementation, this would emit a real-time event
    console.log(`User ${userId} is typing in thread ${threadId}`);
  },

  // Upload attachment
  async uploadAttachment(file: File): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock file upload - in real implementation, upload to storage service
    return `https://storage.example.com/${file.name}`;
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    for (const threadId in mockMessages) {
      const messageIndex = mockMessages[threadId].findIndex(
        (m) => m.id === messageId,
      );
      if (
        messageIndex !== -1 &&
        mockMessages[threadId][messageIndex].senderId === userId
      ) {
        mockMessages[threadId].splice(messageIndex, 1);
        return true;
      }
    }

    return false;
  },

  // Add reaction to message
  async addReaction(
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    for (const threadId in mockMessages) {
      const message = mockMessages[threadId].find((m) => m.id === messageId);
      if (message) {
        if (!message.reactions) message.reactions = [];

        const existingReaction = message.reactions.find(
          (r) => r.emoji === emoji,
        );
        if (existingReaction) {
          if (!existingReaction.userIds.includes(userId)) {
            existingReaction.userIds.push(userId);
            existingReaction.count++;
          }
        } else {
          message.reactions.push({
            emoji,
            userIds: [userId],
            count: 1,
          });
        }
        break;
      }
    }
  },
};

export type ChatType = "freelance" | "marketplace" | "p2p" | "social";

export interface ChatThread {
  id: string;
  type: ChatType;
  referenceId: string | null; // jobId, productId, tradeId, or null for social
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  unreadCount?: number;
  contextData?: ChatContextData;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  readBy: string[];
  messageType?: "text" | "image" | "file" | "system" | "voice";
  replyTo?: string; // ID of message being replied to
  reactions?: MessageReaction[];
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    mediaType?: "image" | "video" | "file";
    caption?: string;
    duration?: number;
    transcription?: string;
    stickerName?: string;
    pack?: string;
    animated?: boolean;
    [key: string]: any;
  };
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface ChatContextData {
  // For freelance chats
  jobTitle?: string;
  jobBudget?: number;
  projectStatus?: string;

  // For marketplace chats
  productName?: string;
  productPrice?: number;
  productImage?: string;

  // For P2P crypto chats
  tradeAmount?: number;
  cryptoType?: string;
  tradeStatus?: string;

  // For social chats
  relationshipType?: "friend" | "follower" | "family";
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  role?: "admin" | "member"; // For group chats
}

export interface StartChatRequest {
  type: ChatType;
  referenceId?: string;
  participants: string[];
  initialMessage?: string;
  groupName?: string;
  contextData?: ChatContextData;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
  attachments?: string[];
  replyTo?: string;
  messageType?: "text" | "image" | "file" | "voice";
}

export interface ChatNotification {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: ChatType;
  contextInfo?: string; // e.g., "replied to your job", "new marketplace inquiry"
  isRead: boolean;
}

export interface TypingIndicator {
  threadId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatFilter {
  type?: ChatType | "all";
  unreadOnly?: boolean;
  searchQuery?: string;
}

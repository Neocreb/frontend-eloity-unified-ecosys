// @ts-nocheck
import {
  ChatType,
  ChatThread,
  ChatContextData,
  ChatParticipant,
} from "@/types/chat";

export const getChatTypeIcon = (type: ChatType): string => {
  switch (type) {
    case "freelance":
      return "💼";
    case "marketplace":
      return "🛒";
    case "p2p":
      return "💱";
    case "social":
      return "💬";
    default:
      return "💬";
  }
};

export const getChatTypeLabel = (type: ChatType): string => {
  switch (type) {
    case "freelance":
      return "Work";
    case "marketplace":
      return "Marketplace";
    case "p2p":
      return "Crypto P2P";
    case "social":
      return "Social";
    default:
      return "Chat";
  }
};

export const getChatTypeBadgeColor = (type: ChatType): string => {
  switch (type) {
    case "freelance":
      return "bg-blue-100 text-blue-800";
    case "marketplace":
      return "bg-green-100 text-green-800";
    case "p2p":
      return "bg-yellow-100 text-yellow-800";
    case "social":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatChatTitle = (
  thread: ChatThread,
  currentUserId: string,
): string => {
  if (thread.isGroup && thread.groupName) {
    return thread.groupName;
  }

  if (thread.contextData) {
    switch (thread.type) {
      case "freelance":
        return thread.contextData.jobTitle || "Freelance Project";
      case "marketplace":
        return `${thread.contextData.productName || "Product"} - Marketplace`;
      case "p2p":
        return `${thread.contextData.cryptoType || "Crypto"} Trade`;
      case "social":
        // For social chats, show the other participant's name
        const otherParticipant = thread.participants.find(
          (id) => id !== currentUserId,
        );
        return `Chat with ${otherParticipant || "User"}`;
    }
  }

  return "Chat";
};

export const formatContextSubtitle = (thread: ChatThread): string => {
  if (!thread.contextData) return "";

  switch (thread.type) {
    case "freelance":
      return thread.contextData.projectStatus
        ? `Status: ${thread.contextData.projectStatus}`
        : thread.contextData.jobBudget
          ? `Budget: $${thread.contextData.jobBudget.toLocaleString()}`
          : "";
    case "marketplace":
      return thread.contextData.productPrice
        ? `$${thread.contextData.productPrice.toLocaleString()}`
        : "";
    case "p2p":
      return thread.contextData.tradeAmount && thread.contextData.cryptoType
        ? `${thread.contextData.tradeAmount} ${thread.contextData.cryptoType}`
        : "";
    case "social":
      return thread.contextData.relationshipType || "";
    default:
      return "";
  }
};

export const getContextualGreeting = (
  type: ChatType,
  contextData?: ChatContextData,
): string => {
  switch (type) {
    case "freelance":
      return `Hi! I'm interested in discussing the "${contextData?.jobTitle || "project"}" opportunity.`;
    case "marketplace":
      return `Hello! I have a question about the "${contextData?.productName || "product"}" you're selling.`;
    case "p2p":
      return `Hi! I'd like to proceed with the ${contextData?.cryptoType || "crypto"} trade.`;
    case "social":
      return "Hey there! 👋";
    default:
      return "Hello!";
  }
};

export const generateThreadId = (): string => {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 60000) {
    // Less than 1 minute
    return "Just now";
  } else if (diffMs < 3600000) {
    // Less than 1 hour
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes}m ago`;
  } else if (diffHours < 24) {
    // Less than 24 hours
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const formatLastMessagePreview = (
  message: string,
  maxLength: number = 50,
): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength).trim() + "...";
};

export const isSystemMessage = (content: string): boolean => {
  return (
    content.startsWith("[SYSTEM]") ||
    content.includes("joined the chat") ||
    content.includes("left the chat")
  );
};

export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

export const shouldGroupMessages = (
  currentMessage: { senderId: string; timestamp: string },
  previousMessage: { senderId: string; timestamp: string } | null,
): boolean => {
  if (!previousMessage) return false;
  if (currentMessage.senderId !== previousMessage.senderId) return false;

  const currentTime = new Date(currentMessage.timestamp).getTime();
  const previousTime = new Date(previousMessage.timestamp).getTime();
  const timeDiff = currentTime - previousTime;

  // Group messages if they're from the same sender within 5 minutes
  return timeDiff < 5 * 60 * 1000;
};

export const getNotificationTitle = (
  type: ChatType,
  senderName: string,
  contextData?: ChatContextData,
): string => {
  switch (type) {
    case "freelance":
      return `${senderName} replied to your project`;
    case "marketplace":
      return `${senderName} messaged about ${contextData?.productName || "your product"}`;
    case "p2p":
      return `${senderName} updated your crypto trade`;
    case "social":
      return `New message from ${senderName}`;
    default:
      return `New message from ${senderName}`;
  }
};

export const validateParticipants = (
  participants: string[],
  currentUserId: string,
): boolean => {
  return participants.length >= 2 && participants.includes(currentUserId);
};

export const canUserAccessThread = (
  thread: ChatThread,
  userId: string,
): boolean => {
  return thread.participants.includes(userId);
};

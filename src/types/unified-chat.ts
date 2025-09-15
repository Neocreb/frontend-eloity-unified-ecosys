import {
  ChatType,
  ChatThread,
  ChatMessage,
  ChatParticipant,
  ChatContextData,
} from "./chat";

export type UnifiedChatType = ChatType | "ai_assistant";

export interface UnifiedChatTab {
  id: UnifiedChatType;
  label: string;
  icon: string;
  count?: number;
  color?: string;
}

export interface AIAssistantMessage
  extends Omit<ChatMessage, "threadId" | "senderId"> {
  threadId: "ai_assistant";
  senderId: "ai_assistant" | string; // user ID for user messages
  aiContext?: {
    confidence?: number;
    sources?: string[];
    suggestedActions?: AIAction[];
    followUpQuestions?: string[];
    relatedTopics?: string[];
  };
}

export interface AIAction {
  id: string;
  label: string;
  action: "navigate" | "execute" | "copy" | "share";
  data?: any;
  url?: string;
}

export interface UnifiedChatThread extends ChatThread {
  type: UnifiedChatType;
  isAI?: boolean;
  aiPersonality?: "helpful" | "professional" | "casual" | "expert";
}

export interface ChatFilter {
  type?: UnifiedChatType | "all";
  unreadOnly?: boolean;
  searchQuery?: string;
  hasUnread?: boolean;
}

export interface UnifiedChatContextData extends ChatContextData {
  // AI Assistant specific context
  conversationTopic?: string;
  aiPersonality?: string;
  learningMode?: boolean;

  // Enhanced context for other chat types
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
  customData?: Record<string, any>;
}

export interface ChatTabConfig {
  tabs: UnifiedChatTab[];
  defaultTab: UnifiedChatType;
  aiAssistantConfig: {
    name: string;
    avatar: string;
    personality: string;
    welcomeMessage: string;
    capabilities: string[];
  };
}

export const DEFAULT_CHAT_TABS: UnifiedChatTab[] = [
  {
    id: "social",
    label: "Social",
    icon: "Users",
    color: "blue",
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: "Briefcase",
    color: "green",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "ShoppingBag",
    color: "orange",
  },
  {
    id: "p2p",
    label: "Crypto P2P",
    icon: "Coins",
    color: "yellow",
  },
  {
    id: "ai_assistant",
    label: "Edith AI",
    icon: "Bot",
    color: "purple",
  },
];

export const AI_ASSISTANT_CONFIG = {
  name: "Edith",
  avatar: "/placeholder.svg",
  personality: "helpful",
  welcomeMessage:
    "Hi! I'm Edith, your personal SoftChat assistant. I'm here to help you with content creation, trading insights, marketplace guidance, freelancing tips, and much more. What can I help you with today?",
  capabilities: [
    "Content creation assistance",
    "Trading and crypto insights",
    "Marketplace guidance",
    "Freelancing tips",
    "Platform navigation",
    "Performance analytics",
    "Social media optimization",
  ],
};

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  ArrowLeft,
  UserPlus,
  Users,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Crown,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Import group components
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupInfoModal } from "./GroupInfoModal";
import { GroupChatFilters, ChatFilter } from "./GroupChatFilters";
import { ChatListItem } from "./ChatListItem";

// Import existing components
import { ChatTabs } from "../ChatTabs";
import { EnhancedMessage, EnhancedChatMessage } from "../EnhancedMessage";
import WhatsAppChatInput from "../WhatsAppChatInput";
import { VoiceVideoCall } from "../VoiceVideoCall";
import { TypingIndicator } from "../TypingIndicator";
import { AIAssistantChat } from "../AIAssistantChat";
import { OnlineStatusIndicator } from "../OnlineStatusIndicator";

// Import integration hooks
import { useChatIntegration } from "@/hooks/use-chat-integration";
import { useNavigate } from "react-router-dom";

// Types
import { 
  UnifiedChatType, 
  UnifiedChatTab, 
  UnifiedChatThread,
  DEFAULT_CHAT_TABS 
} from "@/types/unified-chat";
import { 
  GroupChatThread, 
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupParticipant,
} from "@/types/group-chat";
import { ChatParticipant } from "@/types/chat";
import { chatService } from "@/services/chatService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedChatInterfaceProps {
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { openChatTab } = useChatIntegration();

  // Core state
  const [activeTab, setActiveTab] = useState<UnifiedChatType>("social");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<UnifiedChatThread | null>(null);
  const [conversations, setConversations] = useState<UnifiedChatThread[]>([]);
  const [messages, setMessages] = useState<Record<string, EnhancedChatMessage[]>>({});
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Filter state - only for social tab
  const [chatFilter, setChatFilter] = useState<ChatFilter>({
    type: 'all',
    showUnread: false,
    showPinned: false,
    showMuted: false,
    showArchived: false,
  });

  // Group management state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<ChatParticipant[]>([]);

  // Call state
  const [activeCall, setActiveCall] = useState<{
    type: "voice" | "video" | "group";
    participants: any[];
    currentUser: any;
    chatInfo: any;
  } | null>(null);

  // Typing state
  const [typingUsers, setTypingUsers] = useState<{
    [chatId: string]: Array<{id: string, name: string, avatar?: string}>
  }>({});

  // Reply state
  const [replyToMessage, setReplyToMessage] = useState<EnhancedChatMessage | null>(null);

  // Voice/Video call handlers
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Mock conversations for different tabs
  const mockConversations: UnifiedChatThread[] = [
    // Social conversations
    {
      id: "social_1",
      type: "social",
      referenceId: null,
      participant_profile: {
        id: "user_1",
        name: "Alice Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100",
        is_online: true,
      },
      lastMessage: "Hey! How was your weekend?",
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 2,
      isPinned: true,
    },
    {
      id: "social_group_1",
      type: "social",
      referenceId: null,
      participants: [
        { id: "user_1", name: "Alice", avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100", role: "member", joinedAt: new Date().toISOString(), addedBy: "current", isActive: true, isOnline: true },
        { id: "user_2", name: "Bob", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", role: "member", joinedAt: new Date().toISOString(), addedBy: "current", isActive: true, isOnline: false },
        { id: "current", name: "You", avatar: "", role: "admin", joinedAt: new Date().toISOString(), addedBy: "current", isActive: true, isOnline: true },
      ],
      lastMessage: "Let's plan the family dinner!",
      lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: true,
      groupName: "Family Group",
      groupDescription: "Family chat group",
      groupAvatar: "",
      createdBy: "current",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Created 7 days ago
      adminIds: ["current"],
      settings: {
        whoCanSendMessages: 'everyone',
        whoCanAddMembers: 'everyone',
        whoCanEditGroupInfo: 'admins_only',
        whoCanRemoveMembers: 'admins_only',
        disappearingMessages: false,
        allowMemberInvites: true,
        showMemberAddNotifications: true,
        showMemberExitNotifications: true,
        muteNonAdminMessages: false,
      },
      maxParticipants: 256,
      groupType: 'private',
      category: 'family',
      totalMessages: 15,
      unreadCount: 3,
    },
    {
      id: "social_2",
      type: "social",
      referenceId: null,
      participant_profile: {
        id: "user_3",
        name: "Mike Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        is_online: false,
      },
      lastMessage: "Thanks for the recommendation!",
      lastMessageAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 0,
    },
    // Freelance conversations
    {
      id: "freelance_1",
      type: "freelance",
      referenceId: "project_123",
      participant_profile: {
        id: "client_1",
        name: "TechStart Inc",
        avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100",
        is_online: false,
      },
      lastMessage: "Can we discuss the project timeline?",
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 1,
      contextData: { jobTitle: "Full Stack Web Developer", projectBudget: 5000 },
    },
    {
      id: "freelance_2",
      type: "freelance",
      referenceId: "project_456",
      participant_profile: {
        id: "client_2",
        name: "Design Agency",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        is_online: true,
      },
      lastMessage: "The mockups look great! When can you start?",
      lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 0,
      contextData: { jobTitle: "UI/UX Designer", projectBudget: 2500 },
    },
    // Marketplace conversations
    {
      id: "marketplace_1",
      type: "marketplace",
      referenceId: "product_789",
      participant_profile: {
        id: "seller_1",
        name: "Electronics Store",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        is_online: true,
      },
      lastMessage: "The laptop is still available. Are you interested?",
      lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 1,
      contextData: { productName: "MacBook Pro 16\"", productPrice: 2499 },
    },
    {
      id: "marketplace_2",
      type: "marketplace",
      referenceId: "product_101",
      participant_profile: {
        id: "seller_2",
        name: "Fashion Boutique",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        is_online: false,
      },
      lastMessage: "We have it in stock! Would you like to purchase?",
      lastMessageAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 0,
      contextData: { productName: "Designer Handbag", productPrice: 299 },
    },
    // Crypto P2P conversations
    {
      id: "crypto_1",
      type: "crypto",
      referenceId: "trade_567",
      participant_profile: {
        id: "trader_1",
        name: "Bitcoin Trader",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        is_online: true,
      },
      lastMessage: "I can do 0.5 BTC at market rate. Deal?",
      lastMessageAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 2,
      contextData: { tradeType: "buy", cryptocurrency: "BTC", amount: 0.5 },
    },
    {
      id: "crypto_2",
      type: "crypto",
      referenceId: "trade_890",
      participant_profile: {
        id: "trader_2",
        name: "ETH Exchanger",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        is_online: false,
      },
      lastMessage: "Payment confirmed. When can we complete the trade?",
      lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: false,
      unreadCount: 0,
      contextData: { tradeType: "sell", cryptocurrency: "ETH", amount: 10 },
    },
  ];

  // Handle tab changes - stay within chat interface
  const handleTabChange = (tabId: UnifiedChatType) => {
    setActiveTab(tabId);
    setSelectedChat(null); // Clear selection when switching tabs
  };

  // Tabs configuration
  const tabsWithCounts: UnifiedChatTab[] = useMemo(() => {
    const socialConvs = conversations.filter(c => c.type === "social");
    const freelanceConvs = conversations.filter(c => c.type === "freelance");
    const marketplaceConvs = conversations.filter(c => c.type === "marketplace");
    const cryptoConvs = conversations.filter(c => c.type === "crypto");

    return [
      { id: "social", label: "Social", icon: "👥", count: socialConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0) },
      { id: "freelance", label: "Freelance", icon: "💼", count: freelanceConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0) },
      { id: "marketplace", label: "Marketplace", icon: "🛒", count: marketplaceConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0) },
      { id: "crypto", label: "Crypto", icon: "🪙", count: cryptoConvs.reduce((sum, c) => sum + (c.unreadCount || 0), 0) },
      { id: "ai_assistant", label: "AI", icon: "🤖", count: 0 },
    ];
  }, [conversations]);

  // Filtered conversations based on active tab and filters
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv) =>
      activeTab === "ai_assistant" ? false : conv.type === activeTab
    );

    // Apply filters only for social tab
    if (activeTab === "social") {
      if (chatFilter.type === 'groups') {
        filtered = filtered.filter((conv) => conv.isGroup);
      } else if (chatFilter.type === 'direct') {
        filtered = filtered.filter((conv) => !conv.isGroup);
      }

      if (chatFilter.showUnread) {
        filtered = filtered.filter((conv) => (conv.unreadCount || 0) > 0);
      }

      if (chatFilter.showPinned) {
        filtered = filtered.filter((conv) => conv.isPinned);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) =>
        conv.groupName?.toLowerCase().includes(query) ||
        conv.participant_profile?.name?.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [conversations, activeTab, chatFilter, searchQuery]);

  // Calculate filter counts for social tab
  const filterCounts = useMemo(() => {
    const socialConversations = conversations.filter((conv) => conv.type === "social");

    return {
      groups: socialConversations.filter((conv) => conv.isGroup).length,
      direct: socialConversations.filter((conv) => !conv.isGroup).length,
      unread: socialConversations.filter((conv) => (conv.unreadCount || 0) > 0).length,
      pinned: socialConversations.filter((conv) => conv.isPinned).length,
    };
  }, [conversations]);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get("type") as UnifiedChatType;
    const threadParam = urlParams.get("thread");

    if (typeParam && ["social", "freelance", "marketplace", "crypto", "ai_assistant"].includes(typeParam)) {
      setActiveTab(typeParam);
    }

    if (threadParam && conversations.length > 0) {
      const targetChat = conversations.find((conv) => conv.id === threadParam);
      if (targetChat) {
        setSelectedChat(targetChat);
      }
    }
  }, [conversations]);

  // Load conversations effect
  useEffect(() => {
    if (user) {
      setConversations(mockConversations);
      setLoading(false);

      // Load mock messages for each conversation
      const mockMessagesData: Record<string, EnhancedChatMessage[]> = {
        "social_1": [
          {
            id: "msg_1",
            senderId: "user_1",
            senderName: "Alice Johnson",
            senderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100",
            content: "Hey! How was your weekend?",
            type: "text",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            status: "read",
            reactions: [],
          },
          {
            id: "msg_2",
            senderId: user?.id || "current",
            senderName: "You",
            senderAvatar: user?.profile?.avatar_url,
            content: "It was great! Went hiking with friends. How about you?",
            type: "text",
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            status: "read",
            reactions: [],
          },
        ],
        "social_group_1": [
          {
            id: "msg_3",
            senderId: "user_1",
            senderName: "Alice",
            senderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100",
            content: "Let's plan the family dinner!",
            type: "text",
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            status: "read",
            reactions: [],
          },
          {
            id: "msg_4",
            senderId: "user_2",
            senderName: "Bob",
            senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
            content: "Great idea! What date works for everyone?",
            type: "text",
            timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
            status: "read",
            reactions: [],
          },
        ],
        "freelance_1": [
          {
            id: "msg_5",
            senderId: "client_1",
            senderName: "Tech Startup Inc",
            senderAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100",
            content: "The project requirements have been updated",
            type: "text",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            reactions: [],
          },
        ],
        "marketplace_1": [
          {
            id: "msg_6",
            senderId: user?.id || "current",
            senderName: "You",
            senderAvatar: user?.profile?.avatar_url,
            content: "Is this item still available?",
            type: "text",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            status: "sent",
            reactions: [],
          },
        ],
      };

      setMessages(mockMessagesData);

      // Load mock contacts
      const mockContacts: ChatParticipant[] = [
        {
          id: "user_1",
          name: "Alice Johnson",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100",
          isOnline: true,
          username: "alicej",
          isVerified: true,
        },
        {
          id: "user_2",
          name: "Bob Smith",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          isOnline: false,
          username: "bobsmith",
        },
        {
          id: "user_3",
          name: "Carol Williams",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
          isOnline: true,
          username: "carolw",
          isVerified: true,
        },
      ];
      setAvailableContacts(mockContacts);
    }
  }, [user]);

  // Group management functions
  const handleCreateGroup = async (request: CreateGroupRequest) => {
    try {
      console.log("Creating group with request:", request);

      // Ensure current user is included in participants
      const allParticipants = [...new Set([...(request.participants || []), user?.id || 'current'])];
      console.log("All participants:", allParticipants);

      const newGroup: GroupChatThread = {
        id: `group_${Date.now()}`,
        type: "social",
        referenceId: null,
        participants: allParticipants.map(userId => ({
          id: userId,
          name: userId === user?.id
            ? (user?.profile?.full_name || user?.email || "You")
            : (availableContacts.find(c => c.id === userId)?.name || "Unknown"),
          avatar: userId === user?.id
            ? user?.profile?.avatar_url
            : availableContacts.find(c => c.id === userId)?.avatar,
          role: userId === user?.id ? 'admin' : 'member',
          joinedAt: new Date().toISOString(),
          addedBy: 'current',
          isActive: true,
          isOnline: userId === user?.id ? true : (availableContacts.find(c => c.id === userId)?.isOnline || false),
        })),
        lastMessage: request.initialMessage || "Group created",
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGroup: true,
        groupName: request.name,
        groupDescription: request.description,
        groupAvatar: request.avatar,
        createdBy: 'current',
        createdAt: new Date().toISOString(),
        adminIds: ['current'],
        settings: request.settings || {
          whoCanSendMessages: 'everyone',
          whoCanAddMembers: 'everyone', 
          whoCanEditGroupInfo: 'admins_only',
          whoCanRemoveMembers: 'admins_only',
          disappearingMessages: false,
          allowMemberInvites: true,
          showMemberAddNotifications: true,
          showMemberExitNotifications: true,
          muteNonAdminMessages: false,
        },
        maxParticipants: 256,
        groupType: request.groupType || 'private',
        category: request.category || 'friends',
        totalMessages: 0,
      };

      console.log("New group created:", newGroup);
      setConversations(prev => {
        const updated = [newGroup, ...prev];
        console.log("Updated conversations:", updated);
        return updated;
      });
      setShowCreateGroup(false);

      toast({
        title: "Group Created",
        description: `${request.name} has been created successfully`,
      });
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  // Chat actions
  const handlePinChat = async (chatId: string, pin: boolean) => {
    setConversations(prev => prev.map(conv => 
      conv.id === chatId ? { ...conv, isPinned: pin } : conv
    ));
  };

  const handleMuteChat = async (chatId: string, mute: boolean) => {
    setConversations(prev => prev.map(conv =>
      conv.id === chatId ? { ...conv, isMuted: mute } : conv
    ));
  };

  const handleArchiveChat = async (chatId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === chatId ? { ...conv, isArchived: true } : conv
    ));

    toast({
      title: "Chat archived",
      description: "The conversation has been archived",
    });
  };

  const handleDeleteChat = async (chatId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== chatId));

    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }

    toast({
      title: "Chat deleted",
      description: "The conversation has been deleted",
    });
  };

  const handleCall = (chatId: string, type: 'voice' | 'video') => {
    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;

    setActiveCall({
      type: type,
      participants: chat.isGroup
        ? (chat as GroupChatThread).participants || []
        : [{ id: user?.id, name: user?.profile?.full_name || "You" }],
      currentUser: { id: user?.id, name: user?.profile?.full_name || "You" },
      chatInfo: chat,
    });
  };

  const markAsRead = (chatId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === chatId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  // Mark chat as read when selected
  useEffect(() => {
    if (selectedChat) {
      markAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  // Send message with notification
  const handleSendMessage = async () => {
    if (!selectedChat || !messageInput.trim()) return;

    const newMessage: EnhancedChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || "current-user",
      senderName: user?.profile?.full_name || user?.email || "You",
      senderAvatar: user?.profile?.avatar_url,
      content: messageInput.trim(),
      type: "text",
      timestamp: new Date().toISOString(),
      status: "sent",
      reactions: [],
      replyTo: replyToMessage,
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    // Update conversation last message
    setConversations(prev => prev.map(conv =>
      conv.id === selectedChat.id
        ? {
            ...conv,
            lastMessage: messageInput.trim(),
            lastMessageAt: new Date().toISOString()
          }
        : conv
    ));

    // Trigger notification for other participants
    if (selectedChat.isGroup) {
      const groupChat = selectedChat as GroupChatThread;
      groupChat.participants?.forEach(participant => {
        if (participant.id !== user?.id) {
          // Dispatch custom event for notification system
          window.dispatchEvent(new CustomEvent('chat-notification', {
            detail: {
              type: 'social',
              title: `${selectedChat.groupName}`,
              message: `${user?.profile?.full_name || 'Someone'}: ${messageInput.trim()}`,
              fromUserId: user?.id,
              chatId: selectedChat.id,
              chatType: selectedChat.type,
            }
          }));
        }
      });
    } else {
      // Direct message notification
      window.dispatchEvent(new CustomEvent('chat-notification', {
        detail: {
          type: selectedChat.type,
          title: `${user?.profile?.full_name || 'New message'}`,
          message: messageInput.trim(),
          fromUserId: user?.id,
          chatId: selectedChat.id,
          chatType: selectedChat.type,
        }
      }));
    }

    setMessageInput("");
    setReplyToMessage(null);
  };

  // Message interaction handlers
  const handleReplyToMessage = (message: EnhancedChatMessage) => {
    setReplyToMessage(message);
    toast({
      title: "Replying to message",
      description: `Replying to ${message.senderName}`,
    });
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!selectedChat) return;

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]:
        prev[selectedChat.id]?.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  {
                    userId: user?.id || "",
                    emoji,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : msg,
        ) || [],
    }));

    toast({
      title: "Reaction added",
      description: `You reacted with ${emoji}`,
    });
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!selectedChat) return;

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]:
        prev[selectedChat.id]?.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg,
        ) || [],
    }));

    toast({
      title: "Message edited",
      description: "Your message has been updated",
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedChat) return;

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]:
        prev[selectedChat.id]?.filter((msg) => msg.id !== messageId) || [],
    }));

    toast({
      title: "Message deleted",
      description: "The message has been removed",
    });
  };

  // Call handlers
  const handleToggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        currentUser: {
          ...activeCall.currentUser,
          isAudioMuted: !isAudioMuted,
        },
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        currentUser: {
          ...activeCall.currentUser,
          isVideoEnabled: !isVideoEnabled,
        },
      });
    }
  };

  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        currentUser: {
          ...activeCall.currentUser,
          isScreenSharing: !isScreenSharing,
        },
      });
    }

    toast({
      title: isScreenSharing
        ? "Screen Sharing Stopped"
        : "Screen Sharing Started",
      description: isScreenSharing
        ? "You stopped sharing your screen"
        : "You are now sharing your screen",
    });
  };

  // Render chat header
  const renderChatHeader = () => {
    if (!selectedChat) return null;

    const isGroup = selectedChat.isGroup;
    const groupChat = isGroup ? selectedChat as GroupChatThread : null;

    return (
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {isGroup ? groupChat?.groupName : selectedChat.participant_profile?.name}
              </h3>
            </div>
            
            {isGroup ? (
              <p className="text-sm text-muted-foreground">
                {groupChat?.participants?.filter(p => p.isActive).length} members
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {selectedChat.participant_profile?.is_online ? "Online" : "Last seen recently"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleCall(selectedChat.id, 'voice')}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleCall(selectedChat.id, 'video')}
          >
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Show AI Assistant for AI tab
  if (activeTab === "ai_assistant") {
    return <AIAssistantChat className={className} />;
  }

  return (
    <div className={cn("flex h-full bg-background flex-col", className)}>
      {/* Main Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className={cn("px-4 py-4 space-y-4", isMobile && "px-3 py-3 space-y-3")}>
          {/* Title and Options */}
          <div className="flex items-center justify-between">
            <h1 className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
              Messages
            </h1>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {!isMobile && "New"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activeTab === "social" && (
                  <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Create Group
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start New Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <ChatTabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Sub-filters (only for Social tab) */}
        {activeTab === "social" && (
          <div className="px-4 pb-4">
            <GroupChatFilters
              activeFilter={chatFilter}
              onFilterChange={setChatFilter}
              groupsCount={filterCounts.groups}
              directCount={filterCounts.direct}
              unreadCount={filterCounts.unread}
              pinnedCount={filterCounts.pinned}
            />
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Chat List */}
        <div className={cn(
          "flex flex-col border-r bg-card min-w-0",
          isMobile ? (selectedChat ? "hidden" : "w-full") : "w-80 max-w-80"
        )}>
          <ScrollArea className="flex-1">
            <div className={cn("p-2 space-y-1", isMobile && "p-1.5 space-y-0.5")}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((chat) => (
                  <div key={chat.id} className={cn("transition-transform", isMobile && "active:scale-95")}>
                    <ChatListItem
                      chat={chat}
                      isSelected={selectedChat?.id === chat.id}
                      currentUserId={user?.id || ""}
                      onClick={() => {
                        // Store conversation data for ChatRoom to access
                        try {
                          localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
                          console.log("Stored chat data for", chat.id, ":", chat);
                        } catch (error) {
                          console.error("Error storing conversation data:", error);
                        }

                        // Navigate to dedicated chat page
                        navigate(`/app/chat/${chat.id}?type=${chat.type}`);
                      }}
                      onPin={handlePinChat}
                      onMute={handleMuteChat}
                      onArchive={handleArchiveChat}
                      onDelete={handleDeleteChat}
                      onCall={handleCall}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                  {activeTab === "social" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowCreateGroup(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex flex-col flex-1 min-w-0",
          isMobile && !selectedChat && "hidden"
        )}>
          {selectedChat ? (
            <>
              {renderChatHeader()}

              {/* Messages */}
              <ScrollArea className={cn(
                "flex-1 p-4",
                isMobile && "p-3",
                "min-h-0" // Important for scroll behavior
              )}>
                <div className={cn("space-y-4", isMobile && "space-y-3")}>
                  {(messages[selectedChat.id] || []).map((message) => (
                    <div key={message.id} className={cn(isMobile && "transition-transform active:scale-98")}>
                      <EnhancedMessage
                        message={message}
                        currentUserId={user?.id || ""}
                        onReact={(emoji) => handleReactToMessage(message.id, emoji)}
                        onReply={() => handleReplyToMessage(message)}
                        onEdit={(newContent) => handleEditMessage(message.id, newContent)}
                        onDelete={() => handleDeleteMessage(message.id)}
                        showAvatar={selectedChat.isGroup}
                        isGroupMessage={selectedChat.isGroup}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Typing Indicator */}
              {typingUsers[selectedChat.id] && typingUsers[selectedChat.id].length > 0 && (
                <div className="px-4 pb-2">
                  <TypingIndicator users={typingUsers[selectedChat.id]} />
                </div>
              )}

              {/* Online Status Indicator */}
              {!selectedChat.isGroup && selectedChat.participant_profile && (
                <div className="px-4 pb-2">
                  <OnlineStatusIndicator
                    isOnline={selectedChat.participant_profile.is_online || false}
                    lastSeen={selectedChat.lastMessageAt}
                  />
                </div>
              )}

              {/* Message Input */}
              <div className="flex-shrink-0 bg-background">
                <WhatsAppChatInput
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  onSendMessage={(type, content, metadata) => {
                    if (type === "text") {
                      handleSendMessage();
                    } else {
                      // Handle other message types (voice, sticker, media)
                      const newMessage: EnhancedChatMessage = {
                        id: `msg_${Date.now()}`,
                        senderId: user?.id || "current-user",
                        senderName: user?.profile?.full_name || user?.email || "You",
                        senderAvatar: user?.profile?.avatar_url,
                        content: content,
                        type: type === "voice" ? "voice" : type === "sticker" ? "sticker" : "media",
                        timestamp: new Date().toISOString(),
                        status: "sent",
                        reactions: [],
                        metadata: metadata,
                      };

                      setMessages(prev => ({
                        ...prev,
                        [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
                      }));

                      // Update last message in conversation
                      setConversations(prev => prev.map(conv =>
                        conv.id === selectedChat.id
                          ? {
                              ...conv,
                              lastMessage: type === "text" ? content : `${type} message`,
                              lastMessageAt: new Date().toISOString()
                            }
                          : conv
                      ));
                    }
                  }}
                  isMobile={isMobile}
                  placeholder={`Message ${selectedChat.isGroup ? selectedChat.groupName : selectedChat.participant_profile?.name}...`}
                  currentUserId={user?.id}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center p-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className={cn("font-medium mb-2", isMobile ? "text-base" : "text-lg")}>
                  Select a conversation
                </h3>
                <p className="text-sm opacity-80">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        trigger={<div />}
        contacts={availableContacts}
        onCreateGroup={handleCreateGroup}
        isOpen={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />

      {selectedChat?.isGroup && (
        <GroupInfoModal
          trigger={<div />}
          group={selectedChat as GroupChatThread}
          currentUserId={user?.id || ""}
          onUpdateGroup={async (request) => {
            // Update conversation in state
            setConversations(prev => prev.map(conv =>
              conv.id === selectedChat.id
                ? {
                    ...conv as GroupChatThread,
                    groupName: request.name || (conv as GroupChatThread).groupName,
                    groupDescription: request.description || (conv as GroupChatThread).groupDescription,
                    groupAvatar: request.avatar || (conv as GroupChatThread).groupAvatar,
                  }
                : conv
            ));

            // Update selected chat
            if (selectedChat) {
              const updatedChat = {
                ...selectedChat as GroupChatThread,
                groupName: request.name || (selectedChat as GroupChatThread).groupName,
                groupDescription: request.description || (selectedChat as GroupChatThread).groupDescription,
                groupAvatar: request.avatar || (selectedChat as GroupChatThread).groupAvatar,
              };
              setSelectedChat(updatedChat);
            }
          }}
          isOpen={showGroupInfo}
          onOpenChange={setShowGroupInfo}
        />
      )}

      {/* Active Call */}
      {activeCall && (
        <VoiceVideoCall
          type={activeCall.type}
          participants={activeCall.participants}
          currentUser={activeCall.currentUser}
          chatInfo={activeCall.chatInfo}
          onEndCall={() => setActiveCall(null)}
          isAudioMuted={isAudioMuted}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={handleToggleScreenShare}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Send,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  PlusCircle,
  Users,
  Briefcase,
  ShoppingBag,
  Coins,
  MessageSquare,
  Filter,
  ArrowLeft,
  UserPlus,
  VideoIcon,
  X,
} from "lucide-react";
import WhatsAppChatInput from "./WhatsAppChatInput";
import { VoiceVideoCall } from "./VoiceVideoCall";
import { GroupVideoRoom } from "./GroupVideoRoom";
import { EnhancedMessage, EnhancedChatMessage } from "./EnhancedMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { ChatTabs } from "./ChatTabs";
import { AIAssistantChat } from "./AIAssistantChat";
import { chatService } from "@/services/chatService";
import {
  UnifiedChatType,
  UnifiedChatTab,
  UnifiedChatThread,
  DEFAULT_CHAT_TABS,
} from "@/types/unified-chat";
import { ChatThread, ChatMessage, ChatFilter } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { TypingIndicator } from "./TypingIndicator";
import { OnlineStatusIndicator } from "./OnlineStatusIndicator";

interface UnifiedChatInterfaceProps {
  className?: string;
}

export const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState<UnifiedChatType>("social");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<UnifiedChatThread | null>(
    null,
  );
  const [conversations, setConversations] = useState<UnifiedChatThread[]>([]);
  const [messages, setMessages] = useState<
    Record<string, EnhancedChatMessage[]>
  >({});
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{[chatId: string]: Array<{id: string, name: string, avatar?: string}>}>({});

  // Voice/Video call state
  const [activeCall, setActiveCall] = useState<{
    type: "voice" | "video" | "group";
    participants: any[];
    currentUser: any;
    chatInfo: any;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    from: any;
    type: "voice" | "video";
    chatInfo: any;
  } | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Group video room state
  const [groupVideoRoom, setGroupVideoRoom] = useState<{
    roomId: string;
    roomName: string;
    roomType: string;
    participants: any[];
    currentUser: any;
  } | null>(null);

  // Reply functionality
  const [replyToMessage, setReplyToMessage] =
    useState<EnhancedChatMessage | null>(null);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get("type") as UnifiedChatType;
    const threadParam = urlParams.get("thread");

    if (typeParam && DEFAULT_CHAT_TABS.some((tab) => tab.id === typeParam)) {
      setActiveTab(typeParam);
    }

    if (threadParam && conversations.length > 0) {
      const targetChat = conversations.find((conv) => conv.id === threadParam);
      if (targetChat) {
        setSelectedChat(targetChat);
      }
    }
  }, [conversations]);

  // Enhanced tabs with unread counts
  const tabsWithCounts = useMemo<UnifiedChatTab[]>(() => {
    return DEFAULT_CHAT_TABS.map((tab) => {
      const count = conversations
        .filter((conv) => conv.type === tab.id)
        .reduce((total, conv) => total + (conv.unreadCount || 0), 0);

      return {
        ...tab,
        count,
      };
    });
  }, [conversations]);

  // Add some mock enhanced messages when a chat is selected for demo purposes
  useEffect(() => {
    if (
      selectedChat &&
      (!messages[selectedChat.id] || messages[selectedChat.id].length === 0)
    ) {
      const mockMessages: EnhancedChatMessage[] = [
        {
          id: "1",
          senderId: "other-user",
          senderName: selectedChat.participant_profile?.name || "Other User",
          senderAvatar: selectedChat.participant_profile?.avatar,
          content: "Hey! How are you doing today?",
          type: "text",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          status: "read",
          reactions: [],
        },
        {
          id: "2",
          senderId: user?.id || "current-user",
          senderName: user?.profile?.full_name || user?.email || "You",
          senderAvatar: user?.profile?.avatar_url,
          content:
            "I'm doing great! Just working on some exciting new features 🚀",
          type: "text",
          timestamp: new Date(Date.now() - 480000).toISOString(),
          status: "read",
          reactions: [
            {
              userId: "other-user",
              emoji: "👍",
              timestamp: new Date(Date.now() - 470000).toISOString(),
            },
          ],
        },
        {
          id: "3",
          senderId: "other-user",
          senderName: selectedChat.participant_profile?.name || "Other User",
          senderAvatar: selectedChat.participant_profile?.avatar,
          content: "That sounds exciting! What kind of features are you working on?",
          type: "text",
          timestamp: new Date(Date.now() - 420000).toISOString(),
          status: "read",
          reactions: [],
        },
        {
          id: "4",
          senderId: user?.id || "current-user",
          senderName: user?.profile?.full_name || user?.email || "You",
          senderAvatar: user?.profile?.avatar_url,
          content: "We're adding enhanced chat functionality with better message positioning and new interactive features!",
          type: "text",
          timestamp: new Date(Date.now() - 360000).toISOString(),
          status: "delivered",
          reactions: [],
        },
        {
          id: "5",
          senderId: user?.id || "current-user",
          senderName: user?.profile?.full_name || user?.email || "You",
          senderAvatar: user?.profile?.avatar_url,
          content: "Also working on voice messages and file sharing",
          type: "text",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: "sent",
          reactions: [],
        },
        {
          id: "6",
          senderId: "other-user",
          senderName: selectedChat.participant_profile?.name || "Other User",
          senderAvatar: selectedChat.participant_profile?.avatar,
          content: "😊",
          type: "sticker",
          timestamp: new Date(Date.now() - 240000).toISOString(),
          status: "read",
          reactions: [],
          metadata: {
            stickerName: "Happy",
          },
        },
        {
          id: "7",
          senderId: "other-user",
          senderName: selectedChat.participant_profile?.name || "Other User",
          senderAvatar: selectedChat.participant_profile?.avatar,
          content: "Can't wait to try them out! When will they be available?",
          type: "text",
          timestamp: new Date(Date.now() - 180000).toISOString(),
          status: "read",
          reactions: [],
        },
      ];

      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: mockMessages,
      }));
    }
  }, [selectedChat, messages, user]);

  // Call handling functions
  const handleStartVoiceCall = () => {
    if (!selectedChat || !user) return;

    const mockParticipant = {
      id: selectedChat.participants?.[0]?.id || "participant-1",
      name: selectedChat.participants?.[0]?.name || selectedChat.title,
      avatar: selectedChat.participants?.[0]?.avatar,
      isAudioMuted: false,
      isVideoEnabled: false,
      isScreenSharing: false,
      connectionQuality: "excellent" as const,
    };

    const currentUserParticipant = {
      id: user.id,
      name: user.profile?.full_name || user.email,
      avatar: user.profile?.avatar_url,
      isAudioMuted: isAudioMuted,
      isVideoEnabled: false,
      isScreenSharing: isScreenSharing,
      connectionQuality: "excellent" as const,
    };

    setActiveCall({
      type: "voice",
      participants: [mockParticipant],
      currentUser: currentUserParticipant,
      chatInfo: selectedChat,
    });

    toast({
      title: "Voice Call Started",
      description: `Calling ${selectedChat.title}...`,
    });
  };

  const handleStartVideoCall = () => {
    if (!selectedChat || !user) return;

    const mockParticipant = {
      id: selectedChat.participants?.[0]?.id || "participant-1",
      name: selectedChat.participants?.[0]?.name || selectedChat.title,
      avatar: selectedChat.participants?.[0]?.avatar,
      isAudioMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      connectionQuality: "excellent" as const,
    };

    const currentUserParticipant = {
      id: user.id,
      name: user.profile?.full_name || user.email,
      avatar: user.profile?.avatar_url,
      isAudioMuted: isAudioMuted,
      isVideoEnabled: isVideoEnabled,
      isScreenSharing: isScreenSharing,
      connectionQuality: "excellent" as const,
    };

    setActiveCall({
      type: "video",
      participants: [mockParticipant],
      currentUser: currentUserParticipant,
      chatInfo: selectedChat,
    });

    toast({
      title: "Video Call Started",
      description: `Starting video call with ${selectedChat.title}...`,
    });
  };

  const handleStartGroupVideo = () => {
    if (!selectedChat || !user) return;

    // Mock group participants
    const mockParticipants = [
      {
        id: user.id,
        name: user.profile?.full_name || user.email,
        avatar: user.profile?.avatar_url,
        role: "host" as const,
        isVideoEnabled: isVideoEnabled,
        isAudioEnabled: !isAudioMuted,
        isScreenSharing: isScreenSharing,
        handRaised: false,
        joinedAt: new Date().toISOString(),
        connectionQuality: "excellent" as const,
      },
      {
        id: "participant-2",
        name: "Sarah Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "participant" as const,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isScreenSharing: false,
        handRaised: false,
        joinedAt: new Date().toISOString(),
        connectionQuality: "good" as const,
      },
      {
        id: "participant-3",
        name: "Mike Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        role: "speaker" as const,
        isVideoEnabled: false,
        isAudioEnabled: true,
        isScreenSharing: true,
        handRaised: false,
        joinedAt: new Date().toISOString(),
        connectionQuality: "excellent" as const,
      },
    ];

    setGroupVideoRoom({
      roomId: `room-${selectedChat.id}`,
      roomName: selectedChat.title,
      roomType:
        selectedChat.type === "freelance"
          ? "freelance_collab"
          : selectedChat.type === "marketplace"
            ? "marketplace_demo"
            : selectedChat.type === "crypto"
              ? "crypto_discussion"
              : "community_event",
      participants: mockParticipants,
      currentUser: mockParticipants[0],
    });

    toast({
      title: "Group Video Room Created",
      description: `Starting group video session for ${selectedChat.title}`,
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setIncomingCall(null);
    toast({
      title: "Call Ended",
      description: "The call has been ended.",
    });
  };

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

  // Filter conversations based on active tab and search
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by tab type (except AI assistant which is handled separately)
    if (activeTab !== "ai_assistant") {
      filtered = filtered.filter((conv) => conv.type === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.participant_profile?.name?.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query) ||
          conv.contextData?.jobTitle?.toLowerCase().includes(query) ||
          conv.contextData?.productName?.toLowerCase().includes(query),
      );
    }

    // Filter by unread status
    if (showUnreadOnly) {
      filtered = filtered.filter((conv) => (conv.unreadCount || 0) > 0);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );
  }, [conversations, activeTab, searchQuery, showUnreadOnly]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const threads = await chatService.getChatThreads();
      const unifiedThreads: UnifiedChatThread[] = threads.map((thread) => ({
        ...thread,
        type: thread.type as UnifiedChatType,
      }));

      setConversations(unifiedThreads);

      // Load messages for each conversation
      for (const thread of unifiedThreads) {
        const threadMessages = await chatService.getMessages(thread.id, 50, 0, user?.id);

        // Convert ChatMessage[] to EnhancedChatMessage[]
        const enhancedMessages: EnhancedChatMessage[] = threadMessages.map(
          (msg) => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.sender?.name || msg.sender?.full_name || "Unknown",
            senderAvatar: msg.sender?.avatar || msg.sender?.avatar_url,
            content: msg.content,
            type:
              msg.messageType === "voice"
                ? "voice"
                : msg.messageType === "image" || msg.messageType === "file"
                  ? "media"
                  : "text",
            timestamp: msg.timestamp,
            metadata:
              msg.messageType === "voice"
                ? { transcription: "Voice message" }
                : msg.messageType === "image" || msg.messageType === "file"
                  ? { fileName: "Attachment" }
                  : undefined,
            status: msg.readBy.includes(user?.id || "") ? "read" : "delivered",
            reactions:
              msg.reactions?.map((reaction) => ({
                userId: reaction.userIds[0] || "unknown",
                emoji: reaction.emoji,
                timestamp: msg.timestamp,
              })) || [],
            isEdited: false,
            replyTo: msg.replyTo
              ? {
                  messageId: msg.replyTo,
                  content: "Replied message",
                  senderName: "Unknown",
                }
              : undefined,
          }),
        );

        setMessages((prev) => ({
          ...prev,
          [thread.id]: enhancedMessages,
        }));
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: UnifiedChatType) => {
    setActiveTab(tab);
    setSelectedChat(null);
    setSearchQuery("");
  };

  const handleChatSelect = (chat: UnifiedChatThread) => {
    // On mobile, navigate to full-screen chat room
    if (isMobile) {
      navigate(`/app/chat/${chat.id}`);
      return;
    }

    // On desktop, show in sidebar
    setSelectedChat(chat);

    // Simulate typing indicator occasionally
    if (Math.random() > 0.7) {
      setTypingUsers(prev => ({
        ...prev,
        [chat.id]: [{
          id: 'typing-user',
          name: chat.participant_profile?.name || 'Someone',
          avatar: chat.participant_profile?.avatar
        }]
      }));

      // Clear typing after a few seconds
      setTimeout(() => {
        setTypingUsers(prev => ({
          ...prev,
          [chat.id]: []
        }));
      }, 3000 + Math.random() * 2000);
    }

    // Mark as read
    if (chat.unreadCount && chat.unreadCount > 0) {
      chatService.markAsRead(chat.id, user?.id || "");
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === chat.id ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    }
  };

  // Enhanced send message function with support for different message types
  const handleSendEnhancedMessage = async (
    type: "text" | "voice" | "sticker" | "media",
    content: string,
    metadata?: any,
  ) => {
    if (!selectedChat || !user) return;

    try {
      const newMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.profile?.full_name || user.email,
        senderAvatar: user.profile?.avatar_url,
        content,
        type,
        timestamp: new Date().toISOString(),
        metadata,
        status: "sending",
        reactions: [],
        replyTo: replyToMessage
          ? {
              messageId: replyToMessage.id,
              content: replyToMessage.content,
              senderName: replyToMessage.senderName,
            }
          : undefined,
      };

      // Immediately add to UI
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
      }));

      // Clear reply
      setReplyToMessage(null);

      // Simulate API call
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [selectedChat.id]:
            prev[selectedChat.id]?.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, status: "delivered" as const }
                : msg,
            ) || [],
        }));
      }, 1000);

      // Update conversation last message
      const lastMessageText =
        type === "sticker"
          ? "Sticker"
          : type === "voice"
            ? "Voice message"
            : type === "media"
              ? metadata?.fileName || "Media"
              : content;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedChat.id
            ? {
                ...conv,
                lastMessage: lastMessageText,
                lastMessageAt: newMessage.timestamp,
                unreadCount: 0,
              }
            : conv,
        ),
      );

      // Show success toast for special message types
      if (type === "voice") {
        toast({
          title: "Voice Message Sent",
          description: "Your voice message has been sent successfully.",
        });
      } else if (type === "media") {
        toast({
          title: "Media Sent",
          description: `${metadata?.fileName || "File"} has been sent successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Legacy send message function for backward compatibility
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await handleSendEnhancedMessage("text", messageInput.trim());
    setMessageInput("");
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
    setMessages((prev) => ({
      ...prev,
      [selectedChat?.id || ""]:
        prev[selectedChat?.id || ""]?.map((msg) =>
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
    setMessages((prev) => ({
      ...prev,
      [selectedChat?.id || ""]:
        prev[selectedChat?.id || ""]?.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg,
        ) || [],
    }));

    toast({
      title: "Message edited",
      description: "Your message has been updated.",
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [selectedChat?.id || ""]:
        prev[selectedChat?.id || ""]?.filter((msg) => msg.id !== messageId) ||
        [],
    }));

    toast({
      title: "Message deleted",
      description: "The message has been removed.",
    });
  };

  const getContextInfo = (conversation: UnifiedChatThread) => {
    const { contextData, type } = conversation;
    if (!contextData) return null;

    switch (type) {
      case "freelance":
        return contextData.jobTitle;
      case "marketplace":
        return contextData.productName;
      case "p2p":
        return `${contextData.cryptoType} Trade`;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: UnifiedChatType) => {
    switch (type) {
      case "freelance":
        return <Briefcase className="h-3 w-3" />;
      case "marketplace":
        return <ShoppingBag className="h-3 w-3" />;
      case "p2p":
        return <Coins className="h-3 w-3" />;
      case "social":
        return <Users className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "h:mm a");
    } else {
      return format(messageDate, "MMM d");
    }
  };

  if (!user) return null;

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Chat Tabs - sticky top */}
      <div className="shrink-0 bg-background border-b px-4 py-3">
        <ChatTabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          totalUnreadCount={tabsWithCounts.reduce(
            (total, tab) => total + (tab.count || 0),
            0,
          )}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Conversations List - Responsive sidebar */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out bg-background border-r",
              "flex flex-col",
              // Mobile: full width when no chat selected, hidden when chat selected
              isMobile &&
                !selectedChat &&
                activeTab !== "ai_assistant" &&
                "w-full",
              isMobile &&
                (selectedChat || activeTab === "ai_assistant") &&
                "hidden",
              // Desktop: fixed sidebar width
              !isMobile && "w-80 xl:w-96",
            )}
          >
            <Card className="w-full h-full border-0 shadow-none bg-transparent flex flex-col">
              <CardHeader
                className={`pb-3 ${isMobile ? "px-3 py-3" : "px-4 py-4"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <CardTitle
                    className={`flex items-center gap-2 ${isMobile ? "text-base" : "text-lg"}`}
                  >
                    {getTypeIcon(activeTab)}
                    <span className="truncate">
                      {activeTab === "ai_assistant"
                        ? "AI Assistant"
                        : activeTab.charAt(0).toUpperCase() +
                          activeTab.slice(1)}{" "}
                      {isMobile ? "" : "Chat"}
                    </span>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "default"}
                        className={isMobile ? "h-8 w-8 p-0" : "h-9 w-9 p-0"}
                      >
                        <span className="sr-only">Open menu</span>
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>New Chat</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Start Social Chat</DropdownMenuItem>
                      <DropdownMenuItem>Find Freelancer</DropdownMenuItem>
                      <DropdownMenuItem>Message Seller</DropdownMenuItem>
                      <DropdownMenuItem>P2P Trade Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Search and Filter */}
                {activeTab !== "ai_assistant" && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={
                          isMobile ? "Search..." : "Search conversations..."
                        }
                        className={`pl-10 ${isMobile ? "h-9" : "h-10"}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-2">
                      <Button
                        variant={showUnreadOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                        className={isMobile ? "text-xs px-2" : ""}
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        {showUnreadOnly ? "All" : "Unread"}
                      </Button>
                      <span
                        className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {filteredConversations.length}
                        {!isMobile && " conversation"}
                        {!isMobile && filteredConversations.length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </>
                )}
              </CardHeader>

              {activeTab === "ai_assistant" ? (
                <CardContent className="p-0 flex-1">
                  <div className={`${isMobile ? "p-3" : "p-4"} text-center`}>
                    <AIAssistantChat isMinimized />
                    <p
                      className={`text-muted-foreground mt-2 ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {isMobile
                        ? "AI Assistant available"
                        : "AI Assistant is always available in the main chat area"}
                    </p>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea
                    className={cn(
                      "chat-scroll-area",
                      isMobile
                        ? "h-[calc(100vh-200px)]"
                        : "h-[calc(100vh-240px)]",
                    )}
                    style={{
                      height: isMobile
                        ? "calc(100vh - 200px)"
                        : "calc(100vh - 240px)",
                    }}
                  >
                    {loading ? (
                      <div
                        className={`${isMobile ? "p-3" : "p-4"} text-center`}
                      >
                        <div className="animate-pulse space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-3 ${isMobile ? "p-2" : "p-3"}`}
                            >
                              <div
                                className={`bg-muted rounded-full ${isMobile ? "w-8 h-8" : "w-10 h-10"}`}
                              />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : filteredConversations.length > 0 ? (
                      filteredConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={cn(
                            "flex items-start cursor-pointer transition-all duration-200 border-b border-border/30 last:border-b-0",
                            "touch-optimized active:bg-muted/70", // Touch optimizations
                            isMobile ? "gap-2 p-3 min-h-[60px]" : "gap-3 p-4", // Minimum touch target
                            selectedChat?.id === conv.id
                              ? "bg-primary/5 border-l-2 border-l-primary"
                              : "hover:bg-muted/50 hover:border-l-2 hover:border-l-muted-foreground/20",
                          )}
                          onClick={() => handleChatSelect(conv)}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar
                              className={isMobile ? "h-10 w-10" : "h-12 w-12"}
                            >
                              <AvatarImage
                                src={conv.participant_profile?.avatar}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                {conv.participant_profile?.name?.charAt(0) ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <OnlineStatusIndicator
                                isOnline={conv.participant_profile?.is_online || false}
                                lastSeen={conv.participant_profile?.last_seen}
                                size={isMobile ? "sm" : "md"}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div
                                  className={`rounded bg-muted/50 ${isMobile ? "p-0.5" : "p-1"}`}
                                >
                                  {getTypeIcon(conv.type)}
                                </div>
                                <h4
                                  className={`font-semibold truncate text-foreground ${
                                    isMobile ? "text-sm" : "text-sm"
                                  }`}
                                >
                                  {conv.participant_profile?.name}
                                </h4>
                              </div>
                              <div className="flex flex-col items-end gap-1 ml-2">
                                <p
                                  className={`text-muted-foreground ${
                                    isMobile ? "text-xs" : "text-xs"
                                  }`}
                                >
                                  {formatMessageDate(conv.lastMessageAt)}
                                </p>
                                {(conv.unreadCount || 0) > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className={`text-xs ${
                                      isMobile
                                        ? "h-4 min-w-[16px] px-1"
                                        : "h-5 min-w-[20px] px-1.5"
                                    }`}
                                  >
                                    {conv.unreadCount > 99
                                      ? "99+"
                                      : conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Context info */}
                            {getContextInfo(conv) && (
                              <div className="flex items-center gap-1 mb-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                <p
                                  className={`text-primary font-medium ${
                                    isMobile ? "text-xs" : "text-xs"
                                  }`}
                                >
                                  {getContextInfo(conv)}
                                </p>
                              </div>
                            )}

                            <p
                              className={`text-muted-foreground truncate leading-relaxed ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              {conv.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`${isMobile ? "p-3" : "p-4"} text-center text-muted-foreground`}
                      >
                        <div className="space-y-2">
                          <MessageSquare
                            className={`mx-auto text-muted-foreground/50 ${
                              isMobile ? "h-8 w-8" : "h-12 w-12"
                            }`}
                          />
                          <p className={isMobile ? "text-sm" : "text-base"}>
                            {searchQuery
                              ? "No conversations found"
                              : `No ${activeTab} conversations yet`}
                          </p>
                          {!searchQuery && (
                            <p
                              className={`text-muted-foreground/70 ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              Start a new conversation to get started
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Chat Area - Responsive message area */}
          <div
            className={cn(
              "flex-1 bg-background flex flex-col",
              // Mobile: full width when chat selected or AI assistant, hidden otherwise
              isMobile &&
                !selectedChat &&
                activeTab !== "ai_assistant" &&
                "hidden",
              isMobile &&
                (selectedChat || activeTab === "ai_assistant") &&
                "w-full",
              // Desktop: always visible, takes remaining space
              !isMobile && "flex",
            )}
          >
            <Card className="w-full border-0 shadow-none h-full flex flex-col">
              <Tabs value={activeTab} className="h-full flex flex-col">
                <TabsContent
                  value="ai_assistant"
                  className="h-full mt-0 flex flex-col"
                >
                  <div className="flex flex-col h-full">
                    {/* Mobile back button for AI Assistant */}
                    {isMobile && (
                      <div className="border-b p-3 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("social")}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to chats
                        </Button>
                      </div>
                    )}
                    <div className="flex-1 min-h-0">
                      <AIAssistantChat />
                    </div>
                  </div>
                </TabsContent>

                {/* Other chat types */}
                {["social", "freelance", "marketplace", "p2p"].map(
                  (chatType) => (
                    <TabsContent
                      key={chatType}
                      value={chatType}
                      className="h-full mt-0 flex flex-col"
                    >
                      {selectedChat ? (
                        <>
                          <CardHeader
                            className={`pb-3 flex-shrink-0 ${isMobile ? "px-3 py-3" : "px-4 py-4"}`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Mobile back button */}
                                {isMobile && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedChat(null)}
                                    className="p-1 flex-shrink-0"
                                  >
                                    <ArrowLeft className="h-4 w-4" />
                                  </Button>
                                )}
                                <Avatar
                                  className={isMobile ? "h-8 w-8" : "h-10 w-10"}
                                >
                                  <AvatarImage
                                    src={
                                      selectedChat.participant_profile?.avatar
                                    }
                                  />
                                  <AvatarFallback>
                                    {selectedChat.participant_profile?.name?.charAt(
                                      0,
                                    ) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(selectedChat.type)}
                                    <CardTitle
                                      className={`truncate ${
                                        isMobile ? "text-sm" : "text-base"
                                      }`}
                                    >
                                      {selectedChat.participant_profile?.name}
                                    </CardTitle>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <OnlineStatusIndicator
                                      isOnline={selectedChat.participant_profile?.is_online || false}
                                      lastSeen={selectedChat.participant_profile?.last_seen}
                                      size="sm"
                                      showLabel={true}
                                    />
                                    {getContextInfo(selectedChat) && (
                                      <>
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                        <p
                                          className={`text-primary font-medium truncate ${
                                            isMobile ? "text-xs" : "text-sm"
                                          }`}
                                        >
                                          {getContextInfo(selectedChat)}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={isMobile ? "h-8 w-8" : "h-8 w-8"}
                                  onClick={handleStartVoiceCall}
                                  title="Start voice call"
                                  disabled={!selectedChat || !user || loading}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={isMobile ? "h-8 w-8" : "h-8 w-8"}
                                  onClick={handleStartVideoCall}
                                  title="Start video call"
                                  disabled={!selectedChat || !user || loading}
                                >
                                  <Video className="h-4 w-4" />
                                </Button>
                                {!isMobile && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        onClick={handleStartGroupVideo}
                                      >
                                        <Users className="w-4 h-4 mr-2" />
                                        Start Group Video
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add People
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Chat Info
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                            <ScrollArea
                              className={cn(
                                "flex-1 chat-scroll-area relative",
                                isMobile ? "px-3" : "px-4",
                              )}
                              style={{
                                height: isMobile
                                  ? "calc(100vh - 180px)"
                                  : "calc(100vh - 240px)",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                              }}
                            >
                              <div
                                className={`flex flex-col py-4 ${isMobile ? "gap-3" : "gap-4"}`}
                              >
                                {messages[selectedChat.id] &&
                                messages[selectedChat.id].length > 0 ? (
                                  messages[selectedChat.id].map(
                                    (msg, index) => {
                                      const prevMsg =
                                        messages[selectedChat.id]?.[index - 1];
                                      const isGrouped =
                                        prevMsg &&
                                        prevMsg.senderId === msg.senderId &&
                                        new Date(msg.timestamp).getTime() -
                                          new Date(
                                            prevMsg.timestamp,
                                          ).getTime() <
                                          300000; // 5 minutes

                                      return (
                                        <div
                                          key={msg.id}
                                          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                                          style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                          <EnhancedMessage
                                            message={msg}
                                            isCurrentUser={
                                              msg.senderId === user.id
                                            }
                                            isMobile={isMobile}
                                            onReply={handleReplyToMessage}
                                            onReact={handleReactToMessage}
                                            onEdit={handleEditMessage}
                                            onDelete={handleDeleteMessage}
                                            showAvatar={!isGrouped}
                                            groupWithPrevious={isGrouped}
                                          />
                                        </div>
                                      );
                                    },
                                  )
                                ) : (
                                  <div
                                    className={`text-center text-muted-foreground ${
                                      isMobile ? "p-6" : "p-8"
                                    }`}
                                  >
                                    <MessageSquare
                                      className={`mx-auto mb-3 text-muted-foreground/50 ${
                                        isMobile ? "h-8 w-8" : "h-12 w-12"
                                      }`}
                                    />
                                    <p
                                      className={
                                        isMobile ? "text-sm" : "text-base"
                                      }
                                    >
                                      No messages yet. Start the conversation!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>

                            {/* Typing Indicator */}
                            {typingUsers[selectedChat.id] && typingUsers[selectedChat.id].length > 0 && (
                              <TypingIndicator
                                users={typingUsers[selectedChat.id]}
                                isMobile={isMobile}
                              />
                            )}
                          </CardContent>

                          {/* Reply indicator */}
                          {replyToMessage && (
                            <div className="border-t border-b bg-muted/30 p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-8 bg-primary rounded-full" />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-primary">
                                    Replying to {replyToMessage.senderName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate max-w-48">
                                    {replyToMessage.content}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setReplyToMessage(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {/* WhatsApp-style Chat Input with Sticker Support */}
                          <WhatsAppChatInput
                            messageInput={messageInput}
                            setMessageInput={setMessageInput}
                            onSendMessage={handleSendEnhancedMessage}
                            isMobile={isMobile}
                            disabled={loading}
                            placeholder={`Message ${selectedChat?.participant_profile?.name || 'chat'}...`}
                          />
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                          <div className="text-center space-y-3">
                            <div
                              className={`mx-auto mb-4 bg-muted rounded-full flex items-center justify-center ${
                                isMobile ? "w-12 h-12" : "w-16 h-16"
                              }`}
                            >
                              {getTypeIcon(activeTab as UnifiedChatType)}
                            </div>
                            <h3
                              className={`font-medium ${
                                isMobile ? "text-base" : "text-lg"
                              }`}
                            >
                              {isMobile
                                ? `Select ${activeTab} chat`
                                : `Select a ${activeTab} conversation`}
                            </h3>
                            <p
                              className={`text-muted-foreground ${
                                isMobile ? "text-sm" : "text-base"
                              }`}
                            >
                              {isMobile
                                ? "Choose a conversation or start new"
                                : "Choose a conversation from the list or start a new one"}
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ),
                )}
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Voice/Video Call Modal */}
      {activeCall && (
        <VoiceVideoCall
          isOpen={!!activeCall}
          onClose={handleEndCall}
          callType={activeCall.type}
          participants={activeCall.participants}
          currentUser={activeCall.currentUser}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={handleEndCall}
          chatName={activeCall.chatInfo?.title}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <VoiceVideoCall
          isOpen={!!incomingCall}
          onClose={() => setIncomingCall(null)}
          callType={incomingCall.type}
          participants={[incomingCall.from]}
          currentUser={{
            id: user?.id || "",
            name: user?.profile?.full_name || user?.email || "",
            avatar: user?.profile?.avatar_url,
            isAudioMuted: isAudioMuted,
            isVideoEnabled:
              incomingCall.type === "video" ? isVideoEnabled : false,
            isScreenSharing: false,
            connectionQuality: "excellent" as const,
          }}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onEndCall={handleEndCall}
          chatName={incomingCall.chatInfo?.title}
          isIncoming={true}
          onAcceptCall={() => {
            // Accept the call and start the regular call interface
            setActiveCall({
              type: incomingCall.type,
              participants: [incomingCall.from],
              currentUser: {
                id: user?.id || "",
                name: user?.profile?.full_name || user?.email || "",
                avatar: user?.profile?.avatar_url,
                isAudioMuted: isAudioMuted,
                isVideoEnabled:
                  incomingCall.type === "video" ? isVideoEnabled : false,
                isScreenSharing: false,
                connectionQuality: "excellent" as const,
              },
              chatInfo: incomingCall.chatInfo,
            });
            setIncomingCall(null);
            toast({
              title: "Call Connected",
              description: "You are now connected to the call.",
            });
          }}
          onDeclineCall={() => {
            setIncomingCall(null);
            toast({
              title: "Call Declined",
              description: "You declined the incoming call.",
            });
          }}
        />
      )}

      {/* Group Video Room Modal */}
      {groupVideoRoom && (
        <GroupVideoRoom
          isOpen={!!groupVideoRoom}
          onClose={() => setGroupVideoRoom(null)}
          roomId={groupVideoRoom.roomId}
          roomName={groupVideoRoom.roomName}
          roomType={groupVideoRoom.roomType as any}
          participants={groupVideoRoom.participants}
          currentUser={groupVideoRoom.currentUser}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onLeaveRoom={() => {
            setGroupVideoRoom(null);
            toast({
              title: "Left Video Room",
              description: "You have left the group video room.",
            });
          }}
          onInviteUsers={() => {
            toast({
              title: "Invite Feature",
              description: "User invitation feature coming soon!",
            });
          }}
          isHost={true}
        />
      )}
    </div>
  );
};

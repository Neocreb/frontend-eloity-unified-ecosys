// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Phone,
  Video,
  Settings,
  Users,
  Crown,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatErrorBoundary } from "@/components/debug/ChatErrorBoundary";

// Import chat components
import { EnhancedMessage, EnhancedChatMessage } from "@/components/chat/EnhancedMessage";
import WhatsAppChatInput from "@/components/chat/WhatsAppChatInput";
import { VoiceVideoCall } from "@/components/chat/VoiceVideoCall";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineStatusIndicator } from "@/components/chat/OnlineStatusIndicator";
import { GroupInfoModal } from "@/components/chat/group/GroupInfoModal";

// Types
import { UnifiedChatThread, UnifiedChatType } from "@/types/unified-chat";
import { GroupChatThread } from "@/types/group-chat";

const ChatRoomContent = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const chatType = (searchParams.get("type") as UnifiedChatType) || "social";

  // State
  const [chat, setChat] = useState<UnifiedChatThread | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<EnhancedChatMessage | null>(null);

  // Call state
  const [activeCall, setActiveCall] = useState<{
    type: "voice" | "video" | "group";
    participants: any[];
    currentUser: any;
    chatInfo: any;
  } | null>(null);

  // Typing state
  const [typingUsers, setTypingUsers] = useState<Array<{id: string, name: string, avatar?: string}>>([]);

  // Generate chat data from ID
  const generateChatFromId = (chatId: string, type: UnifiedChatType): UnifiedChatThread => {
    // Predefined chat mappings for better user experience
    const chatMappings: Record<string, any> = {
      'social_1': {
        name: 'Alice Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100',
        lastMessage: 'Hey! How was your weekend?',
        isGroup: false,
        contextMessage: 'Hey! How was your weekend?'
      },
      'social_2': {
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        lastMessage: 'Thanks for the recommendation!',
        isGroup: false,
        contextMessage: 'Thanks for the recommendation!'
      },
      'social_group_1': {
        name: 'Family Group',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        lastMessage: "Let's plan the family dinner!",
        isGroup: true,
        groupName: 'Family Group',
        groupDescription: 'Family chat group',
        contextMessage: "Let's plan the family dinner!",
        participants: [
          { 
            id: 'user_1', 
            name: 'Alice', 
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100', 
            role: 'member', 
            joinedAt: new Date().toISOString(), 
            addedBy: 'current', 
            isActive: true, 
            isOnline: true 
          },
          { 
            id: 'user_2', 
            name: 'Bob', 
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 
            role: 'member', 
            joinedAt: new Date().toISOString(), 
            addedBy: 'current', 
            isActive: true, 
            isOnline: false 
          },
          {
            id: 'current',
            name: user?.profile?.full_name || 'You',
            avatar: user?.profile?.avatar_url,
            role: 'admin',
            joinedAt: new Date().toISOString(),
            addedBy: 'current',
            isActive: true,
            isOnline: true
          },
        ],
        adminIds: [user?.id || 'current']
      },
      'freelance_1': {
        name: 'TechStart Inc',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
        lastMessage: 'Can we discuss the project timeline?',
        isGroup: false,
        contextMessage: 'Hi! I saw your application for the web development project. Let\'s discuss the requirements.'
      },
      'freelance_2': {
        name: 'Design Agency',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        lastMessage: 'The mockups look great! When can you start?',
        isGroup: false,
        contextMessage: 'The mockups look great! When can you start?'
      },
      'marketplace_1': {
        name: 'Electronics Store',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        lastMessage: 'The laptop is still available. Are you interested?',
        isGroup: false,
        contextMessage: 'Hello! I\'m interested in the laptop you have listed. Is it still available?'
      },
      'marketplace_2': {
        name: 'Fashion Boutique',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        lastMessage: 'We have it in stock! Would you like to purchase?',
        isGroup: false,
        contextMessage: 'We have it in stock! Would you like to purchase?'
      },
      'crypto_1': {
        name: 'Bitcoin Trader',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        lastMessage: 'I can do 0.5 BTC at market rate. Deal?',
        isGroup: false,
        contextMessage: 'I can do 0.5 BTC at market rate. Deal?'
      },
      'crypto_2': {
        name: 'ETH Exchanger',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        lastMessage: 'Payment confirmed. When can we complete the trade?',
        isGroup: false,
        contextMessage: 'Payment confirmed. When can we complete the trade?'
      }
    };

    const chatData = chatMappings[chatId] || {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} User`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      lastMessage: 'Hello! How can I help you?',
      isGroup: false,
      contextMessage: 'Hello! How can I help you?'
    };

    const baseChat: UnifiedChatThread = {
      id: chatId,
      type: type,
      referenceId: null,
      lastMessage: chatData.lastMessage,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isGroup: chatData.isGroup,
      unreadCount: 0,
    };

    if (chatData.isGroup) {
      return {
        ...baseChat,
        isGroup: true,
        groupName: chatData.groupName || chatData.name,
        groupDescription: chatData.groupDescription,
        participants: chatData.participants || [
          {
            id: 'current',
            name: user?.profile?.full_name || 'You',
            avatar: user?.profile?.avatar_url,
            role: 'admin' as const,
            joinedAt: new Date().toISOString(),
            addedBy: 'current',
            isActive: true,
            isOnline: true,
          }
        ],
        adminIds: chatData.adminIds || ['current'],
        createdBy: 'current',
        createdAt: new Date().toISOString(),
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
        category: 'friends',
        totalMessages: 0,
      } as GroupChatThread;
    } else {
      return {
        ...baseChat,
        participant_profile: {
          id: `user_${chatId.split('_')[1] || Date.now()}`,
          name: chatData.name,
          avatar: chatData.avatar,
          is_online: Math.random() > 0.3, // More likely to be online
        }
      };
    }
  };

  // Load chat data
  useEffect(() => {
    if (!threadId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      console.error("Chat loading timeout");
      setLoading(false);
      toast({
        title: "Loading Timeout",
        description: "Chat took too long to load. Please try again.",
        variant: "destructive",
      });
    }, 5000);

    const loadChatData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Try to get conversation data from localStorage (passed from chat list)
        let chatData: UnifiedChatThread | null = null;

        try {
          const conversationData = localStorage.getItem(`chat_${threadId}`);
          if (conversationData) {
            chatData = JSON.parse(conversationData);
          }
        } catch (error) {
          console.error("Error parsing conversation data:", error);
        }

        // Generate chat data based on threadId and chatType if not found
        if (!chatData) {
          chatData = generateChatFromId(threadId, chatType);
        }

        // Basic validation and enhancement for group chats
        if (chatData.isGroup) {
          const groupData = chatData as GroupChatThread;
          if (!groupData.participants || groupData.participants.length === 0) {
            console.warn("Group chat has no participants, this might cause errors");
          }

          // Ensure all required fields are present for group chats
          if (!groupData.groupType) {
            (chatData as GroupChatThread).groupType = 'private';
          }
          if (!groupData.category) {
            (chatData as GroupChatThread).category = 'friends';
          }
          if (!groupData.settings) {
            (chatData as GroupChatThread).settings = {
              whoCanSendMessages: 'everyone',
              whoCanAddMembers: 'everyone',
              whoCanEditGroupInfo: 'admins_only',
              whoCanRemoveMembers: 'admins_only',
              disappearingMessages: false,
              allowMemberInvites: true,
              showMemberAddNotifications: true,
              showMemberExitNotifications: true,
              muteNonAdminMessages: false,
            };
          }
          if (!groupData.createdAt) {
            (chatData as GroupChatThread).createdAt = new Date().toISOString();
          }
          if (!groupData.createdBy) {
            (chatData as GroupChatThread).createdBy = 'current';
          }
          if (!groupData.adminIds) {
            (chatData as GroupChatThread).adminIds = ['current'];
          }
          if (!groupData.maxParticipants) {
            (chatData as GroupChatThread).maxParticipants = 256;
          }
        }

        // Generate contextual messages based on chat data
        const mockMessages: EnhancedChatMessage[] = [];

        try {
          if (chatData.isGroup) {
            const groupChat = chatData as GroupChatThread;
            // Group chat messages
            mockMessages.push({
              id: "msg_1",
              senderId: "user_1",
              senderName: "Alice",
              senderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b9a5f4b0?w=100",
              content: "Let's plan the family dinner!",
              type: "text",
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
              status: "read",
              reactions: [],
            });

            mockMessages.push({
              id: "msg_2",
              senderId: "user_2",
              senderName: "Bob",
              senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
              content: "Great idea! What date works for everyone?",
              type: "text",
              timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
              status: "read",
              reactions: [],
            });

            mockMessages.push({
              id: "msg_3",
              senderId: user?.id || "current",
              senderName: user?.profile?.full_name || user?.email || "You",
              senderAvatar: user?.profile?.avatar_url,
              content: "How about this Saturday evening?",
              type: "text",
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              status: "read",
              reactions: [],
            });
          } else {
            // Direct chat messages
            const contextMessage = chatData.lastMessage || getContextualMessage(chatType);

            mockMessages.push({
              id: "msg_1",
              senderId: chatData.participant_profile?.id || "user_1",
              senderName: chatData.participant_profile?.name || "User",
              senderAvatar: chatData.participant_profile?.avatar,
              content: contextMessage,
              type: "text",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              status: "read",
              reactions: [],
            });

            mockMessages.push({
              id: "msg_2",
              senderId: user?.id || "current",
              senderName: user?.profile?.full_name || user?.email || "You",
              senderAvatar: user?.profile?.avatar_url,
              content: "Hello! I'm interested in discussing this further.",
              type: "text",
              timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
              status: "read",
              reactions: [],
            });
          }
        } catch (error) {
          console.error("Error generating messages:", error);
          // Fallback to basic message
          mockMessages.push({
            id: "msg_1",
            senderId: user?.id || "current",
            senderName: user?.profile?.full_name || user?.email || "You",
            senderAvatar: user?.profile?.avatar_url,
            content: "Hello!",
            type: "text",
            timestamp: new Date().toISOString(),
            status: "read",
            reactions: [],
          });
        }

        setChat(chatData);
        setMessages(mockMessages);
        setLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error loading chat:", error);
        setLoading(false);
        clearTimeout(timeoutId);
        toast({
          title: "Error",
          description: "Failed to load chat. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadChatData();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [threadId, chatType, user?.id, toast]);

  const getContextualMessage = (type: UnifiedChatType) => {
    switch (type) {
      case "freelance":
        return "Hi! I saw your application for the web development project. Let's discuss the requirements.";
      case "marketplace":
        return "Hello! I'm interested in the laptop you have listed. Is it still available?";
      case "crypto":
        return "Hey! I'd like to trade some Bitcoin. Are you interested in the offer I posted?";
      default:
        return "Hey! How are you doing?";
    }
  };

  const getPageTitle = () => {
    if (!chat) return "Chat | Eloity";
    
    const contextPrefix = chatType === "freelance" ? "Work Chat" :
                         chatType === "marketplace" ? "Marketplace Chat" :
                         chatType === "crypto" ? "P2P Chat" : "Chat";
    
    const chatName = chat.isGroup 
      ? (chat as GroupChatThread).groupName 
      : chat.participant_profile?.name;
    
    return `${contextPrefix} with ${chatName} | Eloity`;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !chat) return;

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

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    setReplyToMessage(null);

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
      ));
    }, 1000);
  };

  const handleCall = (type: 'voice' | 'video') => {
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

  const handleReplyToMessage = (message: EnhancedChatMessage) => {
    setReplyToMessage(message);
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => 
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
        : msg
    ));
  };

  // Early return if no threadId
  if (!threadId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No chat selected</h2>
          <Button onClick={() => navigate("/app/chat")}>
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Chat not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The chat you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/app/chat")}>
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  const displayName = chat.isGroup 
    ? (chat as GroupChatThread).groupName 
    : chat.participant_profile?.name;

  const isOnline = chat.isGroup 
    ? (chat as GroupChatThread).participants.some(p => p.isOnline)
    : chat.participant_profile?.is_online;

  const statusText = chat.isGroup 
    ? `${(chat as GroupChatThread).participants.filter(p => p.isActive).length} members`
    : (isOnline ? "Online" : "Last seen recently");

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta
          name="description"
          content={`Chat conversation with ${displayName}`}
        />
      </Helmet>

      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/chat")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {displayName}
                </h3>
                {chatType !== "social" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {chatType === "freelance" ? "💼 Work" :
                     chatType === "marketplace" ? "🛒 Market" : "🪙 P2P"}
                  </span>
                )}
                {chat.isGroup && (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {statusText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCall('voice')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleCall('video')}
            >
              <Video className="h-4 w-4" />
            </Button>
            {chat.isGroup && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowGroupInfo(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <EnhancedMessage
                key={message.id}
                message={message}
                currentUserId={user?.id || ""}
                onReact={(emoji) => handleReactToMessage(message.id, emoji)}
                onReply={() => handleReplyToMessage(message)}
                onEdit={() => {}}
                onDelete={() => {}}
                showAvatar={chat.isGroup}
                isGroupMessage={chat.isGroup}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 pb-2">
            <TypingIndicator users={typingUsers} />
          </div>
        )}

        {/* Online Status */}
        {!chat.isGroup && chat.participant_profile && (
          <div className="px-4 pb-2">
            <OnlineStatusIndicator 
              isOnline={chat.participant_profile.is_online || false}
              lastSeen={chat.lastMessageAt}
            />
          </div>
        )}

        {/* Message Input */}
        <div className="bg-background">
          <WhatsAppChatInput
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={(type, content, metadata) => {
              if (type === "text") {
                handleSendMessage();
              } else {
                // Handle other message types
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

                setMessages(prev => [...prev, newMessage]);
              }
            }}
            isMobile={isMobile}
            placeholder={`Message ${displayName}...`}
            currentUserId={user?.id}
          />
        </div>
      </div>

      {/* Active Call */}
      {activeCall && (
        <VoiceVideoCall
          type={activeCall.type}
          participants={activeCall.participants}
          currentUser={activeCall.currentUser}
          chatInfo={activeCall.chatInfo}
          onEndCall={() => setActiveCall(null)}
          isAudioMuted={false}
          isVideoEnabled={true}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
        />
      )}

      {/* Group Info Modal - Only render if we have proper group data */}
      {chat?.isGroup && (chat as GroupChatThread).participants && showGroupInfo && (
        <GroupInfoModal
          trigger={<div />}
          group={chat as GroupChatThread}
          currentUserId={user?.id || "current"}
          onUpdateGroup={async (request) => {
            console.log("Updating group with:", request);
            try {
              if (chat && chat.isGroup) {
                const updatedChat = {
                  ...chat as GroupChatThread,
                  groupName: request.name || (chat as GroupChatThread).groupName,
                  groupDescription: request.description || (chat as GroupChatThread).groupDescription,
                  groupAvatar: request.avatar || (chat as GroupChatThread).groupAvatar,
                };
                setChat(updatedChat);
                console.log("Group updated successfully");
              }
            } catch (error) {
              console.error("Error updating group:", error);
            }
          }}
          isOpen={showGroupInfo}
          onOpenChange={setShowGroupInfo}
        />
      )}
    </>
  );
};

const ChatRoom = () => {
  const navigate = useNavigate();

  return (
    <ChatErrorBoundary
      onRetry={() => window.location.reload()}
      onGoBack={() => navigate('/app/chat')}
    >
      <ChatRoomContent />
    </ChatErrorBoundary>
  );
};

export default ChatRoom;

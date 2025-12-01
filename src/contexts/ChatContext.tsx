// @ts-nocheck
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { ChatConversation, ChatMessage } from "@/types/user";
import {
  UnifiedChatType,
  UnifiedChatThread,
  UnifiedChatContextData,
} from "@/types/unified-chat";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

type ChatContextType = {
  conversations: ChatConversation[];
  unifiedConversations: UnifiedChatThread[];
  messages: Record<string, ChatMessage[]>;
  selectedChat: ChatConversation | null;
  selectedUnifiedChat: UnifiedChatThread | null;
  messageInput: string;
  activeTab: UnifiedChatType;
  setMessageInput: (input: string) => void;
  setSelectedChat: (chat: ChatConversation | null) => void;
  setSelectedUnifiedChat: (chat: UnifiedChatThread | null) => void;
  setActiveTab: (tab: UnifiedChatType) => void;
  sendMessage: (content: string) => void;
  markAsRead: (chatId: string) => void;
  startNewChat: (
    userId: string,
    initialMessage?: string,
    type?: UnifiedChatType,
  ) => void;
  searchConversations: (query: string) => ChatConversation[];
  unreadCount: number;
  getUnifiedConversations: (type?: UnifiedChatType) => UnifiedChatThread[];
  handleNotificationChat: (notification: {
    type:
      | "freelance_application"
      | "marketplace_inquiry"
      | "trade_request"
      | "social_mention";
    fromUserId: string;
    referenceId?: string;
    metadata?: any;
  }) => Promise<string | null>;
};

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [unifiedConversations, setUnifiedConversations] = useState<
    UnifiedChatThread[]
  >([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    null,
  );
  const [selectedUnifiedChat, setSelectedUnifiedChat] =
    useState<UnifiedChatThread | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<UnifiedChatType>("social");

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // Get all conversations where the current user is a participant
        const { data: conversationsData, error } = await supabase
          .from("chat_conversations")
          .select("*")
          .contains("participants", [user.id]);

        if (error) {
          console.error("Error loading conversations:", error);
          return;
        }

        // For each conversation, find the other participant's profile
        const formattedConversations: ChatConversation[] = [];

        for (const conv of conversationsData) {
          // Find the other participant (not the current user)
          const otherParticipantId = conv.participants.find(
            (id) => id !== user.id,
          );

          if (!otherParticipantId) continue;

          // Get the other participant's profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", otherParticipantId)
            .maybeSingle();

          if (profileError) {
            console.error("Error loading participant profile:", profileError);
            continue;
          }

          if (!profileData) {
            console.warn("No profile data found for participant:", otherParticipantId);
            continue;
          }

          // Get unread count for this conversation
          const { count: unreadCount, error: countError } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("read", false)
            .neq("sender_id", user.id);

          if (countError) {
            console.error("Error getting unread count:", countError);
          }

          // Get the last message for this conversation
          const { data: lastMessageArray, error: lastMessageError } =
            await supabase
              .from("chat_messages")
              .select("*")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1);

          const lastMessageData = lastMessageArray?.[0] || null;

          formattedConversations.push({
            id: conv.id,
            participants: conv.participants,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            unread_count: unreadCount || 0,
            last_message: lastMessageData
              ? {
                  id: lastMessageData.id,
                  content: lastMessageData.content,
                  sender_id: lastMessageData.sender_id,
                  conversation_id: lastMessageData.conversation_id,
                  created_at: lastMessageData.created_at,
                  read: lastMessageData.read,
                }
              : undefined,
            participant_profile: {
              id: otherParticipantId,
              name: profileData.full_name || profileData.username || "User",
              avatar: profileData.avatar_url || "/placeholder.svg",
              is_online: false, // TODO: Implement online status tracking
            },
          });
        }

        setConversations(formattedConversations);

        // Load messages for each conversation
        formattedConversations.forEach((conv) => {
          loadMessages(conv.id);
        });
      } catch (error) {
        console.error("Error in loadConversations:", error);
      }
    };

    loadConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel("chat_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Only process messages for conversations the user is part of
          if (conversations.some((c) => c.id === newMessage.conversation_id)) {
            handleNewMessage(newMessage);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*, sender:sender_id(full_name, username, avatar_url)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      const formattedMessages: ChatMessage[] = data.map((msg) => {
        // Extract sender information from the view
        const senderName = msg.full_name || msg.username || "Unknown";
        const senderAvatar = msg.avatar_url || "/placeholder.svg";

        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
          created_at: msg.created_at,
          read: msg.read,
          sender: {
            name: senderName,
            avatar: senderAvatar,
          },
        };
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    // Update messages
    setMessages((prev) => ({
      ...prev,
      [message.conversation_id]: [
        ...(prev[message.conversation_id] || []),
        message,
      ],
    }));

    // Update conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversation_id
          ? {
              ...conv,
              last_message: message,
              unread_count:
                message.sender_id !== user?.id
                  ? (conv.unread_count || 0) + 1
                  : conv.unread_count,
            }
          : conv,
      ),
    );
  };

  // Calculate unread count
  const unreadCount = conversations.reduce(
    (count, conv) => count + (conv.unread_count || 0),
    0,
  );

  const sendMessage = async (content: string) => {
    if (!selectedChat || !content.trim() || !user) return;

    try {
      const { data: message, error } = await supabase
        .from("chat_messages")
        .insert({
          content: content.trim(),
          sender_id: user.id,
          conversation_id: selectedChat.id,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Format the message with sender information from the view
      const newMessage: ChatMessage = {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        conversation_id: message.conversation_id,
        created_at: message.created_at,
        read: message.read,
        sender: {
          name: user.full_name || user.username || "User",
          avatar: user.avatar_url || "/placeholder.svg",
        },
      };

      handleNewMessage(newMessage);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", chatId)
        .neq("sender_id", user.id);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === chatId ? { ...conv, unread_count: 0 } : conv,
        ),
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const startNewChat = async (
    userId: string,
    initialMessage?: string,
    type: UnifiedChatType = "social",
  ) => {
    if (!user) return;

    try {
      // Check if chat already exists
      const existingChat = conversations.find(
        (conv) =>
          conv.participants.includes(userId) &&
          conv.participants.includes(user.id),
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        if (initialMessage) {
          setMessageInput(initialMessage);
        }
        return;
      }

      // Get the other user's profile
      const { data: otherUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      // Create new conversation
      const { data: conversation, error } = await supabase
        .from("chat_conversations")
        .insert({
          participants: [user.id, userId],
        })
        .select()
        .single();

      if (error) throw error;

      const newChat: ChatConversation = {
        ...conversation,
        unread_count: 0,
        participant_profile: {
          id: userId,
          name:
            otherUserProfile.full_name || otherUserProfile.username || "User",
          avatar: otherUserProfile.avatar_url || "/placeholder.svg",
          is_online: false,
        },
      };

      // Also create unified chat entry
      const newUnifiedChat: UnifiedChatThread = {
        id: conversation.id,
        type,
        referenceId: null,
        participants: [user.id, userId],
        lastMessage: initialMessage || "",
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGroup: false,
        createdAt: new Date().toISOString(),
        unreadCount: 0,
        participant_profile: newChat.participant_profile,
      };

      setConversations((prev) => [newChat, ...prev]);
      setUnifiedConversations((prev) => [newUnifiedChat, ...prev]);
      setSelectedChat(newChat);
      setSelectedUnifiedChat(newUnifiedChat);

      if (initialMessage) {
        setMessageInput(initialMessage);
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
      toast({
        title: "Error",
        description: "Could not start new chat",
        variant: "destructive",
      });
    }
  };

  const getUnifiedConversations = (type?: UnifiedChatType) => {
    if (!type || type === "all") {
      return unifiedConversations;
    }
    return unifiedConversations.filter((conv) => conv.type === type);
  };

  // Handle real-time notifications and create chats
  const handleNotificationChat = async (notification: {
    type:
      | "freelance_application"
      | "marketplace_inquiry"
      | "trade_request"
      | "social_mention";
    fromUserId: string;
    referenceId?: string;
    metadata?: any;
  }) => {
    const { type, fromUserId, referenceId, metadata } = notification;

    try {
      // Check if chat already exists
      const existingChat = conversations.find(
        (conv) =>
          conv.participants.includes(fromUserId) &&
          conv.participants.includes(user?.id || "") &&
          (referenceId ? conv.referenceId === referenceId : true),
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        return existingChat.id;
      }

      // Create new chat based on notification type
      let chatType: UnifiedChatType;
      let contextData: UnifiedChatContextData = {};
      let initialMessage = "";

      switch (type) {
        case "freelance_application":
          chatType = "freelance";
          contextData = {
            jobTitle: metadata?.jobTitle,
            jobBudget: metadata?.jobBudget,
            projectStatus: "proposal",
          };
          initialMessage = `Hi! I'm interested in your job posting: ${metadata?.jobTitle}`;
          break;

        case "marketplace_inquiry":
          chatType = "marketplace";
          contextData = {
            productName: metadata?.productName,
            productPrice: metadata?.productPrice,
            productImage: metadata?.productImage,
          };
          initialMessage = `Hi! I'm interested in your product: ${metadata?.productName}`;
          break;

        case "trade_request":
          chatType = "p2p";
          contextData = {
            tradeAmount: metadata?.amount,
            cryptoType: metadata?.crypto,
            tradeStatus: "initiated",
          };
          initialMessage = `Hi! I'd like to discuss a ${metadata?.crypto} trade`;
          break;

        case "social_mention":
          chatType = "social";
          contextData = {
            relationshipType: "friend",
          };
          initialMessage = "Hi! 👋";
          break;

        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      // Create new unified chat
      const newThread: UnifiedChatThread = {
        id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: chatType,
        referenceId: referenceId || null,
        participants: [user?.id || "", fromUserId],
        lastMessage: initialMessage,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGroup: false,
        createdAt: new Date().toISOString(),
        unreadCount: 1,
        contextData,
      };

      setUnifiedConversations((prev) => [newThread, ...prev]);
      setActiveTab(chatType);

      return newThread.id;
    } catch (error) {
      console.error("Error handling notification chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat from notification",
        variant: "destructive",
      });
      return null;
    }
  };

  const searchConversations = (query: string) => {
    if (!query) return conversations;

    const normalizedQuery = query.toLowerCase();
    return conversations.filter((conv) => {
      const participantName =
        conv.participant_profile?.name?.toLowerCase() || "";
      const lastMessageContent =
        conv.last_message?.content?.toLowerCase() || "";

      return (
        participantName.includes(normalizedQuery) ||
        lastMessageContent.includes(normalizedQuery)
      );
    });
  };

  const contextValue: ChatContextType = {
    conversations,
    unifiedConversations,
    messages,
    selectedChat,
    selectedUnifiedChat,
    messageInput,
    activeTab,
    setMessageInput,
    setSelectedChat,
    setSelectedUnifiedChat,
    setActiveTab,
    sendMessage,
    markAsRead,
    startNewChat,
    searchConversations,
    unreadCount,
    getUnifiedConversations,
    handleNotificationChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

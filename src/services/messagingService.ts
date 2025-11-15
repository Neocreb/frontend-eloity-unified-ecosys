// @ts-nocheck
// @ts-nocheck
import { supabase } from "@/lib/supabase/client";

export interface ChatMessage {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    name: string;
    username: string;
    avatar: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
  other_user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

export const messagingService = {
  // Create or get existing conversation between two users
  async getOrCreateConversation(
    userId1: string,
    userId2: string,
  ): Promise<string | null> {
    try {
      // Check if conversation already exists
      const { data: existingConv, error: searchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .contains("participants", [userId1])
        .contains("participants", [userId2])
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("chat_conversations")
        .insert({
          participants: [userId1, userId2],
        })
        .select("id")
        .single();

      if (createError) throw createError;
      return newConv?.id || null;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      return null;
    }
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      // Get sender profile information
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("user_id", senderId)
        .single();

      return {
        id: data.id,
        sender_id: data.sender_id,
        conversation_id: data.conversation_id,
        content: data.content,
        created_at: data.created_at,
        read: data.read,
        sender: senderProfile
          ? {
              name: senderProfile.full_name || senderProfile.username || "Unknown",
              username: senderProfile.username || "unknown",
              avatar: senderProfile.avatar_url || "/placeholder.svg",
            }
          : undefined,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  },

  // Get messages for a conversation
  async getMessages(
    conversationId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      // Handle sample conversation
      if (conversationId === "sample-conversation-1") {
        return [
          {
            id: "sample-message-1",
            sender_id: "sample-user-1",
            conversation_id: "sample-conversation-1",
            content:
              "Hey! Welcome to Eloity messaging. This is a sample conversation for testing.",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            sender: {
              name: "Eloity Bot",
              username: "eloity_bot",
              avatar:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
            },
          },
          {
            id: "sample-message-2",
            sender_id: "sample-user-1",
            conversation_id: "sample-conversation-1",
            content:
              "You can now send real messages and they will be stored in the database.",
            created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            read: false,
            sender: {
              name: "Eloity Bot",
              username: "eloity_bot",
              avatar:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
            },
          },
        ];
      }

      const { data: messages, error } = await supabase
        .from("chat_messages_with_profiles")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get unique sender IDs
      const senderIds = [
        ...new Set(messages?.map((msg) => msg.sender_id) || []),
      ];

      // Get sender profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(
        profiles?.map((profile) => [
          profile.user_id,
          {
            name: profile.name || "Unknown",
            username: profile.username || "unknown",
            avatar: profile.avatar_url || "/placeholder.svg",
          },
        ]) || [],
      );

      return (messages || [])
        .map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          conversation_id: msg.conversation_id,
          content: msg.content,
          created_at: msg.created_at,
          read: msg.read,
          sender: profileMap.get(msg.sender_id),
        }))
        .reverse();
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  },

  // Get user's conversations
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .contains("participants", [userId])
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Add sample conversation for testing if no conversations exist
      const sampleConversation: ChatConversation = {
        id: "sample-conversation-1",
        participants: [userId, "sample-user-1"],
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        last_message: {
          id: "sample-message-1",
          sender_id: "sample-user-1",
          conversation_id: "sample-conversation-1",
          content:
            "Hey! Welcome to Eloity messaging. This is a sample conversation for testing.",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          sender: {
            name: "Eloity Bot",
            username: "eloity_bot",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
          },
        },
        unread_count: 1,
        other_user: {
          id: "sample-user-1",
          name: "Eloity Bot",
          username: "eloity_bot",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
        },
      };

      const conversationsWithDetails = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from("chat_messages_with_profiles")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("chat_messages_with_profiles")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", userId)
            .eq("read", false);

          // Get other user info
          const otherUserId = conv.participants.find((id) => id !== userId);
          let otherUser = undefined;

          if (otherUserId) {
            const { data: otherUserProfile } = await supabase
              .from("profiles")
              .select("user_id, full_name, username, avatar_url")
              .eq("user_id", otherUserId)
              .single();

            if (otherUserProfile) {
              otherUser = {
                id: otherUserProfile.user_id,
                name: otherUserProfile.full_name || "Unknown",
                username: otherUserProfile.username || "unknown",
                avatar: otherUserProfile.avatar_url || "/placeholder.svg",
              };
            }
          }

          // Get sender info for last message if exists
          let lastMessageWithSender = undefined;
          if (lastMessage) {
            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("full_name, username, avatar_url")
              .eq("user_id", lastMessage.sender_id)
              .single();

            lastMessageWithSender = {
              id: lastMessage.id,
              sender_id: lastMessage.sender_id,
              conversation_id: lastMessage.conversation_id,
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              read: lastMessage.read,
              sender: senderProfile
                ? {
                    name: senderProfile.full_name || "Unknown",
                    username: senderProfile.username || "unknown",
                    avatar: senderProfile.avatar_url || "/placeholder.svg",
                  }
                : undefined,
            };
          }

          return {
            id: conv.id,
            participants: conv.participants,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message: lastMessageWithSender,
            unread_count: unreadCount || 0,
            other_user: otherUser,
          };
        }),
      );

      // Include sample conversation if no real conversations exist
      if (conversationsWithDetails.length === 0) {
        return [sampleConversation];
      }

      return conversationsWithDetails;
    } catch (error) {
      console.error("Error getting conversations:", error);
      // Return sample conversation on error for testing
      return [
        {
          id: "sample-conversation-1",
          participants: [userId, "sample-user-1"],
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          last_message: {
            id: "sample-message-1",
            sender_id: "sample-user-1",
            conversation_id: "sample-conversation-1",
            content:
              "Hey! Welcome to Eloity messaging. This is a sample conversation for testing.",
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            sender: {
              name: "Eloity Bot",
              username: "eloity_bot",
              avatar:
                "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
            },
          },
          unread_count: 1,
          other_user: {
            id: "sample-user-1",
            name: "Eloity Bot",
            username: "eloity_bot",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eloity",
          },
        },
      ];
    }
  },

  // Mark messages as read
  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("read", false);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },
};

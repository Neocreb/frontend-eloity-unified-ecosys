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
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// REAL DATABASE IMPLEMENTATION
// ============================================================================
// This service now uses Supabase for all chat operations
// No more mock data - all queries hit the real database
// ============================================================================

export const chatService = {
  // Get all chat threads for a user
  async getChatThreads(filter?: ChatFilter): Promise<ChatThread[]> {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user ?? null;
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_participants!inner(user_id, last_read_message_id),
          chat_messages!chat_conversations_last_message_id_fkey(
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .contains('participants', [user.id])
        .eq('is_archived', false)
        .order('last_activity', { ascending: false });

      const { data: conversations, error } = await query;

      if (error) throw error;

      // Transform to ChatThread format
      const threads: ChatThread[] = (conversations || []).map((conv: any) => {
        const participant = (conv.chat_participants || []).find((p: any) => p.user_id === user.id);
        const unreadCount = participant?.last_read_message_id ? 0 : 1; // Simplified unread logic

        return {
          id: conv.id,
          type: conv.type === 'group' ? 'social' : 'freelance', // Map to your types
          referenceId: conv.settings?.referenceId || null,
          participants: conv.participants,
          lastMessage: conv.chat_messages?.[0]?.content || '',
          lastMessageAt: conv.last_activity,
          updatedAt: conv.updated_at,
          isGroup: conv.type === 'group',
          groupName: conv.name,
          groupAvatar: conv.avatar,
          createdAt: conv.created_at,
          unreadCount,
          contextData: conv.settings || {},
        };
      });

      // Apply filters
      let filtered = threads;
      
      if (filter?.type && filter.type !== 'all') {
        filtered = filtered.filter(t => t.type === filter.type);
      }
      
      if (filter?.unreadOnly) {
        filtered = filtered.filter(t => (t.unreadCount || 0) > 0);
      }
      
      if (filter?.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
          t.lastMessage?.toLowerCase().includes(query) ||
          t.groupName?.toLowerCase().includes(query)
        );
      }

      return filtered;
    } catch (error) {
      console.error('Error fetching chat threads:', error);
      return [];
    }
  },

  // Get a specific chat thread
  async getChatThread(threadId: string): Promise<ChatThread | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_messages!chat_conversations_last_message_id_fkey(content, created_at)
        `)
        .eq('id', threadId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        type: data.type === 'group' ? 'social' : 'freelance',
        referenceId: data.settings?.referenceId || null,
        participants: data.participants,
        lastMessage: data.chat_messages?.content || '',
        lastMessageAt: data.last_activity,
        updatedAt: data.updated_at,
        isGroup: data.type === 'group',
        groupName: data.name,
        groupAvatar: data.avatar,
        createdAt: data.created_at,
        unreadCount: 0,
        contextData: data.settings || {},
      };
    } catch (error) {
      console.error('Error fetching chat thread:', error);
      return null;
    }
  },

  // Create a new chat thread
  async createChatThread(request: StartChatRequest): Promise<ChatThread> {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user ?? null;
      if (!user) throw new Error("Not authenticated");

      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          type: request.groupName ? 'group' : 'direct',
          name: request.groupName,
          participants: request.participants,
          created_by: user.id,
          settings: request.contextData,
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants
      const participantInserts = request.participants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member',
      }));

      await supabase.from('chat_participants').insert(participantInserts);

      // Send initial message if provided
      if (request.initialMessage) {
        await this.sendMessage({
          threadId: conversation.id,
          content: request.initialMessage,
          messageType: 'text',
        });
      }

      return {
        id: conversation.id,
        type: request.type,
        referenceId: request.referenceId,
        participants: request.participants,
        lastMessage: request.initialMessage || '',
        lastMessageAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        isGroup: !!request.groupName,
        groupName: request.groupName,
        createdAt: conversation.created_at,
        unreadCount: 0,
        contextData: request.contextData,
      };
    } catch (error) {
      console.error('Error creating chat thread:', error);
      throw error;
    }
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
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!sender_id(id, user_metadata)
        `)
        .eq('conversation_id', threadId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (messages || []).map((msg: any) => ({
        id: msg.id,
        threadId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: msg.created_at,
        readBy: msg.read_by || [],
        messageType: msg.message_type,
        attachments: msg.attachments,
        replyTo: msg.reply_to_id,
        reactions: msg.reactions,
        metadata: msg.metadata,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Send a message
  async sendMessage(request: SendMessageRequest & { currentUserId?: string }): Promise<ChatMessage> {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user ?? null;
      if (!user) throw new Error("Not authenticated");

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: request.threadId,
          sender_id: user.id,
          content: request.content,
          message_type: request.messageType || 'text',
          attachments: request.attachments,
          reply_to_id: request.replyTo,
          metadata: request.metadata,
          read_by: [user.id],
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last activity and last message
      await supabase
        .from('chat_conversations')
        .update({
          last_message_id: message.id,
          last_activity: new Date().toISOString(),
        })
        .eq('id', request.threadId);

      return {
        id: message.id,
        threadId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        timestamp: message.created_at,
        readBy: [user.id],
        messageType: message.message_type,
        attachments: message.attachments,
        replyTo: message.reply_to_id,
        metadata: message.metadata,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(threadId: string, userId: string): Promise<void> {
    try {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, read_by')
        .eq('conversation_id', threadId)
        .eq('is_deleted', false);

      if (!messages) return;

      // Update messages that haven't been read by this user
      for (const message of messages) {
        const readBy = message.read_by || [];
        if (!readBy.includes(userId)) {
          await supabase
            .from('chat_messages')
            .update({ read_by: [...readBy, userId] })
            .eq('id', message.id);
        }
      }

      // Update participant's last read
      await supabase
        .from('chat_participants')
        .update({
          last_read_at: new Date().toISOString(),
        })
        .eq('conversation_id', threadId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },

  // Get notifications
  async getNotifications(userId: string): Promise<ChatNotification[]> {
    try {
      // Get unread messages from conversations user is part of
      const { data: unreadMessages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          conversation:chat_conversations!inner(type, name, participants),
          sender:users!sender_id(id, user_metadata)
        `)
        .contains('conversation.participants', [userId])
        .not('sender_id', 'eq', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (unreadMessages || []).map((msg: any) => ({
        id: msg.id,
        threadId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: msg.sender?.user_metadata?.name || 'User',
        message: msg.content,
        timestamp: msg.created_at,
        type: msg.conversation?.type || 'social',
        contextInfo: msg.conversation?.name || '',
        isRead: (msg.read_by || []).includes(userId),
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const userRes = await supabase.auth.getUser();
      const user = userRes?.data?.user ?? null;
      if (!user) return;

      const { data: message } = await supabase
        .from('chat_messages')
        .select('read_by')
        .eq('id', notificationId)
        .single();

      if (message) {
        const readBy = message.read_by || [];
        if (!readBy.includes(user.id)) {
          await supabase
            .from('chat_messages')
            .update({ read_by: [...readBy, user.id] })
            .eq('id', notificationId);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Search messages
  async searchMessages(query: string, threadId?: string): Promise<ChatMessage[]> {
    try {
      let searchQuery = supabase
        .from('chat_messages')
        .select('*')
        .ilike('content', `%${query}%`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (threadId) {
        searchQuery = searchQuery.eq('conversation_id', threadId);
      }

      const { data: messages, error } = await searchQuery;

      if (error) throw error;

      return (messages || []).map((msg: any) => ({
        id: msg.id,
        threadId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        timestamp: msg.created_at,
        readBy: msg.read_by || [],
        messageType: msg.message_type,
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  },

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.user_id,
        name: data.full_name || data.username,
        avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'User')}`,
        isOnline: false, // Would need presence system
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Send typing indicator
  async sendTypingIndicator(threadId: string, userId: string): Promise<void> {
    // Implement with Supabase realtime presence
    console.log(`User ${userId} is typing in thread ${threadId}`);
  },

  // Upload attachment
  async uploadAttachment(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { data: message } = await supabase
        .from('chat_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (!message || message.sender_id !== userId) {
        return false;
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  },

  // Add reaction to message
  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    try {
      const { data: message } = await supabase
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (!message) return;

      const reactions = message.reactions || [];
      const existingReaction = reactions.find((r: any) => r.emoji === emoji);

      if (existingReaction) {
        if (!existingReaction.userIds.includes(userId)) {
          existingReaction.userIds.push(userId);
          existingReaction.count++;
        }
      } else {
        reactions.push({
          emoji,
          userIds: [userId],
          count: 1,
        });
      }

      await supabase
        .from('chat_messages')
        .update({ reactions })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  },
};

import { FreelanceMessage, Profile } from "@/types/freelance";
import { supabase } from "@/integrations/supabase/client";

export interface FreelanceMessageWithSender extends FreelanceMessage {
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface SendMessageRequest {
  projectId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  messageType?: "text" | "file" | "milestone" | "payment";
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export const freelanceMessagingService = {
  // Get messages for a project
  async getProjectMessages(
    projectId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    messages: FreelanceMessageWithSender[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Get messages from database
      const { data: messagesData, error: messagesError, count } = await supabase
        .from('freelance_messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `, { count: 'exact' })
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (messagesError) throw messagesError;

      // Transform to FreelanceMessageWithSender format
      const messages: FreelanceMessageWithSender[] = (messagesData || []).map((msg: any) => ({
        id: msg.id,
        projectId: msg.project_id,
        senderId: msg.sender_id,
        content: msg.content,
        attachments: msg.attachments || [],
        messageType: msg.message_type || "text",
        read: msg.read || false,
        createdAt: new Date(msg.created_at),
        sender: {
          id: msg.sender_id,
          name: msg.sender?.full_name || "Unknown User",
          avatar: msg.sender?.avatar_url || "/placeholder.svg",
        },
      }));

      const total = count || 0;
      return {
        messages,
        total,
        hasMore: total > offset + limit,
      };
    } catch (error) {
      console.error('Error fetching project messages:', error);
      return {
        messages: [],
        total: 0,
        hasMore: false,
      };
    }
  },

  // Send a message
  async sendMessage(
    request: SendMessageRequest,
  ): Promise<FreelanceMessageWithSender> {
    try {
      const { data, error } = await supabase
        .from('freelance_messages')
        .insert({
          project_id: request.projectId,
          sender_id: request.senderId,
          content: request.content,
          attachments: request.attachments || [],
          message_type: request.messageType || "text",
        })
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Transform to FreelanceMessageWithSender format
      const newMessage: FreelanceMessageWithSender = {
        id: data.id,
        projectId: data.project_id,
        senderId: data.sender_id,
        content: data.content,
        attachments: data.attachments || [],
        messageType: data.message_type || "text",
        read: data.read || false,
        createdAt: new Date(data.created_at),
        sender: {
          id: data.sender_id,
          name: data.sender?.full_name || "Unknown User",
          avatar: data.sender?.avatar_url || "/placeholder.svg",
        },
      };

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(projectId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('freelance_messages')
        .update({ read: true })
        .eq('project_id', projectId)
        .neq('sender_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count for a project
  async getUnreadCount(projectId: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('freelance_messages')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .neq('sender_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Upload file attachment
  async uploadAttachment(
    file: File,
    projectId: string,
  ): Promise<MessageAttachment> {
    try {
      // In a real implementation, this would upload to storage
      // For now, we'll return a mock attachment
      const mockAttachment: MessageAttachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
      };
      return mockAttachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Search messages
  async searchMessages(
    projectId: string,
    query: string,
  ): Promise<FreelanceMessageWithSender[]> {
    try {
      const { data, error } = await supabase
        .from('freelance_messages')
        .select(`
          *,
          sender:profiles(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform to FreelanceMessageWithSender format
      const messages: FreelanceMessageWithSender[] = (data || []).map((msg: any) => ({
        id: msg.id,
        projectId: msg.project_id,
        senderId: msg.sender_id,
        content: msg.content,
        attachments: msg.attachments || [],
        messageType: msg.message_type || "text",
        read: msg.read || false,
        createdAt: new Date(msg.created_at),
        sender: {
          id: msg.sender_id,
          name: msg.sender?.full_name || "Unknown User",
          avatar: msg.sender?.avatar_url || "/placeholder.svg",
        },
      }));

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  },

  // Subscribe to real-time message updates
  subscribeToProjectMessages(
    projectId: string,
    onMessage: (message: FreelanceMessageWithSender) => void,
  ): () => void {
    try {
      const channel = supabase
        .channel(`project-messages:${projectId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'freelance_messages',
            filter: `project_id=eq.${projectId}`,
          },
          async (payload: any) => {
            const newMessage = payload.new;
            
            // Get sender profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            const messageWithSender: FreelanceMessageWithSender = {
              id: newMessage.id,
              projectId: newMessage.project_id,
              senderId: newMessage.sender_id,
              content: newMessage.content,
              attachments: newMessage.attachments || [],
              messageType: newMessage.message_type || "text",
              read: newMessage.read || false,
              createdAt: new Date(newMessage.created_at),
              sender: {
                id: newMessage.sender_id,
                name: senderProfile?.full_name || "Unknown User",
                avatar: senderProfile?.avatar_url || "/placeholder.svg",
              },
            };

            onMessage(messageWithSender);
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error subscribing to project messages:', error);
      return () => {};
    }
  },
};
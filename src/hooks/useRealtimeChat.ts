import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  updated_at: string;
  created_at: string;
  last_message?: ChatMessage;
  unread_count?: number;
  other_user?: {
    id: string;
    name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export const useRealtimeChat = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_messages (
            id,
            content,
            sender_id,
            read,
            created_at
          )
        `)
        .contains('participants', [user.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for participants
      const participantIds = Array.from(new Set(
        data.flatMap(conv => conv.participants.filter(id => id !== user.id))
      ));

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, username, avatar_url')
        .in('user_id', participantIds);

      if (profileError) throw profileError;

      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      const conversationsWithUsers = data.map(conv => {
        const otherUserId = conv.participants.find(id => id !== user.id);
        const otherUser = otherUserId ? profileMap[otherUserId] : null;
        const lastMessage = conv.chat_messages?.[conv.chat_messages.length - 1];

        return {
          ...conv,
          other_user: otherUser ? {
            id: otherUser.user_id,
            name: otherUser.name,
            username: otherUser.username,
            avatar_url: otherUser.avatar_url,
          } : null,
          last_message: lastMessage,
          unread_count: conv.chat_messages?.filter(msg => !msg.read && msg.sender_id !== user.id).length || 0,
        };
      });

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey (
            user_id,
            name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data,
      }));

      // Mark messages as read
      const unreadMessages = data.filter(msg => !msg.read && msg.sender_id !== user.id);
      if (unreadMessages.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user?.id]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          read: false,
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Start a new conversation
  const startConversation = useCallback(async (otherUserId: string) => {
    if (!user?.id) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .contains('participants', [user.id])
        .contains('participants', [otherUserId])
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          participants: [user.id, otherUserId],
        })
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new conversations
    const conversationChannel = supabase
      .channel('chat_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        (payload) => {
          console.log('Conversation change:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messageChannel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Message change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            
            // Update messages if this conversation is active
            if (newMessage.conversation_id === activeConversation) {
              fetchMessages(newMessage.conversation_id);
            }
            
            // Update conversations list
            fetchConversations();
            
            // Show notification for new messages
            if (newMessage.sender_id !== user.id) {
              toast({
                title: "New Message",
                description: newMessage.content,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user?.id, activeConversation, fetchConversations, fetchMessages, toast]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    typingUsers,
    sendMessage,
    fetchMessages,
    startConversation,
    refetch: fetchConversations,
  };
};
// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedChatMessage } from '@/components/chat/EnhancedMessage';
import { UnifiedChatThread, GroupChatThread } from '@/types/group-chat';

export interface WebSocketChatHook {
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  sendMessage: (chatId: string, message: EnhancedChatMessage) => void;
  startCall: (chatId: string, type: 'voice' | 'video') => void;
  joinCall: (callId: string) => void;
  endCall: (callId: string) => void;
  createInviteLink: (groupId: string, options?: { expiresIn?: number; maxUses?: number }) => Promise<string>;
  revokeInviteLink: (groupId: string, linkId: string) => Promise<void>;
  updateTypingStatus: (chatId: string, isTyping: boolean) => void;
  updateOnlineStatus: (isOnline: boolean) => void;
}

interface WebSocketMessage {
  type: 'message' | 'typing' | 'call_start' | 'call_end' | 'user_online' | 'user_offline' | 'group_update' | 'invite_created';
  payload: any;
  chatId?: string;
  userId?: string;
  timestamp: string;
}

interface UseWebSocketChatOptions {
  onMessageReceived?: (message: EnhancedChatMessage) => void;
  onTypingStatusChanged?: (chatId: string, users: Array<{id: string, name: string}>) => void;
  onCallStarted?: (callData: { id: string; type: 'voice' | 'video'; participants: string[]; initiator: string }) => void;
  onCallEnded?: (callId: string) => void;
  onUserStatusChanged?: (userId: string, isOnline: boolean) => void;
  onGroupUpdated?: (group: GroupChatThread) => void;
  onInviteLinkCreated?: (groupId: string, link: string) => void;
}

export const useWebSocketChat = (options: UseWebSocketChatOptions = {}): WebSocketChatHook => {
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    
    // Use environment variable or fallback to localhost
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/chat';
    
    try {
      wsRef.current = new WebSocket(`${wsUrl}?userId=${user.id}`);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Send authentication message
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          payload: { userId: user.id, token: user.token },
          timestamp: new Date().toISOString()
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [user, reconnectAttempts]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'message':
        options.onMessageReceived?.(message.payload);
        break;
      
      case 'typing':
        options.onTypingStatusChanged?.(message.chatId!, message.payload.users);
        break;
      
      case 'call_start':
        options.onCallStarted?.(message.payload);
        break;
      
      case 'call_end':
        options.onCallEnded?.(message.payload.callId);
        break;
      
      case 'user_online':
      case 'user_offline':
        options.onUserStatusChanged?.(message.userId!, message.type === 'user_online');
        break;
      
      case 'group_update':
        options.onGroupUpdated?.(message.payload);
        break;
      
      case 'invite_created':
        options.onInviteLinkCreated?.(message.payload.groupId, message.payload.link);
        break;
      
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }, [options]);

  const sendWebSocketMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
      toast({
        title: "Connection Error",
        description: "Not connected to chat server. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const sendMessage = useCallback((chatId: string, message: EnhancedChatMessage) => {
    sendWebSocketMessage({
      type: 'message',
      chatId,
      payload: message
    });
  }, [sendWebSocketMessage]);

  const startCall = useCallback((chatId: string, type: 'voice' | 'video') => {
    sendWebSocketMessage({
      type: 'call_start',
      chatId,
      payload: { type, chatId, initiator: user?.id }
    });
  }, [sendWebSocketMessage, user?.id]);

  const joinCall = useCallback((callId: string) => {
    sendWebSocketMessage({
      type: 'call_join',
      payload: { callId, userId: user?.id }
    });
  }, [sendWebSocketMessage, user?.id]);

  const endCall = useCallback((callId: string) => {
    sendWebSocketMessage({
      type: 'call_end',
      payload: { callId, userId: user?.id }
    });
  }, [sendWebSocketMessage, user?.id]);

  const createInviteLink = useCallback(async (groupId: string, options: { expiresIn?: number; maxUses?: number } = {}): Promise<string> => {
    return new Promise((resolve, reject) => {
      const messageId = `invite_${Date.now()}`;
      
      const handleResponse = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'invite_created' && message.payload.messageId === messageId) {
            wsRef.current?.removeEventListener('message', handleResponse);
            resolve(message.payload.link);
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      wsRef.current?.addEventListener('message', handleResponse);

      sendWebSocketMessage({
        type: 'create_invite',
        payload: { groupId, messageId, ...options }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', handleResponse);
        reject(new Error('Timeout creating invite link'));
      }, 10000);
    });
  }, [sendWebSocketMessage]);

  const revokeInviteLink = useCallback(async (groupId: string, linkId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const messageId = `revoke_${Date.now()}`;
      
      const handleResponse = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'invite_revoked' && message.payload.messageId === messageId) {
            wsRef.current?.removeEventListener('message', handleResponse);
            resolve();
          }
        } catch (error) {
          // Ignore parsing errors for other messages
        }
      };

      wsRef.current?.addEventListener('message', handleResponse);

      sendWebSocketMessage({
        type: 'revoke_invite',
        payload: { groupId, linkId, messageId }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener('message', handleResponse);
        reject(new Error('Timeout revoking invite link'));
      }, 10000);
    });
  }, [sendWebSocketMessage]);

  const updateTypingStatus = useCallback((chatId: string, isTyping: boolean) => {
    sendWebSocketMessage({
      type: 'typing',
      chatId,
      payload: { isTyping, userId: user?.id }
    });
  }, [sendWebSocketMessage, user?.id]);

  const updateOnlineStatus = useCallback((isOnline: boolean) => {
    sendWebSocketMessage({
      type: isOnline ? 'user_online' : 'user_offline',
      payload: { userId: user?.id }
    });
  }, [sendWebSocketMessage, user?.id]);

  // Connect when component mounts and user is available
  useEffect(() => {
    if (user?.id && connectionStatus === 'disconnected') {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [user?.id, connect, connectionStatus]);

  // Update online status when connection state changes
  useEffect(() => {
    if (isConnected) {
      updateOnlineStatus(true);
    }
  }, [isConnected, updateOnlineStatus]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isConnected) {
        updateOnlineStatus(!document.hidden);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, updateOnlineStatus]);

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    sendMessage,
    startCall,
    joinCall,
    endCall,
    createInviteLink,
    revokeInviteLink,
    updateTypingStatus,
    updateOnlineStatus,
  };
};

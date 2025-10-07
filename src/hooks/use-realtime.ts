// @ts-nocheck
import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, WebSocketEvents, ConnectionStatus } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';

// Main hook for WebSocket connection management
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isReconnecting: false
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const connect = async () => {
        try {
          setConnectionStatus(prev => ({ ...prev, isReconnecting: true }));
          await websocketService.connect(user.id, user.token);
          setConnectionStatus({
            isConnected: true,
            isReconnecting: false,
            lastConnected: new Date()
          });
        } catch (error) {
          setConnectionStatus({
            isConnected: false,
            isReconnecting: false,
            error: error instanceof Error ? error.message : 'Connection failed'
          });
        }
      };

      connect();

      return () => {
        websocketService.disconnect();
        setConnectionStatus({
          isConnected: false,
          isReconnecting: false
        });
      };
    }
  }, [user]);

  return connectionStatus;
}

// Hook for subscribing to specific WebSocket events
export function useSocketEvent<T extends keyof WebSocketEvents>(
  event: T,
  handler: (data: WebSocketEvents[T]) => void,
  dependencies: any[] = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (data: WebSocketEvents[T]) => {
      handlerRef.current(data);
    };

    websocketService.on(event, wrappedHandler);

    return () => {
      websocketService.off(event);
    };
  }, [event, ...dependencies]);
}

// Hook for real-time chat functionality
export function useRealTimeChat(roomId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Join/leave room when roomId changes
  useEffect(() => {
    if (roomId && websocketService.isConnected()) {
      websocketService.joinRoom(roomId);
      setIsLoading(true);
      
      return () => {
        websocketService.leaveRoom(roomId);
      };
    }
  }, [roomId]);

  // Listen for new messages
  useSocketEvent('message_received', (data) => {
    if (data.roomId === roomId) {
      setMessages(prev => [...prev, data.message]);
      setIsLoading(false);
    }
  }, [roomId]);

  // Listen for typing indicators
  useSocketEvent('typing_start', (data) => {
    if (data.roomId === roomId) {
      setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
    }
  }, [roomId]);

  useSocketEvent('typing_stop', (data) => {
    if (data.roomId === roomId) {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    }
  }, [roomId]);

  // Listen for user presence
  useSocketEvent('user_joined', (data) => {
    if (data.roomId === roomId) {
      setOnlineUsers(prev => [...prev.filter(id => id !== data.user.id), data.user.id]);
    }
  }, [roomId]);

  useSocketEvent('user_left', (data) => {
    if (data.roomId === roomId) {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    }
  }, [roomId]);

  const sendMessage = useCallback((content: string, type: string = 'text', metadata?: any) => {
    if (!roomId) return;
    
    const message = {
      content,
      type,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    websocketService.sendMessage(roomId, message);
  }, [roomId]);

  const startTyping = useCallback(() => {
    if (roomId) {
      websocketService.emit('start_typing', { roomId });
    }
  }, [roomId]);

  const stopTyping = useCallback(() => {
    if (roomId) {
      websocketService.emit('stop_typing', { roomId });
    }
  }, [roomId]);

  return {
    messages,
    typingUsers,
    onlineUsers,
    isLoading,
    sendMessage,
    startTyping,
    stopTyping
  };
}

// Hook for real-time trading functionality
export function useRealTimeTrading(tradingPairId?: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any>({});
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  useEffect(() => {
    if (tradingPairId && websocketService.isConnected()) {
      websocketService.joinTradingRoom(tradingPairId);
    }
  }, [tradingPairId]);

  useSocketEvent('order_update', (data) => {
    setOrders(prev => {
      const index = prev.findIndex(order => order.id === data.orderId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data.data, status: data.status };
        return updated;
      }
      return [...prev, { id: data.orderId, status: data.status, ...data.data }];
    });
  }, []);

  useSocketEvent('price_update', (data) => {
    setPriceData(prev => ({
      ...prev,
      [data.symbol]: {
        price: data.price,
        change: data.change,
        timestamp: new Date()
      }
    }));
  }, []);

  useSocketEvent('trade_executed', (data) => {
    setRecentTrades(prev => [data.details, ...prev.slice(0, 49)]); // Keep last 50 trades
  }, []);

  const subscribeToPrices = useCallback((symbols: string[]) => {
    websocketService.subscribeToPriceUpdates(symbols);
  }, []);

  const createOrder = useCallback(async (orderData: any) => {
    // This would typically make an API call to create the order
    // The WebSocket will handle real-time updates
    try {
      const response = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }, []);

  return {
    orders,
    priceData,
    recentTrades,
    subscribeToPrices,
    createOrder
  };
}

// Hook for real-time notifications
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useSocketEvent('new_notification', (data) => {
    setNotifications(prev => [data.notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  useSocketEvent('notification_read', (data) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === data.notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    websocketService.markNotificationRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notifications.forEach(notif => {
      if (!notif.isRead) {
        markAsRead(notif.id);
      }
    });
  }, [notifications, markAsRead]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}

// Hook for user presence management
export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useSocketEvent('user_online', (data) => {
    setOnlineUsers(prev => new Set([...prev, data.userId]));
  }, []);

  useSocketEvent('user_offline', (data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  }, []);

  const updateStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    websocketService.updatePresence(status);
  }, []);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return {
    onlineUsers: Array.from(onlineUsers),
    updateStatus,
    isUserOnline
  };
}

// Hook for real-time wallet updates
export function useRealTimeWallet(userId?: string) {
  const [balance, setBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSocketEvent('balance_update', (data) => {
    if (data.userId === userId) {
      setBalance(data.balance);
      setIsLoading(false);
    }
  }, [userId]);

  useSocketEvent('transaction_complete', (data) => {
    setRecentTransactions(prev => [data.details, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  // Initial balance fetch
  useEffect(() => {
    if (userId) {
      fetch(`/api/wallet/${userId}/balance`)
        .then(res => res.json())
        .then(data => {
          setBalance(data.balance);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch wallet balance:', err);
          setIsLoading(false);
        });
    }
  }, [userId]);

  return {
    balance,
    recentTransactions,
    isLoading
  };
}

import { supabase } from "@/integrations/supabase/client";
import { NotificationData } from "./notificationService";
import { notificationSettingsService } from "./notificationSettingsService";

export interface RealtimeNotification extends NotificationData {
  // Extended properties for real-time notifications
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  category?: string;
}

class RealtimeNotificationService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 1 second
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private userId: string | null = null;

  // Initialize real-time notifications
  async initialize(userId: string) {
    this.userId = userId;
    
    // Set up Supabase real-time subscription for notifications
    this.setupSupabaseRealtime();
    
    // Set up WebSocket connection for push notifications
    // In a real implementation, this would connect to your notification server
    // this.setupWebSocket();
  }

  // Set up Supabase real-time subscription
  private setupSupabaseRealtime() {
    if (!this.userId) return;

    // Subscribe to notifications table changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`
        },
        (payload: any) => {
          this.handleNewNotification(payload.new as RealtimeNotification);
        }
      )
      .subscribe();

    console.log('Supabase real-time notifications initialized');
  }

  // Handle new notification from real-time subscription
  private async handleNewNotification(notification: RealtimeNotification) {
    // Check if notification type is enabled for this user
    if (this.userId) {
      const isEnabled = await notificationSettingsService.isNotificationTypeEnabled(
        this.userId, 
        notification.type
      );
      
      if (!isEnabled) {
        console.log(`Notification type ${notification.type} is disabled for user ${this.userId}`);
        return;
      }
    }

    // Emit event to all listeners
    this.emit('notification', notification);
    
    // Handle browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  // Show browser notification
  private async showBrowserNotification(notification: RealtimeNotification) {
    // Check if browser notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      this.createBrowserNotification(notification);
    } 
    // Request permission if not denied
    else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.createBrowserNotification(notification);
      }
    }
  }

  // Create browser notification
  private createBrowserNotification(notification: RealtimeNotification) {
    const options: NotificationOptions = {
      body: notification.content,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    };

    const browserNotification = new Notification(notification.title, options);
    
    // Handle click event
    browserNotification.onclick = () => {
      if (notification.actionUrl) {
        window.open(notification.actionUrl, '_blank');
      }
      browserNotification.close();
    };
  }

  // Set up WebSocket connection for push notifications
  private setupWebSocket() {
    // In a real implementation, connect to your WebSocket server
    // const wsUrl = process.env.REACT_APP_NOTIFICATION_WS_URL || 'ws://localhost:8080/notifications';
    // this.websocket = new WebSocket(wsUrl);
    // 
    // this.websocket.onopen = () => {
    //   console.log('WebSocket connection established');
    //   this.reconnectAttempts = 0;
    //   // Authenticate with user ID
    //   if (this.userId) {
    //     this.websocket?.send(JSON.stringify({ type: 'auth', userId: this.userId }));
    //   }
    // };
    // 
    // this.websocket.onmessage = (event) => {
    //   try {
    //     const data = JSON.parse(event.data);
    //     this.handleWebSocketMessage(data);
    //   } catch (error) {
    //     console.error('Error parsing WebSocket message:', error);
    //   }
    // };
    // 
    // this.websocket.onclose = () => {
    //   console.log('WebSocket connection closed');
    //   this.handleWebSocketDisconnect();
    // };
    // 
    // this.websocket.onerror = (error) => {
    //   console.error('WebSocket error:', error);
    // };
  }

  // Handle WebSocket message
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'notification':
        this.handleNewNotification(data.notification);
        break;
      case 'heartbeat':
        // Handle heartbeat to keep connection alive
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  // Handle WebSocket disconnect
  private handleWebSocketDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        // this.setupWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  // Subscribe to notification events
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Unsubscribe from notification events
  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to all listeners
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  // Send notification to server (for testing)
  async sendTestNotification(userId: string, notification: Partial<RealtimeNotification>) {
    try {
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_type: notification.type || 'system',
        p_title: notification.title || 'Test Notification',
        p_content: notification.content || 'This is a test notification',
        p_related_user_id: notification.related_user_id,
        p_related_post_id: notification.related_post_id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  // Clean up resources
  cleanup() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    // Unsubscribe from Supabase channel
    supabase.getChannels().forEach((channel: any) => {
      supabase.removeChannel(channel);
    });
    
    this.listeners.clear();
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
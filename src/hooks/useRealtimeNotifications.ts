import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeNotificationService, RealtimeNotification } from '@/services/realtimeNotificationService';
import { notificationService, NotificationData } from '@/services/notificationService';
// Debug import - this will run the debug function on import
import '@/utils/debugNotificationService';

export interface UseRealtimeNotificationsReturn {
  notifications: RealtimeNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendTestNotification: (notification: Partial<RealtimeNotification>) => Promise<void>;
}

export const useRealtimeNotifications = (): UseRealtimeNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize real-time notifications
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const initializeNotifications = async () => {
      try {
        setLoading(true);
        
        // Initialize the real-time notification service
        await realtimeNotificationService.initialize(user.id);
        
        // Fetch initial notifications
        const notificationData = await notificationService.getUserNotifications(user.id);
        
        // Map to RealtimeNotification format
        const mappedNotifications = notificationData.map((data: any) => ({
          ...data,
          priority: 'medium',
          category: data.type
        }));
        
        setNotifications(mappedNotifications);
        setUnreadCount(notificationData.filter((n: any) => !n.read).length);
        
        // Listen for new real-time notifications
        realtimeNotificationService.on('notification', handleNewNotification);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      realtimeNotificationService.off('notification', handleNewNotification);
      realtimeNotificationService.cleanup();
    };
  }, [user]);

  // Handle new notification from real-time service
  const handleNewNotification = useCallback((notification: RealtimeNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // In a real implementation, you might want to delete from the database
      // For now, we'll just remove from the local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // If the notification was unread, decrease the unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Send test notification
  const sendTestNotification = useCallback(async (notification: Partial<RealtimeNotification>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      await realtimeNotificationService.sendTestNotification(user.id, notification);
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification
  };
};
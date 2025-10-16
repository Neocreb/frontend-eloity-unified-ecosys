import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';

// Enhanced notification interface
export interface UnifiedNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: string;
  actionUrl?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  categories: {
    all: boolean;
    social: boolean;
    chat: boolean;
    marketplace: boolean;
    freelance: boolean;
    crypto: boolean;
    rewards: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: string;
}

export interface CryptoNotificationPayload {
  title: string;
  message: string;
  symbol?: string;
  price?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
}

interface UnifiedNotificationContextType {
  // State
  notifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSettings;
  
  // Actions
  addNotification: (notification: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => void;
  
  // Settings
  updateSettings: (settings: any) => void;
}

const UnifiedNotificationContext = createContext<UnifiedNotificationContextType | undefined>(undefined);

export function createCryptoNotification(payload: CryptoNotificationPayload): UnifiedNotification {
  return {
    id: Date.now().toString(),
    type: 'crypto',
    category: 'crypto',
    title: payload.title,
    message: payload.message,
    timestamp: new Date(),
    read: false,
    priority: payload.priority || 'medium',
    actionUrl: payload.actionUrl,
  };
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: true,
  push: true,
  categories: {
    all: true,
    social: true,
    chat: true,
    marketplace: true,
    freelance: true,
    crypto: true,
    rewards: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  frequency: 'instant',
};

export const UnifiedNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  // Initialize notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load notifications from real service
        const notificationData = await notificationService.getUserNotifications(user.id);
        
        // Map to UnifiedNotification format
        const mappedNotifications = notificationData.map(data => ({
          id: data.id,
          type: data.type,
          category: data.type,
          title: data.title,
          message: data.content,
          timestamp: new Date(data.created_at),
          read: data.read,
          priority: "medium",
        }));
        
        setNotifications(mappedNotifications);
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem(`notification_settings_${user.id}`);
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(settings));
    }
  }, [settings, user]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add new notification
  const addNotification = useCallback(async (notificationData: any) => {
    if (!user) return;

    try {
      // Create notification in database
      const result = await notificationService.createNotification(
        user.id,
        notificationData.type,
        notificationData.title,
        notificationData.message
      );

      if (result) {
        // Add to local state
        const newNotification = {
          ...notificationData,
          id: result,
          timestamp: new Date(),
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 99)]);

        // Show toast
        if (settings.enabled) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [settings, toast, user]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings } as NotificationSettings));
  }, []);

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    settings,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    
    // Settings
    updateSettings,
  };

  return (
    <UnifiedNotificationContext.Provider value={value}>
      {children}
    </UnifiedNotificationContext.Provider>
  );
};

export const useUnifiedNotifications = () => {
  const context = useContext(UnifiedNotificationContext);
  if (context === undefined) {
    throw new Error('useUnifiedNotifications must be used within a UnifiedNotificationProvider');
  }
  return context;
};

export const useNotificationCount = () => {
  const { unreadCount } = useUnifiedNotifications();
  return unreadCount;
};

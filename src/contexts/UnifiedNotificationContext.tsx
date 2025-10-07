import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// Enhanced notification interface
export interface UnifiedNotification {
  id: string;
  type: NotificationCategory;
  category: NotificationCategory;
  title: string;
  message: string;
  content?: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
  icon?: React.ReactNode;
  metadata?: any;
  userId?: string;
  groupId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  archived?: boolean;
  starred?: boolean;
  source?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCategory = 
  | "all"
  | "social" 
  | "chat" 
  | "marketplace" 
  | "freelance" 
  | "crypto" 
  | "rewards" 
  | "system" 
  | "videos"
  | "campaigns"
  | "payments"
  | "security";

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'instant' | 'hourly' | 'daily';
}

interface UnifiedNotificationContextType {
  // State
  notifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSettings;
  
  // Actions
  addNotification: (notification: Omit<UnifiedNotification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  toggleStar: (id: string) => void;
  clearAll: () => void;
  
  // Bulk operations
  bulkMarkAsRead: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  
  // Filtering and sorting
  getNotificationsByCategory: (category: NotificationCategory) => UnifiedNotification[];
  getUnreadNotifications: () => UnifiedNotification[];
  getStarredNotifications: () => UnifiedNotification[];
  getArchivedNotifications: () => UnifiedNotification[];
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  updateCategorySettings: (category: NotificationCategory, enabled: boolean) => void;
  
  // Real-time
  subscribe: () => void;
  unsubscribe: () => void;
}

const UnifiedNotificationContext = createContext<UnifiedNotificationContextType | undefined>(undefined);

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
    videos: true,
    campaigns: true,
    payments: true,
    security: true,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  frequency: 'instant',
};

// Sample notifications for different platform features
const getSampleNotifications = (): UnifiedNotification[] => [
  {
    id: "1",
    type: "social",
    category: "social",
    title: "New Follower",
    message: "Sarah Johnson started following you",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: "medium",
    avatar: "/api/placeholder/40/40",
    actionUrl: "/app/profile/sarah-johnson",
    actionLabel: "View Profile",
    metadata: { userId: "sarah-johnson" },
  },
  {
    id: "2",
    type: "chat",
    category: "chat",
    title: "New Message",
    message: "Emma Wilson sent you a message",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    priority: "high",
    avatar: "/api/placeholder/40/40",
    actionUrl: "/app/chat/emma-wilson",
    actionLabel: "Open Chat",
    metadata: { chatId: "emma-wilson" },
  },
  {
    id: "3",
    type: "marketplace",
    category: "marketplace",
    title: "Order Shipped",
    message: "Your order #MP-12345 has been shipped",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    priority: "medium",
    actionUrl: "/app/marketplace/orders/MP-12345",
    actionLabel: "Track Order",
    metadata: { orderId: "MP-12345" },
  },
  {
    id: "4",
    type: "freelance",
    category: "freelance",
    title: "New Job Match",
    message: "A new React Developer position matches your skills",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    actionUrl: "/app/freelance/jobs/react-developer-123",
    actionLabel: "View Job",
    metadata: { jobId: "react-developer-123", matchScore: 92 },
  },
  {
    id: "5",
    type: "crypto",
    category: "crypto",
    title: "Price Alert",
    message: "Bitcoin reached your target price of $45,000",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: false,
    priority: "high",
    actionUrl: "/app/crypto/btc",
    actionLabel: "View Chart",
    metadata: { symbol: "BTC", price: 45000 },
  },
  {
    id: "6",
    type: "rewards",
    category: "rewards",
    title: "Streak Bonus!",
    message: "You've earned 100 bonus points for your 7-day streak",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: false,
    priority: "medium",
    actionUrl: "/app/rewards",
    actionLabel: "Claim Reward",
    metadata: { points: 100, streakDays: 7 },
  },
  {
    id: "7",
    type: "security",
    category: "security",
    title: "Security Alert",
    message: "New login detected from New York, USA",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: false,
    priority: "urgent",
    actionUrl: "/app/settings/security",
    actionLabel: "Review",
    metadata: { location: "New York, USA" },
  },
];

export const UnifiedNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  // Initialize notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // In a real app, this would fetch from API
        const savedNotifications = localStorage.getItem(`notifications_${user?.id}`);
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(parsed);
        } else {
          // Load sample data
          setNotifications(getSampleNotifications());
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications(getSampleNotifications());
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user && !loading) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user, loading]);

  // Load settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(`notification_settings_${user?.id}`);
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, [user]);

  // Save settings
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(settings));
    }
  }, [settings, user]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  // Add new notification
  const addNotification = useCallback((notificationData: Omit<UnifiedNotification, 'id' | 'timestamp'>) => {
    const newNotification: UnifiedNotification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Keep last 100

    // Show toast if enabled and not in quiet hours
    if (settings.enabled && settings.categories[notificationData.category] && !isInQuietHours()) {
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    }

    // Desktop notification
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted' && !isInQuietHours()) {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }

    // Play sound if enabled
    if (settings.sound && !isInQuietHours()) {
      // In a real app, play notification sound
      console.log('🔔 Notification sound would play here');
    }
  }, [settings, toast]);

  // Check if currently in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const start = settings.quietHours.start.split(':');
    const startTime = parseInt(start[0]) * 60 + parseInt(start[1]);

    const end = settings.quietHours.end.split(':');
    const endTime = parseInt(end[0]) * 60 + parseInt(end[1]);

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.quietHours]);

  // Individual actions
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
  }, []);

  const toggleStar = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Bulk operations
  const bulkMarkAsRead = useCallback((ids: string[]) => {
    setNotifications(prev => 
      prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
    );
  }, []);

  const bulkArchive = useCallback((ids: string[]) => {
    setNotifications(prev => 
      prev.map(n => ids.includes(n.id) ? { ...n, archived: true } : n)
    );
  }, []);

  const bulkDelete = useCallback((ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  }, []);

  // Filtering functions
  const getNotificationsByCategory = useCallback((category: NotificationCategory) => {
    if (category === "all") return notifications.filter(n => !n.archived);
    return notifications.filter(n => n.category === category && !n.archived);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read && !n.archived);
  }, [notifications]);

  const getStarredNotifications = useCallback(() => {
    return notifications.filter(n => n.starred);
  }, [notifications]);

  const getArchivedNotifications = useCallback(() => {
    return notifications.filter(n => n.archived);
  }, [notifications]);

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateCategorySettings = useCallback((category: NotificationCategory, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: enabled }
    }));
  }, []);

  // Real-time subscription (placeholder)
  const subscribe = useCallback(() => {
    // In a real app, this would set up WebSocket/SSE connections
    console.log('📡 Subscribing to real-time notifications...');
  }, []);

  const unsubscribe = useCallback(() => {
    // In a real app, this would clean up connections
    console.log('📡 Unsubscribing from real-time notifications...');
  }, []);

  const value: UnifiedNotificationContextType = {
    // State
    notifications,
    unreadCount,
    loading,
    settings,
    
    // Actions
    addNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    toggleStar,
    clearAll,
    
    // Bulk operations
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
    
    // Filtering and sorting
    getNotificationsByCategory,
    getUnreadNotifications,
    getStarredNotifications,
    getArchivedNotifications,
    
    // Settings
    updateSettings,
    updateCategorySettings,
    
    // Real-time
    subscribe,
    unsubscribe,
  };

  return (
    <UnifiedNotificationContext.Provider value={value}>
      {children}
    </UnifiedNotificationContext.Provider>
  );
};

export const useUnifiedNotifications = (): UnifiedNotificationContextType => {
  const context = useContext(UnifiedNotificationContext);
  if (context === undefined) {
    throw new Error('useUnifiedNotifications must be used within a UnifiedNotificationProvider');
  }
  return context;
};

// Helper hooks for specific use cases
export const useNotificationCount = () => {
  const { unreadCount } = useUnifiedNotifications();
  return unreadCount;
};

export const useNotificationsByCategory = (category: NotificationCategory) => {
  const { getNotificationsByCategory } = useUnifiedNotifications();
  return getNotificationsByCategory(category);
};

export const useUnreadNotifications = () => {
  const { getUnreadNotifications } = useUnifiedNotifications();
  return getUnreadNotifications();
};

// Notification creation helpers for different platform features
export const createSocialNotification = (data: {
  title: string;
  message: string;
  userId?: string;
  avatar?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "social",
  category: "social",
  priority: "medium",
  read: false,
  ...data,
});

export const createChatNotification = (data: {
  title: string;
  message: string;
  chatId: string;
  avatar?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "chat",
  category: "chat",
  priority: "high",
  read: false,
  actionUrl: `/app/chat/${data.chatId}`,
  actionLabel: "Open Chat",
  ...data,
});

export const createMarketplaceNotification = (data: {
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  actionUrl?: string;
  actionLabel?: string;
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "marketplace",
  category: "marketplace",
  priority: "medium",
  read: false,
  ...data,
});

export const createFreelanceNotification = (data: {
  title: string;
  message: string;
  jobId?: string;
  projectId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "freelance",
  category: "freelance",
  priority: "medium",
  read: false,
  ...data,
});

export const createCryptoNotification = (data: {
  title: string;
  message: string;
  symbol?: string;
  price?: number;
  priority?: "low" | "medium" | "high" | "urgent";
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "crypto",
  category: "crypto",
  priority: "high",
  read: false,
  actionUrl: "/app/crypto",
  actionLabel: "View Portfolio",
  ...data,
});

export const createRewardsNotification = (data: {
  title: string;
  message: string;
  points?: number;
  actionUrl?: string;
  actionLabel?: string;
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "rewards",
  category: "rewards",
  priority: "medium",
  read: false,
  actionUrl: "/app/rewards",
  actionLabel: "View Rewards",
  ...data,
});

export const createSecurityNotification = (data: {
  title: string;
  message: string;
  location?: string;
  device?: string;
}): Omit<UnifiedNotification, 'id' | 'timestamp'> => ({
  type: "security",
  category: "security",
  priority: "urgent",
  read: false,
  actionUrl: "/app/settings/security",
  actionLabel: "Review Security",
  ...data,
});

// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  X,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Clock,
  Star,
  Heart,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Zap,
  Gift,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Circle,
  Dot,
  ChevronDown,
  Filter,
  Archive,
  Trash2,
  MarkAsRead,
  BellRing,
  BellOff,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  type:
    | "social"
    | "trading"
    | "marketplace"
    | "system"
    | "rewards"
    | "freelance";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
  icon?: React.ReactNode;
  data?: any;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  types: {
    social: boolean;
    trading: boolean;
    marketplace: boolean;
    system: boolean;
    rewards: boolean;
    freelance: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "social",
    title: "New follower",
    message: "Sarah Johnson started following you",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: "low",
    avatar: "/api/placeholder/32/32",
    icon: <Users className="w-4 h-4" />,
    actionUrl: "/profile/sarah-johnson",
    actionLabel: "View Profile",
  },
  {
    id: "2",
    type: "trading",
    title: "Price Alert",
    message: "Bitcoin reached your target price of $45,000",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    priority: "high",
    icon: <TrendingUp className="w-4 h-4" />,
    actionUrl: "/crypto/btc",
    actionLabel: "View Chart",
  },
  {
    id: "3",
    type: "marketplace",
    title: "Order shipped",
    message: "Your order #12345 has been shipped and is on its way",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
    priority: "medium",
    icon: <ShoppingCart className="w-4 h-4" />,
    actionUrl: "/orders/12345",
    actionLabel: "Track Order",
  },
  {
    id: "4",
    type: "rewards",
    title: "Streak bonus!",
    message: "You've earned 100 bonus points for your 7-day streak",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
    priority: "medium",
    icon: <Gift className="w-4 h-4" />,
    actionUrl: "/rewards",
    actionLabel: "Claim Reward",
  },
  {
    id: "5",
    type: "freelance",
    title: "New job match",
    message: "A new project matches your skills: React Developer needed",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    priority: "high",
    icon: <Zap className="w-4 h-4" />,
    actionUrl: "/freelance/jobs",
    actionLabel: "View Job",
  },
];

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: true,
    types: {
      social: true,
      trading: true,
      crypto: true,
      marketplace: true,
      system: true,
      rewards: true,
      freelance: true,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("notification-settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("user-notifications");
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(
        parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
      );
    }

    // Initialize WebSocket for real-time notifications
    initializeWebSocket();

    // Listen for rewards notifications
    const handleRewardsNotification = (event: CustomEvent) => {
      const notification = event.detail;
      setNotifications((prev) => [{
        ...notification,
        timestamp: new Date(notification.timestamp),
        icon: <Gift className="w-4 h-4" />
      }, ...prev.slice(0, 99)]);

      // Play sound and show desktop notification if enabled
      if (settings.sound && settings.enabled) {
        playNotificationSound();
      }
      if (settings.desktop && settings.enabled && permission === "granted") {
        showDesktopNotification({
          ...notification,
          timestamp: new Date(notification.timestamp)
        });
      }
    };

    // Listen for toast notifications from rewards system
    const handleToastNotification = (event: CustomEvent) => {
      if (settings.enabled) {
        toast(event.detail);
      }
    };

    window.addEventListener('rewardsNotificationAdded', handleRewardsNotification as EventListener);
    window.addEventListener('showToast', handleToastNotification as EventListener);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      window.removeEventListener('rewardsNotificationAdded', handleRewardsNotification as EventListener);
      window.removeEventListener('showToast', handleToastNotification as EventListener);
    };
  }, []);

  // Listen for crypto notifications
  useEffect(() => {
    const handleCryptoNotification = (event: CustomEvent) => {
      const newNotification = event.detail;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Play notification sound if enabled
      if (settings.sound && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    const handleChatNotification = (event: CustomEvent) => {
      const { type, title, message, fromUserId, chatId, chatType } = event.detail;

      // Create chat notification
      const chatNotification: Notification = {
        id: Date.now().toString(),
        type: chatType || 'social',
        title: title,
        message: message,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        actionUrl: `/app/chat?type=${chatType}&thread=${chatId}`,
        actionLabel: 'View Chat',
        data: {
          fromUserId,
          chatId,
          chatType,
        }
      };

      setNotifications(prev => [chatNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Play notification sound if enabled
      if (settings.sound && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('crypto-notification', handleCryptoNotification as EventListener);
    window.addEventListener('chat-notification', handleChatNotification as EventListener);

    return () => {
      window.removeEventListener('crypto-notification', handleCryptoNotification as EventListener);
      window.removeEventListener('chat-notification', handleChatNotification as EventListener);
    };
  }, [settings.sound]);

  useEffect(() => {
    // Update unread count
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);

    // Update document title with unread count
    if (unread > 0) {
      document.title = `(${unread}) Eloity`;
    } else {
      document.title = "Eloity";
    }

    // Save to localStorage
    localStorage.setItem("user-notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem("notification-settings", JSON.stringify(settings));
  }, [settings]);

  const initializeWebSocket = () => {
    if (!user) return;

    // In a real app, this would connect to your WebSocket server
    // wsRef.current = new WebSocket('ws://localhost:8080/notifications');

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        simulateNewNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const simulateNewNotification = () => {
    const types: Notification["type"][] = [
      "social",
      "trading",
      "marketplace",
      "rewards",
      "freelance",
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    let newNotification: Notification;

    if (randomType === "rewards") {
      // Enhanced rewards notifications
      const rewardsNotifications = [
        {
          title: "Battle Vote Won! 🎯",
          message: "Your vote on Alex Dance vs Music Mike was successful! Earned $87.50",
          priority: "high" as const,
          actionUrl: "/app/rewards?tab=battles",
          actionLabel: "View Details"
        },
        {
          title: "Achievement Unlocked! 🏆",
          message: "Battle Master - Win 5 battle votes in a row",
          priority: "medium" as const,
          actionUrl: "/app/rewards?tab=dashboard",
          actionLabel: "View Achievement"
        },
        {
          title: "Gift Received! 🎁",
          message: "Received Crown gift during live stream - $25.00",
          priority: "medium" as const,
          actionUrl: "/app/rewards?tab=activities",
          actionLabel: "View Activity"
        },
        {
          title: "Challenge Completed! ⭐",
          message: "Daily streak challenge - 7 days completed - $12.50",
          priority: "low" as const,
          actionUrl: "/app/rewards?tab=challenges",
          actionLabel: "View Challenges"
        },
        {
          title: "Goal Progress! 📈",
          message: "You've reached 75% of your weekly earning goal",
          priority: "low" as const,
          actionUrl: "/app/rewards?tab=dashboard",
          actionLabel: "View Goals"
        },
        {
          title: "Seasonal Event! ❄️",
          message: "Winter Rewards Festival is now active - 2x rewards!",
          priority: "high" as const,
          actionUrl: "/app/rewards?tab=dashboard",
          actionLabel: "Join Event"
        }
      ];

      const randomReward = rewardsNotifications[Math.floor(Math.random() * rewardsNotifications.length)];

      newNotification = {
        id: Date.now().toString(),
        type: "rewards",
        title: randomReward.title,
        message: randomReward.message,
        timestamp: new Date(),
        read: false,
        priority: randomReward.priority,
        icon: <Gift className="w-4 h-4" />,
        actionUrl: randomReward.actionUrl,
        actionLabel: randomReward.actionLabel
      };
    } else {
      newNotification = {
        id: Date.now().toString(),
        type: randomType,
        title: "New notification",
        message: "You have a new update",
        timestamp: new Date(),
        read: false,
        priority: "medium",
        icon: <Bell className="w-4 h-4" />,
      };
    }

    addNotification(newNotification);
  };

  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive desktop notifications",
        });
      }
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 99)]); // Keep last 100

    // Play sound if enabled
    if (settings.sound && settings.enabled && isInQuietHours() === false) {
      playNotificationSound();
    }

    // Show desktop notification if enabled
    if (
      settings.desktop &&
      settings.enabled &&
      permission === "granted" &&
      isInQuietHours() === false
    ) {
      showDesktopNotification(notification);
    }

    // Show toast notification
    if (settings.enabled) {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const isInQuietHours = () => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const start = settings.quietHours.start.split(":");
    const startTime = parseInt(start[0]) * 60 + parseInt(start[1]);

    const end = settings.quietHours.end.split(":");
    const endTime = parseInt(end[0]) * 60 + parseInt(end[1]);

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const showDesktopNotification = (notification: Notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: notification.id,
        requireInteraction: notification.priority === "urgent",
      });

      desktopNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        desktopNotification.close();
      };

      // Auto close after 5 seconds unless urgent
      if (notification.priority !== "urgent") {
        setTimeout(() => desktopNotification.close(), 5000);
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "social":
        return <Users className="w-4 h-4" />;
      case "trading":
        return <TrendingUp className="w-4 h-4" />;
      case "marketplace":
        return <ShoppingCart className="w-4 h-4" />;
      case "rewards":
        return <Gift className="w-4 h-4" />;
      case "freelance":
        return <Zap className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Notification Bell */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`relative ${className}`}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-0" align="end">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Notification Settings</DialogTitle>
                    </DialogHeader>
                    <NotificationSettingsPanel
                      settings={settings}
                      onSettingsChange={setSettings}
                      permission={permission}
                      onRequestPermission={requestPermission}
                    />
                  </DialogContent>
                </Dialog>

                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-3 overflow-x-auto">
              {["all", "unread", "rewards", "social", "trading", "marketplace", "freelance"].map(
                (filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className="text-xs capitalize whitespace-nowrap"
                  >
                    {filterType}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {getFilteredNotifications().length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 ${getPriorityColor(notification.priority)}`}
                    >
                      {notification.icon || getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Circle className="w-3 h-3 fill-blue-600 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {notification.actionUrl && notification.actionLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs h-6"
                          onClick={() => {
                            window.location.href = notification.actionUrl!;
                            markAsRead(notification.id);
                          }}
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

// Notification Settings Panel Component
interface NotificationSettingsPanelProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  permission: NotificationPermission;
  onRequestPermission: () => void;
}

const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  permission,
  onRequestPermission,
}) => {
  const updateSettings = (updates: Partial<NotificationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateTypeSettings = (
    type: keyof NotificationSettings["types"],
    enabled: boolean,
  ) => {
    onSettingsChange({
      ...settings,
      types: { ...settings.types, [type]: enabled },
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="font-medium">Enable Notifications</label>
          <p className="text-sm text-muted-foreground">
            Turn all notifications on or off
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(enabled) => updateSettings({ enabled })}
        />
      </div>

      {/* Permission Request */}
      {permission !== "granted" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  Desktop notifications disabled
                </p>
                <p className="text-xs text-orange-700">
                  Enable browser notifications for real-time alerts
                </p>
              </div>
              <Button size="sm" onClick={onRequestPermission}>
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Types */}
      <div className="space-y-4">
        <h4 className="font-medium">Notification Types</h4>
        {Object.entries(settings.types).map(([type, enabled]) => (
          <div key={type} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium capitalize">{type}</label>
              <p className="text-xs text-muted-foreground">
                {type === "social" && "Likes, comments, follows, mentions"}
                {type === "trading" &&
                  "Price alerts, trade executions, market news"}
                {type === "marketplace" && "Orders, shipping, reviews"}
                {type === "rewards" && "Points earned, streaks, achievements"}
                {type === "freelance" && "Job matches, proposals, payments"}
                {type === "system" && "Security, updates, maintenance"}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) =>
                updateTypeSettings(
                  type as keyof NotificationSettings["types"],
                  checked,
                )
              }
              disabled={!settings.enabled}
            />
          </div>
        ))}
      </div>

      {/* Sound & Desktop */}
      <div className="space-y-4">
        <h4 className="font-medium">Delivery Options</h4>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Sound</label>
            <p className="text-xs text-muted-foreground">
              Play sound for new notifications
            </p>
          </div>
          <Switch
            checked={settings.sound}
            onCheckedChange={(sound) => updateSettings({ sound })}
            disabled={!settings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Desktop Notifications</label>
            <p className="text-xs text-muted-foreground">
              Show browser notifications
            </p>
          </div>
          <Switch
            checked={settings.desktop}
            onCheckedChange={(desktop) => updateSettings({ desktop })}
            disabled={!settings.enabled || permission !== "granted"}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Email Notifications</label>
            <p className="text-xs text-muted-foreground">
              Send important updates via email
            </p>
          </div>
          <Switch
            checked={settings.email}
            onCheckedChange={(email) => updateSettings({ email })}
            disabled={!settings.enabled}
          />
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Quiet Hours</label>
            <p className="text-sm text-muted-foreground">
              Pause notifications during specific hours
            </p>
          </div>
          <Switch
            checked={settings.quietHours.enabled}
            onCheckedChange={(enabled) =>
              updateSettings({
                quietHours: { ...settings.quietHours, enabled },
              })
            }
            disabled={!settings.enabled}
          />
        </div>

        {settings.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={(e) =>
                  updateSettings({
                    quietHours: {
                      ...settings.quietHours,
                      start: e.target.value,
                    },
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Time</label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={(e) =>
                  updateSettings({
                    quietHours: { ...settings.quietHours, end: e.target.value },
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;

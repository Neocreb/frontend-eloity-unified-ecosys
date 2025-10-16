// @ts-nocheck
import React, { useState, useEffect } from "react";
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
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";

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

interface NotificationSystemProps {
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useRealtimeNotifications();

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
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem("notification-settings", JSON.stringify(settings));
  }, [settings]);

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
    // In a real implementation, you would play an actual sound
    console.log("Playing notification sound");
  };

  const showDesktopNotification = (notification: any) => {
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

  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  };

  const getPriorityColor = (priority: string) => {
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

  const getTypeIcon = (type: string) => {
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

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <>
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
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : getFilteredNotifications().length === 0 ? (
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
                      className={`mt-1 ${getPriorityColor(notification.priority || 'medium')}`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(notification.created_at)}
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
                <Button variant="ghost" size="sm" onClick={() => {}}>
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
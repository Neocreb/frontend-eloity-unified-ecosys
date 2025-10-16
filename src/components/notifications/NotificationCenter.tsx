import { useState } from "react";
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Check, 
  Trash2, 
  Settings,
  Filter,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface NotificationCenterProps {
  maxNotifications?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export const NotificationCenter = ({
  maxNotifications = 10,
  showHeader = true,
  showFilters = true,
  compact = false
}: NotificationCenterProps) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useRealtimeNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter notifications based on selected filters
  const filteredNotifications = notifications
    .filter(n => {
      if (filter === "unread") return !n.read;
      if (filter === "read") return n.read;
      return true;
    })
    .filter(n => {
      if (categoryFilter === "all") return true;
      return n.type === categoryFilter;
    })
    .slice(0, maxNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "message":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />;
      case "crypto":
        return <Heart className="h-4 w-4 text-yellow-500" />;
      case "trading":
        return <Heart className="h-4 w-4 text-green-500" />;
      case "rewards":
        return <Heart className="h-4 w-4 text-pink-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className={compact ? "p-4" : "p-6"}>
        <div className="animate-pulse space-y-3">
          {showHeader && (
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          )}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "p-4" : "p-6"}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className={compact ? "text-lg" : "text-xl"}>
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilter("all")}>
                      All Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("unread")}>
                      <Eye className="h-4 w-4 mr-2" />
                      Unread
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("read")}>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark All Read
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            {filter === "unread" 
              ? "You're all caught up! No unread notifications." 
              : "You don't have any notifications yet."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`
                ${!notification.read ? "border-l-4 border-l-primary bg-muted/30" : ""}
                ${compact ? "p-3" : "p-4"}
              `}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  {notification.avatar ? (
                    <AvatarImage src={notification.avatar} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {notification.title?.charAt(0) || "N"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <p className={`font-medium ${compact ? "text-sm" : "text-sm"}`}>
                        {notification.title}
                      </p>
                      <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                        {notification.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                    
                    {notification.priority && notification.priority !== "medium" && (
                      <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
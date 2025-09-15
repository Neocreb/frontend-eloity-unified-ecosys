import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  MessageCircle,
  Users,
  Filter,
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatThread, ChatFilter, ChatType } from "@/types/chat";
import { useChatThreads } from "@/chat/hooks/useChatThread";
import {
  getChatTypeIcon,
  getChatTypeLabel,
  getChatTypeBadgeColor,
  formatChatTitle,
  formatContextSubtitle,
  formatMessageTime,
  formatLastMessagePreview,
} from "@/chat/utils/chatHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export const Inbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChatType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const filter: ChatFilter = useMemo(
    () => ({
      type: activeTab,
      unreadOnly: showUnreadOnly,
      searchQuery: searchQuery.trim() || undefined,
    }),
    [activeTab, showUnreadOnly, searchQuery],
  );

  const { threads, loading, error, refresh } = useChatThreads(filter);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
  }, [threads]);

  const getTabBadgeCount = (type: ChatType | "all") => {
    if (type === "all") return totalUnreadCount;
    return threads
      .filter((thread) => thread.type === type)
      .reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
  };

  const handleThreadClick = (threadId: string) => {
    navigate(`/messages/${threadId}`);
  };

  const ThreadCard: React.FC<{ thread: ChatThread }> = ({ thread }) => {
    const title = formatChatTitle(thread, user?.id || "");
    const subtitle = formatContextSubtitle(thread);
    const unreadCount = thread.unreadCount || 0;
    const isUnread = unreadCount > 0;

    // Get participant info for display
    const otherParticipants = thread.participants.filter(
      (id) => id !== user?.id,
    );
    const displayAvatar =
      thread.groupAvatar ||
      (otherParticipants.length === 1
        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
        : "");

    return (
      <Card
        className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
          isUnread ? "border-l-4 border-l-primary bg-primary/5" : ""
        }`}
        onClick={() => handleThreadClick(thread.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback>
                  {thread.isGroup ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <h3
                    className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`}
                  >
                    {title}
                  </h3>
                  <Badge
                    className={`text-xs ${getChatTypeBadgeColor(thread.type)}`}
                  >
                    {getChatTypeIcon(thread.type)}{" "}
                    {getChatTypeLabel(thread.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(thread.lastMessageAt)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pin className="w-4 h-4 mr-2" />
                        Pin Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Mute
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {subtitle && (
                <p className="text-xs text-muted-foreground mb-1">{subtitle}</p>
              )}

              <div className="flex items-center justify-between">
                <p
                  className={`text-sm text-muted-foreground line-clamp-1 ${
                    isUnread ? "font-medium text-foreground" : ""
                  }`}
                >
                  {formatLastMessagePreview(thread.lastMessage)}
                </p>
                {unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="ml-2 min-w-[20px] h-5 text-xs"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ThreadSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">Unable to load messages</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              {totalUnreadCount > 0
                ? `${totalUnreadCount} unread messages`
                : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={
                showUnreadOnly ? "bg-primary text-primary-foreground" : ""
              }
            >
              <Filter className="w-4 h-4 mr-2" />
              {showUnreadOnly ? "Show All" : "Unread Only"}
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Chat Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ChatType | "all")}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              💬 All
              {getTabBadgeCount("all") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {getTabBadgeCount("all")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              💬 Social
              {getTabBadgeCount("social") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {getTabBadgeCount("social")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="freelance" className="flex items-center gap-2">
              💼 Work
              {getTabBadgeCount("freelance") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {getTabBadgeCount("freelance")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="flex items-center gap-2"
            >
              🛒 Market
              {getTabBadgeCount("marketplace") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {getTabBadgeCount("marketplace")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="p2p" className="flex items-center gap-2">
              💱 Crypto
              {getTabBadgeCount("p2p") > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {getTabBadgeCount("p2p")}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Content for each tab */}
          <div className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ThreadSkeleton key={index} />
                ))}
              </div>
            ) : threads.length > 0 ? (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    {searchQuery
                      ? "No matching conversations"
                      : "No conversations yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `No conversations match "${searchQuery}"`
                      : activeTab === "all"
                        ? "Start a conversation to see it here"
                        : `No ${getChatTypeLabel(activeTab as ChatType)} conversations yet`}
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Inbox;

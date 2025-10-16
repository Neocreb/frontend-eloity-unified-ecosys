import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Crown,
  Pin,
  PinOff,
  Archive,
  Trash2,
  MoreVertical,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  MessageSquare,
  Phone,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { UnifiedChatThread } from "@/types/unified-chat";
import { GroupChatThread } from "@/types/group-chat";

interface ChatListItemProps {
  chat: UnifiedChatThread;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
  onPin?: (chatId: string, pin: boolean) => void;
  onMute?: (chatId: string, mute: boolean) => void;
  onArchive?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  onCall?: (chatId: string, type: 'voice' | 'video') => void;
  className?: string;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  currentUserId,
  onClick,
  onPin,
  onMute,
  onArchive,
  onDelete,
  onCall,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const getLastMessageStatus = (): 'sent' | 'delivered' | 'read' | 'received' => {
    // This would typically come from the last message sender
    // For now, we'll assume if it's not from current user, it's received
    return chat.lastMessage && chat.lastMessage.includes(currentUserId) ? 'sent' : 'received';
  };

  const getMessageStatusIcon = () => {
    const status = getLastMessageStatus();
    if (status === 'sent') {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    } else if (status === 'delivered' || status === 'read') {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return null;
  };

  const renderChatContent = () => {
    if (chat.isGroup) {
      const groupChat = chat as unknown as GroupChatThread;
      const activeMembers = groupChat.participants?.filter(p => p.isActive) || [];
      const onlineMembers = activeMembers.filter(p => p.isOnline);
      const isCurrentUserAdmin = groupChat.participants?.find(p => p.id === currentUserId)?.role === 'admin';

      return (
        <>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.groupAvatar} alt={chat.groupName} />
                <AvatarFallback className="bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              {/* Group indicator */}
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Users className="h-2.5 w-2.5" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {chat.groupName || 'Unnamed Group'}
                </h3>
                {isCurrentUserAdmin && (
                  <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                )}
                {chat.isPinned && (
                  <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                {chat.isMuted && (
                  <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{activeMembers.length} members</span>
                {onlineMembers.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">{onlineMembers.length} online</span>
                  </>
                )}
                {groupChat.category && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 capitalize">
                      {groupChat.category}
                    </Badge>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                {getMessageStatusIcon()}
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      // Direct message
      const participant = chat.participant_profile;
      
      return (
        <>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={participant?.avatar} alt={participant?.name} />
                <AvatarFallback>
                  {participant?.name ? getInitials(participant.name) : '?'}
                </AvatarFallback>
              </Avatar>
              {participant?.is_online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {participant?.name || 'Unknown User'}
                </h3>
                {chat.isPinned && (
                  <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                {chat.isMuted && (
                  <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              {participant?.is_online ? (
                <p className="text-xs text-green-600">Online</p>
              ) : (
                <p className="text-xs text-muted-foreground">Last seen recently</p>
              )}
              
              <div className="flex items-center gap-1 mt-1">
                {getMessageStatusIcon()}
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group",
        "hover:bg-accent/50",
        isSelected && "bg-accent border border-border",
        chat.unreadCount && chat.unreadCount > 0 && "bg-primary/5 border-l-4 border-l-primary",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        {renderChatContent()}
      </div>
      
      <div className="flex flex-col items-end gap-1 ml-2">
        <span className="text-xs text-muted-foreground">
          {formatTime(chat.lastMessageAt)}
        </span>

        <div className="flex items-center gap-1">
          {chat.unreadCount && chat.unreadCount > 0 && (
            <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Badge>
          )}

          {/* Quick Actions - Always visible on mobile, hover on desktop */}
          <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            {onCall && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 md:h-7 md:w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCall(chat.id, 'voice');
                  }}
                >
                  <Phone className="h-3.5 w-3.5 md:h-3 md:w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 md:h-7 md:w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCall(chat.id, 'video');
                  }}
                >
                  <Video className="h-3.5 w-3.5 md:h-3 md:w-3" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 md:h-7 md:w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5 md:h-3 md:w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onPin?.(chat.id, !chat.isPinned);
                }}>
                  {chat.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin Chat
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin Chat
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onMute?.(chat.id, !chat.isMuted);
                }}>
                  {chat.isMuted ? (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Mute
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.(chat.id);
                }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Chat
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(chat.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedChatThread } from '@/types/unified-chat';

interface ChatListItemProps {
  chat: UnifiedChatThread;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  isSelected,
  onClick,
  isMobile = false,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLastMessageStatus = () => {
    if (chat.lastMessage && chat.lastMessage.includes(currentUserId)) {
      return 'sent';
    }
    return 'received';
  };

  const getMessageStatusIcon = () => {
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent transition-colors",
        isSelected && "bg-accent",
        isMobile && "p-2"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className={cn(isMobile ? "h-10 w-10" : "h-12 w-12")}>
          <AvatarImage src={chat.groupAvatar} alt={chat.title || "Chat"} />
          <AvatarFallback>
            {chat.title ? getInitials(chat.title) : 'C'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-medium truncate",
            isMobile ? "text-sm" : "text-base"
          )}>
            {chat.title || `Chat ${chat.id.slice(0, 8)}`}
          </h3>
          <span className={cn(
            "text-muted-foreground flex-shrink-0",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {formatTime(chat.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {getMessageStatusIcon()}
            <p className={cn(
              "text-muted-foreground truncate",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {chat.lastMessage || 'No messages yet'}
            </p>
          </div>

          <div className="flex items-center gap-1 ml-2">
            {chat.unreadCount && chat.unreadCount > 0 && (
              <span className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { usePresence } from '@/hooks/usePresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface OnlineIndicatorProps {
  roomId?: string;
  showUserList?: boolean;
  maxVisible?: number;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ 
  roomId = 'global', 
  showUserList = false,
  maxVisible = 3 
}) => {
  const { onlineUsers, onlineCount, isConnected } = usePresence(roomId);

  if (!isConnected) {
    return null;
  }

  if (!showUserList) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <Users className="w-3 h-3" />
        {onlineCount}
      </Badge>
    );
  }

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, onlineCount - maxVisible);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {visibleUsers.map((user) => (
          <Avatar key={user.user_id} className="w-6 h-6 border-2 border-background">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {user.username?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
      
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {onlineCount} online
      </Badge>
    </div>
  );
};

export default OnlineIndicator;
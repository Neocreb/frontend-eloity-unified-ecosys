import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserPresence } from '@/hooks/useUserPresence';
import { Users } from 'lucide-react';

interface OnlineUsersIndicatorProps {
  roomId?: string;
  showAvatars?: boolean;
  maxAvatars?: number;
  className?: string;
}

const OnlineUsersIndicator: React.FC<OnlineUsersIndicatorProps> = ({
  roomId = 'global',
  showAvatars = true,
  maxAvatars = 5,
  className = '',
}) => {
  const { onlineUsers, presenceState } = useUserPresence(roomId);

  const onlineCount = onlineUsers.length;

  if (onlineCount === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const visibleUsers = onlineUsers.slice(0, maxAvatars);
  const remainingCount = Math.max(0, onlineCount - maxAvatars);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatars && (
        <div className="flex -space-x-2">
          {visibleUsers.map((userId) => {
            // Find the presence data for this user
            const userPresence = Object.values(presenceState)
              .flat()
              .find(p => p.user_id === userId);
            
            const status = userPresence?.status || 'offline';
            
            return (
              <div key={userId} className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`}
                    alt="User avatar" 
                  />
                  <AvatarFallback>
                    {userId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(status)}`}
                  title={`${status.charAt(0).toUpperCase() + status.slice(1)}`}
                />
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full border-2 border-background text-xs font-medium">
              +{remainingCount}
            </div>
          )}
        </div>
      )}
      
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <Users className="h-3 w-3" />
        <span className="text-xs font-medium">
          {onlineCount} online
        </span>
      </Badge>
    </div>
  );
};

export default OnlineUsersIndicator;
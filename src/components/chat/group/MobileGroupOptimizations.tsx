import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Settings, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupChatThread } from '@/types/group-chat';

interface MobileGroupChatHeaderProps {
  group: GroupChatThread;
  currentUserId: string;
  onBack: () => void;
  onSettings: () => void;
  onCall: (type: 'voice' | 'video') => void;
  className?: string;
}

export const MobileGroupChatHeader: React.FC<MobileGroupChatHeaderProps> = ({
  group,
  currentUserId,
  onBack,
  onSettings,
  onCall,
  className,
}) => {
  const currentUser = group.participants?.find(p => p.id === currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const activeMembersCount = group.participants?.filter(p => p.isActive).length || 0;
  const onlineMembersCount = group.participants?.filter(p => p.isOnline && p.isActive).length || 0;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10",
      className
    )}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onSettings}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{group.groupName}</h3>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs px-1 h-4">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeMembersCount} members
            {onlineMembersCount > 0 && `, ${onlineMembersCount} online`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onCall('voice')}>
              Voice Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCall('video')}>
              Video Call
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettings}>
              <Users className="h-4 w-4 mr-2" />
              Group Info
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

interface MobileGroupListProps {
  groups: GroupChatThread[];
  selectedGroupId?: string;
  onSelectGroup: (group: GroupChatThread) => void;
  onCreateGroup: () => void;
  className?: string;
}

export const MobileGroupList: React.FC<MobileGroupListProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  className,
}) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Groups</h2>
          <Button 
            size="sm" 
            onClick={onCreateGroup}
            className="h-8 px-3 text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">No groups yet</p>
              <Button size="sm" onClick={onCreateGroup}>
                Create your first group
              </Button>
            </div>
          ) : (
            groups.map((group) => (
              <MobileGroupListItem
                key={group.id}
                group={group}
                isSelected={group.id === selectedGroupId}
                onClick={() => onSelectGroup(group)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface MobileGroupListItemProps {
  group: GroupChatThread;
  isSelected: boolean;
  onClick: () => void;
}

const MobileGroupListItem: React.FC<MobileGroupListItemProps> = ({
  group,
  isSelected,
  onClick,
}) => {
  const activeMembersCount = group.participants?.filter(p => p.isActive).length || 0;
  const hasUnread = group.unreadCount && group.unreadCount > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors active:scale-95 transition-transform",
        isSelected 
          ? "bg-primary/10 border border-primary/20" 
          : "hover:bg-muted/50 active:bg-muted/70"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          {group.groupAvatar ? (
            <img 
              src={group.groupAvatar} 
              alt={group.groupName} 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Users className="h-6 w-6 text-primary" />
          )}
        </div>
        {hasUnread && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              {group.unreadCount! > 99 ? '99+' : group.unreadCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
            <h4 className={cn(
            "font-medium text-sm truncate",
            hasUnread && "font-semibold"
          )}>
            {group.groupName}
          </h4>
          {group.lastMessageAt && (
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {formatTime(group.lastMessageAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate">
            {group.lastMessage || `${activeMembersCount} members`}
          </p>
          
          {group.isMuted && (
            <Badge variant="outline" className="text-xs px-1 h-4 ml-2">
              Muted
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized floating action button for creating groups
interface MobileGroupFABProps {
  onCreateGroup: () => void;
  className?: string;
}

export const MobileGroupFAB: React.FC<MobileGroupFABProps> = ({
  onCreateGroup,
  className,
}) => {
  return (
    <Button
      onClick={onCreateGroup}
      className={cn(
        "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-20",
        "bg-primary hover:bg-primary/90 text-white",
        "transition-all duration-200 active:scale-95",
        className
      )}
      size="icon"
    >
      <Users className="h-6 w-6" />
    </Button>
  );
};

// Mobile swipe actions for group items
interface MobileGroupSwipeActionsProps {
  group: GroupChatThread;
  onMute: () => void;
  onPin: () => void;
  onArchive: () => void;
  onLeave: () => void;
  children: React.ReactNode;
}

export const MobileGroupSwipeActions: React.FC<MobileGroupSwipeActionsProps> = ({
  group,
  onMute,
  onPin,
  onArchive,
  onLeave,
  children,
}) => {
  const [swipeOffset, setSwipeOffset] = React.useState(0);
  const [isRevealed, setIsRevealed] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);
  const isDragging = React.useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Determine if this is a horizontal swipe
    if (!isDragging.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isDragging.current = true;
      e.preventDefault();
    }

    if (isDragging.current) {
      const maxSwipe = 160; // Width of action buttons
      const newOffset = Math.max(-maxSwipe, Math.min(0, deltaX));
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging.current) {
      const threshold = -80; // Half of max swipe
      if (swipeOffset < threshold) {
        setSwipeOffset(-160);
        setIsRevealed(true);
      } else {
        setSwipeOffset(0);
        setIsRevealed(false);
      }
    }
    isDragging.current = false;
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setIsRevealed(false);
  };

  const handleAction = (action: () => void) => {
    action();
    resetSwipe();
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Action buttons (revealed when swiping left) */}
      <div className="absolute right-0 top-0 h-full flex items-center bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(onPin)}
          className="h-full px-4 rounded-none bg-blue-500 hover:bg-blue-600 text-white"
        >
          Pin
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(onMute)}
          className="h-full px-4 rounded-none bg-orange-500 hover:bg-orange-600 text-white"
        >
          {group.isMuted ? 'Unmute' : 'Mute'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(onArchive)}
          className="h-full px-4 rounded-none bg-gray-500 hover:bg-gray-600 text-white"
        >
          Archive
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction(onLeave)}
          className="h-full px-4 rounded-none bg-red-500 hover:bg-red-600 text-white"
        >
          Leave
        </Button>
      </div>

      {/* Main content */}
      <div
        className="relative bg-background transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          zIndex: 1
        }}
      >
        {children}
      </div>

      {/* Overlay to detect outside clicks when revealed */}
      {isRevealed && (
        <div
          className="fixed inset-0 z-10"
          onClick={resetSwipe}
        />
      )}
    </div>
  );
};

// Mobile-optimized participant list
interface MobileParticipantListProps {
  participants: GroupChatThread['participants'];
  currentUserId: string;
  onParticipantAction: (participantId: string, action: 'profile' | 'remove' | 'promote') => void;
}

export const MobileParticipantList: React.FC<MobileParticipantListProps> = ({
  participants,
  currentUserId,
  onParticipantAction,
}) => {
  const currentUser = participants?.find(p => p.id === currentUserId);
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-1 p-1">
        {participants?.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => onParticipantAction(participant.id, 'profile')}
          >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {participant.avatar ? (
                    <img 
                      src={participant.avatar} 
                      alt={participant.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {participant.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              {participant.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {participant.name}
                  {participant.id === currentUserId && " (You)"}
                </p>
                {participant.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs px-1 h-4">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {participant.isOnline ? 'Online' : 'Last seen recently'}
              </p>
            </div>

            {isCurrentUserAdmin && participant.id !== currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onParticipantAction(participant.id, 'promote');
                    }}
                  >
                    {participant.role === 'admin' ? 'Remove admin' : 'Make admin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onParticipantAction(participant.id, 'remove');
                    }}
                    className="text-destructive"
                  >
                    Remove from group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// Helper function for time formatting
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  
  return date.toLocaleDateString();
}

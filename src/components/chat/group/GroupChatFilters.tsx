import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  Users,
  User,
  Bell,
  BellOff,
  Pin,
  Archive,
  Crown,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/utils/utils";

export interface ChatFilter {
  type: 'all' | 'groups' | 'direct';
  showUnread: boolean;
  showPinned: boolean;
  showMuted: boolean;
  showArchived: boolean;
  category?: 'family' | 'friends' | 'work' | 'community' | 'other';
  hasAdmin?: boolean;
}

interface GroupChatFiltersProps {
  activeFilter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  groupsCount: number;
  directCount: number;
  unreadCount: number;
  pinnedCount: number;
  className?: string;
}

export const GroupChatFilters: React.FC<GroupChatFiltersProps> = ({
  activeFilter,
  onFilterChange,
  groupsCount,
  directCount,
  unreadCount,
  pinnedCount,
  className,
}) => {
  const quickFilters = [
    {
      id: 'all',
      label: 'All',
      count: groupsCount + directCount,
      active: activeFilter.type === 'all',
      onClick: () => onFilterChange({ ...activeFilter, type: 'all' }),
    },
    {
      id: 'groups',
      label: '👥',
      count: groupsCount,
      active: activeFilter.type === 'groups',
      onClick: () => onFilterChange({ ...activeFilter, type: 'groups' }),
      icon: Users,
    },
    {
      id: 'direct',
      label: '👤',
      count: directCount,
      active: activeFilter.type === 'direct',
      onClick: () => onFilterChange({ ...activeFilter, type: 'direct' }),
      icon: User,
    },
    {
      id: 'unread',
      label: '📩',
      count: unreadCount,
      active: activeFilter.showUnread,
      onClick: () => onFilterChange({ ...activeFilter, showUnread: !activeFilter.showUnread }),
      icon: MessageSquare,
    },
    {
      id: 'pinned',
      label: '📌',
      count: pinnedCount,
      active: activeFilter.showPinned,
      onClick: () => onFilterChange({ ...activeFilter, showPinned: !activeFilter.showPinned }),
      icon: Pin,
    },
  ];

  const categoryOptions = [
    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { value: 'friends', label: 'Friends', emoji: '👥' },
    { value: 'work', label: 'Work', emoji: '💼' },
    { value: 'community', label: 'Community', emoji: '🌍' },
    { value: 'other', label: 'Other', emoji: '📝' },
  ];

  return (
    <div className={cn("flex items-center gap-2 pb-3", className)}>
      {/* Quick Filters */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
        {quickFilters.map((filter) => {
          return (
            <Button
              key={filter.id}
              variant={filter.active ? "default" : "ghost"}
              size="sm"
              onClick={filter.onClick}
              className={cn(
                "flex items-center gap-1 whitespace-nowrap min-w-0 px-3 py-1.5 h-auto text-xs",
                filter.active && "bg-primary text-primary-foreground"
              )}
            >
              <span className="text-sm">{filter.label}</span>
              {filter.count > 0 && (
                <Badge
                  variant={filter.active ? "secondary" : "outline"}
                  className="text-xs h-4 px-1 min-w-[1.25rem] flex items-center justify-center"
                >
                  {filter.count > 99 ? '99+' : filter.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuCheckboxItem
            checked={activeFilter.showMuted}
            onCheckedChange={(checked) =>
              onFilterChange({ ...activeFilter, showMuted: checked })
            }
          >
            <BellOff className="h-4 w-4 mr-2" />
            Show Muted Chats
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={activeFilter.showArchived}
            onCheckedChange={(checked) =>
              onFilterChange({ ...activeFilter, showArchived: checked })
            }
          >
            <Archive className="h-4 w-4 mr-2" />
            Show Archived
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={activeFilter.hasAdmin === true}
            onCheckedChange={(checked) =>
              onFilterChange({ 
                ...activeFilter, 
                hasAdmin: checked ? true : undefined 
              })
            }
          >
            <Crown className="h-4 w-4 mr-2" />
            Admin Groups Only
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled className="text-xs font-medium text-muted-foreground">
            Filter by Category
          </DropdownMenuItem>

          {categoryOptions.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              checked={activeFilter.category === category.value}
              onCheckedChange={(checked) =>
                onFilterChange({
                  ...activeFilter,
                  category: checked ? category.value as any : undefined,
                })
              }
            >
              <span className="mr-2">{category.emoji}</span>
              {category.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              onFilterChange({
                type: 'all',
                showUnread: false,
                showPinned: false,
                showMuted: false,
                showArchived: false,
              })
            }
          >
            Clear All Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

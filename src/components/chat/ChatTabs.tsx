import React from "react";
import { Badge } from "@/components/ui";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Briefcase,
  ShoppingBag,
  Coins,
  Bot,
  MessageSquare,
} from "lucide-react";
import { UnifiedChatType, UnifiedChatTab } from "@/types/unified-chat";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatTabsProps {
  tabs: UnifiedChatTab[];
  activeTab: UnifiedChatType;
  onTabChange: (tab: UnifiedChatType) => void;
  totalUnreadCount?: number;
  className?: string;
}

const iconMap = {
  Users,
  Briefcase,
  ShoppingBag,
  Coins,
  Bot,
  MessageSquare,
};

const colorMap = {
  blue: "text-blue-600 bg-blue-50 border-blue-200",
  green: "text-green-600 bg-green-50 border-green-200",
  orange: "text-orange-600 bg-orange-50 border-orange-200",
  yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
  purple: "text-purple-600 bg-purple-50 border-purple-200",
  gray: "text-gray-600 bg-gray-50 border-gray-200",
};

export const ChatTabs: React.FC<ChatTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  totalUnreadCount,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as UnifiedChatType)} className="w-full">
        <TabsList
          className={cn(
            "flex w-full h-auto bg-muted/30 rounded-lg overflow-x-auto",
            isMobile ? "p-0.5 gap-0.5 touch-pan-x" : "p-1 gap-1",
            "scrollbar-hide", // Hide scrollbar on mobile
          )}
        >
          {tabs.map((tab) => {
            const IconComponent =
              iconMap[tab.icon as keyof typeof iconMap] || MessageSquare;
            const isActive = activeTab === tab.id;
            const hasUnread = (tab.count || 0) > 0;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center relative transition-all duration-200 touch-optimized",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground",
                  "hover:bg-background/60 rounded-md",
                  isMobile && "active:scale-95", // Only scale on mobile
                  // Mobile specific styling
                  isMobile && [
                    "flex-col gap-1 py-2.5 px-1.5 text-xs min-w-[64px] max-w-[80px] min-h-[52px]", // Increased min-height for better touch target
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  ],
                  // Desktop specific styling
                  !isMobile && [
                    "gap-2 py-2.5 px-4 text-sm min-w-0 flex-1 lg:flex-none",
                  ],
                  isActive &&
                    tab.color &&
                    !isMobile &&
                    colorMap[tab.color as keyof typeof colorMap],
                  hasUnread && !isActive && "font-medium",
                )}
              >
                <div className="relative shrink-0">
                  <IconComponent
                    className={cn(
                      "transition-colors",
                      isMobile ? "h-4 w-4" : "h-4 w-4",
                      isActive ? "text-current" : "text-muted-foreground",
                    )}
                  />
                  {hasUnread && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "absolute flex items-center justify-center text-[10px] font-medium",
                        isMobile
                          ? "-top-1.5 -right-1.5 h-4 w-4 p-0 min-w-[16px]"
                          : "-top-1 -right-1 h-3 w-3 p-0 min-w-[12px]",
                      )}
                    >
                      {tab.count! > 99
                        ? "99+"
                        : tab.count! > 9
                          ? "9+"
                          : tab.count}
                    </Badge>
                  )}
                </div>

                {/* Mobile: Show short label below icon */}
                {isMobile ? (
                  <span
                    className={cn(
                      "text-[10px] leading-tight text-center truncate max-w-full",
                      isActive
                        ? "text-current font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {tab.id === "ai_assistant" ? "AI" : tab.label.split(" ")[0]}
                  </span>
                ) : (
                  /* Desktop: Show full label */
                  <span
                    className={cn(
                      "truncate transition-colors",
                      isActive
                        ? "text-current font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {tab.label}
                  </span>
                )}

                {/* AI Assistant special indicator - adjusted for mobile */}
                {tab.id === "ai_assistant" && (
                  <div
                    className={cn(
                      "absolute",
                      isMobile ? "top-0.5 right-0.5" : "top-1 right-1",
                    )}
                  >
                    <div
                      className={cn(
                        "bg-purple-500 rounded-full animate-pulse",
                        isMobile ? "w-1.5 h-1.5" : "w-2 h-2",
                      )}
                    />
                  </div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Total unread count for mobile - improved design */}
      {isMobile && totalUnreadCount && totalUnreadCount > 0 && (
        <div className="flex justify-center mt-2">
          <Badge
            variant="secondary"
            className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
          >
            {totalUnreadCount} unread
          </Badge>
        </div>
      )}
    </div>
  );
};

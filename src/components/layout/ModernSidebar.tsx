import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  MessageSquare,
  Users,
  Video,
  ShoppingBag,
  Briefcase,
  Coins,
  TrendingUp,
  Gift,
  Calendar,
  Settings,
  Bell,
  User,
  PlusCircle,
  Zap,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ModernSidebarProps {
  collapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  color?: string;
  description?: string;
}

const primaryNavItems: NavItem[] = [
  {
    label: "Feed",
    href: "/app/feed",
    icon: Home,
    description: "Your personalized timeline",
  },
  {
    label: "Messages",
    href: "/chat",
    icon: MessageSquare,
    badge: 3,
    description: "All your conversations",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    description: "Your profile and settings",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 5,
    description: "Stay updated",
  },
];

const platformNavItems: NavItem[] = [
  {
    label: "Videos",
    href: "/videos",
    icon: Video,
    color: "text-red-600",
    description: "Create and watch videos",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: ShoppingBag,
    color: "text-orange-600",
    description: "Buy and sell products",
  },
  {
    label: "Freelance",
    href: "/freelance",
    icon: Briefcase,
    color: "text-green-600",
    description: "Find work and hire talent",
  },
  {
    label: "Crypto",
    href: "/app/crypto",
    icon: Coins,
    color: "text-yellow-600",
    description: "Trade cryptocurrencies",
  },
  {
    label: "Rewards",
    href: "/rewards",
    icon: Gift,
    color: "text-purple-600",
    description: "Earn and redeem points",
  },
];

const utilityNavItems: NavItem[] = [
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
    description: "Community events",
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: Bot,
    color: "text-purple-600",
    description: "Get AI-powered help",
  },
  {
    label: "Creator Studio",
    href: "/unified-creator-studio",
    icon: Zap,
    color: "text-blue-600",
    description: "Content creation tools",
  },
];

export default function ModernSidebar({
  collapsed,
  isOpen,
  onClose,
  isMobile,
}: ModernSidebarProps) {
  const location = useLocation();

  const NavItemComponent = ({
    item,
    showLabel = true,
  }: {
    item: NavItem;
    showLabel?: boolean;
  }) => {
    const isActive = location.pathname === item.href;

    return (
      <Link
        to={item.href}
        onClick={isMobile ? onClose : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
          !showLabel && "justify-center px-2",
        )}
      >
        <div className="relative shrink-0">
          <item.icon
            className={cn(
              "h-5 w-5 transition-colors",
              item.color || (isActive ? "text-primary" : ""),
              isActive && "drop-shadow-sm",
            )}
          />
          {item.badge && item.badge > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px]"
            >
              {item.badge > 9 ? "9+" : item.badge}
            </Badge>
          )}
        </div>

        {showLabel && (
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium truncate",
                isActive ? "text-primary" : "",
              )}
            >
              {item.label}
            </p>
            {item.description && !collapsed && (
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            )}
          </div>
        )}
      </Link>
    );
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-300 lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Mobile header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Eloity</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Main
                </h3>
                <div className="space-y-1">
                  {primaryNavItems.map((item) => (
                    <NavItemComponent key={item.href} item={item} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Platform
                </h3>
                <div className="space-y-1">
                  {platformNavItems.map((item) => (
                    <NavItemComponent key={item.href} item={item} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Tools
                </h3>
                <div className="space-y-1">
                  {utilityNavItems.map((item) => (
                    <NavItemComponent key={item.href} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-64px)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Quick actions when collapsed, or welcome message when expanded */}
        <div className="p-3 border-b">
          {collapsed ? (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => (window.location.href = "/create")}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Welcome back!
              </p>
              <p className="text-xs text-muted-foreground">
                Ready to create something amazing?
              </p>
            </div>
          )}
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Primary Navigation */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Main
              </h3>
            )}
            <div className="space-y-1">
              {primaryNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  showLabel={!collapsed}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Platform Features */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Platform
              </h3>
            )}
            <div className="space-y-1">
              {platformNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  showLabel={!collapsed}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Utility Features */}
          <div>
            {!collapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Tools
              </h3>
            )}
            <div className="space-y-1">
              {utilityNavItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  showLabel={!collapsed}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="p-3 border-t">
          <div className="space-y-1">
            <NavItemComponent
              item={{
                label: "Settings",
                href: "/settings",
                icon: Settings,
                description: "App preferences",
              }}
              showLabel={!collapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

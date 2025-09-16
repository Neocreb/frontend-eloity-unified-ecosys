import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDeliveryProvider } from "@/hooks/use-delivery-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  BarChart3,
  Rss,
  ShoppingCart,
  Video,
  TrendingUp,
  Briefcase,
  Calendar,
  Wallet,
  Award,
  Settings,
  Radio,
  X,
  MessageCircle,
  MessageSquare,
  UserCheck,
  Building,
  Megaphone,
  Target,
  Truck,
  Package,
} from "lucide-react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, href, isActive }) => (
  <Link
    to={href}
    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
      isActive ? "bg-blue-50 text-blue-600" : "text-gray-700"
    }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <span className="font-medium">{label}</span>
  </Link>
);

interface ShortcutItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
  onClick?: () => void;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({
  icon,
  label,
  href,
  badge,
  onClick,
}) => (
  <Link
    to={href}
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors min-w-[80px] relative"
  >
    <div className="relative">
      {icon}
      {badge && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
    <span className="text-xs text-center font-medium text-gray-600 truncate w-full">
      {label}
    </span>
  </Link>
);

interface FacebookStyleSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const FacebookStyleSidebar: React.FC<FacebookStyleSidebarProps> = ({
  isOpen = true,
  onClose,
  isMobile = false,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const providerStatus = useDeliveryProvider();

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Dynamic delivery provider shortcut based on user status
  const getDeliveryProviderShortcut = () => {
    if (!providerStatus.loading) {
      if (providerStatus.isProvider && providerStatus.status === "verified") {
        return {
          icon: <Truck className="w-8 h-8 text-emerald-600" />,
          label: "Provider Dashboard",
          href: "/app/delivery/provider/dashboard",
          badge: "Active",
        };
      } else if (providerStatus.isProvider && providerStatus.status === "pending") {
        return {
          icon: <Truck className="w-8 h-8 text-yellow-600" />,
          label: "Provider Status",
          href: "/app/delivery",
          badge: "Pending",
        };
      } else if (providerStatus.isProvider && (providerStatus.status === "rejected" || providerStatus.status === "suspended")) {
        return {
          icon: <Truck className="w-8 h-8 text-red-600" />,
          label: "Provider Status",
          href: "/app/delivery",
          badge: providerStatus.status === "suspended" ? "Suspended" : "Rejected",
        };
      } else {
        return {
          icon: <Truck className="w-8 h-8 text-blue-600" />,
          label: "Become Provider",
          href: "/app/delivery",
          badge: "Apply",
        };
      }
    }
    return null;
  };

  const shortcuts = [
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      label: "Messages",
      href: "/app/chat",
      badge: "2",
    },
    {
      icon: <UserCheck className="w-8 h-8 text-blue-600" />,
      label: "Groups",
      href: "/app/groups",
    },
    {
      icon: <Building className="w-8 h-8 text-blue-600" />,
      label: "Pages",
      href: "/app/pages",
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      label: "Events",
      href: "/app/events",
      badge: "3",
    },
    {
      icon: <Radio className="w-8 h-8 text-red-600" />,
      label: "Live",
      href: "/app/videos?tab=live",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      label: "Crypto",
      href: "/app/crypto",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      label: "Unified Creator Studio",
      href: "/app/unified-creator-studio",
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      label: "Verification",
      href: "/app/premium",
    },
    {
      icon: <Briefcase className="w-8 h-8 text-orange-600" />,
      label: "Freelance",
      href: "/app/freelance",
      badge: "New",
    },
    {
      icon: <Package className="w-8 h-8 text-teal-600" />,
      label: "Track Package",
      href: "/app/delivery/track",
    },
    {
      icon: <Megaphone className="w-8 h-8 text-pink-600" />,
      label: "Campaigns",
      href: "/app/campaigns",
      badge: "Hot",
    },
  ].filter(Boolean);

  // Add dynamic delivery provider shortcut if available
  const deliveryProviderShortcut = getDeliveryProviderShortcut();
  if (deliveryProviderShortcut) {
    shortcuts.splice(-1, 0, deliveryProviderShortcut); // Insert before campaigns
  }

  const menuItems = [
    {
      icon: <Rss className="w-6 h-6 text-blue-600" />,
      label: "Feed",
      href: "/app/feed",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      label: "Connections",
      href: "/app/friends",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
      label: "Messages",
      href: "/app/chat",
    },
    {
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      label: "Groups",
      href: "/app/groups",
    },
    {
      icon: <Building className="w-6 h-6 text-blue-600" />,
      label: "Pages",
      href: "/app/pages",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      label: "Unified Creator Studio",
      href: "/app/unified-creator-studio",
    },
    {
      icon: <Video className="w-6 h-6 text-red-600" />,
      label: "Videos",
      href: "/app/videos",
    },
    {
      icon: <Radio className="w-6 h-6 text-red-500" />,
      label: "Live Streaming",
      href: "/app/videos?tab=live",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      label: "Marketplace",
      href: "/app/marketplace",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      label: "Crypto Trading",
      href: "/app/crypto",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      label: "Freelance",
      href: "/app/freelance",
    },
    {
      icon: <Target className="w-6 h-6 text-pink-600" />,
      label: "Campaign Center",
      href: "/app/campaigns",
    },
    {
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
      label: "Events",
      href: "/app/events",
    },
    {
      icon: <Wallet className="w-6 h-6 text-green-600" />,
      label: "Wallet",
      href: "/app/wallet",
    },
    {
      icon: <Award className="w-6 h-6 text-purple-600" />,
      label: "Rewards",
      href: "/app/rewards",
    },
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      label: "Get Verified",
      href: "/app/premium",
    },
    {
      icon: <Settings className="w-6 h-6 text-gray-600" />,
      label: "Settings",
      href: "/app/settings",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${
          isMobile
            ? `fixed left-0 top-0 bottom-0 z-50 bg-white transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } w-80`
            : "w-80 xl:w-96 2xl:w-80 bg-white border-r border-gray-200 h-full"
        } overflow-y-auto
      `}
      >
        <div className="p-4 space-y-6">
          {/* Close button for mobile */}
          {isMobile && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Profile Section */}
          <Link
            to="/app/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={handleLinkClick}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {user?.name?.substring(0, 2).toUpperCase() || "SC"}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-gray-900 truncate">
              {user?.name || "Your Profile"}
            </span>
          </Link>

          {/* Your Shortcuts Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your shortcuts
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {shortcuts.map((shortcut, index) => (
                <ShortcutItem
                  key={index}
                  icon={shortcut.icon}
                  label={shortcut.label}
                  href={shortcut.href}
                  badge={shortcut.badge}
                  onClick={handleLinkClick}
                />
              ))}
            </div>
          </div>

          {/* Main Menu Items */}
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <Link
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`flex flex-col items-start gap-2 ${
                    isActive(item.href) ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="font-medium text-sm leading-tight">
                    {item.label}
                  </span>
                </Link>
              </div>
            ))}
          </div>

          {/* Privacy & Terms Footer */}
          <div className="text-xs text-gray-500 space-y-1 pb-4">
            <div className="flex flex-wrap gap-2">
              <Link to="/app/privacy" className="hover:underline">
                Privacy
              </Link>
              <span>·</span>
              <Link to="/app/terms" className="hover:underline">
                Terms
              </Link>
              <span>·</span>
              <Link to="/app/advertising" className="hover:underline">
                Advertising
              </Link>
              <span>·</span>
              <Link to="/app/ad-choices" className="hover:underline">
                Ad Choices
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/app/cookies" className="hover:underline">
                Cookies
              </Link>
              <span>·</span>
              <Link to="/app/help" className="hover:underline">
                More
              </Link>
              <span>·</span>
              <span>Eloity © 2024</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacebookStyleSidebar;

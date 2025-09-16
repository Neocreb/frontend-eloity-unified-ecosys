import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Plus,
  Home,
  Video,
  ShoppingBag,
  Briefcase,
  TrendingUp,
  Coins,
  Gift,
  Calendar,
  Zap,
  Bot,
  Wallet,
  Crown,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ShoppingCart,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import SoftchatLogo from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { useNotificationCount } from "@/contexts/UnifiedNotificationContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Header = ({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const notificationCount = useNotificationCount();
  const [searchQuery, setSearchQuery] = useState("");

  // Main navigation items (like mobile footer but organized for desktop)
  const mainNavItems = [
    {
      icon: Home,
      label: "Feed",
      href: "/app/feed",
      active: location.pathname === "/app" || location.pathname === "/app/feed",
    },
    {
      icon: Search,
      label: "Explore",
      href: "/app/explore",
      active: location.pathname === "/app/explore",
    },
    {
      icon: Video,
      label: "Videos",
      href: "/app/videos",
      active: location.pathname === "/app/videos",
    },
    {
      icon: ShoppingBag,
      label: "Market",
      href: "/app/marketplace",
      active:
        location.pathname === "/app/marketplace" ||
        location.pathname.startsWith("/app/marketplace"),
    },
    {
      icon: Briefcase,
      label: "Freelance",
      href: "/app/freelance",
      active:
        location.pathname === "/app/freelance" ||
        location.pathname.startsWith("/app/freelance"),
    },
    {
      icon: Coins,
      label: "Crypto",
      href: "/app/crypto",
      active: location.pathname === "/app/crypto",
    },
    {
      icon: Gift,
      label: "Rewards",
      href: "/app/rewards",
      active: location.pathname === "/app/rewards",
    },
    {
      icon: Gift,
      label: "Send Gifts",
      href: "/app/send-gifts",
      active: location.pathname === "/app/send-gifts",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left section - Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link to="/app/feed" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Eloity</span>
          </Link>
        </div>

        {/* Center section - Main Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/60",
                item.active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-4 w-4", item.active ? "text-primary" : "")}
              />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right section - Search, Actions, User */}
        <div className="flex items-center gap-2">
          {/* Search (Desktop) */}
          <div className="hidden lg:block w-64">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search Eloity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>

          {/* Create button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/app/feed")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/freelance/post-job")}>
                <Briefcase className="h-4 w-4 mr-2" />
                Post Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/freelance/post-skill")}>
                <Award className="h-4 w-4 mr-2" />
                Post Skill/Talent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/marketplace/sell")}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                List Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/notifications")}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/chat")}
            className="relative"
          >
            <MessageSquare className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              5
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/ai-assistant")}>
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/wallet")}>
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/chat")}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/send-gifts")}>
                <Gift className="mr-2 h-4 w-4 text-pink-600" />
                <span className="text-pink-600">Send Gifts</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/premium")}>
                <Crown className="mr-2 h-4 w-4 text-purple-600" />
                <span className="text-purple-600">Premium</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/kyc")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                KYC Verification
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/app/notifications")}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

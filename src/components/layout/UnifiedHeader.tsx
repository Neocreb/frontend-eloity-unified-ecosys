// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ShoppingCart,
  Heart,
  Briefcase,
  TrendingUp,
  Coins,
  Gift,
  Zap,
  Bot,
  Wallet,
  Crown,
  ShieldCheck,
  CreditCard,
  Store,
  Package,
  History,
  X,
  Bookmark,
  Filter,
  Mic,
  Camera,
  Globe,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  BarChart3,
  Layers,
  Archive,
  BookOpen,
  Award,
  ExternalLink,
  DollarSign,
  Eye,
  Star,
  MapPin,
  ToggleLeft,
  Truck,
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { globalSearchService } from "@/services/globalSearchService";
import UserSearchModal from '@/components/search/UserSearchModal';

interface UnifiedHeaderProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  type: "user" | "product" | "service" | "post" | "video" | "crypto" | "job";
  title: string;
  description: string;
  image?: string;
  price?: number;
  rating?: number;
  location?: string;
  category?: string;
  tags?: string[];
  timestamp?: Date;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "user",
    title: "Sarah Johnson",
    description: "Full Stack Developer & Tech Entrepreneur",
    image: "/api/placeholder/40/40",
    location: "San Francisco, CA",
    tags: ["React", "Node.js", "TypeScript"],
    author: { name: "Sarah Johnson", verified: true },
    stats: { views: 1234 },
  },
  {
    id: "2",
    type: "product",
    title: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with 30-hour battery",
    image: "/api/placeholder/200/200",
    price: 199.99,
    rating: 4.8,
    category: "Electronics",
    tags: ["Audio", "Wireless", "Premium"],
    author: { name: "TechStore Pro", verified: true },
    stats: { views: 5678, likes: 234 },
  },
  {
    id: "3",
    type: "job",
    title: "Frontend Developer Position",
    description: "Remote React developer needed for exciting startup",
    price: 75,
    category: "Development",
    tags: ["React", "Remote", "Frontend"],
    author: { name: "StartupCorp", verified: true },
    stats: { views: 890 },
  },
  {
    id: "4",
    type: "crypto",
    title: "Bitcoin (BTC)",
    description: "Leading cryptocurrency with strong institutional adoption",
    price: 45000,
    category: "Cryptocurrency",
    tags: ["BTC", "Bitcoin", "Crypto"],
    stats: { views: 9876 },
  },
  {
    id: "5",
    type: "video",
    title: "How to Build a React App",
    description: "Complete tutorial for beginners",
    author: { name: "CodeMaster", verified: true },
    stats: { views: 12450, likes: 890 },
  },
];

const UnifiedHeader = () => {
  const { user, logout } = useAuth();
  const { cart, wishlist, getCartItemsCount, getCartTotal, categories } =
    useEnhancedMarketplace();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);

  // Marketplace mode state
  const [marketplaceMode, setMarketplaceMode] = useState<"buyer" | "seller">(
    "buyer",
  );

  // Mobile search overlay state
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    marketplace: false,
    freelance: false,
    finance: false,
    premiumTools: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Navigation items with dynamic badges
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
      badge: getCartItemsCount() > 0 ? getCartItemsCount() : undefined,
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
  ];

  // Load search history on mount
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recent-searches") || "[]");
    const saved = JSON.parse(localStorage.getItem("saved-searches") || "[]");
    setRecentSearches(recent);
    setSavedSearches(saved);
  }, []);

  // Add this effect to handle search when query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Use global search service for real API integration
        const searchResponse = await globalSearchService.search({
          query: searchQuery,
          limit: 8, // Limit for header preview
        });

        setSearchResults(searchResponse.results);
        setShowSearchOverlay(true);
      } catch (error) {
        console.error("Search failed:", error);
        // Fallback to mock results if API fails
        const filteredResults = mockSearchResults.filter(
          (result) =>
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.tags?.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        );
        setSearchResults(filteredResults);
        setShowSearchOverlay(true);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        search();
      } else {
        setSearchResults([]);
        setShowSearchOverlay(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to global search with enhanced URL params
      navigate(
        `/app/global-search?q=${encodeURIComponent(searchQuery.trim())}&source=header`,
      );
      setSearchQuery("");
      setShowSearchOverlay(false);
      setShowMobileSearch(false);
    }
  };

  const handleQuickSearch = (query: string, type?: string) => {
    const searchUrl = `/app/global-search?q=${encodeURIComponent(query)}`;
    const typeParam = type ? `&type=${type}` : '';
    navigate(searchUrl + typeParam + '&source=header');
    setSearchQuery("");
    setShowSearchOverlay(false);
    setShowMobileSearch(false);
  };

  const handleResultSelect = (result: SearchResult) => {
    // Navigate based on result type
    switch (result.type) {
      case "user":
        navigate(`/app/profile/${result.id}`);
        break;
      case "product":
        navigate(`/app/marketplace/product/${result.id}`);
        break;
      case "service":
        navigate(`/app/freelance/service/${result.id}`);
        break;
      case "job":
        navigate(`/app/freelance/job/${result.id}`);
        break;
      case "post":
        navigate(`/app/post/${result.id}`);
        break;
      case "video":
        navigate(`/app/videos/${result.id}`);
        break;
      case "crypto":
        navigate(`/app/crypto/${result.title.toLowerCase()}`);
        break;
      default:
        navigate(`/app/explore?q=${encodeURIComponent(result.title)}`);
    }
    setShowSearchOverlay(false);
    setShowMobileSearch(false);
  };

  const saveSearch = () => {
    if (searchQuery.trim() && !savedSearches.includes(searchQuery)) {
      const newSaved = [searchQuery, ...savedSearches];
      setSavedSearches(newSaved);
      localStorage.setItem("saved-searches", JSON.stringify(newSaved));
      toast({
        title: "Search Saved",
        description: "Added to your saved searches",
      });
    }
  };

  const removeRecentSearch = (searchTerm: string) => {
    const newRecent = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(newRecent);
    localStorage.setItem("recent-searches", JSON.stringify(newRecent));
  };

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

  const toggleMarketplaceMode = () => {
    const newMode = marketplaceMode === "buyer" ? "seller" : "buyer";
    setMarketplaceMode(newMode);
    toast({
      title: `Switched to ${newMode} mode`,
      description: `You're now browsing as a ${newMode}`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
  };

  // Mobile Search Overlay
  const MobileSearchOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background transition-transform duration-300",
        showMobileSearch ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileSearch(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, users, jobs..."
                className="pl-10 pr-20"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={saveSearch}
                    className="h-6 w-6 p-0"
                  >
                    <Bookmark className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {searchResults.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {isSearching
                  ? "Searching..."
                  : `${searchResults.length} results`}
              </p>
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultSelect(result)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      {result.image && (
                        <div className="w-12 h-12 flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {result.title}
                          </h3>
                          <Badge variant="outline" className="text-xs ml-2">
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.description}
                        </p>
                        {result.price && (
                          <p className="text-xs font-medium">
                            {formatPrice(result.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Recent Searches
              </p>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => setSearchQuery(search)}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <header
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur
    supports-[backdrop-filter]:bg-background/60 shadow-md"
      >
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left section - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/app/feed" className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Eloity</span>
            </Link>
          </div>

          {/* Center section - Main Navigation (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/60 relative",
                  item.active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-4 w-4", item.active ? "text-primary" : "")}
                />
                <span className="hidden xl:block">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Right section - Search, Actions, User */}
          <div className="flex items-center gap-2">
            {/* Desktop Search */}
            <div className="hidden lg:block w-64 xl:w-72 2xl:w-80 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  type="search"
                  placeholder="Search across Eloity - users, products, jobs, videos, crypto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchOverlay(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchOverlay(false), 200)
                  }
                  className="pl-10 pr-20 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={saveSearch}
                      className="h-6 w-6 p-0"
                    >
                      <Bookmark className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </form>

              {/* Desktop Search Overlay */}
              {showSearchOverlay &&
                (searchQuery || recentSearches.length > 0) && (
                  <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50">
                    <CardContent className="p-2">
                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="space-y-1 mb-2">
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                            {isSearching
                              ? "Searching..."
                              : `${searchResults.length} results`}
                          </div>
                          {searchResults.slice(0, 5).map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleResultSelect(result)}
                              className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-3"
                            >
                              {result.image && (
                                <div className="w-8 h-8 flex-shrink-0">
                                  <img
                                    src={result.image}
                                    alt={result.title}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium truncate">
                                    {result.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs ml-2"
                                  >
                                    {result.type}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </div>
                                {result.price && (
                                  <div className="text-xs font-medium text-green-600">
                                    {formatPrice(result.price)}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Recent Searches */}
                      {recentSearches.length > 0 && !searchQuery && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                            Recent Searches
                          </div>
                          {recentSearches.slice(0, 5).map((search, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted"
                            >
                              <button
                                onClick={() => setSearchQuery(search)}
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                <History className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{search}</span>
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRecentSearch(search)}
                                className="h-4 w-4 p-0"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Actions */}
                      {!searchQuery && (
                        <div className="pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => setShowUserSearch(true)}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Find People to Connect With
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Heart className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/notifications")}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/messages")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/wallet")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/app/rewards")}>
                  <Gift className="mr-2 h-4 w-4" />
                  <span>Rewards</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* User Search Modal */}
      <UserSearchModal
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onSelectUser={(user) => {
          navigate(`/app/profile/${user.id}`);
        }}
        title="Find People to Connect With"
        placeholder="Search by username or name..."
      />

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, users, jobs..."
                    className="pl-10 pr-20"
                    autoFocus
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={saveSearch}
                        className="h-6 w-6 p-0"
                      >
                        <Bookmark className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Mobile Search Results */}
            <div className="space-y-4">
              {searchResults.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {isSearching
                      ? "Searching..."
                      : `${searchResults.length} results`}
                  </p>
                  {searchResults.map((result) => (
                    <Card
                      key={result.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultSelect(result)}
                    >
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          {result.image && (
                            <div className="w-12 h-12 flex-shrink-0">
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium text-sm line-clamp-1">
                                {result.title}
                              </h3>
                              <Badge variant="outline" className="text-xs ml-2">
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {result.description}
                            </p>
                            {result.price && (
                              <p className="text-xs font-medium">
                                {formatPrice(result.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !searchQuery && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Recent Searches
                  </p>
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => setSearchQuery(search)}
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(search);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              {!searchQuery && (
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowUserSearch(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find People to Connect With
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedHeader;

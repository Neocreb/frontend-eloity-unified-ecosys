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

const UnifiedHeader = ({
  mobileMenuOpen = false,
  setMobileMenuOpen,
}: UnifiedHeaderProps) => {
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

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);

    try {
      // Use global search service for real API integration
      const searchResponse = await globalSearchService.search({
        query: searchQuery,
        limit: 5, // Limit for header preview
      });

      setSearchResults(searchResponse.results);
      setShowSearchOverlay(true);

      // Save to recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
        const newRecent = [searchQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecent);
        localStorage.setItem("recent-searches", JSON.stringify(newRecent));
      }

      // Track search analytics
      await globalSearchService.trackSearch(searchQuery, searchResponse.totalCount);
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
        navigate(
          `/app/user/${result.title.toLowerCase().replace(/\s+/g, "-")}`,
        );
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
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // On mobile, navigate directly to global search for better UX
                navigate('/app/global-search?source=mobile');
              }}
              className="lg:hidden"
              title="Search across all platform features"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Marketplace Mode Toggle */}
            {(location.pathname.includes("/marketplace") ||
              location.pathname.includes("/freelance")) && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMarketplaceMode}
                className="hidden md:flex items-center gap-2"
              >
                <ToggleLeft className="h-4 w-4" />
                <span className="text-xs">
                  {marketplaceMode === "buyer" ? "Buy" : "Sell"}
                </span>
              </Button>
            )}

            {/* Cart Button with Badge */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/marketplace/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartItemsCount() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {getCartItemsCount()}
                </Badge>
              )}
            </Button>

            {/* Wishlist Button with Badge */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/marketplace/wishlist")}
              className="relative hidden sm:flex"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                >
                  {wishlist.length}
                </Badge>
              )}
            </Button>

            {/* Create button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="hidden md:flex items-center gap-2"
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

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Messages */}
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
                    <AvatarImage
                      src={user?.user_metadata?.avatar || "/placeholder.svg"}
                      alt={user?.user_metadata?.name || "@user"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.user_metadata?.name
                        ?.substring(0, 2)
                        .toUpperCase() || "SC"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-72 max-h-[80vh] overflow-y-auto"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Profile Section */}
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/app/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Marketplace Section - Collapsible */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between cursor-pointer font-medium"
                    onClick={() => toggleSection("marketplace")}
                  >
                    <div className="flex items-center">
                      <Store className="mr-2 h-4 w-4" />
                      <span>Marketplace</span>
                    </div>
                    {expandedSections.marketplace ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  {expandedSections.marketplace && (
                    <>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/marketplace")}
                      >
                        <Store className="mr-2 h-4 w-4" />
                        <span>Browse</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/marketplace/cart")}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Cart ({getCartItemsCount()})</span>
                        {getCartTotal() > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            ${getCartTotal().toFixed(2)}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/marketplace/wishlist")}
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist ({wishlist.length})</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/marketplace/my")}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/marketplace/seller")}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Seller Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Freelance Section - Collapsible */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between cursor-pointer font-medium"
                    onClick={() => toggleSection("freelance")}
                  >
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Freelance</span>
                    </div>
                    {expandedSections.freelance ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  {expandedSections.freelance && (
                    <>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/freelance")}
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Browse Jobs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/freelance/dashboard")}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Finance Section - Collapsible */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between cursor-pointer font-medium"
                    onClick={() => toggleSection("finance")}
                  >
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Finance</span>
                    </div>
                    {expandedSections.finance ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  {expandedSections.finance && (
                    <>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/wallet")}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Wallet</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/crypto")}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Crypto</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/rewards")}
                      >
                        <Award className="mr-2 h-4 w-4" />
                        <span>Rewards</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Premium & Tools - Collapsible */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between cursor-pointer font-medium"
                    onClick={() => toggleSection("premiumTools")}
                  >
                    <div className="flex items-center">
                      <Crown className="mr-2 h-4 w-4 text-purple-600" />
                      <span>Premium & Tools</span>
                    </div>
                    {expandedSections.premiumTools ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>

                  {expandedSections.premiumTools && (
                    <>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/premium")}
                      >
                        <Crown className="mr-2 h-4 w-4 text-purple-600" />
                        <span className="text-purple-600">Premium</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/ai-assistant")}
                      >
                        <Bot className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">AI Assistant</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/kyc")}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>KYC Verification</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/delivery/provider/dashboard")}
                      >
                        <Truck className="mr-2 h-4 w-4 text-orange-600" />
                        <span className="text-orange-600">Delivery Provider Demo</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="pl-6"
                        onClick={() => navigate("/app/send-gifts")}
                      >
                        <Gift className="mr-2 h-4 w-4 text-pink-600" />
                        <span className="text-pink-600">Send Gifts</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay />
    </>
  );
};

export default UnifiedHeader;

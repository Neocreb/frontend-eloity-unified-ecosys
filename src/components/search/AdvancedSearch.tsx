// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Filter,
  Star,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Tag,
  MapPin,
  Calendar,
  Mic,
  Camera,
  X,
  History,
  Bookmark,
  Zap,
  Globe,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  ChevronDown,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Sliders,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "user" | "product" | "service" | "post" | "video" | "crypto";
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

interface SearchFilters {
  type: string[];
  category: string[];
  priceRange: [number, number];
  rating: number;
  location: string;
  dateRange: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedSearchProps {
  placeholder?: string;
  showFilters?: boolean;
  onResultSelect?: (result: SearchResult) => void;
  initialQuery?: string;
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
    description:
      "Premium noise-cancelling headphones with 30-hour battery life",
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
    type: "service",
    title: "Professional Logo Design",
    description:
      "Custom logo design with unlimited revisions and brand guidelines",
    image: "/api/placeholder/200/200",
    price: 150,
    rating: 4.9,
    category: "Design",
    tags: ["Logo", "Branding", "Design"],
    author: { name: "Alex Designer", verified: true },
    stats: { views: 3456 },
  },
  {
    id: "4",
    type: "post",
    title: "The Future of Web Development in 2024",
    description:
      "Exploring emerging trends and technologies that will shape web development...",
    timestamp: new Date("2024-01-15"),
    category: "Technology",
    tags: ["Web Dev", "Trends", "2024"],
    author: { name: "Mike Chen", avatar: "/api/placeholder/32/32" },
    stats: { views: 2345, likes: 156, comments: 23, shares: 45 },
  },
  {
    id: "5",
    type: "crypto",
    title: "Bitcoin (BTC)",
    description: "Leading cryptocurrency with strong institutional adoption",
    price: 45000,
    category: "Cryptocurrency",
    tags: ["BTC", "Bitcoin", "Crypto"],
    stats: { views: 9876 },
  },
];

const searchCategories = [
  "All",
  "Users",
  "Products",
  "Services",
  "Posts",
  "Videos",
  "Crypto",
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "rating", label: "Rating" },
  { value: "price", label: "Price" },
  { value: "popularity", label: "Popularity" },
  { value: "alphabetical", label: "Alphabetical" },
];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = "Search everything...",
  showFilters = true,
  onResultSelect,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    category: [],
    priceRange: [0, 10000],
    rating: 0,
    location: "",
    dateRange: "all",
    sortBy: "relevance",
    sortOrder: "desc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Load recent and saved searches
    const recent = JSON.parse(localStorage.getItem("recent-searches") || "[]");
    const saved = JSON.parse(localStorage.getItem("saved-searches") || "[]");
    setRecentSearches(recent);
    setSavedSearches(saved);
  }, []);

  useEffect(() => {
    // Debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        performSearch();
        generateSuggestions();
      } else {
        setResults([]);
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters]);

  const performSearch = async () => {
    setIsSearching(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter and sort results based on current filters
      let filteredResults = mockSearchResults.filter((result) => {
        const matchesQuery =
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          );

        const matchesType =
          filters.type.length === 0 || filters.type.includes(result.type);
        const matchesCategory =
          filters.category.length === 0 ||
          (result.category && filters.category.includes(result.category));
        const matchesRating =
          !filters.rating || (result.rating && result.rating >= filters.rating);
        const matchesPrice =
          !result.price ||
          (result.price >= filters.priceRange[0] &&
            result.price <= filters.priceRange[1]);

        return (
          matchesQuery &&
          matchesType &&
          matchesCategory &&
          matchesRating &&
          matchesPrice
        );
      });

      // Sort results
      filteredResults.sort((a, b) => {
        const order = filters.sortOrder === "desc" ? -1 : 1;

        switch (filters.sortBy) {
          case "date":
            return (
              (new Date(b.timestamp || 0).getTime() -
                new Date(a.timestamp || 0).getTime()) *
              order
            );
          case "rating":
            return ((b.rating || 0) - (a.rating || 0)) * order;
          case "price":
            return ((a.price || 0) - (b.price || 0)) * order;
          case "popularity":
            return ((b.stats?.views || 0) - (a.stats?.views || 0)) * order;
          case "alphabetical":
            return a.title.localeCompare(b.title) * order;
          default:
            return 0;
        }
      });

      setResults(filteredResults);

      // Save to recent searches
      if (query.trim() && !recentSearches.includes(query)) {
        const newRecent = [query, ...recentSearches.slice(0, 9)];
        setRecentSearches(newRecent);
        localStorage.setItem("recent-searches", JSON.stringify(newRecent));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const generateSuggestions = () => {
    const allTerms = [
      ...mockSearchResults.flatMap((r) => r.tags || []),
      ...mockSearchResults.map((r) => r.title),
      ...mockSearchResults.map((r) => r.category).filter(Boolean),
    ];

    const matchingSuggestions = allTerms
      .filter(
        (term) => term && term.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);

    setSuggestions(matchingSuggestions);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const saveSearch = () => {
    if (query.trim() && !savedSearches.includes(query)) {
      const newSaved = [query, ...savedSearches];
      setSavedSearches(newSaved);
      localStorage.setItem("saved-searches", JSON.stringify(newSaved));
    }
  };

  const removeRecentSearch = (searchTerm: string) => {
    const newRecent = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(newRecent);
    localStorage.setItem("recent-searches", JSON.stringify(newRecent));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      category: [],
      priceRange: [0, 10000],
      rating: 0,
      location: "",
      dateRange: "all",
      sortBy: "relevance",
      sortOrder: "desc",
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

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={saveSearch}
                className="h-6 w-6 p-0"
              >
                <Bookmark className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery("")}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (query || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-2">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-muted flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Recent Searches
                  </div>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted"
                    >
                      <button
                        onClick={() => handleSuggestionClick(search)}
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

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Saved Searches
                  </div>
                  {savedSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-muted flex items-center gap-2"
                    >
                      <Bookmark className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search Controls */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.type.length > 0 || filters.category.length > 0) && (
              <Badge variant="secondary" className="ml-1">
                {filters.type.length + filters.category.length}
              </Badge>
            )}
          </Button>

          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
              }))
            }
          >
            {filters.sortOrder === "desc" ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
          </Button>

          <div className="flex border rounded">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>

          {(filters.type.length > 0 || filters.category.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFiltersPanel && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Content Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content Type
                </label>
                <div className="space-y-2">
                  {searchCategories.slice(1).map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters((prev) => ({
                              ...prev,
                              type: [...prev.type, type.toLowerCase()],
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              type: prev.type.filter(
                                (t) => t !== type.toLowerCase(),
                              ),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          parseInt(e.target.value) || 0,
                          prev.priceRange[1],
                        ],
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          prev.priceRange[0],
                          parseInt(e.target.value) || 10000,
                        ],
                      }))
                    }
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Rating
                </label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, rating: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Date Range
                </label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, dateRange: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isSearching
                ? "Searching..."
                : `${results.length} results for "${query}"`}
            </p>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {results.map((result) => (
              <Card
                key={result.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onResultSelect?.(result)}
              >
                <CardContent className={viewMode === "grid" ? "p-4" : "p-3"}>
                  <div
                    className={viewMode === "grid" ? "space-y-3" : "flex gap-3"}
                  >
                    {result.image && (
                      <div
                        className={
                          viewMode === "grid"
                            ? "w-full h-40"
                            : "w-16 h-16 flex-shrink-0"
                        }
                      >
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm line-clamp-1">
                            {result.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>

                      {result.author && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={result.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {result.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {result.author.name}
                          </span>
                          {result.author.verified && (
                            <Star className="w-3 h-3 text-blue-500 fill-current" />
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {result.price && (
                            <span className="font-medium">
                              {formatPrice(result.price)}
                            </span>
                          )}
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span>{result.rating}</span>
                            </div>
                          )}
                          {result.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{result.location}</span>
                            </div>
                          )}
                        </div>

                        {result.stats && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {result.stats.views && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{formatNumber(result.stats.views)}</span>
                              </div>
                            )}
                            {result.stats.likes && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{formatNumber(result.stats.likes)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {result.tags && result.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

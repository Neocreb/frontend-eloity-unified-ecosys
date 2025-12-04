import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  Package,
  MapPin,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { searchService } from "@/services/searchService";
import { categoryService } from "@/services";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "product" | "category" | "brand" | "trending";
  category?: string;
  productCount?: number;
}

interface SearchFilters {
  category?: string;
  priceRange: [number, number];
  rating?: number;
  features: string[];
  shipping: string[];
  seller: string[];
  location?: string;
  sortBy: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilters) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
  showFilters?: boolean;
  categories?: Array<{ id: string; name: string; productCount: number }>;
}

const defaultFilters: SearchFilters = {
  priceRange: [0, 1000],
  features: [],
  shipping: [],
  seller: [],
  sortBy: "relevance",
};

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  placeholder = "Search products, brands, categories...",
  onSearch,
  onSuggestionSelect,
  className,
  showFilters = true,
  categories = [],
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent and trending searches
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const recent = await searchService.getRecentSearches();
        setRecentSearches(recent);
        
        const trending = await searchService.getTrendingSearches();
        setTrendingSearches(trending);
      } catch (error) {
        console.error("Error loading search data:", error);
        // Fallback to empty arrays if real data fetch fails
        setRecentSearches([]);
        setTrendingSearches([]);
      }
    };

    loadSearchData();
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        try {
          setLoading(true);
          const searchSuggestions = await searchService.getSearchSuggestions(query);
          setSuggestions(searchSuggestions.slice(0, 8) as SearchSuggestion[]);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          // Fallback to empty array if real data fetch fails
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      // Save to recent searches
      searchService.saveRecentSearch(query);
      
      onSearch(query, filters);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.text, filters);
    
    // Save to recent searches
    searchService.saveRecentSearch(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update active filters for display
    const active: string[] = [];
    if (newFilters.category) active.push(`Category: ${newFilters.category}`);
    if (newFilters.rating) active.push(`${newFilters.rating}+ Stars`);
    if (newFilters.features.length > 0) active.push(...newFilters.features);
    if (newFilters.shipping.length > 0) active.push(...newFilters.shipping);
    if (newFilters.seller.length > 0) active.push(...newFilters.seller);
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000) {
      active.push(
        `$${newFilters.priceRange[0]} - $${newFilters.priceRange[1]}`,
      );
    }
    setActiveFilters(active);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setActiveFilters([]);
  };

  const removeFilter = (filterToRemove: string) => {
    const newFilters = { ...filters };

    if (filterToRemove.startsWith("Category:")) {
      newFilters.category = undefined;
    } else if (filterToRemove.includes("Stars")) {
      newFilters.rating = undefined;
    } else if (filterToRemove.startsWith("$")) {
      newFilters.priceRange = [0, 1000];
    } else {
      newFilters.features = newFilters.features.filter(
        (f) => f !== filterToRemove,
      );
      newFilters.shipping = newFilters.shipping.filter(
        (s) => s !== filterToRemove,
      );
      newFilters.seller = newFilters.seller.filter((s) => s !== filterToRemove);
    }

    updateFilter("category", newFilters.category);
    setFilters(newFilters);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "category":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "brand":
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            {showFilters && (
              <Popover
                open={showFiltersPanel}
                onOpenChange={setShowFiltersPanel}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Filters</h3>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Category Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Category
                        </label>
                        <Select
                          value={filters.category || ""}
                          onValueChange={(value) =>
                            updateFilter("category", value || undefined)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All categories</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name} ({cat.productCount})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      {/* Price Range */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Price Range: ${filters.priceRange[0]} - $
                          {filters.priceRange[1]}
                        </label>
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) =>
                            updateFilter("priceRange", value)
                          }
                          max={1000}
                          min={0}
                          step={10}
                          className="mt-2"
                        />
                      </div>

                      <Separator />

                      {/* Rating Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Minimum Rating
                        </label>
                        <div className="flex gap-2">
                          {[4, 3, 2, 1].map((rating) => (
                            <Button
                              key={rating}
                              variant={
                                filters.rating === rating
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => updateFilter("rating", rating)}
                            >
                              {rating}+ ⭐
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Features */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Features
                        </label>
                        <div className="space-y-2">
                          {[
                            "Free Shipping",
                            "Express Delivery",
                            "New Arrivals",
                            "On Sale",
                          ].map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={feature}
                                checked={filters.features.includes(feature)}
                                onCheckedChange={(checked) => {
                                  const newFeatures = checked
                                    ? [...filters.features, feature]
                                    : filters.features.filter(
                                        (f) => f !== feature,
                                      );
                                  updateFilter("features", newFeatures);
                                }}
                              />
                              <label htmlFor={feature} className="text-sm">
                                {feature}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Sort By */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Sort By
                        </label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) =>
                            updateFilter("sortBy", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Relevance</SelectItem>
                            <SelectItem value="price-low">
                              Price: Low to High
                            </SelectItem>
                            <SelectItem value="price-high">
                              Price: High to Low
                            </SelectItem>
                            <SelectItem value="rating">
                              Customer Rating
                            </SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="popular">
                              Most Popular
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <Button onClick={handleSearch} className="h-12 px-6">
              Search
            </Button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading suggestions...
              </div>
            ) : query.length === 0 ? (
              <div className="p-4 space-y-4">
                {/* Recent Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Recent
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleSuggestionClick({
                            id: `recent-${index}`,
                            text: search,
                            type: "product",
                          })
                        }
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Trending
                    </span>
                  </div>
                  <div className="space-y-1">
                    {trendingSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleSuggestionClick({
                            id: `trending-${index}`,
                            text: search,
                            type: "trending",
                          })
                        }
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {suggestion.text}
                      </div>
                      {suggestion.category && (
                        <div className="text-xs text-gray-500">
                          in {suggestion.category}
                        </div>
                      )}
                      {suggestion.productCount && (
                        <div className="text-xs text-gray-500">
                          {suggestion.productCount} products
                        </div>
                      )}
                    </div>
                    {suggestion.type === "trending" && (
                      <Badge variant="secondary" className="text-xs">
                        Trending
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : query.length > 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No suggestions found for "{query}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {filter}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;

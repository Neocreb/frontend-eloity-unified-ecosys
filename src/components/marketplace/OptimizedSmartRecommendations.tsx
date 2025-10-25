import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  ArrowRight,
  Zap,
  Target,
  Brain,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { recommendationService } from "@/services/recommendationService";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  viewCount?: number;
  soldCount?: number;
}

interface RecommendationReason {
  type:
    | "trending"
    | "similar_users"
    | "recently_viewed"
    | "category_based"
    | "price_drop"
    | "high_rated"
    | "personalized";
  text: string;
  confidence: number;
}

interface RecommendedProduct extends Product {
  reason: RecommendationReason;
  score: number;
}

interface OptimizedSmartRecommendationsProps {
  userId?: string;
  currentProduct?: Product;
  recentlyViewed?: Product[];
  userPreferences?: {
    categories: string[];
    priceRange: [number, number];
    brands: string[];
  };
  onProductClick?: (product: Product) => void;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  className?: string;
  maxItems?: number;
  enableRealTimeUpdates?: boolean;
}

export const OptimizedSmartRecommendations: React.FC<
  OptimizedSmartRecommendationsProps
> = ({
  userId,
  currentProduct,
  recentlyViewed = [],
  userPreferences = {
    categories: ["Electronics", "Fashion"],
    priceRange: [0, 1000],
    brands: ["Apple", "Samsung", "Nike"],
  },
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  className,
  maxItems = 8,
  enableRealTimeUpdates = false, // Default to false to prevent flickering
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real recommendations
  useEffect(() => {
    loadRecommendations();
  }, [userId, currentProduct, refreshKey, user?.id]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get recommendations from service
      const recommendationData = await recommendationService.getRecommendations({
        userId: userId || user?.id,
        currentProductId: currentProduct?.id,
        recentlyViewed: recentlyViewed.map(p => p.id),
        userPreferences,
        limit: maxItems
      });
      
      setRecommendations(recommendationData);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      // Fallback to empty array if real data fetch fails
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((product) => {
      if (activeTab === "all") return true;
      return product.reason.type === activeTab;
    });
  }, [recommendations, activeTab]);

  const getReasonIcon = useCallback((type: RecommendationReason["type"]) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case "high_rated":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "price_drop":
        return <Zap className="w-4 h-4 text-red-500" />;
      case "category_based":
        return <Target className="w-4 h-4 text-blue-500" />;
      case "recently_viewed":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "similar_users":
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Brain className="w-4 h-4 text-purple-500" />;
    }
  }, []);

  const getReasonColor = useCallback((type: RecommendationReason["type"]) => {
    switch (type) {
      case "trending":
        return "border-orange-200 bg-orange-50";
      case "high_rated":
        return "border-yellow-200 bg-yellow-50";
      case "price_drop":
        return "border-red-200 bg-red-50";
      case "category_based":
        return "border-blue-200 bg-blue-50";
      case "recently_viewed":
        return "border-gray-200 bg-gray-50";
      case "similar_users":
        return "border-green-200 bg-green-50";
      default:
        return "border-purple-200 bg-purple-50";
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }, []);

  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-3 h-3",
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300",
        )}
      />
    ));
  }, []);

  const refreshRecommendations = useCallback(() => {
    setIsRefreshing(true);
    // Add a delay to show the refresh state
    setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleProductClick = useCallback(
    (product: Product) => {
      onProductClick?.(product);
    },
    [onProductClick],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      onAddToCart?.(productId);
    },
    [onAddToCart],
  );

  const handleAddToWishlist = useCallback(
    (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      onAddToWishlist?.(productId);
    },
    [onAddToWishlist],
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      onQuickView?.(product);
    },
    [onQuickView],
  );

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <CardTitle className="text-xl">Smart Recommendations</CardTitle>
              </div>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <CardTitle className="text-xl">Smart Recommendations</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshRecommendations}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs">
                Trending
              </TabsTrigger>
              <TabsTrigger value="high_rated" className="text-xs">
                Top Rated
              </TabsTrigger>
              <TabsTrigger value="price_drop" className="text-xs">
                Deals
              </TabsTrigger>
              <TabsTrigger
                value="category_based"
                className="text-xs lg:block hidden"
              >
                For You
              </TabsTrigger>
              <TabsTrigger
                value="recently_viewed"
                className="text-xs lg:block hidden"
              >
                Similar
              </TabsTrigger>
              <TabsTrigger
                value="personalized"
                className="text-xs lg:block hidden"
              >
                Personal
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isRefreshing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                        <div className="bg-gray-200 h-4 rounded mb-2"></div>
                        <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                      </div>
                    ))}
                </div>
              ) : filteredRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRecommendations.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* AI Reason Badge */}
                      <div
                        className={cn(
                          "absolute top-2 left-2 z-10 px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1",
                          getReasonColor(product.reason.type),
                        )}
                      >
                        {getReasonIcon(product.reason.type)}
                        <span className="hidden sm:inline truncate max-w-24">
                          {product.reason.type === "trending"
                            ? "Trending"
                            : product.reason.type === "high_rated"
                              ? "Top Rated"
                              : product.reason.type === "price_drop"
                                ? "Deal"
                                : product.reason.type === "category_based"
                                  ? "For You"
                                  : "Personal"}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/90 hover:bg-white w-8 h-8"
                            onClick={(e) => handleAddToWishlist(e, product.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/90 hover:bg-white w-8 h-8"
                            onClick={(e) => handleQuickView(e, product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-red-500 text-sm">
                            {formatPrice(
                              product.salePrice || product.originalPrice,
                            )}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Confidence Score */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-600">
                              {Math.round(product.reason.confidence * 100)}%
                              match
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Score: {product.score.toFixed(1)}
                          </Badge>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full bg-black hover:bg-gray-800 text-white text-xs"
                          size="sm"
                          onClick={(e) => handleAddToCart(e, product.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No recommendations available for this category
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedSmartRecommendations;
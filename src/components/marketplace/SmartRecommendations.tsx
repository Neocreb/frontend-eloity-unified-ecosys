import React, { useState, useEffect } from "react";
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
import { MarketplaceService } from "@/services/marketplaceService";
import { Product } from "@/types/marketplace";

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

interface SmartRecommendationsProps {
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

// Remove mock product data and fetch real products instead
const generateRecommendations = (
  products: Product[],
  userPreferences?: SmartRecommendationsProps["userPreferences"],
  recentlyViewed?: Product[],
): RecommendedProduct[] => {
  const recommendations: RecommendedProduct[] = [];

  products.forEach((product) => {
    let score = 0;
    let reason: RecommendationReason;

    // Trending algorithm - based on view count and recent sales
    if (product.reviewCount && product.reviewCount > 1000) {
      score += 0.8;
      reason = {
        type: "trending",
        text: `${product.reviewCount?.toLocaleString()} reviews`,
        confidence: 0.85,
      };
    }
    // High rated products
    else if (product.rating >= 4.7) {
      score += 0.9;
      reason = {
        type: "high_rated",
        text: `Highly rated (${product.rating}⭐) by ${product.reviewCount} customers`,
        confidence: 0.9,
      };
    }
    // Price drop detection
    else if (
      product.discountPrice &&
      (product.price - product.discountPrice) / product.price > 0.15
    ) {
      score += 0.7;
      const discount = Math.round(
        ((product.price - product.discountPrice) / product.price) *
          100,
      );
      reason = {
        type: "price_drop",
        text: `${discount}% price drop - limited time offer`,
        confidence: 0.8,
      };
    }
    // Category-based recommendations
    else if (userPreferences?.categories.includes(product.category)) {
      score += 0.6;
      reason = {
        type: "category_based",
        text: `Matches your interest in ${product.category}`,
        confidence: 0.7,
      };
    }
    // Recently viewed similar items
    else if (
      recentlyViewed?.some((viewed) => viewed.category === product.category)
    ) {
      score += 0.65;
      reason = {
        type: "recently_viewed",
        text: "Similar to items you recently viewed",
        confidence: 0.75,
      };
    }
    // Default personalized recommendation
    else {
      score += 0.5;
      reason = {
        type: "personalized",
        text: "Recommended for you based on your activity",
        confidence: 0.6,
      };
    }

    recommendations.push({
      ...product,
      reason,
      score,
    });
  });

  return recommendations.sort((a, b) => b.score - a.score);
};

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
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
  enableRealTimeUpdates = true,
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Load real products from the marketplace service
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await MarketplaceService.getProducts({
          limit: 20 // Fetch more products to have a good selection for recommendations
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to empty array if real data fetch fails
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const generateAndSetRecommendations = () => {
      setIsLoading(true);

      // Simulate AI processing delay
      setTimeout(() => {
        const newRecommendations = generateRecommendations(
          products,
          userPreferences,
          recentlyViewed,
        ).slice(0, maxItems);

        setRecommendations(newRecommendations);
        setIsLoading(false);
      }, 500);
    };

    if (products.length > 0) {
      generateAndSetRecommendations();
    }
  }, [products, userPreferences, recentlyViewed, maxItems]);

  const getReasonIcon = (type: RecommendationReason["type"]) => {
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
  };

  const getReasonColor = (type: RecommendationReason["type"]) => {
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
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderStars = (rating: number) => {
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
  };

  const filteredRecommendations = recommendations.filter((product) => {
    if (activeTab === "all") return true;
    return product.reason.type === activeTab;
  });

  const refreshRecommendations = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newRecommendations = generateRecommendations(
        products.sort(() => Math.random() - 0.5), // Shuffle for variety
        userPreferences,
        recentlyViewed,
      ).slice(0, maxItems);

      setRecommendations(newRecommendations);
      setIsLoading(false);
    }, 800);
  };

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
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
              />
              {isLoading ? "Updating..." : "Refresh"}
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
              {isLoading ? (
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
                      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* AI Reason Badge */}
                      <div
                        className={cn(
                          "absolute top-2 left-2 z-10 px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1",
                          getReasonColor(product.reason.type),
                        )}
                      >
                        {getReasonIcon(product.reason.type)}
                        <span className="hidden sm:inline">
                          {product.reason.text}
                        </span>
                      </div>

                      {/* Product Image */}
                      <div
                        className="aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                        onClick={() => onProductClick?.(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/90 hover:bg-white w-8 h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToWishlist?.(product.id);
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/90 hover:bg-white w-8 h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView?.(product);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <h3
                          className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
                          onClick={() => onProductClick?.(product)}
                        >
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-xs text-gray-500">
                            ({product.reviewCount})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-red-500 text-sm">
                            {formatPrice(
                              product.discountPrice || product.price,
                            )}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product.id);
                          }}
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

export default SmartRecommendations;
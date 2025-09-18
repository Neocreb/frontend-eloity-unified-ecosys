import React, { useState } from "react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  X,
  Star,
  Eye,
  Share,
  Filter,
  SortAsc,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface FunctionalWishlistProps {
  className?: string;
}

export const FunctionalWishlist: React.FC<FunctionalWishlistProps> = ({
  className,
}) => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart, moveToCart } =
    useEnhancedMarketplace();

  const { toast } = useToast();

  const [sortBy, setSortBy] = useState<"date" | "price" | "name">("date");
  const [filterBy, setFilterBy] = useState<string>("all");

  const handleRemoveFromWishlist = (wishlistItemId: string) => {
    const item = wishlist.find((item) => item.id === wishlistItemId);
    removeFromWishlist(wishlistItemId);
    if (item) {
      toast({
        title: "Removed from Wishlist",
        description: `${item.product.name} removed from your wishlist`,
      });
    }
  };

  const handleAddToCart = (productId: string) => {
    const item = wishlist.find((item) => item.productId === productId);
    addToCart(productId, 1);
    if (item) {
      toast({
        title: "Added to Cart",
        description: `${item.product.name} added to your cart`,
      });
    }
  };

  const handleMoveToCart = async (wishlistItemId: string) => {
    const item = wishlist.find((item) => item.id === wishlistItemId);
    await moveToCart(wishlistItemId);
    if (item) {
      toast({
        title: "Moved to Cart",
        description: `${item.product.name} moved to your cart`,
      });
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

  // Filter and sort wishlist items
  const processedWishlist = React.useMemo(() => {
    let filtered = wishlist;

    if (filterBy !== "all") {
      filtered = wishlist.filter(
        (item) => item.product.category.toLowerCase() === filterBy,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          const priceA = a.product.discountPrice || a.product.price;
          const priceB = b.product.discountPrice || b.product.price;
          return priceA - priceB;
        case "name":
          return a.product.name.localeCompare(b.product.name);
        case "date":
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

    return filtered;
  }, [wishlist, filterBy, sortBy]);

  if (wishlist.length === 0) {
    return (
      <div className={cn("max-w-4xl mx-auto p-6", className)}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/marketplace")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Your Wishlist</h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding items you love to keep track of them!
            </p>
            <Button
              onClick={() => navigate("/app/marketplace")}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/marketplace")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Your Wishlist</h1>
            <p className="text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app/marketplace/cart")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Cart
          </Button>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-white border rounded px-3 py-1"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
              <option value="digital">Digital</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4" />
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "price" | "name")
            }
            className="bg-white border rounded px-3 py-1"
          >
            <option value="date">Recently Added</option>
            <option value="price">Price: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {processedWishlist.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              {/* Product Image */}
              <div
                className="aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() =>
                  navigate(`/app/marketplace/product/${item.productId}`)
                }
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Remove Button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white w-8 h-8"
                onClick={() => handleRemoveFromWishlist(item.id)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Sale Badge */}
              {item.product.discountPrice && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {Math.round(
                    ((item.product.price - item.product.discountPrice) /
                      item.product.price) *
                      100,
                  )}
                  % OFF
                </Badge>
              )}

              {/* Quick Actions - Show on Hover */}
              <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                  onClick={() => handleAddToCart(item.productId)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={() =>
                    navigate(`/app/marketplace/product/${item.productId}`)
                  }
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Category */}
              <Badge variant="outline" className="mb-2 text-xs">
                {item.product.category}
              </Badge>

              {/* Product Name */}
              <h3
                className="font-medium text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
                onClick={() =>
                  navigate(`/app/marketplace/product/${item.productId}`)
                }
              >
                {item.product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {renderStars(item.product.averageRating || 0)}
                </div>
                <span className="text-xs text-gray-500">
                  ({item.product.totalReviews || 0})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-green-600">
                  {formatPrice(
                    item.product.discountPrice || item.product.price,
                  )}
                </span>
                {item.product.discountPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.product.price)}
                  </span>
                )}
              </div>

              {/* Seller Info */}
              <div className="text-xs text-gray-600 mb-3">
                by {item.product.sellerName}
                {item.product.sellerVerified && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Added Date */}
              <div className="text-xs text-gray-500">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                  onClick={() => handleMoveToCart(item.id)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Move to Cart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty Filtered Results */}
      {processedWishlist.length === 0 && wishlist.length > 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No items match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filter settings to see more items.
            </p>
            <Button onClick={() => setFilterBy("all")} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionalWishlist;

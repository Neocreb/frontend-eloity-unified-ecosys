import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  X,
  Star,
  Eye,
  Share2,
  Filter,
  SortAsc,
  Bell,
  Gift,
  Download,
  MoveRight,
  Plus,
  Search,
  Grid,
  List,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Define Badge component inline since there's an import issue
const Badge = ({ 
  children, 
  variant = "default",
  className = ""
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
}) => {
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
    outline: "text-foreground border border-input",
    success: "border-transparent bg-green-500 text-green-50",
    warning: "border-transparent bg-yellow-500 text-yellow-50",
  };
  
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
};

interface FunctionalWishlistProps {
  className?: string;
}

interface WishlistCollection {
  id: string;
  name: string;
  itemCount: number;
  isPublic: boolean;
}

export const FunctionalWishlist: React.FC<FunctionalWishlistProps> = ({
  className,
}) => {
  const navigate = useNavigate();
  const { 
    wishlist, 
    removeFromWishlist, 
    addToCart, 
    moveToCart
  } = useEnhancedMarketplace();

  const { toast } = useToast();

  const [sortBy, setSortBy] = useState<"date" | "price" | "name" | "rating">("date");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collections, setCollections] = useState<WishlistCollection[]>([
    { id: "1", name: "Favorites", itemCount: 5, isPublic: false },
    { id: "2", name: "Gift Ideas", itemCount: 3, isPublic: false },
    { id: "3", name: "Wishlist", itemCount: wishlist.length, isPublic: true },
  ]);
  const [selectedCollection, setSelectedCollection] = useState<string>("3");
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [priceAlerts, setPriceAlerts] = useState<Record<string, {targetPrice: number, active: boolean}>>({});

  const handleRemoveFromWishlist = (wishlistItemId: string) => {
    const item = wishlist.find((item) => item.id === wishlistItemId);
    removeFromWishlist(wishlistItemId);
    if (item) {
      toast({
        title: "Removed from Wishlist",
        description: `${item.product?.name || "Item"} removed from your wishlist`,
      });
    }
  };

  const handleAddToCart = (productId: string) => {
    const item = wishlist.find((item) => item.productId === productId);
    addToCart(productId, 1);
    if (item?.product) {
      toast({
        title: "Added to Cart",
        description: `${item.product.name} added to your cart`,
      });
    }
  };

  const handleMoveToCart = async (wishlistItemId: string) => {
    const item = wishlist.find((item) => item.id === wishlistItemId);
    await moveToCart(wishlistItemId);
    if (item?.product) {
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
  const processedWishlist = useMemo(() => {
    let filtered = wishlist;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(
        (item) => item.product?.category.toLowerCase() === filterBy,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          const priceA = a.product?.discountPrice || a.product?.price || 0;
          const priceB = b.product?.discountPrice || b.product?.price || 0;
          return priceA - priceB;
        case "name":
          return (a.product?.name || "").localeCompare(b.product?.name || "");
        case "rating":
          return (b.product?.averageRating || 0) - (a.product?.averageRating || 0);
        case "date":
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

    return filtered;
  }, [wishlist, filterBy, sortBy, searchQuery]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would call an API
    const newCollection: WishlistCollection = {
      id: `collection-${Date.now()}`,
      name: newCollectionName,
      itemCount: 0,
      isPublic: false
    };
    
    setCollections(prev => [...prev, newCollection]);
    setNewCollectionName("");
    setShowCreateCollection(false);
    
    toast({
      title: "Collection Created",
      description: `${newCollection.name} has been created`,
    });
  };

  const handleSetPriceAlert = (productId: string, targetPrice: number) => {
    setPriceAlerts(prev => ({
      ...prev,
      [productId]: { targetPrice, active: true }
    }));
    
    toast({
      title: "Price Alert Set",
      description: "You'll be notified when the price drops to your target",
    });
  };

  const handleCopyProductLink = (productId: string) => {
    const url = `${window.location.origin}/app/marketplace/product/${productId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Product link copied to clipboard",
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className={cn("max-w-6xl mx-auto p-6", className)}>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
            <Share2 className="w-4 h-4 mr-2" />
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

      {/* Collections */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Collections:</span>
        {collections.map((collection) => (
          <Button
            key={collection.id}
            variant={selectedCollection === collection.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCollection(collection.id)}
            className="text-xs"
          >
            {collection.name} ({collection.itemCount})
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateCollection(true)}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>

      {/* Create Collection Form */}
      {showCreateCollection && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateCollection} size="sm">
                Create
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateCollection(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
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
              setSortBy(e.target.value as "date" | "price" | "name" | "rating")
            }
            className="bg-white border rounded px-3 py-1"
          >
            <option value="date">Recently Added</option>
            <option value="price">Price: Low to High</option>
            <option value="name">Name: A to Z</option>
            <option value="rating">Highest Rated</option>
          </select>
          
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      {viewMode === "grid" ? (
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
                    src={item.product?.image}
                    alt={item.product?.name}
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
                {item.product?.discountPrice && item.product?.price && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    {Math.round(
                      ((item.product.price - item.product.discountPrice) /
                        item.product.price) *
                        100,
                    )}
                    % OFF
                  </Badge>
                )}

                {/* Price Alert Indicator */}
                {priceAlerts[item.productId] && priceAlerts[item.productId].active && (
                  <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">
                    <Bell className="w-3 h-3 mr-1" />
                    Alert
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
                  {item.product?.category}
                </Badge>

                {/* Product Name */}
                <h3
                  className="font-medium text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() =>
                    navigate(`/app/marketplace/product/${item.productId}`)
                  }
                >
                  {item.product?.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {renderStars(item.product?.averageRating || 0)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({item.product?.totalReviews || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-green-600">
                    {formatPrice(
                      item.product?.discountPrice || item.product?.price || 0,
                    )}
                  </span>
                  {item.product?.discountPrice && item.product?.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.product.price)}
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="text-xs text-gray-600 mb-3">
                  by {item.product?.sellerName}
                  {item.product?.sellerVerified && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Added Date */}
                <div className="text-xs text-gray-500 mb-3">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </div>

                {/* Price Alert Form */}
                {!priceAlerts[item.productId]?.active && (
                  <div className="mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        const targetPrice = prompt("Enter target price:");
                        if (targetPrice && !isNaN(parseFloat(targetPrice))) {
                          handleSetPriceAlert(item.productId, parseFloat(targetPrice));
                        }
                      }}
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Set Price Alert
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                    onClick={() => handleMoveToCart(item.id)}
                  >
                    <MoveRight className="w-4 h-4 mr-2" />
                    Move to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <Card>
          <CardContent className="p-0">
            {processedWishlist.map((item, index) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex flex-col md:flex-row gap-4 p-4 hover:bg-gray-50",
                  index !== processedWishlist.length - 1 ? "border-b" : ""
                )}
              >
                <div className="flex-shrink-0">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div>
                      <h3 
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/app/marketplace/product/${item.productId}`)}
                      >
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product?.shortDescription}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {renderStars(item.product?.averageRating || 0)}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({item.product?.totalReviews || 0} reviews)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-green-600">
                          {formatPrice(
                            item.product?.discountPrice || item.product?.price || 0,
                          )}
                        </span>
                        {item.product?.discountPrice && item.product?.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-600 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2 mt-2 md:mt-0">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item.productId)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveToCart(item.id)}
                        >
                          <MoveRight className="w-4 h-4 mr-2" />
                          Move
                        </Button>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyProductLink(item.productId)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const targetPrice = prompt("Enter target price:");
                            if (targetPrice && !isNaN(parseFloat(targetPrice))) {
                              handleSetPriceAlert(item.productId, parseFloat(targetPrice));
                            }
                          }}
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
            <Button onClick={() => {
              setFilterBy("all");
              setSearchQuery("");
            }} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionalWishlist;
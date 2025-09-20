import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Star,
  MapPin,
  Clock,
  ShoppingCart,
  Heart,
  MessageSquare,
  TrendingUp,
  Package,
  Eye,
  Filter,
  Grid,
  List,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
  Globe,
  Award,
  Verified,
  AlertCircle,
  User,
} from "lucide-react";
import { Product } from "@/types/marketplace";
import { UserProfile } from "@/types/user";
import ProductCard from "@/components/marketplace/ProductCard";
import { cn } from "@/lib/utils";
import { Link as RouterLink } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { apiClient } from "@/lib/api";

interface UserStoreProps {
  // Add any props if needed
}

const UserStore: React.FC<UserStoreProps> = () => {
  const { username } = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for stats (in real app, fetch from API)
  const storeStats = {
    totalProducts: 127,
    totalSales: 1834,
    averageRating: 4.8,
    totalReviews: 456,
    responseRate: 98,
    responseTime: "< 2 hours",
    memberSince: "2023",
    completedOrders: 1834,
    repeatCustomers: 67,
  };

  const categories = [
    { id: "all", name: "All Products", count: 127 },
    { id: "clothing", name: "Clothing", count: 45 },
    { id: "accessories", name: "Accessories", count: 32 },
    { id: "jewelry", name: "Jewelry", count: 28 },
    { id: "bags", name: "Bags", count: 22 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profile = await profileService.getUserByUsername(username);
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        setUserProfile(profile);
        
        // Fetch user products
        try {
          const userProductsResponse = await apiClient.getSellerProducts(profile.id);
          // Type guard to ensure we're working with the right data structure
          let productsData: Product[] = [];
          if (Array.isArray(userProductsResponse)) {
            productsData = userProductsResponse;
          } else if (userProductsResponse && typeof userProductsResponse === 'object' && 'products' in userProductsResponse) {
            productsData = userProductsResponse.products as Product[];
          } else {
            // Fallback to mock data if API response is unexpected
            productsData = [
              {
                id: "1",
                name: "Premium Leather Handbag",
                description: "Handcrafted premium leather handbag with gold accents",
                price: 189.99,
                image: "/placeholder.svg",
                images: ["/placeholder.svg"],
                category: "bags",
                rating: 4.9,
                reviewCount: 34,
                inStock: true,
                sellerId: profile.id,
                sellerName: profile.full_name || profile.username || "Unknown Seller",
                sellerAvatar: profile.avatar_url || "/placeholder.svg",
                condition: "new",
                createdAt: "2024-01-15",
                updatedAt: "2024-01-15",
              },
              {
                id: "2",
                name: "Vintage Gold Chain Necklace",
                description: "Elegant vintage-style gold chain necklace, perfect for any occasion",
                price: 89.99,
                image: "/placeholder.svg",
                images: ["/placeholder.svg"],
                category: "jewelry",
                rating: 4.7,
                reviewCount: 28,
                inStock: true,
                sellerId: profile.id,
                sellerName: profile.full_name || profile.username || "Unknown Seller",
                sellerAvatar: profile.avatar_url || "/placeholder.svg",
                condition: "new",
                createdAt: "2024-01-12",
                updatedAt: "2024-01-12",
              },
            ];
          }
          setProducts(productsData);
        } catch (productError) {
          console.warn("Failed to fetch products, using mock data:", productError);
          // Mock products data as fallback
          setProducts([
            {
              id: "1",
              name: "Premium Leather Handbag",
              description: "Handcrafted premium leather handbag with gold accents",
              price: 189.99,
              image: "/placeholder.svg",
              images: ["/placeholder.svg"],
              category: "bags",
              rating: 4.9,
              reviewCount: 34,
              inStock: true,
              sellerId: profile.id,
              sellerName: profile.full_name || profile.username || "Unknown Seller",
              sellerAvatar: profile.avatar_url || "/placeholder.svg",
              condition: "new",
              createdAt: "2024-01-15",
              updatedAt: "2024-01-15",
            },
            {
              id: "2",
              name: "Vintage Gold Chain Necklace",
              description: "Elegant vintage-style gold chain necklace, perfect for any occasion",
              price: 89.99,
              image: "/placeholder.svg",
              images: ["/placeholder.svg"],
              category: "jewelry",
              rating: 4.7,
              reviewCount: 28,
              inStock: true,
              sellerId: profile.id,
              sellerName: profile.full_name || profile.username || "Unknown Seller",
              sellerAvatar: profile.avatar_url || "/placeholder.svg",
              condition: "new",
              createdAt: "2024-01-12",
              updatedAt: "2024-01-12",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        // Set mock data as fallback
        setUserProfile({
          id: "1",
          username: username || "",
          full_name: "Sarah Johnson",
          avatar_url: "/placeholder.svg",
          banner_url: "/placeholder.svg",
          bio: "Premium fashion designer & entrepreneur. Creating unique pieces for modern lifestyle.",
          location: "New York, USA",
          website: "https://sarahdesigns.com",
          is_verified: true,
          join_date: "2023-01-15",
          followers_count: 15240,
          following_count: 890,
          posts_count: 324,
        } as UserProfile);
        setProducts([
          {
            id: "1",
            name: "Premium Leather Handbag",
            description: "Handcrafted premium leather handbag with gold accents",
            price: 189.99,
            image: "/placeholder.svg",
            images: ["/placeholder.svg"],
            category: "bags",
            rating: 4.9,
            reviewCount: 34,
            inStock: true,
            sellerId: "1",
            sellerName: "Sarah Johnson",
            sellerAvatar: "/placeholder.svg",
            condition: "new",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-15",
          },
          {
            id: "2",
            name: "Vintage Gold Chain Necklace",
            description: "Elegant vintage-style gold chain necklace, perfect for any occasion",
            price: 89.99,
            image: "/placeholder.svg",
            images: ["/placeholder.svg"],
            category: "jewelry",
            rating: 4.7,
            reviewCount: 28,
            inStock: true,
            sellerId: "1",
            sellerName: "Sarah Johnson",
            sellerAvatar: "/placeholder.svg",
            condition: "new",
            createdAt: "2024-01-12",
            updatedAt: "2024-01-12",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <User className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
          <Button 
            className="mt-4" 
            asChild
          >
            <Link to="/app/profile">Back to Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/app/profile/${username}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Store
              </Button>
              <Button asChild size="sm" variant="secondary">
                <RouterLink to={`/app/marketplace/seller/${username}`}>Open in Marketplace</RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Store Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Store Owner */}
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.full_name || userProfile.username || "User"} />
                    <AvatarFallback className="text-lg">
                      {userProfile.full_name ? userProfile.full_name.split(" ").map(n => n[0]).join("") : (userProfile.username ? userProfile.username.substring(0, 2).toUpperCase() : "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{userProfile.full_name || userProfile.username}</h1>
                    {userProfile.is_verified && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">@{userProfile.username || "unknown"}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{storeStats.averageRating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({storeStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Store Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Products</span>
                    <span className="font-semibold">{products.length || storeStats.totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                    <span className="font-semibold">{storeStats.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-semibold">{storeStats.responseRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-semibold">{storeStats.responseTime}</span>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-2">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Seller
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Follow Store
                  </Button>
                </div>

                {/* Store Info */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {storeStats.memberSince}</span>
                  </div>
                  {userProfile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={userProfile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors",
                        selectedCategory === category.id
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <div className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {category.count}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {userProfile.full_name || userProfile.username}'s Store
                </h2>
                <div className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {products.length} Products
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Store Description */}
            {userProfile.bio && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {userProfile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Products */}
            <div className={cn(
              "gap-6",
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            )}>
              {products
                .filter(p => selectedCategory === "all" || p.category === selectedCategory)
                .map((product) => (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    onAddToCart={() => {}}
                    onAddToWishlist={() => {}}
                    onMessageSeller={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                <Package className="h-4 w-4 mr-2" />
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStore;
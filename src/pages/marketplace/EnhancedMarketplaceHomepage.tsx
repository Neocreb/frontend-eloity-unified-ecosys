import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronRight,
  ChevronLeft,
  Star,
  Eye,
  ArrowRight,
  Bell,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { EnhancedMarketplaceHeader } from "@/components/marketplace/EnhancedMarketplaceHeader";
import { CampaignBanners } from "@/components/marketplace/CampaignBanners";
import { OptimizedSmartRecommendations } from "@/components/marketplace/OptimizedSmartRecommendations";
import ProductQuickView from "@/components/marketplace/ProductQuickView";
import ResponsiveProductCarousel from "@/components/marketplace/ResponsiveProductCarousel";
import CategoryBrowser from "@/components/marketplace/CategoryBrowser";

interface FlashSaleProduct {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviews: number;
  inStock: boolean;
}

const EnhancedMarketplaceHomepage: React.FC = () => {
  const { products, categories, addToCart, addToWishlist } =
    useEnhancedMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56,
  });
  const [selectedProduct, setSelectedProduct] =
    useState<FlashSaleProduct | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Mock flash sale products with better images
  const flashSaleProducts: FlashSaleProduct[] = [
    {
      id: "1",
      name: "HAVIT HV-G92 Gamepad",
      image:
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop",
      originalPrice: 160,
      salePrice: 120,
      discount: 40,
      rating: 5,
      reviews: 88,
      inStock: true,
    },
    {
      id: "2",
      name: "AK-900 Wired Keyboard",
      image:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
      originalPrice: 1160,
      salePrice: 960,
      discount: 35,
      rating: 4,
      reviews: 75,
      inStock: true,
    },
    {
      id: "3",
      name: "IPS LCD Gaming Monitor",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
      originalPrice: 400,
      salePrice: 370,
      discount: 30,
      rating: 5,
      reviews: 99,
      inStock: true,
    },
    {
      id: "4",
      name: "S-Series Comfort Chair",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      rating: 4.5,
      reviews: 99,
      inStock: true,
    },
  ];

  const categoryList = [
    { name: "Woman's Fashion", hasSubmenu: true },
    { name: "Men's Fashion", hasSubmenu: true },
    { name: "Electronics", hasSubmenu: false },
    { name: "Home & Lifestyle", hasSubmenu: false },
    { name: "Medicine", hasSubmenu: false },
    { name: "Sports & Outdoor", hasSubmenu: false },
    { name: "Baby's & Toys", hasSubmenu: false },
    { name: "Groceries & Pets", hasSubmenu: false },
    { name: "Health & Beauty", hasSubmenu: false },
  ];

  const heroSlides = [
    {
      id: 1,
      brand: "Apple",
      logo: "🍎",
      title: "iPhone 14 Series",
      subtitle: "Up to 10% off Voucher",
      cta: "Shop Now",
      image:
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=400&fit=crop",
      bgColor: "bg-black",
    },
  ];

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Enhanced event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    console.log("Category changed to:", categoryId);
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId],
    );
    console.log("Filter toggled:", filterId);
  };

  const handleProductQuickView = (product: FlashSaleProduct) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    addToCart?.(productId, quantity);
  };

  const handleAddToWishlist = (productId: string) => {
    addToWishlist?.(productId);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(0)}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top Promotional Banner */}
      <div className="bg-black text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>
              Summer Sale For All Swim Suits And Free Express Delivery - OFF
              50%!
            </span>
            <Link
              to="/marketplace/sale"
              className="underline font-semibold hover:no-underline"
            >
              ShopNow
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>English</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Enhanced Header with Search and Filters */}
      <EnhancedMarketplaceHeader
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onFilterChange={handleFilterChange}
        className="sticky top-0 z-40 bg-white shadow-sm"
      />

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          {/* Sidebar Categories */}
          <div className="hidden lg:block lg:col-span-1 pt-6 lg:pt-8">
            <div className="space-y-4">
              {categoryList.map((category, index) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between"
                >
                  <Link
                    to={`/marketplace/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-gray-900 hover:text-gray-600 text-sm"
                  >
                    {category.name}
                  </Link>
                  {category.hasSubmenu && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Campaign Banners */}
            <div className="mt-4 lg:mt-8">
              <CampaignBanners
                showCountdown={true}
                dismissible={true}
                className="mb-8"
              />
            </div>

            {/* Hero Section */}
            <div className="relative bg-black rounded-lg overflow-hidden h-64 sm:h-80 lg:h-96 mb-8 lg:mb-16 w-full">
              <div className="flex flex-col lg:flex-row h-full">
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-16 text-white py-6 lg:py-0">
                  <div className="flex items-center gap-3 lg:gap-6 mb-4 lg:mb-6">
                    <span className="text-2xl lg:text-3xl">🍎</span>
                    <span className="text-white/80 text-sm lg:text-base">
                      iPhone 14 Series
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl font-semibold mb-6 lg:mb-8 leading-tight">
                    Up to 10%
                    <br />
                    off Voucher
                  </h2>
                  <Link
                    to="/marketplace/category/electronics"
                    className="flex items-center gap-2 text-white border-b border-white pb-1 w-fit hover:border-white/60"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex-1 relative hidden lg:block overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=400&fit=crop"
                    alt="iPhone 14"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full w-auto object-contain max-w-full"
                  />
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-3 lg:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 lg:gap-3">
                {[0, 1, 2, 3, 4].map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === 2
                        ? "bg-red-500 ring-2 ring-white"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Flash Sales Section */}
            <section className="mb-8 lg:mb-16">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-6 lg:mb-8 gap-4 lg:gap-6">
                {/* Section Title */}
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-4 lg:w-5 h-8 lg:h-10 bg-red-500 rounded" />
                    <span className="text-red-500 font-semibold text-sm lg:text-base">
                      Today's
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold tracking-wide">
                    Flash Sales
                  </h2>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Days</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {timeLeft.days.toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Hours</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Minutes</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                    <div className="w-1 h-1 bg-red-400 rounded-full" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Seconds</div>
                    <div className="text-2xl lg:text-3xl font-bold">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Flash Sale Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {flashSaleProducts.map((product, index) => (
                  <div key={product.id} className="group">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
                      {/* Discount Badge */}
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                        -{product.discount}%
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white w-8 h-8 rounded-full shadow-sm"
                          onClick={() => addToWishlist(product.id)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white w-8 h-8 rounded-full shadow-sm"
                          onClick={() => handleProductQuickView(product)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Product Image */}
                      <div className="p-8 h-full flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Add to Cart Button - Shows on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black text-white py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAddToCart(product.id, 1)}
                          className="text-sm font-medium w-full"
                        >
                          Add To Cart
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-red-500 font-semibold">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({product.reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Category Browser Section */}
            <section className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl lg:text-4xl font-semibold tracking-wide mb-4">
                  Browse Categories
                </h2>
                <p className="text-gray-600">
                  Discover products across our most popular categories
                </p>
              </div>
              <CategoryBrowser
                onCategorySelect={(category) => {
                  console.log("Selected category:", category);
                  handleCategoryChange(category);
                }}
                showSubcategories={true}
                layout="grid"
              />
            </section>

            {/* Best Selling Products Carousel */}
            <section className="mb-16">
              <ResponsiveProductCarousel
                title="Best Selling Products"
                subtitle="Most popular items this month"
                products={flashSaleProducts.map((product) => ({
                  ...product,
                  isFeatured: true,
                  isNew: Math.random() > 0.7,
                  category: "Electronics",
                }))}
                onProductClick={handleProductQuickView}
                onAddToCart={(productId) => handleAddToCart(productId, 1)}
                onAddToWishlist={handleAddToWishlist}
                onQuickView={handleProductQuickView}
                autoplay={true}
                autoplayInterval={4000}
                itemsPerView={{
                  mobile: 1.2,
                  tablet: 2.5,
                  desktop: 4,
                }}
              />
            </section>

            {/* Enhanced Smart Recommendations Section */}
            <section className="mb-16">
              <OptimizedSmartRecommendations
                userId="user123"
                recentlyViewed={flashSaleProducts.slice(0, 3)}
                userPreferences={{
                  categories: ["Electronics", "Fashion", "Home & Garden"],
                  priceRange: [50, 500],
                  brands: ["Apple", "Samsung", "Nike", "Sony"],
                }}
                onProductClick={(product) => {
                  console.log("Product clicked:", product);
                  handleProductQuickView(product as any);
                }}
                onAddToCart={(productId) => handleAddToCart(productId, 1)}
                onAddToWishlist={handleAddToWishlist}
                onQuickView={(product) =>
                  handleProductQuickView(product as any)
                }
                maxItems={8}
                enableRealTimeUpdates={false}
              />
            </section>
          </div>
        </div>
      </div>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={{
            ...selectedProduct,
            description: `High-quality ${selectedProduct.name} with excellent features and great value for money.`,
            highlights: [
              "Premium quality materials",
              "Fast shipping available",
              "30-day return policy",
              "Customer satisfaction guaranteed",
            ],
            seller: {
              name: "Premium Electronics Store",
              rating: 4.8,
              verified: true,
            },
            shipping: {
              freeShipping: true,
              estimatedDays: 3,
            },
            warranty: "1 year manufacturer warranty",
            returnPolicy: "30-day hassle-free returns",
          }}
          isOpen={showQuickView}
          onClose={() => {
            setShowQuickView(false);
            setSelectedProduct(null);
          }}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
          isInWishlist={false}
          isInCart={false}
        />
      )}
    </div>
  );
};

export default EnhancedMarketplaceHomepage;

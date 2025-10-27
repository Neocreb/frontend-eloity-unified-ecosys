import { createContext, useContext, useState, useEffect } from "react";
import {
  Product,
  SellerProfile,
  Review,
  CartItem,
  WishlistItem,
  ProductFilter,
  BoostOption,
  ProductBoost,
  Campaign,
  CampaignProduct,
  ProductCategory,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Address,
  PaymentMethod,
  Promotion,
  MarketplaceContextType,
} from "@/types/enhanced-marketplace";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { unifiedAnalyticsService } from "@/services/unifiedAnalyticsService";
import { OrderService } from "@/services/orderService";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { campaignService } from "@/services/campaignService";
import { boostService } from "@/services/boostService";

// Create the context
const EnhancedMarketplaceContext = createContext<MarketplaceContextType>(
  {} as MarketplaceContextType,
);

// Hook to use the marketplace context
export const useEnhancedMarketplace = () =>
  useContext(EnhancedMarketplaceContext);

// Provider component
export const EnhancedMarketplaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [boostOptions, setBoostOptions] = useState<BoostOption[]>([]);
  const [productBoosts, setProductBoosts] = useState<ProductBoost[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeSeller, setActiveSeller] = useState<SellerProfile | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const categoriesData = await CategoryService.getCategories();
        setCategories(categoriesData as ProductCategory[]);
        
        // Load products
        const productsData = await ProductService.getProducts();
        setProducts(productsData);
        
        // Load campaigns
        const campaignsData = await campaignService.getActiveCampaigns();
        setCampaigns(campaignsData);
        
        // Load boost options (this would typically come from a service)
        // For now, we'll use a simplified version
        setBoostOptions([
          {
            id: "boost1",
            name: "Basic Boost - 24 Hours",
            duration: 24,
            price: 5,
            description: "Boost your product visibility for 24 hours",
            boostType: "basic",
            currency: "SOFT_POINTS",
            features: ["Appears in 'Boosted' section", "Higher search ranking"],
          },
          {
            id: "boost2",
            name: "Featured Boost - 3 Days",
            duration: 72,
            price: 15,
            description: "Feature your product for 3 days",
            boostType: "featured",
            currency: "SOFT_POINTS",
            features: [
              "Featured products section",
              "Category page highlight",
              "Email newsletter inclusion",
            ],
            popular: true,
          },
          {
            id: "boost3",
            name: "Premium Boost - 7 Days",
            duration: 168,
            price: 35,
            description: "Maximum visibility for a full week",
            boostType: "premium",
            currency: "SOFT_POINTS",
            features: [
              "Homepage banner",
              "Top search results",
              "Social media promotion",
              "Email campaigns",
            ],
          },
          {
            id: "boost4",
            name: "Homepage Spotlight - 1 Day",
            duration: 24,
            price: 50,
            description: "Premium homepage placement for 24 hours",
            boostType: "homepage",
            currency: "USDT",
            features: ["Homepage hero section", "Maximum exposure", "Priority support"],
          },
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Derived state
  const sponsoredProducts = products.filter((p) => p.isSponsored);
  const featuredProducts = products.filter((p) => p.isFeatured);
  const myListings = products.filter((p) => user?.id === p.sellerId);

  // Campaign management
  const getCampaigns = () => campaigns;
  const getCampaign = (campaignId: string) =>
    campaigns.find((c) => c.id === campaignId);
  const getCampaignProducts = (campaignId: string) =>
    products.filter((p) => p.campaignIds?.includes(campaignId));

  const requestCampaignParticipation = async (
    campaignId: string,
    productId: string,
  ): Promise<boolean> => {
    try {
      // Implementation would make API call
      toast({
        title: "Campaign Participation Requested",
        description: "Your request has been submitted for review",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request campaign participation",
        variant: "destructive",
      });
      return false;
    }
  };

  // Product management
  const getProduct = (productId: string) =>
    products.find((p) => p.id === productId);
  const getProductVariants = (productId: string) => {
    const product = getProduct(productId);
    return product?.variants || [];
  };

  const createProduct = async (productData: any): Promise<Product> => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      if (newProduct) {
        setProducts([...products, newProduct]);
        toast({
          title: "Product Created",
          description: "Your product has been listed successfully",
        });
        return newProduct;
      } else {
        throw new Error("Failed to create product");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (
    productId: string,
    updates: Partial<Product>,
  ): Promise<Product> => {
    try {
      // In a real implementation, this would call an API to update the product
      const product = getProduct(productId);
      if (!product) throw new Error("Product not found");

      const updatedProduct = {
        ...product,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setProducts(products.map((p) => (p.id === productId ? updatedProduct : p)));

      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully",
      });

      return updatedProduct;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const success = await ProductService.deleteProduct(productId);
      if (success) {
        setProducts(products.filter((p) => p.id !== productId));
        toast({
          title: "Product Deleted",
          description: "Your product has been removed from the marketplace",
        });
        return true;
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return false;
    }
  };

  const duplicateProduct = async (productId: string): Promise<Product> => {
    try {
      const product = getProduct(productId);
      if (!product) throw new Error("Product not found");

      // Create a copy with a new ID
      const duplicatedProductData = {
        ...product,
        id: undefined,
        name: `${product.name} (Copy)`,
      };

      const duplicatedProduct = await createProduct(duplicatedProductData);
      
      toast({
        title: "Product Duplicated",
        description: "A copy of your product has been created",
      });

      return duplicatedProduct;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Boost management
  const boostProduct = async (
    productId: string,
    boostOptionId: string,
  ): Promise<ProductBoost> => {
    try {
      const product = getProduct(productId);
      const boostOption = boostOptions.find((b) => b.id === boostOptionId);

      if (!product || !boostOption) {
        throw new Error("Product or boost option not found");
      }

      // In a real implementation, this would call an API to create the boost
      const newBoost: ProductBoost = {
        id: `boost-${Date.now()}`,
        productId,
        userId: user?.id || "current-user",
        boostType: boostOption.boostType,
        duration: boostOption.duration,
        cost: boostOption.price,
        currency: boostOption.currency,
        paymentMethod: "wallet",
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + boostOption.duration * 60 * 60 * 1000,
        ).toISOString(),
        requiresApproval: false,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        conversionValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProductBoosts([...productBoosts, newBoost]);

      // Update product boost level
      await updateProduct(productId, {
        boostLevel:
          boostOption.boostType === "basic"
            ? 1
            : boostOption.boostType === "featured"
              ? 2
              : 3,
        boostedUntil: newBoost.endDate,
        isSponsored: true,
      });

      toast({
        title: "Product Boosted",
        description: `Your product will be featured for ${boostOption.duration} hours`,
      });

      return newBoost;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to boost product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProductBoosts = (productId: string) =>
    productBoosts.filter((b) => b.productId === productId);

  const getMyBoosts = () => productBoosts.filter((b) => b.userId === user?.id);

  // Cart management
  const addToCart = (
    productId: string,
    quantity = 1,
    variantId?: string,
    customOptions?: Record<string, any>,
  ) => {
    try {
      const product = getProduct(productId);
      if (!product) {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        });
        return;
      }

      if (!product.inStock) {
        toast({
          title: "Out of Stock",
          description: "This product is currently out of stock",
          variant: "destructive",
        });
        return;
      }

      const cartItem: CartItem = {
        id: `cart-${Date.now()}`,
        cartId: `cart-${user?.id || "guest"}`,
        productId,
        variantId,
        quantity,
        priceSnapshot: product.discountPrice || product.price,
        customOptions,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product,
      };

      setCart([...cart, cartItem]);

      toast({
        title: "Added to Cart",
        description: `${product.name} added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    try {
      setCart(cart.filter((item) => item.id !== cartItemId));

      toast({
        title: "Removed from Cart",
        description: "Item removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateCartItem = (cartItemId: string, updates: Partial<CartItem>) => {
    try {
      setCart(
        cart.map((item) =>
          item.id === cartItemId
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    }
  };

  const clearCart = () => {
    try {
      setCart([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.priceSnapshot * item.quantity,
      0,
    );
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Placeholder implementations for remaining functions
  const searchProducts = async (query: string, filters?: ProductFilter) => ({
    products: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
    filters: {
      categories: [],
      brands: [],
      priceRanges: [],
      ratings: [],
      productTypes: [],
    },
    suggestions: [],
    relatedSearches: [],
    facets: {},
  });
  
  const addProductVariant = async () => ({
    id: "",
    productId: "",
    name: "",
    sku: "",
    priceAdjustment: 0,
    attributes: {},
    stockQuantity: 0,
    inStock: false,
    isActive: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const updateProductVariant = async () => ({
    id: "",
    productId: "",
    name: "",
    sku: "",
    priceAdjustment: 0,
    attributes: {},
    stockQuantity: 0,
    inStock: false,
    isActive: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const deleteProductVariant = async () => false;
  
  const extendBoost = async () => ({
    id: "",
    productId: "",
    userId: "",
    boostType: "basic" as const,
    duration: 0,
    cost: 0,
    currency: "SOFT_POINTS" as const,
    paymentMethod: "wallet" as const,
    status: "pending" as const,
    requiresApproval: false,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    conversionValue: 0,
    createdAt: "",
    updatedAt: "",
  });
  
  const cancelBoost = async () => false;
  
  const getSeller = () => undefined;
  
  const getSellerProducts = () => [];
  
  const updateSellerProfile = async () => ({
    id: "",
    username: "",
    name: "",
    avatar: "",
    joinedDate: "",
    isVerified: false,
    rating: 0,
    reviewCount: 0,
    productCount: 0,
  });
  
  const getProductReviews = () => [];
  
  const addReview = async () => ({
    id: "",
    productId: "",
    userId: "",
    userName: "",
    userAvatar: "",
    rating: 0,
    content: "",
    verified: false,
    isVerifiedPurchase: false,
    purchaseVerified: false,
    reviewSource: "marketplace" as const,
    helpful: 0,
    totalVotes: 0,
    reported: false,
    reportCount: 0,
    moderationStatus: "approved" as const,
    helpfulnessScore: 0,
    qualityScore: 0,
    rewardEarned: 0,
    createdAt: "",
  });
  
  const markReviewHelpful = async () => {};
  
  const reportReview = async () => {};
  
  const addSellerResponse = async () => ({
    id: "",
    reviewId: "",
    sellerId: "",
    response: "",
    moderationStatus: "approved" as const,
    createdAt: "",
    updatedAt: "",
  });
  
  const createOrder = async () => ({
    id: "",
    buyerId: "",
    sellerId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    orderType: "marketplace" as const,
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentMethod: "",
    paymentCurrency: "USDT" as const,
    paymentStatus: "pending" as const,
    downloadCount: 0,
    status: "pending" as const,
    fulfillmentStatus: "pending" as const,
    requiresShipping: false,
    autoCompleteAfterDays: 7,
    platformFee: 0,
    feePercentage: 0,
    returnRequested: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const getOrder = () => undefined;
  
  const updateOrderStatus = async () => ({
    id: "",
    buyerId: "",
    sellerId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    orderType: "marketplace" as const,
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentMethod: "",
    paymentCurrency: "USDT" as const,
    paymentStatus: "pending" as const,
    downloadCount: 0,
    status: "pending" as const,
    fulfillmentStatus: "pending" as const,
    requiresShipping: false,
    autoCompleteAfterDays: 7,
    platformFee: 0,
    feePercentage: 0,
    returnRequested: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const confirmDelivery = async () => ({
    id: "",
    buyerId: "",
    sellerId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    orderType: "marketplace" as const,
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentMethod: "",
    paymentCurrency: "USDT" as const,
    paymentStatus: "pending" as const,
    downloadCount: 0,
    status: "pending" as const,
    fulfillmentStatus: "pending" as const,
    requiresShipping: false,
    autoCompleteAfterDays: 7,
    platformFee: 0,
    feePercentage: 0,
    returnRequested: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const cancelOrder = async () => false;
  
  const requestReturn = async () => false;
  
  const trackOrder = async () => ({ status: "", updates: [] });
  
  const downloadDigitalProduct = async () => "";
  
  const raiseDispute = async () => false;
  
  const getOrderDisputes = () => [];
  
  const getWishlists = () => [];
  
  const createWishlist = async () => ({
    id: "",
    userId: "",
    name: "",
    isPublic: false,
    isDefault: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const addToWishlist = async (
    productId: string,
    wishlistId?: string,
    options?: Partial<WishlistItem>,
  ): Promise<WishlistItem> => {
    try {
      const product = getProduct(productId);
      if (!product) {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        });
        throw new Error("Product not found");
      }

      const wishlistItem: WishlistItem = {
        id: `wishlist-${Date.now()}`,
        wishlistId: wishlistId || `wishlist-${user?.id || "guest"}`,
        productId,
        notifyOnSale: options?.notifyOnSale || false,
        notifyOnRestock: options?.notifyOnRestock || false,
        priority: options?.priority || 1,
        addedAt: new Date().toISOString(),
        product,
      };

      setWishlist([...wishlist, wishlistItem]);

      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to your wishlist`,
      });

      return wishlistItem;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const removeFromWishlist = () => {};
  
  const moveToCart = async () => false;
  
  const shareWishlist = async () => "";
  
  const moveToWishlist = async () => false;
  
  const addAddress = async () => ({
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  
  const updateAddress = async () => ({
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  
  const deleteAddress = async () => false;
  
  const setDefaultAddress = async () => {};
  
  const addPaymentMethod = async () => ({
    id: "",
    type: "card" as const,
    name: "",
    isDefault: false,
    createdAt: "",
  });
  
  const updatePaymentMethod = async () => ({
    id: "",
    type: "card" as const,
    name: "",
    isDefault: false,
    createdAt: "",
  });
  
  const deletePaymentMethod = async () => false;
  
  const setDefaultPaymentMethod = async () => {};
  
  const validateCart = async () => ({ valid: true, issues: [] });
  
  const calculateShipping = async () => 0;
  
  const calculateTax = async () => 0;
  
  const applyPromotion = async () => ({
    id: "",
    title: "",
    description: "",
    type: "percentage" as const,
    value: 0,
    startDate: "",
    endDate: "",
    usageCount: 0,
    active: false,
  });
  
  const removePromotion = () => {};
  
  const getPaymentMethods = async () => [];
  
  const checkout = async () => ({
    id: "",
    buyerId: "",
    sellerId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    orderType: "marketplace" as const,
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentMethod: "",
    paymentCurrency: "USDT" as const,
    paymentStatus: "pending" as const,
    downloadCount: 0,
    status: "pending" as const,
    fulfillmentStatus: "pending" as const,
    requiresShipping: false,
    autoCompleteAfterDays: 7,
    platformFee: 0,
    feePercentage: 0,
    returnRequested: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const expressCheckout = async () => ({
    id: "",
    buyerId: "",
    sellerId: "",
    customerName: "",
    customerEmail: "",
    orderNumber: "",
    orderType: "marketplace" as const,
    items: [],
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    paymentMethod: "",
    paymentCurrency: "USDT" as const,
    paymentStatus: "pending" as const,
    downloadCount: 0,
    status: "pending" as const,
    fulfillmentStatus: "pending" as const,
    requiresShipping: false,
    autoCompleteAfterDays: 7,
    platformFee: 0,
    feePercentage: 0,
    returnRequested: false,
    createdAt: "",
    updatedAt: "",
  });
  
  const messageUser = async () => false;
  
  const startOrderChat = async () => "";
  
  const getCategories = () => categories;
  
  const getRecommendedProducts = () => [];
  
  const getPersonalizedProducts = () => [];
  
  const getTrendingProducts = () => [];
  
  const getRecentlyViewedProducts = () => [];
  
  const trackProductView = () => {};
  
  const trackProductClick = () => {};
  
  const trackSearch = () => {};
  
  const getSellerAnalytics = async (period: "daily" | "weekly" | "monthly" = "weekly") => {
    if (!user?.id) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        customerSatisfaction: 0,
        monthlyRevenue: [0, 0, 0],
        categoryBreakdown: [],
        averageOrderValue: 0,
        responseRate: 0,
        onTimeDeliveryRate: 0,
        topProducts: [],
        conversionRate: 0,
        boostROI: 0,
      };
    }

    try {
      // Use the unified analytics service for real data
      const ecommerceMetrics = await unifiedAnalyticsService.getEcommerceMetrics(user.id, period);
      
      // Transform the data to match the expected format
      return {
        totalRevenue: ecommerceMetrics.sales.totalRevenue,
        totalOrders: ecommerceMetrics.sales.totalOrders,
        totalProducts: ecommerceMetrics.products.totalProducts,
        customerSatisfaction: ecommerceMetrics.products.avgRating,
        monthlyRevenue: [0, 0, ecommerceMetrics.sales.totalRevenue], // Simplified
        categoryBreakdown: [], // Would need to implement category breakdown
        averageOrderValue: ecommerceMetrics.sales.avgOrderValue,
        responseRate: 98, // Would need real data
        onTimeDeliveryRate: 95, // Would need real data
        topProducts: ecommerceMetrics.sales.topSellingProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          image: "", // Would need real image
          price: 0, // Would need real price
        })),
        conversionRate: ecommerceMetrics.sales.conversionRate,
        boostROI: 245, // Would need real data
      };
    } catch (error) {
      console.error("Error fetching seller analytics:", error);
      // Fallback to default data
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        customerSatisfaction: 0,
        monthlyRevenue: [0, 0, 0],
        categoryBreakdown: [],
        averageOrderValue: 0,
        responseRate: 0,
        onTimeDeliveryRate: 0,
        topProducts: [],
        conversionRate: 0,
        boostROI: 0,
      };
    }
  };

  const getProductPerformance = async (productId: string) => {
    try {
      // In a real implementation, this would fetch actual product performance data
      // For now, we'll return default data
      return {
        views: 0,
        clicks: 0,
        addToCarts: 0,
        purchases: 0,
        favorites: 0,
        conversionRate: 0,
        revenue: 0,
        rating: 0,
        reviewCount: 0,
      };
    } catch (error) {
      console.error("Error fetching product performance:", error);
      return {
        views: 0,
        clicks: 0,
        addToCarts: 0,
        purchases: 0,
        favorites: 0,
        conversionRate: 0,
        revenue: 0,
        rating: 0,
        reviewCount: 0,
      };
    }
  };

  const getSellerOrders = async (sellerId: string) => {
    if (!sellerId) {
      return [];
    }

    try {
      // Use the OrderService to fetch real seller orders
      const orders = await OrderService.getSellerOrders(sellerId);
      return orders;
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      // Return empty array on error
      return [];
    }
  };

  const setPriceAlert = async () => false;
  const getPriceHistory = async () => [];

  const contextValue: MarketplaceContextType = {
    // State
    products,
    categories,
    campaigns,
    sponsoredProducts,
    featuredProducts,
    sellers,
    reviews,
    boostOptions,
    productBoosts,
    cart,
    wishlist,
    myListings,
    myOrders,
    addresses,
    paymentMethods,
    filter,
    activeProduct,
    activeSeller,
    activeCampaign,
    isLoading,
    searchResults,

    // Actions
    setFilter,
    searchProducts,

    // Campaign management
    getCampaigns,
    getCampaign,
    getCampaignProducts,
    requestCampaignParticipation,

    // Cart management
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    moveToWishlist,

    // Wishlist management
    getWishlists,
    createWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    shareWishlist,

    // Product management
    getProduct,
    getProductVariants,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    boostProduct,
    getProductBoosts,
    getMyBoosts,
    extendBoost,
    cancelBoost,

    // Seller management
    getSeller,
    getSellerProducts,
    updateSellerProfile,

    // Review management
    getProductReviews,
    addReview,
    markReviewHelpful,
    reportReview,
    addSellerResponse,

    // Order management
    createOrder,
    getOrder,
    updateOrderStatus,
    confirmDelivery,
    cancelOrder,
    requestReturn,
    trackOrder,
    downloadDigitalProduct,
    raiseDispute,
    getOrderDisputes,

    // Address management
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Payment management
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,

    // Checkout process
    validateCart,
    calculateShipping,
    calculateTax,
    applyPromotion,
    removePromotion,
    getPaymentMethods,
    checkout,
    expressCheckout,

    // Utility functions
    setActiveProduct,
    setActiveSeller,
    setActiveCampaign,
    messageUser,
    startOrderChat,
    getCategories,
    getRecommendedProducts,
    getPersonalizedProducts,
    getTrendingProducts,
    getRecentlyViewedProducts,
    trackProductView,
    trackProductClick,
    trackSearch,
    getSellerAnalytics,
    getProductPerformance,
    getSellerOrders,
    setPriceAlert,
    getPriceHistory,
  };

  return (
    <EnhancedMarketplaceContext.Provider value={contextValue}>
      {children}
    </EnhancedMarketplaceContext.Provider>
  );
};
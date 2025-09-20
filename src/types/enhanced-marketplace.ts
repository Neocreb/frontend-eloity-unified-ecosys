// Enhanced marketplace types for full ecommerce functionality with campaigns, boosts, and multi-product support

export interface EnhancedProduct {
  id: string;

  // Basic info
  name: string;
  description: string;
  shortDescription?: string;

  // Product type and classification
  productType: "physical" | "digital" | "service" | "freelance_service";
  category: string;
  subcategory?: string;
  tags?: string[];

  // Pricing
  price: number;
  discountPrice?: number;
  discountPercentage?: number;

  // Media
  image: string; // thumbnail/main image
  images?: string[];
  videos?: string[];
  thumbnailImage?: string;

  // Inventory and availability
  inStock: boolean;
  stockQuantity?: number;
  limitedQuantity?: boolean;
  allowBackorder?: boolean;

  // Status and features
  status: "active" | "draft" | "suspended" | "out_of_stock";
  isDigital: boolean;
  isFeatured: boolean;
  isSponsored: boolean;

  // SEO and discovery
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Ratings and performance
  rating: number;
  averageRating: number;
  reviewCount?: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  clickCount: number;
  favoriteCount: number;

  // Boost and campaign data
  boostLevel: number;
  boostedUntil?: string;
  campaignIds?: string[];

  // Seller info
  sellerId: string;
  sellerName?: string;
  sellerRating?: number;

  // Shipping and fulfillment
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
  freeShipping?: boolean;
  shippingTime?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;

  // Basic info
  name: string;
  description: string;
  shortDescription?: string;

  // Product type and classification
  productType: "physical" | "digital" | "service" | "freelance_service";
  category: string;
  subcategory?: string;
  tags?: string[];

  // Pricing
  price: number;
  discountPrice?: number;
  discountPercentage?: number;

  // Media
  image: string; // thumbnail/main image
  images?: string[];
  videos?: string[];
  thumbnailImage?: string;

  // Inventory and availability
  inStock: boolean;
  stockQuantity?: number;
  limitedQuantity?: boolean;
  allowBackorder?: boolean;

  // Status and features
  status: "active" | "draft" | "suspended" | "out_of_stock";
  isDigital: boolean;
  isFeatured: boolean;
  isSponsored: boolean;

  // SEO and discovery
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Ratings and performance
  rating: number;
  averageRating: number;
  reviewCount?: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  clickCount: number;
  favoriteCount: number;

  // Seller info
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating?: number;
  sellerVerified?: boolean;

  // Enhanced features
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  shippingInfo?: ShippingInfo;

  // Boost and campaign
  boostLevel: number; // 0=none, 1=basic, 2=featured, 3=premium
  boostedUntil?: string;
  campaignIds?: string[];

  // Digital product specific
  downloadUrl?: string;
  licenseType?: "single" | "multiple" | "unlimited";
  downloadLimit?: number;

  // Service specific
  serviceDeliveryTime?: string;
  serviceType?: "one_time" | "recurring" | "hourly";
  hourlyRate?: number;

  // Legacy fields for compatibility
  isNew?: boolean;
  condition?: "new" | "used" | "refurbished";
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  returnPolicy?: string;
  warranty?: string;

  // Metadata
  metadata?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // "Red XL", "Blue Medium", etc.
  sku?: string;

  // Pricing
  priceAdjustment: number; // +/- amount from base price

  // Attributes
  attributes: Record<string, string>; // {color: 'red', size: 'xl', material: 'cotton'}

  // Inventory
  stockQuantity: number;
  inStock: boolean;

  // Media
  images?: string[];

  // Status
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "inch";
}

export interface ShippingInfo {
  weight: number;
  dimensions: ProductDimensions;
  freeShipping: boolean;
  shippingCost?: number;
  estimatedDelivery: string;
  expressAvailable: boolean;
  expressShippingCost?: number;
  internationalShipping: boolean;
}

export interface BoostOption {
  id: string;
  name: string;
  duration: number; // in hours
  price: number;
  description: string;
  features?: string[];
  popular?: boolean;
  boostType: "basic" | "featured" | "premium" | "homepage";
  currency: "SOFT_POINTS" | "USDT" | "ETH" | "BTC";
}

export interface ProductBoost {
  id: string;
  productId: string;
  userId: string;

  // Boost configuration
  boostType: "basic" | "featured" | "premium" | "homepage";
  duration: number; // Duration in hours
  cost: number;
  currency: "SOFT_POINTS" | "USDT" | "ETH" | "BTC";

  // Payment details
  paymentMethod: "wallet" | "premium_credits";
  transactionId?: string;

  // Status and timing
  status: "pending" | "active" | "completed" | "cancelled" | "rejected";
  startDate?: string;
  endDate?: string;

  // Admin approval
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Performance metrics
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  roi?: number;

  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Campaign type
  type: "seasonal" | "flash_sale" | "featured" | "category_boost";

  // Timing
  startDate: string;
  endDate: string;

  // Display
  bannerImage?: string;
  bannerText?: string;
  backgroundColor?: string;
  textColor?: string;

  // Rules and criteria
  eligibilityCriteria?: Record<string, any>;
  discountType?: "percentage" | "fixed_amount" | "buy_x_get_y";
  discountValue?: number;
  maxDiscount?: number;
  minOrderAmount?: number;

  // Limits
  maxParticipants?: number;
  maxProductsPerSeller?: number;
  usageLimit?: number;
  usageCount: number;

  // Status
  status: "draft" | "active" | "paused" | "ended";
  isPublic: boolean;
  requiresApproval: boolean;

  // Admin info
  createdBy: string;

  // Performance tracking
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  totalRevenue: number;

  createdAt: string;
  updatedAt: string;
}

export interface CampaignProduct {
  id: string;
  campaignId: string;
  productId: string;

  // Participation details
  requestedBy: string;

  // Status
  status: "pending" | "approved" | "rejected" | "ended";
  approvedBy?: string;
  approvedAt?: string;

  // Campaign-specific settings
  customDiscount?: number;
  featuredOrder: number;

  // Performance within campaign
  campaignViews: number;
  campaignClicks: number;
  campaignSales: number;
  campaignRevenue: number;

  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;

  // Hierarchy
  parentId?: string;
  level: number;
  path?: string;

  // Display
  icon?: string;
  image?: string;
  color?: string;
  sortOrder: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Status
  isActive: boolean;
  isFeatured: boolean;

  // Stats
  productCount: number;

  // Sub-categories
  subcategories?: ProductCategory[];

  createdAt: string;
  updatedAt: string;
}

// Legacy alias for ProductCategory
export type Category = ProductCategory;

export interface SellerProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  salesCount?: number;
  totalRevenue?: number;
  responseRate?: number;
  responseTime?: string;
  location?: string;
  businessType?: "individual" | "business";
  businessInfo?: BusinessInfo;
  policies?: SellerPolicies;
  socialMedia?: SocialMediaLinks;
  achievements?: Achievement[];

  // Enhanced seller metrics
  tier?: "bronze" | "silver" | "gold" | "platinum";
  badges?: string[];
  overallScore?: number;
  onTimeDeliveryRate?: number;
}

export interface BusinessInfo {
  companyName: string;
  registrationNumber?: string;
  taxId?: string;
  address: Address;
  phone?: string;
  email?: string;
}

export interface SellerPolicies {
  returnPolicy: string;
  shippingPolicy: string;
  refundPolicy: string;
  privacyPolicy?: string;
}

export interface SocialMediaLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;

  // Enhanced ratings
  qualityRating?: number;
  valueRating?: number;
  shippingRating?: number;
  serviceRating?: number;
  deliveryRating?: number;
  communicationRating?: number;
  accuracyRating?: number;

  // Content
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];

  // Media
  images?: string[];
  videos?: string[];

  // Purchase context
  variantPurchased?: string;
  useCase?: string;
  wouldRecommend?: boolean;

  // Verification and quality
  verified: boolean;
  isVerifiedPurchase: boolean;
  purchaseVerified: boolean;
  reviewSource: "marketplace" | "imported" | "migrated";

  // Community interaction
  helpful: number;
  totalVotes: number;
  reported: boolean;
  reportCount: number;

  // Moderation
  moderationStatus: "pending" | "approved" | "rejected" | "auto_approved";
  moderatedBy?: string;
  moderatedAt?: string;

  // Quality scores
  helpfulnessScore: number;
  qualityScore: number;

  // Seller response
  sellerResponse?: SellerResponse;
  sellerResponseId?: string;

  // Rewards
  rewardEarned: number;

  createdAt: string;
  updatedAt?: string;
}

export interface SellerResponse {
  id: string;
  reviewId: string;
  sellerId: string;
  response: string;
  moderationStatus: "pending" | "approved" | "rejected";
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  priceSnapshot: number;
  customOptions?: Record<string, any>;
  notes?: string;
  addedAt: string;
  updatedAt: string;

  // Populated data
  product?: Product;
  variant?: ProductVariant;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  preferredVariant?: string;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
  targetPrice?: number;
  priceWhenAdded?: number;
  lowestPriceSeen?: number;
  notes?: string;
  priority: number;
  addedAt: string;

  // Populated data
  product?: Product;
}

export interface Order {
  id: string;

  // Order parties
  buyerId: string;
  sellerId: string;
  customerName: string;
  customerEmail: string;

  // Order details
  orderNumber: string;
  orderType: "marketplace" | "digital" | "service";
  items: OrderItem[];

  // Financial details
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  discountCode?: string;
  totalAmount: number;

  // Payment and escrow
  paymentMethod: string;
  paymentCurrency: "USDT" | "ETH" | "BTC" | "SOFT_POINTS";
  paymentStatus: PaymentStatus;
  escrowId?: string;
  paymentTransactionId?: string;

  // Shipping details (for physical products)
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: "standard" | "express" | "pickup" | "digital";
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;

  // Digital delivery (for digital products)
  downloadUrls?: string[];
  downloadExpiresAt?: string;
  downloadCount: number;
  downloadLimit?: number;

  // Order status
  status: OrderStatus;
  fulfillmentStatus: "pending" | "processing" | "fulfilled" | "cancelled";
  requiresShipping: boolean;
  autoCompleteAfterDays: number;

  // Chat integration
  chatThreadId?: string;

  // Customer service
  customerNotes?: string;
  sellerNotes?: string;
  adminNotes?: string;

  // Timeline
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  // Platform fees and revenue
  platformFee: number;
  feePercentage: number;
  sellerRevenue?: number;

  // Dispute handling
  disputeId?: string;
  disputeReason?: string;

  // Return/refund tracking
  returnRequested: boolean;
  returnRequestedAt?: string;
  returnReason?: string;
  returnStatus?: "requested" | "approved" | "denied" | "returned" | "refunded";
  refundAmount?: number;
  refundedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: Record<string, string>;
  customOptions?: Record<string, any>;
  status: OrderItemStatus;

  // Digital product specific
  downloadUrl?: string;
  licenseKey?: string;

  // Service specific
  deliveryDate?: string;
  serviceNotes?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partial_refund";

export type OrderItemStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned";

export interface Address {
  id?: string;
  type?: "shipping" | "billing";
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  productType?: "physical" | "digital" | "service" | "freelance_service";
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  condition?: "new" | "used" | "refurbished";
  brand?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  tags?: string[];
  searchQuery?: string;
  sortBy?:
    | "recent"
    | "price-low"
    | "price-high"
    | "popular"
    | "rating"
    | "reviews"
    | "boosted";
  sellerId?: string;
  campaignId?: string;
  location?: string;
  hasVariants?: boolean;
  freeShipping?: boolean;
  digitalOnly?: boolean;
  servicesOnly?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet" | "crypto";
  name: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "free_shipping";
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  code?: string;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  active: boolean;
}

export interface MarketplaceStats {
  totalProducts: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentSales: Array<{
    productName: string;
    amount: number;
    date: string;
  }>;
  campaignPerformance: Array<{
    campaignId: string;
    name: string;
    conversions: number;
    revenue: number;
  }>;
}

export interface SellerStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyRevenue: number[];
  topSellingProducts: Product[];
  recentOrders: Order[];
  conversionRate: number;
  pageViews: number;
  favoriteCount: number;
  boostROI: number;
  responseRate: number;
  onTimeDeliveryRate: number;
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    categories: Array<{ name: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    ratings: Array<{ rating: number; count: number }>;
    productTypes: Array<{ type: string; count: number }>;
  };
  suggestions: string[];
  relatedSearches: string[];
  facets: Record<string, Array<{ value: string; count: number }>>;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  reviewReminders: boolean;
  restockAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Enhanced Context type definition
export type MarketplaceContextType = {
  // State
  products: Product[];
  categories: ProductCategory[];
  campaigns: Campaign[];
  sponsoredProducts: Product[];
  featuredProducts: Product[];
  sellers: SellerProfile[];
  reviews: Record<string, Review[]>;
  boostOptions: BoostOption[];
  productBoosts: ProductBoost[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  myListings: Product[];
  myOrders: Order[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  filter: ProductFilter;
  activeProduct: Product | null;
  activeSeller: SellerProfile | null;
  activeCampaign: Campaign | null;
  isLoading: boolean;
  searchResults: SearchResult | null;

  // Actions
  setFilter: (filter: ProductFilter) => void;
  searchProducts: (
    query: string,
    filters?: ProductFilter,
  ) => Promise<SearchResult>;

  // Campaign management
  getCampaigns: () => Campaign[];
  getCampaign: (campaignId: string) => Campaign | undefined;
  getCampaignProducts: (campaignId: string) => Product[];
  requestCampaignParticipation: (
    campaignId: string,
    productId: string,
  ) => Promise<boolean>;

  // Cart management
  addToCart: (
    productId: string,
    quantity?: number,
    variantId?: string,
    customOptions?: Record<string, any>,
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItem: (cartItemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  moveToWishlist: (cartItemId: string, wishlistId?: string) => Promise<boolean>;

  // Wishlist management
  getWishlists: () => Wishlist[];
  createWishlist: (name: string, description?: string) => Promise<Wishlist>;
  addToWishlist: (
    productId: string,
    wishlistId?: string,
    options?: Partial<WishlistItem>,
  ) => Promise<WishlistItem>;
  removeFromWishlist: (wishlistItemId: string) => void;
  moveToCart: (wishlistItemId: string) => Promise<boolean>;
  shareWishlist: (wishlistId: string) => Promise<string>; // Returns shareable link

  // Product management
  getProduct: (productId: string) => Product | undefined;
  getProductVariants: (productId: string) => ProductVariant[];
  createProduct: (
    product: Omit<
      Product,
      | "id"
      | "sellerId"
      | "sellerName"
      | "sellerAvatar"
      | "createdAt"
      | "updatedAt"
      | "rating"
      | "averageRating"
      | "totalReviews"
      | "totalSales"
      | "viewCount"
      | "clickCount"
      | "favoriteCount"
    >,
  ) => Promise<Product>;
  updateProduct: (
    productId: string,
    updates: Partial<Product>,
  ) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  duplicateProduct: (productId: string) => Promise<Product>;

  // Product variants
  addProductVariant: (
    productId: string,
    variant: Omit<
      ProductVariant,
      "id" | "productId" | "createdAt" | "updatedAt"
    >,
  ) => Promise<ProductVariant>;
  updateProductVariant: (
    variantId: string,
    updates: Partial<ProductVariant>,
  ) => Promise<ProductVariant>;
  deleteProductVariant: (variantId: string) => Promise<boolean>;

  // Boost management
  boostProduct: (
    productId: string,
    boostOptionId: string,
  ) => Promise<ProductBoost>;
  getProductBoosts: (productId: string) => ProductBoost[];
  getMyBoosts: () => ProductBoost[];
  extendBoost: (
    boostId: string,
    additionalHours: number,
  ) => Promise<ProductBoost>;
  cancelBoost: (boostId: string) => Promise<boolean>;

  // Seller management
  getSeller: (sellerId: string) => SellerProfile | undefined;
  getSellerProducts: (sellerId: string) => Product[];
  updateSellerProfile: (
    updates: Partial<SellerProfile>,
  ) => Promise<SellerProfile>;

  // Review management
  getProductReviews: (productId: string) => Review[];
  addReview: (
    productId: string,
    orderId: string,
    rating: number,
    content: string,
    additionalRatings?: Partial<Review>,
    images?: string[],
  ) => Promise<Review>;
  markReviewHelpful: (reviewId: string, isHelpful: boolean) => Promise<void>;
  reportReview: (reviewId: string, reason: string) => Promise<void>;
  addSellerResponse: (
    reviewId: string,
    response: string,
  ) => Promise<SellerResponse>;

  // Order management
  createOrder: (
    cartItems: CartItem[],
    shippingAddress?: Address,
    paymentMethod?: string,
  ) => Promise<Order>;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    notes?: string,
  ) => Promise<Order>;
  getSellerOrders: (sellerId: string) => Promise<Order[]>;
  confirmDelivery: (orderId: string) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
  requestReturn: (
    orderId: string,
    reason: string,
    items?: string[],
  ) => Promise<boolean>;
  trackOrder: (orderId: string) => Promise<{ status: string; updates: any[] }>;
  downloadDigitalProduct: (
    orderId: string,
    productId: string,
  ) => Promise<string>; // Returns download URL

  // Dispute management
  raiseDispute: (
    orderId: string,
    reason: string,
    description: string,
    evidence?: string[],
  ) => Promise<boolean>;
  getOrderDisputes: (orderId: string) => any[];

  // Address management
  addAddress: (address: Omit<Address, "id">) => Promise<Address>;
  updateAddress: (
    addressId: string,
    updates: Partial<Address>,
  ) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  setDefaultAddress: (
    addressId: string,
    type: "shipping" | "billing",
  ) => Promise<void>;

  // Payment management
  addPaymentMethod: (
    paymentMethod: Omit<PaymentMethod, "id" | "createdAt">,
  ) => Promise<PaymentMethod>;
  updatePaymentMethod: (
    methodId: string,
    updates: Partial<PaymentMethod>,
  ) => Promise<PaymentMethod>;
  deletePaymentMethod: (methodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;

  // Checkout process
  validateCart: () => Promise<{ valid: boolean; issues: string[] }>;
  calculateShipping: (items: CartItem[], address: Address) => Promise<number>;
  calculateTax: (items: CartItem[], address: Address) => Promise<number>;
  applyPromotion: (code: string) => Promise<Promotion>;
  removePromotion: () => void;
  getPaymentMethods: () => Promise<PaymentMethod[]>;

  // Enhanced checkout
  checkout: (
    paymentMethodId: string,
    shippingAddressId?: string,
    billingAddressId?: string,
    promotionCode?: string,
  ) => Promise<Order>;

  // Express checkout for digital products
  expressCheckout: (productId: string, variantId?: string) => Promise<Order>;

  // Utility functions
  setActiveProduct: (product: Product | null) => void;
  setActiveSeller: (seller: SellerProfile | null) => void;
  setActiveCampaign: (campaign: Campaign | null) => void;

  // Communication
  messageUser: (
    userId: string,
    message: string,
    productId?: string,
    orderId?: string,
  ) => Promise<boolean>;
  startOrderChat: (orderId: string) => Promise<string>; // Returns chat thread ID

  // Discovery and recommendations
  getCategories: () => ProductCategory[];
  getRecommendedProducts: (productId?: string, context?: string) => Product[];
  getPersonalizedProducts: () => Product[];
  getTrendingProducts: (category?: string) => Product[];
  getRecentlyViewedProducts: () => Product[];

  // Analytics and tracking
  trackProductView: (productId: string, context?: string) => void;
  trackProductClick: (productId: string, context?: string) => void;
  trackSearch: (
    query: string,
    filters?: ProductFilter,
    resultCount?: number,
  ) => void;

  // Seller analytics (for sellers)
  getSellerAnalytics: (period?: "daily" | "weekly" | "monthly") => Promise<any>;
  getProductPerformance: (productId: string) => Promise<any>;

  // Price tracking and alerts
  setPriceAlert: (productId: string, targetPrice: number) => Promise<boolean>;
  getPriceHistory: (productId: string) => Promise<any[]>;
};

// Type aliases for compatibility and validation
export type MarketplaceOrder = Order;

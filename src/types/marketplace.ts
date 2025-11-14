// Enhanced marketplace types for full ecommerce functionality

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount?: number;
  inStock: boolean;
  stockQuantity?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  boostedUntil?: string;
  tags?: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating?: number;
  sellerVerified?: boolean;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  shippingInfo?: ShippingInfo;
  returnPolicy?: string;
  warranty?: string;
  condition: "new" | "used" | "refurbished";
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  createdAt: string;
  updatedAt: string;
  
  // Enhanced product type fields
  productType: "physical" | "digital" | "service";
  
  // Digital product specific fields
  digitalProductType?: "ebook" | "online_course" | "template" | "digital_art" | "software" | "audio" | "video" | "license" | "worksheet" | "printable";
  downloadUrl?: string;
  licenseType?: "single" | "multiple" | "unlimited";
  downloadLimit?: number;
  downloadExpiryDays?: number;
  fileSize?: number;
  fileFormat?: string;
  author?: string;
  coAuthor?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  ageGroup?: string;
  skillLevel?: string;
  courseDuration?: string;
  courseModules?: number;
  includesSourceFiles?: boolean;
  
  // Physical product specific fields
  size?: string;
  color?: string;
  material?: string;
  careInstructions?: string;
  assemblyRequired?: boolean;
  assemblyTime?: string;
  packageDimensions?: ProductDimensions;
  packageWeight?: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  image?: string;
  inStock: boolean;
  stockQuantity?: number;
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
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  reported: boolean;
  sellerResponse?: SellerResponse;
  createdAt: string;
  updatedAt?: string;
}

export interface SellerResponse {
  content: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  addedAt: string;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
  notifyOnSale: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: Record<string, string>;
  status: OrderItemStatus;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
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
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  condition?: "new" | "used" | "refurbished";
  brand?: string;
  freeShipping?: boolean;
  inStock?: boolean;
  tags?: string[];
  searchQuery?: string;
  sortBy?:
    | "recent"
    | "price-low"
    | "price-high"
    | "popular"
    | "rating"
    | "reviews";
  location?: string;
  sellerId?: string;
  limit?: number; // Add limit property
  featuredOnly?: boolean; // Add featuredOnly property
}

export interface BoostOption {
  id: string;
  name: string;
  duration: number; // in days
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  subcategories?: Category[];
  productCount: number;
  featured: boolean;
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
  };
  suggestions: string[];
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

// Context type definition
export type MarketplaceContextType = {
  // State
  products: Product[];
  categories: Category[];
  sponsoredProducts: Product[];
  featuredProducts: Product[];
  sellers: SellerProfile[];
  reviews: Record<string, Review[]>;
  boostOptions: BoostOption[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  myListings: Product[];
  myOrders: Order[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  filter: ProductFilter;
  activeProduct: Product | null;
  activeSeller: SellerProfile | null;
  isLoading: boolean;
  searchResults: SearchResult | null;

  // Actions
  setFilter: (filter: ProductFilter) => void;
  searchProducts: (
    query: string,
    filters?: ProductFilter,
  ) => Promise<SearchResult>;

  // Cart management
  addToCart: (
    productId: string,
    quantity?: number,
    variants?: Record<string, string>,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // Wishlist management
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;

  // Product management
  getProduct: (productId: string) => Product | undefined;
  createProduct: (
    product: Omit<
      Product,
      | "id"
      | "sellerId"
      | "sellerName"
      | "sellerAvatar"
      | "createdAt"
      | "updatedAt"
    >,
  ) => Promise<Product>;
  updateProduct: (
    productId: string,
    updates: Partial<Product>,
  ) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  boostProduct: (productId: string, boostOptionId: string) => Promise<Product>;

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
    rating: number,
    content: string,
    images?: string[],
  ) => Promise<Review>;
  markReviewHelpful: (reviewId: string) => Promise<void>;
  reportReview: (reviewId: string, reason: string) => Promise<void>;

  // Order management
  createOrder: (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Order>;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
  requestReturn: (orderId: string, reason: string) => Promise<boolean>;

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
  checkout: (
    paymentMethodId: string,
    shippingAddressId: string,
    billingAddressId?: string,
  ) => Promise<Order>;
  calculateShipping: (addressId: string, items: CartItem[]) => Promise<number>;
  applyPromotion: (code: string) => Promise<Promotion>;

  // Utility functions
  setActiveProduct: (product: Product | null) => void;
  setActiveSeller: (seller: SellerProfile | null) => void;
  messageUser: (
    userId: string,
    message: string,
    productId?: string,
  ) => Promise<boolean>;
  getCategories: () => Category[];
  getRecommendedProducts: (productId?: string) => Product[];
};

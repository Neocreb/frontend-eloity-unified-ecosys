import {
  Product,
  SellerProfile,
  Review,
  Order,
  OrderItem,
  CartItem,
  Address,
  PaymentMethod,
  Category,
  BoostOption,
  Promotion,
  MarketplaceStats,
  SellerStats,
  SearchResult,
  ProductFilter,
} from "@/types/marketplace";

// Mock data for comprehensive marketplace functionality

export const mockCategories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300",
    productCount: 1247,
    featured: true,
    subcategories: [
      {
        id: "smartphones",
        name: "Smartphones",
        slug: "smartphones",
        productCount: 324,
        featured: false,
      },
      {
        id: "laptops",
        name: "Laptops",
        slug: "laptops",
        productCount: 198,
        featured: false,
      },
      {
        id: "headphones",
        name: "Headphones",
        slug: "headphones",
        productCount: 156,
        featured: false,
      },
      {
        id: "cameras",
        name: "Cameras",
        slug: "cameras",
        productCount: 89,
        featured: false,
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300",
    productCount: 2156,
    featured: true,
    subcategories: [
      {
        id: "mens-clothing",
        name: "Men's Clothing",
        slug: "mens-clothing",
        productCount: 678,
        featured: false,
      },
      {
        id: "womens-clothing",
        name: "Women's Clothing",
        slug: "womens-clothing",
        productCount: 892,
        featured: false,
      },
      {
        id: "shoes",
        name: "Shoes",
        slug: "shoes",
        productCount: 456,
        featured: false,
      },
      {
        id: "accessories",
        name: "Accessories",
        slug: "accessories",
        productCount: 234,
        featured: false,
      },
    ],
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
    productCount: 987,
    featured: true,
    subcategories: [
      {
        id: "furniture",
        name: "Furniture",
        slug: "furniture",
        productCount: 345,
        featured: false,
      },
      {
        id: "decor",
        name: "Home Decor",
        slug: "decor",
        productCount: 278,
        featured: false,
      },
      {
        id: "kitchen",
        name: "Kitchen",
        slug: "kitchen",
        productCount: 198,
        featured: false,
      },
      {
        id: "garden",
        name: "Garden",
        slug: "garden",
        productCount: 166,
        featured: false,
      },
    ],
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
    productCount: 743,
    featured: false,
    subcategories: [
      {
        id: "fitness",
        name: "Fitness",
        slug: "fitness",
        productCount: 234,
        featured: false,
      },
      {
        id: "outdoor",
        name: "Outdoor",
        slug: "outdoor",
        productCount: 189,
        featured: false,
      },
      {
        id: "team-sports",
        name: "Team Sports",
        slug: "team-sports",
        productCount: 167,
        featured: false,
      },
      {
        id: "water-sports",
        name: "Water Sports",
        slug: "water-sports",
        productCount: 153,
        featured: false,
      },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Health",
    slug: "beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300",
    productCount: 654,
    featured: false,
    subcategories: [
      {
        id: "skincare",
        name: "Skincare",
        slug: "skincare",
        productCount: 198,
        featured: false,
      },
      {
        id: "makeup",
        name: "Makeup",
        slug: "makeup",
        productCount: 176,
        featured: false,
      },
      {
        id: "hair-care",
        name: "Hair Care",
        slug: "hair-care",
        productCount: 134,
        featured: false,
      },
      {
        id: "supplements",
        name: "Supplements",
        slug: "supplements",
        productCount: 146,
        featured: false,
      },
    ],
  },
  {
    id: "books",
    name: "Books & Media",
    slug: "books",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300",
    productCount: 432,
    featured: false,
    subcategories: [
      {
        id: "fiction",
        name: "Fiction",
        slug: "fiction",
        productCount: 156,
        featured: false,
      },
      {
        id: "non-fiction",
        name: "Non-Fiction",
        slug: "non-fiction",
        productCount: 134,
        featured: false,
      },
      {
        id: "textbooks",
        name: "Textbooks",
        slug: "textbooks",
        productCount: 87,
        featured: false,
      },
      {
        id: "media",
        name: "Movies & Music",
        slug: "media",
        productCount: 55,
        featured: false,
      },
    ],
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "iPhone 15 Pro Max",
    description:
      "The most advanced iPhone yet with titanium design, A17 Pro chip, and professional camera system.",
    price: 1199.99,
    discountPrice: 1099.99,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
      "https://images.unsplash.com/photo-1512499617640-c2f999de1f7a?w=500",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500",
    ],
    category: "electronics",
    subcategory: "smartphones",
    rating: 4.8,
    reviewCount: 1247,
    inStock: true,
    stockQuantity: 45,
    condition: "new",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    isNew: true,
    isFeatured: true,
    isSponsored: true,
    boostedUntil: "2024-12-31T23:59:59Z",
    tags: ["smartphone", "apple", "premium", "5g"],
    sellerId: "seller1",
    sellerName: "TechHub Store",
    sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    sellerRating: 4.9,
    sellerVerified: true,
    specifications: [
      { name: "Display", value: "6.7-inch Super Retina XDR" },
      { name: "Chip", value: "A17 Pro" },
      { name: "Storage", value: "256GB" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Battery", value: "Up to 29 hours video playback" },
    ],
    variants: [
      {
        id: "v1",
        name: "Storage",
        value: "128GB",
        price: 1099.99,
        inStock: true,
        stockQuantity: 23,
      },
      {
        id: "v2",
        name: "Storage",
        value: "256GB",
        price: 1199.99,
        inStock: true,
        stockQuantity: 45,
      },
      {
        id: "v3",
        name: "Storage",
        value: "512GB",
        price: 1399.99,
        inStock: true,
        stockQuantity: 12,
      },
      {
        id: "c1",
        name: "Color",
        value: "Natural Titanium",
        inStock: true,
        stockQuantity: 30,
      },
      {
        id: "c2",
        name: "Color",
        value: "Blue Titanium",
        inStock: true,
        stockQuantity: 25,
      },
      {
        id: "c3",
        name: "Color",
        value: "White Titanium",
        inStock: true,
        stockQuantity: 20,
      },
      {
        id: "c4",
        name: "Color",
        value: "Black Titanium",
        inStock: true,
        stockQuantity: 15,
      },
    ],
    shippingInfo: {
      weight: 0.35,
      dimensions: { length: 16, width: 7.7, height: 0.83, unit: "cm" },
      freeShipping: true,
      estimatedDelivery: "2-3 business days",
      expressAvailable: true,
      expressShippingCost: 15.99,
      internationalShipping: true,
    },
    returnPolicy: "30-day return policy",
    warranty: "1-year limited warranty",
    weight: 0.35,
    dimensions: { length: 16, width: 7.7, height: 0.83, unit: "cm" },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "p2",
    name: "MacBook Pro 16-inch M3 Max",
    description:
      "Professional laptop with M3 Max chip, stunning Liquid Retina XDR display, and all-day battery life.",
    price: 3999.99,
    discountPrice: 3699.99,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    ],
    category: "electronics",
    subcategory: "laptops",
    rating: 4.9,
    reviewCount: 856,
    inStock: true,
    stockQuantity: 12,
    condition: "new",
    brand: "Apple",
    model: "MacBook Pro 16-inch",
    isNew: true,
    isFeatured: true,
    tags: ["laptop", "professional", "apple", "m3"],
    sellerId: "seller1",
    sellerName: "TechHub Store",
    sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    sellerRating: 4.9,
    sellerVerified: true,
    specifications: [
      { name: "Chip", value: "Apple M3 Max" },
      { name: "Memory", value: "36GB unified memory" },
      { name: "Storage", value: "1TB SSD" },
      { name: "Display", value: "16.2-inch Liquid Retina XDR" },
      { name: "Battery", value: "Up to 22 hours" },
    ],
    variants: [
      {
        id: "v1",
        name: "Memory",
        value: "18GB",
        price: 2999.99,
        inStock: true,
        stockQuantity: 8,
      },
      {
        id: "v2",
        name: "Memory",
        value: "36GB",
        price: 3999.99,
        inStock: true,
        stockQuantity: 12,
      },
      {
        id: "v3",
        name: "Memory",
        value: "128GB",
        price: 7199.99,
        inStock: true,
        stockQuantity: 3,
      },
      {
        id: "s1",
        name: "Storage",
        value: "512GB",
        price: 3499.99,
        inStock: true,
        stockQuantity: 15,
      },
      {
        id: "s2",
        name: "Storage",
        value: "1TB",
        price: 3999.99,
        inStock: true,
        stockQuantity: 12,
      },
      {
        id: "s3",
        name: "Storage",
        value: "2TB",
        price: 4999.99,
        inStock: true,
        stockQuantity: 5,
      },
    ],
    shippingInfo: {
      weight: 2.15,
      dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: "cm" },
      freeShipping: true,
      estimatedDelivery: "3-5 business days",
      expressAvailable: true,
      expressShippingCost: 25.99,
      internationalShipping: true,
    },
    returnPolicy: "30-day return policy",
    warranty: "1-year limited warranty + 3 months free tech support",
    weight: 2.15,
    dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: "cm" },
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:15:00Z",
  },
  {
    id: "p3",
    name: "Nike Air Max 270",
    description:
      "Lifestyle sneaker with large Air unit in the heel for all-day comfort and style.",
    price: 150.0,
    discountPrice: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    ],
    category: "fashion",
    subcategory: "shoes",
    rating: 4.6,
    reviewCount: 2134,
    inStock: true,
    stockQuantity: 234,
    condition: "new",
    brand: "Nike",
    model: "Air Max 270",
    isFeatured: true,
    tags: ["sneakers", "nike", "comfort", "lifestyle"],
    sellerId: "seller2",
    sellerName: "Sneaker World",
    sellerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    sellerRating: 4.7,
    sellerVerified: true,
    specifications: [
      { name: "Upper Material", value: "Mesh and synthetic" },
      { name: "Sole", value: "Rubber with Air Max unit" },
      { name: "Closure", value: "Lace-up" },
      { name: "Style", value: "Low-top" },
    ],
    variants: [
      {
        id: "size7",
        name: "Size",
        value: "US 7",
        inStock: true,
        stockQuantity: 23,
      },
      {
        id: "size8",
        name: "Size",
        value: "US 8",
        inStock: true,
        stockQuantity: 45,
      },
      {
        id: "size9",
        name: "Size",
        value: "US 9",
        inStock: true,
        stockQuantity: 67,
      },
      {
        id: "size10",
        name: "Size",
        value: "US 10",
        inStock: true,
        stockQuantity: 34,
      },
      {
        id: "size11",
        name: "Size",
        value: "US 11",
        inStock: true,
        stockQuantity: 28,
      },
      {
        id: "size12",
        name: "Size",
        value: "US 12",
        inStock: true,
        stockQuantity: 15,
      },
      {
        id: "black",
        name: "Color",
        value: "Black/White",
        inStock: true,
        stockQuantity: 89,
      },
      {
        id: "white",
        name: "Color",
        value: "White/Black",
        inStock: true,
        stockQuantity: 76,
      },
      {
        id: "red",
        name: "Color",
        value: "Red/Black",
        inStock: true,
        stockQuantity: 45,
      },
      {
        id: "blue",
        name: "Color",
        value: "Blue/White",
        inStock: true,
        stockQuantity: 34,
      },
    ],
    shippingInfo: {
      weight: 0.8,
      dimensions: { length: 33, width: 20, height: 12, unit: "cm" },
      freeShipping: true,
      estimatedDelivery: "3-5 business days",
      expressAvailable: true,
      expressShippingCost: 12.99,
      internationalShipping: true,
    },
    returnPolicy: "60-day return policy",
    warranty: "2-year manufacturing warranty",
    weight: 0.8,
    dimensions: { length: 33, width: 20, height: 12, unit: "cm" },
    createdAt: "2024-01-10T14:22:00Z",
    updatedAt: "2024-01-10T14:22:00Z",
  },
];

export const mockSellers: SellerProfile[] = [
  {
    id: "seller1",
    username: "techhub",
    name: "TechHub Store",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Your trusted source for the latest tech gadgets, electronics, and accessories. Authorized retailer with 10+ years of experience.",
    joinedDate: "2020-03-15T00:00:00Z",
    isVerified: true,
    rating: 4.9,
    reviewCount: 2847,
    productCount: 156,
    salesCount: 8934,
    totalRevenue: 2450000,
    responseRate: 98,
    responseTime: "< 1 hour",
    location: "New York, NY",
    businessType: "business",
    businessInfo: {
      companyName: "TechHub Electronics LLC",
      registrationNumber: "LLC-2020-0315",
      taxId: "US123456789",
      address: {
        fullName: "TechHub Store",
        addressLine1: "123 Tech Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "United States",
        phone: "+1-555-0123",
      },
      phone: "+1-555-0123",
      email: "contact@techhub.com",
    },
    policies: {
      returnPolicy:
        "30-day hassle-free returns on all products. Items must be in original condition.",
      shippingPolicy:
        "Free shipping on orders over $50. Express shipping available for $15.99.",
      refundPolicy:
        "Full refunds within 30 days. Refunds processed within 3-5 business days.",
      privacyPolicy:
        "We protect your privacy and never share personal information.",
    },
    socialMedia: {
      website: "https://techhub.com",
      facebook: "https://facebook.com/techhub",
      instagram: "https://instagram.com/techhub",
      twitter: "https://twitter.com/techhub",
    },
    achievements: [
      {
        id: "top_seller",
        title: "Top Seller",
        description: "Achieved top seller status for 12 consecutive months",
        icon: "🏆",
        earnedAt: "2023-12-01T00:00:00Z",
      },
      {
        id: "fast_shipper",
        title: "Fast Shipper",
        description: "Consistently ships orders within 24 hours",
        icon: "⚡",
        earnedAt: "2023-06-15T00:00:00Z",
      },
    ],
  },
  {
    id: "seller2",
    username: "sneakerworld",
    name: "Sneaker World",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Premium sneakers and athletic footwear from top brands. Authentic products with fast shipping and excellent customer service.",
    joinedDate: "2019-11-22T00:00:00Z",
    isVerified: true,
    rating: 4.7,
    reviewCount: 1923,
    productCount: 342,
    salesCount: 5672,
    totalRevenue: 850000,
    responseRate: 95,
    responseTime: "2-4 hours",
    location: "Los Angeles, CA",
    businessType: "business",
    policies: {
      returnPolicy:
        "60-day return policy for unworn shoes in original packaging.",
      shippingPolicy:
        "Free shipping on all orders. Express shipping available.",
      refundPolicy:
        "Full refunds for defective products. Store credit for returns.",
    },
    achievements: [
      {
        id: "verified_authentic",
        title: "Authenticity Verified",
        description: "All products verified for authenticity",
        icon: "✅",
        earnedAt: "2023-08-20T00:00:00Z",
      },
    ],
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    userId: "user1",
    userName: "Sarah Johnson",
    userAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    rating: 5,
    content:
      "Amazing phone! The camera quality is outstanding and the battery life is incredible. Fast shipping and great packaging.",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300",
    ],
    verified: true,
    helpful: 23,
    reported: false,
    sellerResponse: {
      content:
        "Thank you for the wonderful review! We're so glad you're happy with your new iPhone.",
      createdAt: "2024-01-16T09:00:00Z",
    },
    createdAt: "2024-01-15T18:30:00Z",
  },
  {
    id: "r2",
    productId: "p1",
    userId: "user2",
    userName: "Michael Chen",
    userAvatar: "https://randomuser.me/api/portraits/men/34.jpg",
    rating: 4,
    content:
      "Great phone overall. The titanium design feels premium and the performance is excellent. Only minor complaint is the price.",
    verified: true,
    helpful: 18,
    reported: false,
    createdAt: "2024-01-14T14:45:00Z",
  },
];

export const mockOrders: Order[] = [
  {
    id: "order1",
    customerId: "user1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    items: [
      {
        productId: "p1",
        productName: "iPhone 15 Pro Max",
        productImage:
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200",
        sellerId: "seller1",
        sellerName: "TechHub Store",
        quantity: 1,
        unitPrice: 1099.99,
        totalPrice: 1099.99,
        selectedVariants: { Storage: "256GB", Color: "Natural Titanium" },
        status: "shipped",
      },
    ],
    subtotal: 1099.99,
    shippingCost: 0,
    taxAmount: 109.99,
    discountAmount: 100.0,
    totalAmount: 1109.98,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card ending in 4242",
    shippingAddress: {
      fullName: "John Doe",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
      phone: "+1-555-0199",
    },
    billingAddress: {
      fullName: "John Doe",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
    trackingNumber: "UPS123456789",
    estimatedDelivery: "2024-01-18T17:00:00Z",
    notes: "Please leave at front door if not home",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:22:00Z",
  },
];

export const mockBoostOptions: BoostOption[] = [
  {
    id: "boost1",
    name: "24-Hour Boost",
    duration: 1,
    price: 5.99,
    description: "Boost your product visibility for 24 hours",
    features: [
      "Featured in sponsored section",
      "Higher search ranking",
      "Mobile app promotion",
    ],
  },
  {
    id: "boost2",
    name: "3-Day Boost",
    duration: 3,
    price: 14.99,
    description: "Boost your product visibility for 3 days",
    features: [
      "Featured in sponsored section",
      "Higher search ranking",
      "Mobile app promotion",
      "Email newsletter inclusion",
    ],
    popular: true,
  },
  {
    id: "boost3",
    name: "Weekly Boost",
    duration: 7,
    price: 29.99,
    description: "Boost your product visibility for a full week",
    features: [
      "Featured in sponsored section",
      "Higher search ranking",
      "Mobile app promotion",
      "Email newsletter inclusion",
      "Social media promotion",
    ],
  },
  {
    id: "boost4",
    name: "Premium Boost",
    duration: 14,
    price: 49.99,
    description: "Maximum visibility for 2 weeks",
    features: [
      "Featured in sponsored section",
      "Higher search ranking",
      "Mobile app promotion",
      "Email newsletter inclusion",
      "Social media promotion",
      "Homepage banner",
    ],
  },
];

export const mockAddresses: Address[] = [
  {
    id: "addr1",
    type: "shipping",
    fullName: "John Doe",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    postalCode: "94102",
    country: "United States",
    phone: "+1-555-0199",
    isDefault: true,
  },
  {
    id: "addr2",
    type: "billing",
    fullName: "John Doe",
    company: "Acme Corp",
    addressLine1: "456 Business Ave",
    city: "San Francisco",
    state: "CA",
    postalCode: "94103",
    country: "United States",
    isDefault: true,
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    type: "card",
    name: "Visa ending in 4242",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027,
    brand: "visa",
    isDefault: true,
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "pm2",
    type: "card",
    name: "Mastercard ending in 5555",
    last4: "5555",
    expiryMonth: 8,
    expiryYear: 2026,
    brand: "mastercard",
    isDefault: false,
    createdAt: "2023-08-22T14:15:00Z",
  },
];

export const mockPromotions: Promotion[] = [
  {
    id: "promo1",
    title: "WELCOME10",
    description: "10% off your first order",
    type: "percentage",
    value: 10,
    maxDiscount: 100,
    code: "WELCOME10",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    usageLimit: 1000,
    usageCount: 245,
    active: true,
  },
  {
    id: "promo2",
    title: "Free Shipping Weekend",
    description: "Free shipping on all orders this weekend",
    type: "free_shipping",
    value: 0,
    startDate: "2024-01-20T00:00:00Z",
    endDate: "2024-01-21T23:59:59Z",
    usageLimit: 10000,
    usageCount: 1234,
    active: true,
  },
];

// Service functions
export const marketplaceService = {
  // Product operations
  async searchProducts(
    query: string,
    filters: ProductFilter = {},
  ): Promise<SearchResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredProducts = [...mockProducts];

    // Apply search query
    if (query) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          ),
      );
    }

    // Apply filters
    if (filters.category && filters.category !== "all") {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === filters.category,
      );
    }

    if (filters.subcategory) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategory === filters.subcategory,
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => (p.discountPrice || p.price) >= filters.minPrice!,
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => (p.discountPrice || p.price) <= filters.maxPrice!,
      );
    }

    if (filters.rating !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.rating >= filters.rating!,
      );
    }

    if (filters.condition) {
      filteredProducts = filteredProducts.filter(
        (p) => p.condition === filters.condition,
      );
    }

    if (filters.brand) {
      filteredProducts = filteredProducts.filter((p) =>
        p.brand?.toLowerCase().includes(filters.brand!.toLowerCase()),
      );
    }

    if (filters.freeShipping) {
      filteredProducts = filteredProducts.filter(
        (p) => p.shippingInfo?.freeShipping,
      );
    }

    if (filters.inStock) {
      filteredProducts = filteredProducts.filter((p) => p.inStock);
    }

    if (filters.sellerId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.sellerId === filters.sellerId,
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          filteredProducts.sort(
            (a, b) =>
              (a.discountPrice || a.price) - (b.discountPrice || b.price),
          );
          break;
        case "price-high":
          filteredProducts.sort(
            (a, b) =>
              (b.discountPrice || b.price) - (a.discountPrice || a.price),
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "reviews":
          filteredProducts.sort(
            (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0),
          );
          break;
        case "recent":
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
      }
    }

    return {
      products: filteredProducts,
      totalCount: filteredProducts.length,
      currentPage: 1,
      totalPages: Math.ceil(filteredProducts.length / 20),
      filters: {
        categories: mockCategories.map((cat) => ({
          name: cat.name,
          count: cat.productCount,
        })),
        brands: [
          { name: "Apple", count: 156 },
          { name: "Nike", count: 234 },
          { name: "Samsung", count: 198 },
          { name: "Sony", count: 167 },
        ],
        priceRanges: [
          { min: 0, max: 50, count: 234 },
          { min: 50, max: 200, count: 456 },
          { min: 200, max: 500, count: 678 },
          { min: 500, max: 1000, count: 345 },
          { min: 1000, max: 5000, count: 123 },
        ],
        ratings: [
          { rating: 5, count: 234 },
          { rating: 4, count: 567 },
          { rating: 3, count: 345 },
          { rating: 2, count: 123 },
          { rating: 1, count: 45 },
        ],
      },
      suggestions: [
        "iphone 15",
        "macbook pro",
        "nike air max",
        "apple watch",
        "samsung galaxy",
      ],
    };
  },

  async getProduct(productId: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockProducts.find((p) => p.id === productId) || null;
  },

  async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(
    productId: string,
    updates: Partial<Product>,
  ): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const productIndex = mockProducts.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return mockProducts[productIndex];
  },

  async deleteProduct(productId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const productIndex = mockProducts.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return false;
    }

    mockProducts.splice(productIndex, 1);
    return true;
  },

  // Order operations
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newOrder: Order = {
      ...orderData,
      id: `order${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);
    return newOrder;
  },

  async getOrders(customerId: string): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockOrders.filter((order) => order.customerId === customerId);
  },

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockOrders.filter((order) => 
      order.items.some(item => item.sellerId === sellerId)
    );
  },

  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
  ): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error("Order not found");
    }

    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    return mockOrders[orderIndex];
  },

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockReviews.filter((review) => review.productId === productId);
  },

  async addReview(
    reviewData: Omit<Review, "id" | "createdAt">,
  ): Promise<Review> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newReview: Review = {
      ...reviewData,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    mockReviews.push(newReview);
    return newReview;
  },

  // Utility functions
  async getCategories(): Promise<Category[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockCategories;
  },

  async getSellers(): Promise<SellerProfile[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return mockSellers;
  },

  async getBoostOptions(): Promise<BoostOption[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockBoostOptions;
  },

  async calculateShipping(
    addressId: string,
    items: CartItem[],
  ): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simple shipping calculation
    const totalWeight = items.reduce(
      (weight, item) => weight + (item.product.weight || 0) * item.quantity,
      0,
    );

    const hasExpressShipping = items.some(
      (item) => item.product.shippingInfo?.expressAvailable,
    );

    if (totalWeight === 0) return 0;
    if (totalWeight < 2) return 5.99;
    if (totalWeight < 5) return 9.99;
    if (hasExpressShipping) return 15.99;

    return 12.99;
  },

  async getRecommendedProducts(productId?: string): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (productId) {
      const product = mockProducts.find((p) => p.id === productId);
      if (product) {
        // Return products from same category
        return mockProducts
          .filter((p) => p.id !== productId && p.category === product.category)
          .slice(0, 6);
      }
    }

    // Return featured products
    return mockProducts.filter((p) => p.isFeatured).slice(0, 6);
  },

  // Add missing seller analytics function
  async getSellerAnalytics(sellerId: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock seller analytics data
    return {
      totalRevenue: 12500,
      totalOrders: 89,
      totalProducts: 24,
      customerSatisfaction: 4.8,
      monthlyRevenue: [8500, 10200, 12500],
      categoryBreakdown: [
        { category: "Electronics", revenue: 7800, percentage: 62 },
        { category: "Fashion", revenue: 3200, percentage: 26 },
        { category: "Home", revenue: 1500, percentage: 12 },
      ],
      averageOrderValue: 140.45,
      responseRate: 98,
      onTimeDeliveryRate: 95,
      topProducts: mockProducts.slice(0, 3),
      conversionRate: 3.2,
      boostROI: 245,
    };
  },

  // Add missing product performance function
  async getProductPerformance(productId: string): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Mock product performance data
    return {
      views: 1247,
      clicks: 398,
      addToCarts: 156,
      purchases: 89,
      favorites: 67,
      conversionRate: 2.3,
      revenue: 22450,
      rating: 4.8,
      reviewCount: 124,
    };
  },

  // Add missing duplicateProduct function
  async duplicateProduct(productId: string): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const duplicatedProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      name: `${product.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(duplicatedProduct);
    return duplicatedProduct;
  },

};

export default marketplaceService;

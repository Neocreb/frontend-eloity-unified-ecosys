import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Product, 
  SellerProfile, 
  Review, 
  CartItem, 
  WishlistItem, 
  ProductFilter,
  BoostOption
} from "@/types/marketplace";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Mock data for products
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones",
    description: "Premium wireless headphones with active noise cancellation for an immersive audio experience. Features 30-hour battery life, touch controls, and voice assistant compatibility.",
    price: 299.99,
    discountPrice: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhlYWRwaG9uZXN8ZW58MHx8MHx8fDA%3D"
    ],
    category: "electronics",
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isNew: true,
    isFeatured: true,
    isSponsored: true,
    boostedUntil: "2023-12-31T23:59:59Z",
    tags: ["audio", "wireless", "noise-cancelling"],
    sellerId: "seller1",
    sellerName: "AudioTech",
    sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    sellerRating: 4.9,
    sellerVerified: true,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Smart Watch Series 5",
    description: "Track your fitness and stay connected with this smart watch. Features heart rate monitoring, GPS, and water resistance up to 50 meters.",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
    category: "electronics",
    rating: 4.5,
    reviewCount: 89,
    inStock: true,
    isFeatured: true,
    tags: ["wearable", "fitness", "smart-watch"],
    sellerId: "seller2",
    sellerName: "TechGadgets",
    sellerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    sellerRating: 4.7,
    sellerVerified: true,
    createdAt: "2023-02-20T14:45:00Z",
    updatedAt: "2023-02-20T14:45:00Z"
  },
  {
    id: "3",
    name: "Premium Cotton T-Shirt",
    description: "Comfortable 100% cotton t-shirt with modern fit. Available in multiple colors and sizes.",
    price: 29.99,
    discountPrice: 19.99,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
    category: "clothing",
    rating: 4.2,
    reviewCount: 215,
    inStock: true,
    isFeatured: true,
    tags: ["apparel", "casual", "cotton"],
    sellerId: "seller3",
    sellerName: "FashionHub",
    sellerAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    sellerVerified: false,
    createdAt: "2023-03-05T09:15:00Z",
    updatedAt: "2023-03-05T09:15:00Z"
  },
  {
    id: "4",
    name: "Designer Sunglasses",
    description: "UV protection sunglasses with polarized lenses. Stylish design with durable metal frame.",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
    category: "accessories",
    rating: 4.7,
    reviewCount: 56,
    inStock: false,
    tags: ["eyewear", "fashion", "summer"],
    sellerId: "seller4",
    sellerName: "LuxeStyle",
    sellerAvatar: "https://randomuser.me/api/portraits/men/42.jpg",
    sellerRating: 4.8,
    sellerVerified: true,
    createdAt: "2023-04-12T11:30:00Z",
    updatedAt: "2023-04-12T11:30:00Z"
  },
  {
    id: "5",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof speaker with 20 hours battery life. Features rich bass and 360-degree sound.",
    price: 89.99,
    discountPrice: 69.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D",
    category: "electronics",
    rating: 4.4,
    reviewCount: 78,
    inStock: true,
    isNew: true,
    isSponsored: true,
    boostedUntil: "2023-12-15T23:59:59Z",
    tags: ["audio", "portable", "waterproof"],
    sellerId: "seller1",
    sellerName: "AudioTech",
    sellerAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    sellerRating: 4.9,
    sellerVerified: true,
    createdAt: "2023-05-18T15:45:00Z",
    updatedAt: "2023-05-18T15:45:00Z"
  },
  {
    id: "6",
    name: "Organic Face Serum",
    description: "Hydrating serum with natural ingredients. Helps reduce fine lines and improve skin texture.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNraW5jYXJlfGVufDB8fDB8fHww",
    category: "beauty",
    rating: 4.9,
    reviewCount: 103,
    inStock: true,
    isFeatured: true,
    tags: ["skincare", "organic", "face-care"],
    sellerId: "seller5",
    sellerName: "NaturalBeauty",
    sellerAvatar: "https://randomuser.me/api/portraits/women/89.jpg",
    sellerRating: 4.9,
    sellerVerified: true,
    createdAt: "2023-06-22T08:30:00Z",
    updatedAt: "2023-06-22T08:30:00Z"
  },
  {
    id: "7",
    name: "Running Shoes",
    description: "Lightweight breathable shoes for runners. Features cushioned soles and arch support.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D",
    category: "footwear",
    rating: 4.6,
    reviewCount: 187,
    inStock: true,
    tags: ["shoes", "sports", "running"],
    sellerId: "seller6",
    sellerName: "SportyGear",
    sellerAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
    sellerRating: 4.7,
    sellerVerified: false,
    createdAt: "2023-07-10T13:15:00Z",
    updatedAt: "2023-07-10T13:15:00Z"
  },
  {
    id: "8",
    name: "Coffee Maker",
    description: "Programmable drip coffee maker with thermal carafe. Brew up to 12 cups at once.",
    price: 149.99,
    discountPrice: 119.99,
    image: "https://images.unsplash.com/photo-1544486361-2ed1d35c1270?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y29mZmVlJTIwbWFrZXJ8ZW58MHx8MHx8fDA%3D",
    category: "home",
    rating: 4.3,
    reviewCount: 68,
    inStock: true,
    isSponsored: true,
    boostedUntil: "2023-11-30T23:59:59Z",
    tags: ["kitchen", "appliance", "coffee"],
    sellerId: "seller7",
    sellerName: "HomeEssentials",
    sellerAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    sellerRating: 4.5,
    sellerVerified: true,
    createdAt: "2023-08-05T10:45:00Z",
    updatedAt: "2023-08-05T10:45:00Z"
  }
];

// Mock data for sellers
const mockSellers: SellerProfile[] = [
  {
    id: "seller1",
    username: "audiotech",
    name: "AudioTech",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Providing high-quality audio equipment for over 10 years. Specialists in noise-cancelling technology.",
    joinedDate: "2020-03-15T00:00:00Z",
    isVerified: true,
    rating: 4.9,
    reviewCount: 342,
    productCount: 28,
    salesCount: 1520
  },
  {
    id: "seller2",
    username: "techgadgets",
    name: "TechGadgets",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Your one-stop shop for all tech accessories and gadgets. Fast shipping and great customer service.",
    joinedDate: "2019-11-22T00:00:00Z",
    isVerified: true,
    rating: 4.7,
    reviewCount: 215,
    productCount: 42,
    salesCount: 980
  },
  {
    id: "seller3",
    username: "fashionhub",
    name: "FashionHub",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Trendy clothing at affordable prices. New collections added weekly.",
    joinedDate: "2021-01-10T00:00:00Z",
    isVerified: false,
    rating: 4.5,
    reviewCount: 178,
    productCount: 64,
    salesCount: 823
  },
  {
    id: "seller4",
    username: "luxestyle",
    name: "LuxeStyle",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    bio: "Curated collection of luxury fashion accessories and designer items.",
    joinedDate: "2018-06-05T00:00:00Z",
    isVerified: true,
    rating: 4.8,
    reviewCount: 297,
    productCount: 31,
    salesCount: 654
  },
  {
    id: "seller5",
    username: "naturalbeauty",
    name: "NaturalBeauty",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    bio: "Organic skincare products made with natural ingredients. Cruelty-free and eco-friendly.",
    joinedDate: "2020-09-12T00:00:00Z",
    isVerified: true,
    rating: 4.9,
    reviewCount: 156,
    productCount: 22,
    salesCount: 743
  }
];

// Mock reviews
const mockReviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userId: "user1",
    userName: "Sarah Johnson",
    userAvatar: "https://randomuser.me/api/portraits/women/12.jpg",
    rating: 5,
    content: "These headphones are amazing! The noise cancellation works perfectly, and the sound quality is outstanding. Battery life is as advertised, and they're very comfortable to wear for long periods.",
    createdAt: "2023-02-10T14:30:00Z"
  },
  {
    id: "r2",
    productId: "1",
    userId: "user2",
    userName: "Michael Chen",
    userAvatar: "https://randomuser.me/api/portraits/men/34.jpg",
    rating: 4,
    content: "Great headphones overall. Sound quality is excellent and the ANC works well. Took off one star because they get a bit uncomfortable after several hours of use. Otherwise, highly recommended!",
    createdAt: "2023-03-05T09:15:00Z"
  },
  {
    id: "r3",
    productId: "1",
    userId: "user3",
    userName: "Emma Williams",
    userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 5,
    content: "Best headphones I've ever owned! They're worth every penny. The sound is crisp and clear, and the noise cancellation is perfect for my commute.",
    createdAt: "2023-04-12T16:45:00Z"
  }
];

// Mock data for boost options
const mockBoostOptions: BoostOption[] = [
  {
    id: "boost1",
    name: "24-Hour Boost",
    duration: 1,
    price: 5,
    description: "Boost your product visibility for 24 hours"
  },
  {
    id: "boost2",
    name: "3-Day Boost",
    duration: 3,
    price: 12,
    description: "Boost your product visibility for 3 days"
  },
  {
    id: "boost3",
    name: "Weekly Boost",
    duration: 7,
    price: 25,
    description: "Boost your product visibility for a full week"
  },
  {
    id: "boost4",
    name: "Premium Boost",
    duration: 14,
    price: 45,
    description: "Maximum visibility for 2 weeks"
  }
];

// Define the context type
type MarketplaceContextType = {
  products: Product[];
  sponsoredProducts: Product[];
  featuredProducts: Product[];
  sellers: SellerProfile[];
  reviews: Record<string, Review[]>;
  boostOptions: BoostOption[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  myListings: Product[];
  filter: ProductFilter;
  activeProduct: Product | null;
  activeSeller: SellerProfile | null;
  isLoading: boolean;
  setFilter: (filter: ProductFilter) => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  getProduct: (productId: string) => Product | undefined;
  getSeller: (sellerId: string) => SellerProfile | undefined;
  getProductReviews: (productId: string) => Review[];
  setActiveProduct: (product: Product | null) => void;
  setActiveSeller: (seller: SellerProfile | null) => void;
  createProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "sellerAvatar" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  boostProduct: (productId: string, boostOptionId: string) => Promise<Product>;
  addReview: (productId: string, rating: number, content: string) => Promise<Review>;
  getSellerProducts: (sellerId: string) => Product[];
  getCartTotal: () => number;
  checkout: () => Promise<boolean>;
  messageUser: (userId: string, message: string, productId?: string) => Promise<boolean>;
};

// Create the context
const MarketplaceContext = createContext<MarketplaceContextType>({} as MarketplaceContextType);

// Hook to use the marketplace context
export const useMarketplace = () => useContext(MarketplaceContext);

// Provider component
export const MarketplaceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sellers, setSellers] = useState<SellerProfile[]>(mockSellers);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({
    "1": mockReviews
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeSeller, setActiveSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [boostOptions] = useState<BoostOption[]>(mockBoostOptions);

  // Calculate derived state
  const sponsoredProducts = products.filter(p => p.isSponsored);
  const featuredProducts = products.filter(p => p.isFeatured);
  const myListings = products.filter(p => user?.id === p.sellerId);

  // Load cart and wishlist from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('marketplace_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Populate with actual product data
        const cartWithProducts = parsedCart.map((item: any) => ({
          ...item,
          product: products.find(p => p.id === item.productId) as Product
        })).filter((item: CartItem) => item.product); // Only keep items with valid products
        
        setCart(cartWithProducts);
      } catch (e) {
        console.error("Error loading cart from localStorage:", e);
      }
    }

    const savedWishlist = localStorage.getItem('marketplace_wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Populate with actual product data
        const wishlistWithProducts = parsedWishlist.map((item: any) => ({
          ...item,
          product: products.find(p => p.id === item.productId) as Product
        })).filter((item: WishlistItem) => item.product); // Only keep items with valid products
        
        setWishlist(wishlistWithProducts);
      } catch (e) {
        console.error("Error loading wishlist from localStorage:", e);
      }
    }
  }, [products]);

  // Save cart and wishlist to localStorage when they change
  useEffect(() => {
    if (cart.length > 0) {
      // Store minimal data without circular references
      const cartData = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      localStorage.setItem('marketplace_cart', JSON.stringify(cartData));
    } else {
      localStorage.removeItem('marketplace_cart');
    }
  }, [cart]);

  useEffect(() => {
    if (wishlist.length > 0) {
      // Store minimal data without circular references
      const wishlistData = wishlist.map(item => ({
        productId: item.productId,
        addedAt: item.addedAt
      }));
      localStorage.setItem('marketplace_wishlist', JSON.stringify(wishlistData));
    } else {
      localStorage.removeItem('marketplace_wishlist');
    }
  }, [wishlist]);

  // Helper functions
  const getProduct = (productId: string) => products.find(p => p.id === productId);
  
  const getSeller = (sellerId: string) => sellers.find(s => s.id === sellerId);
  
  const getProductReviews = (productId: string) => reviews[productId] || [];

  const getSellerProducts = (sellerId: string) => products.filter(p => p.sellerId === sellerId);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  // Cart management
  const addToCart = (productId: string, quantity = 1) => {
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }
    
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive"
      });
      return;
    }
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      // Update quantity if already in cart
      setCart(cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { productId, product, quantity }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    
    toast({
      title: "Removed from Cart",
      description: "Item removed from your cart",
    });
  };
  
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity } 
        : item
    ));
    
    toast({
      title: "Cart Updated",
      description: "Item quantity updated",
    });
  };
  
  const clearCart = () => {
    setCart([]);
    
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };
  
  // Wishlist management
  const addToWishlist = (productId: string) => {
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return;
    }
    
    const existingItem = wishlist.find(item => item.productId === productId);
    
    if (!existingItem) {
      setWishlist([
        ...wishlist, 
        { 
          productId, 
          product, 
          addedAt: new Date().toISOString() 
        }
      ]);
      
      toast({
        title: "Added to Wishlist",
        description: `${product.name} added to your wishlist`,
      });
    }
  };
  
  const removeFromWishlist = (productId: string) => {
    setWishlist(wishlist.filter(item => item.productId !== productId));
    
    toast({
      title: "Removed from Wishlist",
      description: "Item removed from your wishlist",
    });
  };
  
  // Product management
  const createProduct = async (product: Omit<Product, "id" | "sellerId" | "sellerName" | "sellerAvatar" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create products",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }
    
    // In a real app, this would be a server call
    const newProduct: Product = {
      ...product as any,
      id: `new-${Date.now()}`,
      sellerId: user.id || "current-user",
      sellerName: user.user_metadata?.name || "Current User",
      sellerAvatar: user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=User&background=random",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProducts([...products, newProduct]);
    
    toast({
      title: "Product Created",
      description: "Your product has been listed successfully",
    });
    
    return newProduct;
  };
  
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      throw new Error("Product not found");
    }
    
    // In a real app, check if user owns the product
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    setProducts(products.map(p => p.id === productId ? updatedProduct : p));
    
    toast({
      title: "Product Updated",
      description: "Your product has been updated successfully",
    });
    
    return updatedProduct;
  };
  
  const deleteProduct = async (productId: string) => {
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      return false;
    }
    
    // In a real app, check if user owns the product
    
    setProducts(products.filter(p => p.id !== productId));
    
    toast({
      title: "Product Deleted",
      description: "Your product has been removed from the marketplace",
    });
    
    return true;
  };
  
  const boostProduct = async (productId: string, boostOptionId: string) => {
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      throw new Error("Product not found");
    }
    
    const boostOption = boostOptions.find(option => option.id === boostOptionId);
    
    if (!boostOption) {
      toast({
        title: "Error",
        description: "Boost option not found",
        variant: "destructive"
      });
      throw new Error("Boost option not found");
    }
    
    // Calculate boost end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + boostOption.duration);
    
    const updatedProduct = {
      ...product,
      isSponsored: true,
      boostedUntil: endDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setProducts(products.map(p => p.id === productId ? updatedProduct : p));
    
    toast({
      title: "Product Boosted",
      description: `Your product will be featured for ${boostOption.duration} days`,
    });
    
    return updatedProduct;
  };
  
  // Review management
  const addReview = async (productId: string, rating: number, content: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to leave reviews",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }
    
    const product = getProduct(productId);
    
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      throw new Error("Product not found");
    }
    
    // In a real app, check if user has purchased the product
    
    const newReview: Review = {
      id: `review-${Date.now()}`,
      productId,
      userId: user.id || "current-user",
      userName: user.user_metadata?.name || "Current User",
      userAvatar: user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=User&background=random",
      rating,
      content,
      createdAt: new Date().toISOString()
    };
    
    // Update reviews
    const productReviews = reviews[productId] || [];
    const updatedReviews = {
      ...reviews,
      [productId]: [...productReviews, newReview]
    };
    setReviews(updatedReviews);
    
    // Update product rating
    const allProductReviews = [...productReviews, newReview];
    const avgRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;
    
    const updatedProduct = {
      ...product,
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: (product.reviewCount || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    
    setProducts(products.map(p => p.id === productId ? updatedProduct : p));
    
    toast({
      title: "Review Added",
      description: "Your review has been published successfully",
    });
    
    return newReview;
  };
  
  // Checkout process
  const checkout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return false;
    }
    
    // In a real app, process payment here
    
    toast({
      title: "Order Completed",
      description: "Your order has been placed successfully",
    });
    
    // Clear the cart after successful checkout
    clearCart();
    
    return true;
  };
  
  // Messaging functionality
  const messageUser = async (userId: string, message: string, productId?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return false;
    }
    
    // In a real app, this would create a chat thread or add a message
    
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully",
    });
    
    return true;
  };

  // Create the context value
  const contextValue: MarketplaceContextType = {
    products,
    sponsoredProducts,
    featuredProducts,
    sellers,
    reviews,
    boostOptions,
    cart,
    wishlist,
    myListings,
    filter,
    activeProduct,
    activeSeller,
    isLoading,
    setFilter,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    getProduct,
    getSeller,
    getProductReviews,
    setActiveProduct,
    setActiveSeller,
    createProduct,
    updateProduct,
    deleteProduct,
    boostProduct,
    addReview,
    getSellerProducts,
    getCartTotal,
    checkout,
    messageUser
  };

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

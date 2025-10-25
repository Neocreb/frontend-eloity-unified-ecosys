// @ts-nocheck
import { createContext, useContext, useState, useEffect } from "react";
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
import { MarketplaceService } from "@/services/marketplaceService";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeSeller, setActiveSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [boostOptions] = useState<BoostOption[]>([
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
  ]);

  // Load real data from MarketplaceService
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load products
        const productsData = await MarketplaceService.getProducts();
        setProducts(productsData);
        
        // Load real sellers data
        const sellersData = await MarketplaceService.getSellers();
        setSellers(sellersData);
        
        // Load real reviews data for all products
        const reviewsByProduct: Record<string, Review[]> = {};
        for (const product of productsData) {
          const productReviews = await MarketplaceService.getProductReviews(product.id);
          reviewsByProduct[product.id] = productReviews;
        }
        setReviews(reviewsByProduct);
      } catch (error) {
        console.error("Error loading marketplace data:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    
    try {
      const newProductData = await MarketplaceService.createProduct({
        ...product,
        sellerId: user.id || "current-user"
      });
      
      if (!newProductData) {
        throw new Error("Failed to create product");
      }
      
      const newProduct: Product = {
        ...newProductData,
        sellerName: user.user_metadata?.name || "Current User",
        sellerAvatar: user.user_metadata?.avatar || "https://ui-avatars.com/api/?name=User&background=random",
        createdAt: newProductData.createdAt.toISOString(),
        updatedAt: newProductData.updatedAt.toISOString()
      };
      
      setProducts([...products, newProduct]);
      
      toast({
        title: "Product Created",
        description: "Your product has been listed successfully",
      });
      
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
      throw error;
    }
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
    
    try {
      const updatedProductData = await MarketplaceService.getProductById(productId);
      
      if (!updatedProductData) {
        throw new Error("Failed to update product");
      }
      
      const updatedProduct: Product = {
        ...updatedProductData,
        sellerName: product.sellerName,
        sellerAvatar: product.sellerAvatar,
        createdAt: product.createdAt,
        updatedAt: updatedProductData.updatedAt.toISOString()
      };
      
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully",
      });
      
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
      throw error;
    }
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
    
    try {
      const result = await MarketplaceService.deleteProduct(productId);
      
      if (!result) {
        throw new Error("Failed to delete product");
      }
      
      setProducts(products.filter(p => p.id !== productId));
      
      toast({
        title: "Product Deleted",
        description: "Your product has been removed from the marketplace",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
      return false;
    }
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
    
    try {
      // In a real implementation, we would call a service method to boost the product
      // For now, we'll just update the local state
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
    } catch (error) {
      console.error("Error boosting product:", error);
      toast({
        title: "Error",
        description: "Failed to boost product",
        variant: "destructive"
      });
      throw error;
    }
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
    
    try {
      // In a real implementation, we would call a service method to add the review
      // For now, we'll just update the local state
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
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive"
      });
      throw error;
    }
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

    try {
      // Import chat service
      const { chatService } = await import('@/services/chatService');
      
      // Check if conversation already exists
      const existingThreads = await chatService.getChatThreads({
        type: 'marketplace',
        searchQuery: ''
      });
      
      const existingThread = existingThreads.find(thread => 
        thread.participants.includes(user.id) && 
        thread.participants.includes(userId) &&
        thread.contextData?.type === 'marketplace' &&
        thread.contextData?.productId === productId
      );
      
      let threadId: string;
      
      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Create new chat thread with context data
        const newThread = await chatService.createChatThread({
          type: "marketplace",
          participants: [user.id, userId],
          initialMessage: message,
          contextData: {
            type: "marketplace",
            productId: productId,
          },
          referenceId: productId
        });
        threadId = newThread.id;
      }
      
      // Send the message if we're not creating a new thread with initial message
      if (!existingThread) {
        await chatService.sendMessage({
          threadId,
          content: message,
          messageType: 'text'
        });
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      
      // Redirect to chat page
      window.location.href = `/app/chat/${threadId}`;
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
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
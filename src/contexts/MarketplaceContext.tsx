import React, { createContext, useContext, useState, useEffect } from "react";
import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { realMarketplaceService } from "@/services/realMarketplaceService";
import { mockUsers } from "@/data/mockUsers";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';


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
  const [isLoading, setIsLoading] = useState(true);
  const [boostOptions] = useState<BoostOption[]>([]);

  // Load real products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        if (DEMO_MODE) {
          const allMock = Object.values(mockUsers).flatMap(u => (u.mock_data?.products || [])) as Product[];
          if (allMock.length > 0) {
            setProducts(allMock);
            return;
          }
        }

        const realProducts = await realMarketplaceService.getProducts({ limit: 50 });

        // Transform Supabase data to match Product interface
        const transformedProducts: Product[] = realProducts.map((p: any) => ({
          id: p.id,
          name: p.title,
          description: p.description || '',
          price: p.price,
          discountPrice: p.discount_price,
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          images: p.images || [],
          category: p.category || 'general',
          rating: 4.5, // Default rating
          reviewCount: 0, // Will be calculated later
          inStock: p.status === 'active',
          isNew: new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isFeatured: Math.random() > 0.7, // Random for now
          isSponsored: false,
          tags: [p.category || 'general'],
          sellerId: p.seller_id,
          sellerName: `Seller ${p.seller_id.slice(0, 8)}`,
          sellerAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=seller",
          sellerRating: 4.5,
          sellerVerified: true,
          createdAt: p.created_at,
          updatedAt: p.updated_at || p.created_at
        }));

        setProducts(transformedProducts);
      } catch (error) {
        const msg = (error && (error.message || (typeof error === 'string' ? error : JSON.stringify(error)))) || 'Unknown error';
        console.error('Error loading products:', msg, error);
        if (DEMO_MODE) {
          const allMock = Object.values(mockUsers).flatMap(u => (u.mock_data?.products || [])) as Product[];
          if (allMock.length > 0) {
            setProducts(allMock);
            return;
          }
        }
        toast({
          title: "Error loading products",
          description: msg,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

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

import { createContext, useContext, useState, useEffect } from "react";
import {
  Product,
  ProductVariant,
  SellerProfile,
  Review,
  CartItem,
  WishlistItem,
  Wishlist,
  ProductFilter,
  BoostOption,
  ProductBoost,
  Campaign,
  CampaignProduct,
  ProductCategory,
  Order,
  OrderItem,
  OrderStatus,
  OrderItemStatus,
  PaymentStatus,
  Address,
  PaymentMethod,
  Promotion,
  SearchResult,
  MarketplaceContextType,
} from "@/types/enhanced-marketplace";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { unifiedAnalyticsService } from "@/services/unifiedAnalyticsService";
import { OrderService } from "@/services/orderService";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import { CampaignService } from "@/services/campaignService";
import { boostService } from "@/services/boostService";
import { PaymentMethodService } from "@/services/paymentMethodService";
import { MarketplaceService } from "@/services/marketplaceService";
import { WishlistService } from "@/services/wishlistService";
import { AddressService } from "@/services/addressService";

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
        setCategories(categoriesData as unknown as ProductCategory[]);
        
        // Load products
        const productsData = await ProductService.getProducts();
        const enhancedProducts = productsData.map(convertMarketplaceProductToEnhancedProduct);
        setProducts(enhancedProducts);
        
        // Load campaigns
        const campaignsData = await CampaignService.getActiveCampaigns();
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
        const enhancedProduct = convertMarketplaceProductToEnhancedProduct(newProduct as any);
        setProducts([...products, enhancedProduct]);
        toast({
          title: "Product Created",
          description: "Your product has been listed successfully",
        });
        return enhancedProduct;
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
  const searchProducts = async (query: string, filters?: ProductFilter): Promise<SearchResult> => {
    try {
      // Filter products based on query and filters
      let filteredProducts = products;
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          product.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }
      
      if (filters) {
        if (filters.category) {
          filteredProducts = filteredProducts.filter(product => product.category === filters.category);
        }
        if (filters.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!);
        }
        if (filters.rating !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.rating >= filters.rating!);
        }
        if (filters.inStock) {
          filteredProducts = filteredProducts.filter(product => product.inStock);
        }
      }
      
      // Generate mock search result data
      const categorySet: string[] = [];
      filteredProducts.forEach(p => {
        if (p.category && !categorySet.includes(p.category)) {
          categorySet.push(p.category);
        }
      });
      const categories = categorySet.map(category => ({
        name: category,
        count: filteredProducts.filter(p => p.category === category).length
      }));
      
      const brandSet: string[] = [];
      filteredProducts.forEach(p => {
        if (p.brand && !brandSet.includes(p.brand)) {
          brandSet.push(p.brand);
        }
      });
      const brands = brandSet.map(brand => ({
        name: brand,
        count: filteredProducts.filter(p => p.brand === brand).length
      }));
      
      const priceRanges = [
        { min: 0, max: 50, count: filteredProducts.filter(p => p.price <= 50).length },
        { min: 50, max: 100, count: filteredProducts.filter(p => p.price > 50 && p.price <= 100).length },
        { min: 100, max: 500, count: filteredProducts.filter(p => p.price > 100 && p.price <= 500).length },
        { min: 500, max: Infinity, count: filteredProducts.filter(p => p.price > 500).length },
      ];
      
      const ratings = [
        { rating: 5, count: filteredProducts.filter(p => p.rating >= 5).length },
        { rating: 4, count: filteredProducts.filter(p => p.rating >= 4 && p.rating < 5).length },
        { rating: 3, count: filteredProducts.filter(p => p.rating >= 3 && p.rating < 4).length },
        { rating: 2, count: filteredProducts.filter(p => p.rating >= 2 && p.rating < 3).length },
        { rating: 1, count: filteredProducts.filter(p => p.rating >= 1 && p.rating < 2).length },
      ];
      
      const productTypeSet: string[] = [];
      filteredProducts.forEach(p => {
        if (p.productType && !productTypeSet.includes(p.productType)) {
          productTypeSet.push(p.productType);
        }
      });
      const productTypes = productTypeSet.map(type => ({
        type,
        count: filteredProducts.filter(p => p.productType === type).length
      }));
      
      return {
        products: filteredProducts,
        totalCount: filteredProducts.length,
        currentPage: 1,
        totalPages: 1,
        filters: {
          categories,
          brands,
          priceRanges,
          ratings,
          productTypes,
        },
        suggestions: [],
        relatedSearches: [],
        facets: {},
      };
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Error",
        description: "Failed to search products",
        variant: "destructive",
      });
      
      return {
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
      };
    }
  };
  
  const addProductVariant = async (
    productId: string,
    variantData: Omit<ProductVariant, "id" | "productId" | "createdAt" | "updatedAt">
  ): Promise<ProductVariant> => {
    try {
      // In a real implementation, this would create a product variant
      const newVariant: ProductVariant = {
        id: `variant-${Date.now()}`,
        productId,
        ...variantData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      toast({
        title: "Variant Added",
        description: "Product variant has been added successfully",
      });
      
      return newVariant;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product variant",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateProductVariant = async (
    variantId: string,
    updates: Partial<ProductVariant>
  ): Promise<ProductVariant> => {
    try {
      // In a real implementation, this would update a product variant
      const updatedVariant: ProductVariant = {
        id: variantId,
        productId: updates.productId || "",
        name: updates.name || "",
        sku: updates.sku || "",
        priceAdjustment: updates.priceAdjustment || 0,
        attributes: updates.attributes || {},
        stockQuantity: updates.stockQuantity || 0,
        inStock: updates.inStock || false,
        isActive: updates.isActive || false,
        createdAt: updates.createdAt || "",
        updatedAt: new Date().toISOString(),
      };
      
      toast({
        title: "Variant Updated",
        description: "Product variant has been updated successfully",
      });
      
      return updatedVariant;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product variant",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const deleteProductVariant = async (variantId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would delete a product variant
      toast({
        title: "Variant Deleted",
        description: "Product variant has been deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product variant",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const extendBoost = async (
    boostId: string,
    additionalDuration: number
  ): Promise<ProductBoost> => {
    try {
      // In a real implementation, this would extend a product boost
      const existingBoost = productBoosts.find(b => b.id === boostId);
      if (!existingBoost) {
        throw new Error("Boost not found");
      }
      
      const extendedBoost: ProductBoost = {
        ...existingBoost,
        duration: existingBoost.duration + additionalDuration,
        endDate: new Date(
          new Date(existingBoost.endDate!).getTime() + additionalDuration * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update local state
      setProductBoosts(prev => 
        prev.map(boost => boost.id === boostId ? extendedBoost : boost)
      );
      
      toast({
        title: "Boost Extended",
        description: `Your product boost has been extended by ${additionalDuration} hours`,
      });
      
      return extendedBoost;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend product boost",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const cancelBoost = async (boostId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would cancel a product boost
      setProductBoosts(prev => 
        prev.map(boost => 
          boost.id === boostId 
            ? { ...boost, status: 'cancelled', updatedAt: new Date().toISOString() } 
            : boost
        )
      );
      
      toast({
        title: "Boost Cancelled",
        description: "Your product boost has been cancelled successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel product boost",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const getSeller = async (sellerId: string): Promise<SellerProfile | undefined> => {
    try {
      // Fetch the seller profile from the database
      const { data, error } = await supabase
        .from('marketplace_profiles')
        .select(`
          *,
          users:profiles(full_name, username, avatar_url, is_verified)
        `)
        .eq('user_id', sellerId)
        .single();
      
      if (error) {
        console.warn("Error fetching seller profile:", error);
        return undefined;
      }
      
      // Create the seller profile object
      const sellerProfile: SellerProfile = {
        id: data.user_id,
        username: data.users?.username || "",
        name: data.users?.full_name || data.store_name || "",
        avatar: data.users?.avatar_url || data.store_logo || "",
        bio: data.store_description || "",
        joinedDate: data.created_at,
        isVerified: data.users?.is_verified || data.verification_status === 'verified',
        rating: data.store_rating || 0,
        reviewCount: data.total_reviews || 0,
        productCount: data.total_products || 0,
        salesCount: data.total_sales || 0,
        totalRevenue: data.total_revenue || 0,
        responseRate: data.response_rate || 0,
        responseTime: data.response_time || "",
      };
      
      return sellerProfile;
    } catch (error) {
      console.error("Error fetching seller:", error);
      return undefined;
    }
  };
  
  const getSellerProducts = async (sellerId: string): Promise<Product[]> => {
    try {
      // Fetch products for this seller from the database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId);
      
      if (error) {
        console.warn("Error fetching seller products:", error);
        // Fallback to filtering local products
        return products.filter(product => product.sellerId === sellerId);
      }
      
      // Convert to Product type
      return data.map((item: any) => convertMarketplaceProductToEnhancedProduct(item));
    } catch (error) {
      console.error("Error fetching seller products:", error);
      return [];
    }
  };
  
  const updateSellerProfile = async (updates: Partial<SellerProfile>): Promise<SellerProfile> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // Update the seller profile in the database
      const { data, error } = await supabase
        .from('marketplace_profiles')
        .update({
          store_name: updates.name,
          store_description: updates.bio,
          store_logo: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw new Error("Failed to update seller profile");
      }
      
      // Also update the user profile
      if (updates.name || updates.avatar) {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.name,
            avatar_url: updates.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
      
      // Create or update the seller profile object
      const updatedProfile: SellerProfile = {
        id: user.id,
        username: updates.username || "",
        name: updates.name || "",
        avatar: updates.avatar || "",
        bio: updates.bio || "",
        joinedDate: updates.joinedDate || "",
        isVerified: updates.isVerified || false,
        rating: updates.rating || 0,
        reviewCount: updates.reviewCount || 0,
        productCount: updates.productCount || 0,
      };
      
      toast({
        title: "Profile Updated",
        description: "Your seller profile has been updated successfully",
      });
      
      return updatedProfile;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seller profile",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const getProductReviews = (productId: string): Review[] => {
    try {
      // Return reviews for this product if they exist
      return reviews[productId] || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error fetching product reviews:", errorMessage);
      return [];
    }
  };
  
  const addReview = async (
    productId: string,
    orderId: string,
    rating: number,
    content: string,
    additionalRatings?: Partial<Review>,
    images?: string[]
  ): Promise<Review> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // In a real implementation, this would create a review in the database
      const newReview: Review = {
        id: `review-${Date.now()}`,
        productId,
        orderId,
        userId: user.id,
        userName: user.user_metadata?.full_name || "Anonymous User",
        userAvatar: user.user_metadata?.avatar_url || "",
        rating,
        title: "",
        content,
        verified: false,
        isVerifiedPurchase: true,
        purchaseVerified: true,
        reviewSource: "marketplace",
        helpful: 0,
        totalVotes: 0,
        reported: false,
        reportCount: 0,
        moderationStatus: "pending",
        helpfulnessScore: 0,
        qualityScore: 0,
        rewardEarned: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalRatings
      };
      
      // Update local state
      setReviews(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), newReview]
      }));
      
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });
      
      return newReview;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const markReviewHelpful = async (reviewId: string): Promise<void> => {
    try {
      // In a real implementation, this would update the review's helpful count
      // For now, we'll just show a success message
      toast({
        title: "Review Helpful",
        description: "Thank you for marking this review as helpful",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const reportReview = async (reviewId: string, reason: string): Promise<void> => {
    try {
      // In a real implementation, this would report the review
      // For now, we'll just show a success message
      toast({
        title: "Review Reported",
        description: "This review has been reported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report review",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const addSellerResponse = async (
    reviewId: string,
    response: string
  ): Promise<any> => {
    try {
      // In a real implementation, this would add a seller response to a review
      const sellerResponse = {
        id: `response-${Date.now()}`,
        reviewId,
        sellerId: user?.id || "",
        response,
        moderationStatus: "pending" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      toast({
        title: "Response Added",
        description: "Your response has been added successfully",
      });
      
      return sellerResponse;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const createOrder = async (
    cartItems: CartItem[],
    shippingAddress?: Address,
    paymentMethod?: string
  ): Promise<Order> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // Calculate order totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
      const shippingCost = 0; // Would calculate based on address
      const taxAmount = 0; // Would calculate based on address
      const discountAmount = 0; // Would apply promotion
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
      
      // Create order using the marketplace service
      const orderData = {
        customerId: user.id,
        customerName: user.user_metadata?.full_name || "",
        customerEmail: user.email || "",
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        totalAmount,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        paymentMethod: paymentMethod || "",
        shippingAddress: shippingAddress || {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        billingAddress: shippingAddress || {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        trackingNumber: "",
        estimatedDelivery: undefined,
        actualDelivery: undefined,
        notes: "",
        refundAmount: undefined,
        refundReason: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product?.name || "",
        productImage: item.product?.image || "",
        sellerId: item.product?.sellerId || "",
        sellerName: item.product?.sellerName || "",
        quantity: item.quantity,
        unitPrice: item.priceSnapshot,
        totalPrice: item.priceSnapshot * item.quantity,
        selectedVariants: {},
        status: "pending" as const,
      }));
      
      const newOrder = await MarketplaceService.createOrder(orderData, orderItems);
      
      if (newOrder) {
        // Convert to enhanced marketplace order type
        const enhancedOrder: Order = {
          id: newOrder.id,
          buyerId: newOrder.customerId,
          sellerId: cartItems[0]?.product?.sellerId || "",
          customerName: newOrder.customerName || "",
          customerEmail: newOrder.customerEmail || "",
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          orderType: "marketplace",
          items: newOrder.items.map(item => ({
            productId: item.productId,
            variantId: undefined,
            productName: item.productName,
            productImage: item.productImage,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedVariants: item.selectedVariants,
            customOptions: {},
            status: item.status as OrderItemStatus,
            downloadUrl: undefined,
            licenseKey: undefined,
            deliveryDate: undefined,
            serviceNotes: undefined,
          })),
          subtotal: newOrder.subtotal,
          shippingCost: newOrder.shippingCost,
          taxAmount: newOrder.taxAmount,
          discountAmount: newOrder.discountAmount,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
          paymentCurrency: "USDT",
          paymentStatus: newOrder.paymentStatus as PaymentStatus,
          escrowId: undefined,
          paymentTransactionId: undefined,
          shippingAddress: newOrder.shippingAddress,
          billingAddress: newOrder.billingAddress,
          shippingMethod: undefined,
          trackingNumber: newOrder.trackingNumber || "",
          trackingUrl: undefined,
          estimatedDelivery: newOrder.estimatedDelivery,
          actualDelivery: newOrder.actualDelivery,
          downloadUrls: [],
          downloadExpiresAt: undefined,
          downloadCount: 0,
          downloadLimit: undefined,
          status: newOrder.status as OrderStatus,
          fulfillmentStatus: "pending",
          requiresShipping: true,
          autoCompleteAfterDays: 7,
          chatThreadId: undefined,
          customerNotes: undefined,
          sellerNotes: undefined,
          adminNotes: undefined,
          confirmedAt: undefined,
          processingAt: undefined,
          shippedAt: undefined,
          deliveredAt: newOrder.actualDelivery,
          completedAt: undefined,
          cancelledAt: undefined,
          platformFee: newOrder.totalAmount * 0.1,
          feePercentage: 10,
          sellerRevenue: newOrder.totalAmount * 0.9,
          disputeId: undefined,
          disputeReason: undefined,
          returnRequested: false,
          returnRequestedAt: undefined,
          returnReason: undefined,
          returnStatus: undefined,
          refundAmount: newOrder.refundAmount,
          refundedAt: undefined,
          createdAt: newOrder.createdAt,
          updatedAt: newOrder.updatedAt
        };
        
        // Update local state
        setMyOrders(prev => [...prev, enhancedOrder]);
        
        toast({
          title: "Order Created",
          description: `Order #${enhancedOrder.orderNumber} has been created successfully`,
        });
        
        return enhancedOrder;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const getOrder = async (orderId: string): Promise<Order | undefined> => {
    try {
      // First check if order exists in local state
      const localOrder = myOrders.find(order => order.id === orderId);
      if (localOrder) {
        return localOrder;
      }
      
      // If not found locally, fetch from database
      const order = await OrderService.getOrderById(orderId);
      return order || undefined;
    } catch (error) {
      console.error("Error fetching order:", error);
      return undefined;
    }
  };
  
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> => {
    try {
      const success = await OrderService.updateOrderStatus(orderId, status);
      if (success) {
        // Update local state
        setMyOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
          )
        );
        
        toast({
          title: "Order Updated",
          description: `Order status has been updated to ${status}`,
        });
        
        // Return the updated order
        const order = await getOrder(orderId);
        if (order) {
          return order;
        } else {
          throw new Error("Failed to find updated order");
        }
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const confirmDelivery = async (orderId: string): Promise<Order> => {
    try {
      const success = await OrderService.confirmDelivery(orderId);
      if (success) {
        // Update local state
        setMyOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status: 'delivered', deliveredAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : order
          )
        );
        
        toast({
          title: "Delivery Confirmed",
          description: "Order delivery has been confirmed",
        });
        
        // Return the updated order
        const order = await getOrder(orderId);
        if (order) {
          return order;
        } else {
          throw new Error("Failed to find updated order");
        }
      } else {
        throw new Error("Failed to confirm delivery");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm delivery",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const cancelOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      const success = await OrderService.cancelOrder(orderId, reason || "Cancelled by user");
      if (success) {
        // Update local state
        setMyOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : order
          )
        );
        
        toast({
          title: "Order Cancelled",
          description: "Your order has been cancelled successfully",
        });
        
        return true;
      } else {
        throw new Error("Failed to cancel order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const requestReturn = async (orderId: string, reason: string, items?: string[]): Promise<boolean> => {
    try {
      const success = await OrderService.requestReturn(orderId, reason);
      if (success) {
        // Update local state
        setMyOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, returnRequested: true, returnRequestedAt: new Date().toISOString(), returnReason: reason, updatedAt: new Date().toISOString() } : order
          )
        );
        
        toast({
          title: "Return Requested",
          description: "Your return request has been submitted successfully",
        });
        
        return true;
      } else {
        throw new Error("Failed to request return");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request return",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const trackOrder = async (orderId: string): Promise<{ status: string; updates: any[] }> => {
    try {
      const trackingInfo = await OrderService.trackOrder(orderId);
      if (trackingInfo) {
        return {
          status: trackingInfo.status || "unknown",
          updates: trackingInfo.updates || []
        };
      } else {
        throw new Error("Failed to fetch tracking information");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tracking information",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const downloadDigitalProduct = async (orderId: string, productId: string): Promise<string> => {
    try {
      const downloadUrl = await OrderService.downloadDigitalProduct(orderId, productId);
      if (downloadUrl) {
        toast({
          title: "Download Ready",
          description: "Your digital product is ready for download",
        });
        return downloadUrl;
      } else {
        throw new Error("Failed to generate download link");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate download link",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const raiseDispute = async (orderId: string, reason: string, description: string, evidence?: string[]): Promise<boolean> => {
    try {
      const success = await OrderService.raiseDispute(orderId, reason, description);
      if (success) {
        // Update local state
        setMyOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, disputeId: `dispute-${Date.now()}`, disputeReason: reason, updatedAt: new Date().toISOString() } : order
          )
        );
        
        toast({
          title: "Dispute Raised",
          description: "Your dispute has been submitted successfully",
        });
        
        return true;
      } else {
        throw new Error("Failed to raise dispute");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise dispute",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const getOrderDisputes = async (orderId: string): Promise<any[]> => {
    try {
      // Fetch disputes for an order from the database
      const { data, error } = await supabase
        .from('order_disputes')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) {
        console.warn("Error fetching order disputes:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error fetching order disputes:", error);
      return [];
    }
  };
  
  const getWishlists = async (): Promise<Wishlist[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      const wishlists = await WishlistService.getUserWishlists(user.id);
      return wishlists;
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wishlists",
        variant: "destructive",
      });
      return [];
    }
  };

  const createWishlist = async (name: string, description?: string): Promise<Wishlist> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const newWishlist = await WishlistService.createWishlist(user.id, name, description);
      if (newWishlist) {
        toast({
          title: "Wishlist Created",
          description: "Your new wishlist has been created successfully",
        });
        return newWishlist;
      } else {
        throw new Error("Failed to create wishlist");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create wishlist",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addToWishlist = async (
    productId: string,
    wishlistId?: string,
    options?: Partial<WishlistItem>,
  ): Promise<WishlistItem> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

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

      // If no wishlist ID provided, use the default wishlist or create one
      let targetWishlistId = wishlistId;
      if (!targetWishlistId) {
        const userWishlists = await getWishlists();
        const defaultWishlist = userWishlists.find(w => w.isDefault);
        if (defaultWishlist) {
          targetWishlistId = defaultWishlist.id;
        } else if (userWishlists.length > 0) {
          targetWishlistId = userWishlists[0].id;
        } else {
          // Create a default wishlist
          const newWishlist = await createWishlist("My Wishlist", "My default wishlist");
          targetWishlistId = newWishlist.id;
        }
      }

      const wishlistItem = await WishlistService.addToWishlist(targetWishlistId, productId);
      if (wishlistItem) {
        toast({
          title: "Added to Wishlist",
          description: `${product.name} added to your wishlist`,
        });

        return wishlistItem;
      } else {
        throw new Error("Failed to add item to wishlist");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeFromWishlist = async (itemId: string): Promise<boolean> => {
    try {
      const success = await WishlistService.removeFromWishlist(itemId);
      if (success) {
        toast({
          title: "Removed from Wishlist",
          description: "Item removed from your wishlist",
        });
        return true;
      } else {
        throw new Error("Failed to remove item from wishlist");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const moveToCart = async (wishlistItemId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would move the item from wishlist to cart
      // For now, we'll just show a success message
      toast({
        title: "Moved to Cart",
        description: "Item moved from wishlist to cart",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item to cart",
        variant: "destructive",
      });
      return false;
    }
  };

  const shareWishlist = async (wishlistId: string): Promise<string> => {
    try {
      // In a real implementation, this would generate a shareable link
      // For now, we'll return a mock URL
      const shareUrl = `${window.location.origin}/wishlist/${wishlistId}`;
      toast({
        title: "Wishlist Shared",
        description: "Your wishlist link has been copied to clipboard",
      });
      return shareUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share wishlist",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const moveToWishlist = async (cartItemId: string): Promise<boolean> => {
    try {
      const cartItem = cart.find(item => item.id === cartItemId);
      if (!cartItem) {
        toast({
          title: "Error",
          description: "Item not found in cart",
          variant: "destructive",
        });
        return false;
      }

      // Add to wishlist
      await addToWishlist(cartItem.productId);
      
      // Remove from cart
      removeFromCart(cartItemId);
      
      toast({
        title: "Moved to Wishlist",
        description: "Item moved from cart to wishlist successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item to wishlist",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const addAddress = async (address: Omit<Address, "id">): Promise<Address> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      const newAddress = await AddressService.addAddress(user.id, address);
      
      // Update local state
      setAddresses(prev => [...prev, newAddress]);
      
      toast({
        title: "Address Added",
        description: "Your address has been added successfully",
      });
      
      return newAddress;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateAddress = async (addressId: string, updates: Partial<Address>): Promise<Address> => {
    try {
      const updatedAddress = await AddressService.updateAddress(addressId, updates);
      
      // Update local state
      setAddresses(prev => 
        prev.map(addr => addr.id === addressId ? updatedAddress : addr)
      );
      
      toast({
        title: "Address Updated",
        description: "Your address has been updated successfully",
      });
      
      return updatedAddress;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const deleteAddress = async (addressId: string): Promise<boolean> => {
    try {
      const success = await AddressService.deleteAddress(addressId);
      if (success) {
        // Update local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        
        toast({
          title: "Address Deleted",
          description: "Your address has been deleted successfully",
        });
        
        return true;
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const setDefaultAddress = async (addressId: string, type: "shipping" | "billing"): Promise<void> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      const success = await AddressService.setDefaultAddress(user.id, addressId);
      if (success) {
        // Update local state to set this address as default and others as not default
        setAddresses(prev => 
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }))
        );
        
        toast({
          title: "Default Address Set",
          description: "Your default address has been updated successfully",
        });
      } else {
        throw new Error("Failed to set default address");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, "id" | "createdAt">): Promise<PaymentMethod> => {
    try {
      // In a real implementation, this would add a payment method
      const newPaymentMethod: PaymentMethod = {
        id: `pm-${Date.now()}`,
        ...paymentMethod,
        createdAt: new Date().toISOString(),
      };
      
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully",
      });
      
      return newPaymentMethod;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updatePaymentMethod = async (methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      // In a real implementation, this would update a payment method
      const updatedPaymentMethod: PaymentMethod = {
        id: methodId,
        type: updates.type || "card",
        name: updates.name || "",
        isDefault: updates.isDefault || false,
        createdAt: updates.createdAt || new Date().toISOString(),
      };
      
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully",
      });
      
      return updatedPaymentMethod;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const deletePaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would delete a payment method
      toast({
        title: "Payment Method Deleted",
        description: "Your payment method has been deleted successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const setDefaultPaymentMethod = async (methodId: string): Promise<void> => {
    try {
      // In a real implementation, this would set a default payment method
      toast({
        title: "Default Payment Method Set",
        description: "Your default payment method has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default payment method",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const validateCart = async (): Promise<{ valid: boolean; issues: string[] }> => {
    try {
      const issues: string[] = [];
      
      // Check if products are still available
      for (const item of cart) {
        const product = getProduct(item.productId);
        if (!product) {
          issues.push(`Product ${item.productId} no longer exists`);
        } else if (!product.inStock) {
          issues.push(`${product.name} is out of stock`);
        } else if (product.stockQuantity !== undefined && item.quantity > product.stockQuantity) {
          issues.push(`Only ${product.stockQuantity} units of ${product.name} available`);
        }
      }
      
      return { valid: issues.length === 0, issues };
    } catch (error) {
      console.error("Error validating cart:", error);
      return { valid: false, issues: ["Failed to validate cart"] };
    }
  };
  
  const calculateShipping = async (items: CartItem[], address: Address): Promise<number> => {
    try {
      // In a real implementation, this would calculate shipping based on:
      // - Items in cart (weight, dimensions)
      // - Destination address
      // - Shipping methods available
      const totalWeight = items.reduce((sum, item) => sum + (item.product?.weight || 0) * item.quantity, 0);
      const baseRate = 5.00; // Base shipping rate
      const weightRate = totalWeight * 0.50; // $0.50 per unit of weight
      return baseRate + weightRate;
    } catch (error) {
      console.error("Error calculating shipping:", error);
      return 0;
    }
  };
  
  const calculateTax = async (items: CartItem[], address: Address): Promise<number> => {
    try {
      // In a real implementation, this would calculate tax based on:
      // - Items in cart (taxable amounts)
      // - Destination address (tax rates by location)
      const subtotal = items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
      return subtotal * 0.08; // 8% tax rate
    } catch (error) {
      console.error("Error calculating tax:", error);
      return 0;
    }
  };
  
  const applyPromotion = async (code: string): Promise<Promotion> => {
    try {
      // Check if the promotion code exists and is valid
      const { data: promotionData, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .gte('end_date', new Date().toISOString())
        .single();
      
      if (error || !promotionData) {
        throw new Error("Invalid or expired promotion code");
      }
      
      // Check if user has already used this promotion
      const { data: usageData, error: usageError } = await supabase
        .from('promotion_usage')
        .select('id')
        .eq('promotion_id', promotionData.id)
        .eq('user_id', user?.id || '');
      
      if (usageData && usageData.length > 0) {
        throw new Error("Promotion code already used");
      }
      
      // Convert to Promotion type
      const promotion: Promotion = {
        id: promotionData.id,
        title: promotionData.title,
        description: promotionData.description,
        type: promotionData.type as "percentage" | "fixed" | "buy_x_get_y" | "free_shipping",
        value: promotionData.value,
        minAmount: promotionData.min_amount || undefined,
        maxDiscount: promotionData.max_discount || undefined,
        code: promotionData.code,
        startDate: promotionData.start_date,
        endDate: promotionData.end_date,
        usageLimit: promotionData.usage_limit || undefined,
        usageCount: promotionData.usage_count,
        applicableProducts: promotionData.applicable_products || undefined,
        applicableCategories: promotionData.applicable_categories || undefined,
        active: promotionData.active
      };
      
      // Record promotion usage
      if (user?.id) {
        await supabase
          .from('promotion_usage')
          .insert([{
            promotion_id: promotionData.id,
            user_id: user.id,
            used_at: new Date().toISOString()
          }]);
      }
      
      toast({
        title: "Promotion Applied",
        description: `Promotion code ${code} has been applied to your cart.`,
      });
      
      return promotion;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply promotion code",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const removePromotion = (): void => {
    // In a real implementation, this would remove the applied promotion
    toast({
      title: "Promotion Removed",
      description: "The promotion has been removed from your cart.",
    });
  };
  
  const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    if (!user?.id) return [];
    
    try {
      // Use the PaymentMethodService to fetch user's payment methods
      const methods = await PaymentMethodService.getUserPaymentMethods(user.id);
      return methods;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  };
  
  const checkout = async (
    paymentMethodId: string,
    shippingAddressId?: string,
    billingAddressId?: string,
    promotionCode?: string,
  ) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // Get shipping address if ID provided
      let shippingAddress: Address | undefined;
      if (shippingAddressId) {
        const userAddresses = await AddressService.getUserAddresses(user.id);
        shippingAddress = userAddresses.find(addr => addr.id === shippingAddressId);
      }
      
      // Get billing address if ID provided
      let billingAddress: Address | undefined;
      if (billingAddressId) {
        const userAddresses = await AddressService.getUserAddresses(user.id);
        billingAddress = userAddresses.find(addr => addr.id === billingAddressId);
      }
      
      // Calculate order totals
      const subtotal = getCartTotal();
      const shippingCost = await calculateShipping(cart, shippingAddress || {
        fullName: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
      const taxAmount = await calculateTax(cart, shippingAddress || {
        fullName: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
      
      // Apply promotion if code provided
      let discountAmount = 0;
      if (promotionCode) {
        try {
          const promotion = await applyPromotion(promotionCode);
          if (promotion.type === "percentage") {
            discountAmount = subtotal * (promotion.value / 100);
          } else if (promotion.type === "fixed") {
            discountAmount = promotion.value;
          }
        } catch (error) {
          console.warn("Failed to apply promotion:", error);
        }
      }
      
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
      
      // Create order using the marketplace service
      const orderData = {
        customerId: user.id,
        customerName: user.user_metadata?.full_name || "",
        customerEmail: user.email || "",
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        totalAmount,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        paymentMethod: paymentMethodId,
        shippingAddress: shippingAddress || {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        billingAddress: billingAddress || shippingAddress || {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        trackingNumber: "",
        estimatedDelivery: undefined,
        actualDelivery: undefined,
        notes: "",
        refundAmount: undefined,
        refundReason: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const orderItems = cart.map(item => ({
        productId: item.productId,
        productName: item.product?.name || "",
        productImage: item.product?.image || "",
        sellerId: item.product?.sellerId || "",
        sellerName: item.product?.sellerName || "",
        quantity: item.quantity,
        unitPrice: item.priceSnapshot,
        totalPrice: item.priceSnapshot * item.quantity,
        selectedVariants: {},
        status: "pending" as const,
      }));
      
      const newOrder = await MarketplaceService.createOrder(orderData, orderItems);
      
      if (newOrder) {
        // Convert to enhanced marketplace order type
        const enhancedOrder: Order = {
          id: newOrder.id,
          buyerId: newOrder.customerId,
          sellerId: cart[0]?.product?.sellerId || "",
          customerName: newOrder.customerName || "",
          customerEmail: newOrder.customerEmail || "",
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          orderType: "marketplace",
          items: newOrder.items.map(item => ({
            productId: item.productId,
            variantId: undefined,
            productName: item.productName,
            productImage: item.productImage,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedVariants: item.selectedVariants,
            customOptions: {},
            status: item.status as OrderItemStatus,
            downloadUrl: undefined,
            licenseKey: undefined,
            deliveryDate: undefined,
            serviceNotes: undefined,
          })),
          subtotal: newOrder.subtotal,
          shippingCost: newOrder.shippingCost,
          taxAmount: newOrder.taxAmount,
          discountAmount: newOrder.discountAmount,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
          paymentCurrency: "USDT",
          paymentStatus: newOrder.paymentStatus as PaymentStatus,
          escrowId: undefined,
          paymentTransactionId: undefined,
          shippingAddress: newOrder.shippingAddress,
          billingAddress: newOrder.billingAddress,
          shippingMethod: undefined,
          trackingNumber: newOrder.trackingNumber || "",
          trackingUrl: undefined,
          estimatedDelivery: newOrder.estimatedDelivery,
          actualDelivery: newOrder.actualDelivery,
          downloadUrls: [],
          downloadExpiresAt: undefined,
          downloadCount: 0,
          downloadLimit: undefined,
          status: newOrder.status as OrderStatus,
          fulfillmentStatus: "pending",
          requiresShipping: true,
          autoCompleteAfterDays: 7,
          chatThreadId: undefined,
          customerNotes: undefined,
          sellerNotes: undefined,
          adminNotes: undefined,
          confirmedAt: undefined,
          processingAt: undefined,
          shippedAt: undefined,
          deliveredAt: newOrder.actualDelivery,
          completedAt: undefined,
          cancelledAt: undefined,
          platformFee: newOrder.totalAmount * 0.1,
          feePercentage: 10,
          sellerRevenue: newOrder.totalAmount * 0.9,
          disputeId: undefined,
          disputeReason: undefined,
          returnRequested: false,
          returnRequestedAt: undefined,
          returnReason: undefined,
          returnStatus: undefined,
          refundAmount: newOrder.refundAmount,
          refundedAt: undefined,
          createdAt: newOrder.createdAt,
          updatedAt: newOrder.updatedAt
        };
        
        // Update local state
        setMyOrders(prev => [...prev, enhancedOrder]);
        setCart([]); // Clear cart after successful checkout
        
        toast({
          title: "Order Placed",
          description: `Your order #${enhancedOrder.orderNumber} has been placed successfully.`,
        });
        
        return enhancedOrder;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const expressCheckout = async (productId: string, variantId?: string) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      const product = getProduct(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      
      // Calculate order totals
      const price = product.discountPrice || product.price;
      const subtotal = price;
      const shippingCost = 0; // Digital products don't require shipping
      const taxAmount = 0;
      const discountAmount = 0;
      const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
      
      // Create order for digital product
      const orderData = {
        customerId: user.id,
        customerName: user.user_metadata?.full_name || "",
        customerEmail: user.email || "",
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        totalAmount,
        status: "pending" as const,
        paymentStatus: "pending" as const,
        paymentMethod: "digital_wallet",
        shippingAddress: {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        billingAddress: {
          fullName: "",
          addressLine1: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        trackingNumber: "",
        estimatedDelivery: undefined,
        actualDelivery: undefined,
        notes: "",
        refundAmount: undefined,
        refundReason: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const orderItems = [{
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
        selectedVariants: {},
        status: "pending" as const,
      }];
      
      const newOrder = await MarketplaceService.createOrder(orderData, orderItems);
      
      if (newOrder) {
        // Convert to enhanced marketplace order type
        const enhancedOrder: Order = {
          id: newOrder.id,
          buyerId: newOrder.customerId,
          sellerId: product.sellerId,
          customerName: newOrder.customerName || "",
          customerEmail: newOrder.customerEmail || "",
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          orderType: "marketplace",
          items: newOrder.items.map(item => ({
            productId: item.productId,
            variantId: undefined,
            productName: item.productName,
            productImage: item.productImage,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedVariants: item.selectedVariants,
            customOptions: {},
            status: item.status as OrderItemStatus,
            downloadUrl: undefined,
            licenseKey: undefined,
            deliveryDate: undefined,
            serviceNotes: undefined,
          })),
          subtotal: newOrder.subtotal,
          shippingCost: newOrder.shippingCost,
          taxAmount: newOrder.taxAmount,
          discountAmount: newOrder.discountAmount,
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
          paymentCurrency: "USDT",
          paymentStatus: newOrder.paymentStatus as PaymentStatus,
          escrowId: undefined,
          paymentTransactionId: undefined,
          shippingAddress: newOrder.shippingAddress,
          billingAddress: newOrder.billingAddress,
          shippingMethod: undefined,
          trackingNumber: newOrder.trackingNumber || "",
          trackingUrl: undefined,
          estimatedDelivery: newOrder.estimatedDelivery,
          actualDelivery: newOrder.actualDelivery,
          downloadUrls: [],
          downloadExpiresAt: undefined,
          downloadCount: 0,
          downloadLimit: undefined,
          status: newOrder.status as OrderStatus,
          fulfillmentStatus: "pending",
          requiresShipping: false, // Digital products don't require shipping
          autoCompleteAfterDays: 7,
          chatThreadId: undefined,
          customerNotes: undefined,
          sellerNotes: undefined,
          adminNotes: undefined,
          confirmedAt: undefined,
          processingAt: undefined,
          shippedAt: undefined,
          deliveredAt: newOrder.actualDelivery,
          completedAt: undefined,
          cancelledAt: undefined,
          platformFee: newOrder.totalAmount * 0.1,
          feePercentage: 10,
          sellerRevenue: newOrder.totalAmount * 0.9,
          disputeId: undefined,
          disputeReason: undefined,
          returnRequested: false,
          returnRequestedAt: undefined,
          returnReason: undefined,
          returnStatus: undefined,
          refundAmount: newOrder.refundAmount,
          refundedAt: undefined,
          createdAt: newOrder.createdAt,
          updatedAt: newOrder.updatedAt
        };
        
        // Update local state
        setMyOrders(prev => [...prev, enhancedOrder]);
        
        toast({
          title: "Order Placed",
          description: `Your order #${enhancedOrder.orderNumber} has been placed successfully.`,
        });
        
        return enhancedOrder;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process express checkout",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const messageUser = async (
    userId: string,
    message: string,
    productId?: string,
    orderId?: string
  ): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // In a real implementation, this would send a message to another user
      // For now, we'll just simulate the action
      console.log("Message sent:", { userId, message, productId, orderId });
      
      // Create a message record in the database
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          recipient_id: userId,
          content: message,
          product_id: productId,
          order_id: orderId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) {
        throw new Error("Failed to send message");
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const startOrderChat = async (orderId: string): Promise<string> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      // Check if a chat thread already exists for this order
      const { data: existingThread, error: fetchError } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('order_id', orderId)
        .single();
      
      if (existingThread) {
        return existingThread.id;
      }
      
      // Create a new chat thread for the order
      const { data: newThread, error: insertError } = await supabase
        .from('chat_threads')
        .insert([{
          order_id: orderId,
          participants: [user.id],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) {
        throw new Error("Failed to create chat thread");
      }
      
      toast({
        title: "Chat Started",
        description: "Your chat with the seller has been started.",
      });
      
      return newThread.id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const getCategories = (): ProductCategory[] => categories;
  
  const getRecommendedProducts = (productId?: string, context?: string): Product[] => {
    try {
      // In a real implementation, this would fetch recommended products
      // For now, we'll return featured products as recommendations
      return featuredProducts;
    } catch (error) {
      console.error("Error fetching recommended products:", error);
      return [];
    }
  };
  
  const getPersonalizedProducts = (): Product[] => {
    try {
      // In a real implementation, this would fetch personalized products based on user behavior
      // For now, we'll return sponsored products
      return sponsoredProducts;
    } catch (error) {
      console.error("Error fetching personalized products:", error);
      return [];
    }
  };
  
  const getTrendingProducts = (category?: string): Product[] => {
    try {
      // In a real implementation, this would fetch trending products
      // For now, we'll return products sorted by view count
      let filteredProducts = products;
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      return [...filteredProducts]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching trending products:", error);
      return [];
    }
  };
  
  const getRecentlyViewedProducts = (): Product[] => {
    try {
      // In a real implementation, this would fetch recently viewed products
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error("Error fetching recently viewed products:", error);
      return [];
    }
  };
  
  const trackProductView = (productId: string, context?: string): void => {
    try {
      // In a real implementation, this would track a product view
      // For now, we'll just update the product's view count locally
      setProducts(prev => 
        prev.map((product: Product) => 
          product.id === productId 
            ? { ...product, viewCount: (product.viewCount || 0) + 1 } 
            : product
        )
      );
    } catch (error) {
      console.error("Error tracking product view:", error);
    }
  };
  
  const trackProductClick = (productId: string, context?: string): void => {
    try {
      // In a real implementation, this would track a product click
      // For now, we'll just update the product's click count locally
      setProducts(prev => 
        prev.map((product: Product) => 
          product.id === productId 
            ? { ...product, clickCount: (product.clickCount || 0) + 1 } 
            : product
        )
      );
    } catch (error) {
      console.error("Error tracking product click:", error);
    }
  };
  
  const trackSearch = (query: string, filters?: ProductFilter, resultCount?: number): void => {
    try {
      // In a real implementation, this would track a search query
      console.log("Search tracked:", { query, filters, resultCount });
    } catch (error) {
      console.error("Error tracking search:", error);
    }
  };
  
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
      // Fetch actual product performance data from the database
      const { data: performanceData, error } = await supabase
        .from('product_performance')
        .select('*')
        .eq('product_id', productId)
        .single();
      
      if (error) {
        console.warn("Error fetching product performance:", error);
        // Fallback to default data
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
      
      return {
        views: performanceData.views || 0,
        clicks: performanceData.clicks || 0,
        addToCarts: performanceData.add_to_carts || 0,
        purchases: performanceData.purchases || 0,
        favorites: performanceData.favorites || 0,
        conversionRate: performanceData.conversion_rate || 0,
        revenue: performanceData.revenue || 0,
        rating: performanceData.rating || 0,
        reviewCount: performanceData.review_count || 0,
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

  const setPriceAlert = async (productId: string, targetPrice: number): Promise<boolean> => {
    try {
      // In a real implementation, this would set up a price alert
      const success = await WishlistService.setPriceAlert(productId, targetPrice);
      if (success) {
        toast({
          title: "Price Alert Set",
          description: `You'll be notified when the price drops to $${targetPrice}`,
        });
        return true;
      } else {
        throw new Error("Failed to set price alert");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set price alert",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const getPriceHistory = async (productId: string): Promise<any[]> => {
    try {
      // Fetch price history from the database
      const { data, error } = await supabase
        .from('product_price_history')
        .select('*')
        .eq('product_id', productId)
        .order('recorded_at', { ascending: true });
      
      if (error) {
        console.warn("Error fetching price history:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error fetching price history:", error);
      return [];
    }
  };

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

// Helper function to convert marketplace Product to enhanced-marketplace Product
const convertMarketplaceProductToEnhancedProduct = (product: any): Product => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.description?.substring(0, 100),
    productType: "physical",
    category: product.category,
    subcategory: product.subcategory,
    tags: product.tags || [],
    price: product.price,
    discountPrice: product.discountPrice,
    discountPercentage: product.discountPrice ? ((product.price - product.discountPrice) / product.price) * 100 : undefined,
    image: product.image,
    images: product.images || [product.image],
    videos: [],
    thumbnailImage: product.image,
    inStock: product.inStock,
    stockQuantity: product.stockQuantity,
    limitedQuantity: false,
    allowBackorder: false,
    status: "active",
    isDigital: false,
    isFeatured: product.isFeatured || false,
    isSponsored: product.isSponsored || false,
    seoTitle: product.name,
    seoDescription: product.description,
    seoKeywords: product.tags || [],
    rating: product.rating,
    averageRating: product.rating,
    reviewCount: product.reviewCount,
    totalReviews: product.reviewCount || 0,
    totalSales: 0,
    viewCount: 0,
    clickCount: 0,
    favoriteCount: 0,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    sellerAvatar: product.sellerAvatar,
    sellerRating: product.sellerRating,
    sellerVerified: product.sellerVerified,
    variants: product.variants || [],
    specifications: product.specifications || [],
    shippingInfo: product.shippingInfo,
    boostLevel: product.isSponsored ? 1 : 0,
    boostedUntil: product.boostedUntil,
    campaignIds: [],
    isNew: product.isNew,
    condition: product.condition || "new",
    brand: product.brand,
    model: product.model,
    weight: product.weight,
    dimensions: product.dimensions,
    returnPolicy: product.returnPolicy,
    warranty: product.warranty,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

export default EnhancedMarketplaceContext;

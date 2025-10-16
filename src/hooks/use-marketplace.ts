// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import {
  Product,
  CartItem,
  WishlistItem,
  Order,
  Address,
  PaymentMethod,
  Category,
  SellerProfile,
  Review,
  ProductFilter,
  SearchResult,
  Promotion,
} from "@/types/marketplace";
import { marketplaceService } from "@/services/marketplaceService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface UseMarketplaceState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  searchResults: SearchResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useMarketplace() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [state, setState] = useState<UseMarketplaceState>({
    products: [],
    categories: [],
    cart: [],
    wishlist: [],
    orders: [],
    addresses: [],
    paymentMethods: [],
    searchResults: null,
    isLoading: false,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Clear user-specific data when not authenticated
      setState((prev) => ({
        ...prev,
        cart: [],
        wishlist: [],
        orders: [],
        addresses: [],
        paymentMethods: [],
      }));
    }
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [categories] = await Promise.all([
        marketplaceService.getCategories(),
      ]);

      setState((prev) => ({
        ...prev,
        categories,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load marketplace data",
        isLoading: false,
      }));
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user-specific data from localStorage or API
      const savedCart = localStorage.getItem(`marketplace_cart_${user.id}`);
      const savedWishlist = localStorage.getItem(
        `marketplace_wishlist_${user.id}`,
      );
      const savedAddresses = localStorage.getItem(
        `marketplace_addresses_${user.id}`,
      );
      const savedPaymentMethods = localStorage.getItem(
        `marketplace_payment_methods_${user.id}`,
      );

      setState((prev) => ({
        ...prev,
        cart: savedCart ? JSON.parse(savedCart) : [],
        wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
        addresses: savedAddresses ? JSON.parse(savedAddresses) : [],
        paymentMethods: savedPaymentMethods
          ? JSON.parse(savedPaymentMethods)
          : [],
      }));

      // Load orders from API (this would be a real API call)
      const orders = await marketplaceService.getOrders(user.id);
      setState((prev) => ({ ...prev, orders }));
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  // Search and filter products
  const searchProducts = useCallback(
    async (query: string, filters: ProductFilter = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const searchResults = await marketplaceService.searchProducts(
          query,
          filters,
        );
        setState((prev) => ({
          ...prev,
          searchResults,
          products: searchResults.products,
          isLoading: false,
        }));
        return searchResults;
      } catch (error) {
        console.error("Search failed:", error);
        setState((prev) => ({
          ...prev,
          error: "Search failed",
          isLoading: false,
        }));
        throw error;
      }
    },
    [],
  );

  // Cart management
  const addToCart = useCallback(
    (
      productId: string,
      quantity: number = 1,
      variants?: Record<string, string>,
    ) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your cart",
          variant: "destructive",
        });
        return;
      }

      setState((prev) => {
        const product =
          prev.products.find((p) => p.id === productId) ||
          prev.searchResults?.products.find((p) => p.id === productId);

        if (!product) {
          toast({
            title: "Product not found",
            description: "The product you're trying to add could not be found",
            variant: "destructive",
          });
          return prev;
        }

        if (!product.inStock) {
          toast({
            title: "Out of stock",
            description: "This product is currently out of stock",
            variant: "destructive",
          });
          return prev;
        }

        const existingItemIndex = prev.cart.findIndex(
          (item) =>
            item.productId === productId &&
            JSON.stringify(item.selectedVariants) === JSON.stringify(variants),
        );

        let newCart: CartItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          newCart = [...prev.cart];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity,
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            productId,
            product,
            quantity,
            selectedVariants: variants,
            addedAt: new Date().toISOString(),
          };
          newCart = [...prev.cart, newItem];
        }

        // Save to localStorage
        if (user) {
          localStorage.setItem(
            `marketplace_cart_${user.id}`,
            JSON.stringify(newCart),
          );
        }

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });

        return { ...prev, cart: newCart };
      });
    },
    [isAuthenticated, user, toast],
  );

  const removeFromCart = useCallback(
    (productId: string, variants?: Record<string, string>) => {
      setState((prev) => {
        const newCart = prev.cart.filter(
          (item) =>
            !(
              item.productId === productId &&
              JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
            ),
        );

        if (user) {
          localStorage.setItem(
            `marketplace_cart_${user.id}`,
            JSON.stringify(newCart),
          );
        }

        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        });

        return { ...prev, cart: newCart };
      });
    },
    [user, toast],
  );

  const updateCartQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      variants?: Record<string, string>,
    ) => {
      if (quantity <= 0) {
        removeFromCart(productId, variants);
        return;
      }

      setState((prev) => {
        const newCart = prev.cart.map((item) =>
          item.productId === productId &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
            ? { ...item, quantity }
            : item,
        );

        if (user) {
          localStorage.setItem(
            `marketplace_cart_${user.id}`,
            JSON.stringify(newCart),
          );
        }

        return { ...prev, cart: newCart };
      });
    },
    [user, removeFromCart],
  );

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));

    if (user) {
      localStorage.removeItem(`marketplace_cart_${user.id}`);
    }

    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  }, [user, toast]);

  // Wishlist management
  const addToWishlist = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your wishlist",
          variant: "destructive",
        });
        return;
      }

      setState((prev) => {
        const product =
          prev.products.find((p) => p.id === productId) ||
          prev.searchResults?.products.find((p) => p.id === productId);

        if (!product) {
          toast({
            title: "Product not found",
            description: "The product you're trying to add could not be found",
            variant: "destructive",
          });
          return prev;
        }

        const isAlreadyInWishlist = prev.wishlist.some(
          (item) => item.productId === productId,
        );

        if (isAlreadyInWishlist) {
          toast({
            title: "Already in wishlist",
            description: "This product is already in your wishlist",
          });
          return prev;
        }

        const newWishlistItem: WishlistItem = {
          productId,
          product,
          addedAt: new Date().toISOString(),
          notifyOnSale: false,
        };

        const newWishlist = [...prev.wishlist, newWishlistItem];

        if (user) {
          localStorage.setItem(
            `marketplace_wishlist_${user.id}`,
            JSON.stringify(newWishlist),
          );
        }

        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist`,
        });

        return { ...prev, wishlist: newWishlist };
      });
    },
    [isAuthenticated, user, toast],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setState((prev) => {
        const newWishlist = prev.wishlist.filter(
          (item) => item.productId !== productId,
        );

        if (user) {
          localStorage.setItem(
            `marketplace_wishlist_${user.id}`,
            JSON.stringify(newWishlist),
          );
        }

        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist",
        });

        return { ...prev, wishlist: newWishlist };
      });
    },
    [user, toast],
  );

  // Order management
  const createOrder = useCallback(
    async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const order = await marketplaceService.createOrder(orderData);

        setState((prev) => ({
          ...prev,
          orders: [order, ...prev.orders],
          cart: [], // Clear cart after successful order
          isLoading: false,
        }));

        // Clear cart from localStorage
        if (user) {
          localStorage.removeItem(`marketplace_cart_${user.id}`);
        }

        toast({
          title: "Order placed successfully",
          description: `Your order #${order.id} has been placed`,
        });

        return order;
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        console.error("Failed to create order:", error);
        throw error;
      }
    },
    [isAuthenticated, user, toast],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      try {
        const updatedOrder = await marketplaceService.updateOrderStatus(
          orderId,
          status,
        );

        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId ? updatedOrder : order,
          ),
        }));

        toast({
          title: "Order updated",
          description: `Order status changed to ${status}`,
        });
      } catch (error) {
        console.error("Failed to update order status:", error);
        throw error;
      }
    },
    [toast],
  );

  // Address management
  const addAddress = useCallback(
    async (address: Omit<Address, "id">) => {
      try {
        const newAddress: Address = {
          ...address,
          id: `addr_${Date.now()}`,
        };

        setState((prev) => {
          const newAddresses = [...prev.addresses, newAddress];

          if (user) {
            localStorage.setItem(
              `marketplace_addresses_${user.id}`,
              JSON.stringify(newAddresses),
            );
          }

          return { ...prev, addresses: newAddresses };
        });

        toast({
          title: "Address added",
          description: "Your address has been saved successfully",
        });

        return newAddress;
      } catch (error) {
        console.error("Failed to add address:", error);
        throw error;
      }
    },
    [user, toast],
  );

  // Payment method management
  const addPaymentMethod = useCallback(
    async (paymentMethod: Omit<PaymentMethod, "id" | "createdAt">) => {
      try {
        const newPaymentMethod: PaymentMethod = {
          ...paymentMethod,
          id: `pm_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => {
          const newPaymentMethods = [...prev.paymentMethods, newPaymentMethod];

          if (user) {
            localStorage.setItem(
              `marketplace_payment_methods_${user.id}`,
              JSON.stringify(newPaymentMethods),
            );
          }

          return { ...prev, paymentMethods: newPaymentMethods };
        });

        toast({
          title: "Payment method added",
          description: "Your payment method has been saved successfully",
        });

        return newPaymentMethod;
      } catch (error) {
        console.error("Failed to add payment method:", error);
        throw error;
      }
    },
    [user, toast],
  );

  // Utility functions
  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }, [state.cart]);

  const getCartItemsCount = useCallback(() => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }, [state.cart]);

  const isInCart = useCallback(
    (productId: string, variants?: Record<string, string>) => {
      return state.cart.some(
        (item) =>
          item.productId === productId &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(variants),
      );
    },
    [state.cart],
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return state.wishlist.some((item) => item.productId === productId);
    },
    [state.wishlist],
  );

  const calculateShipping = useCallback(
    async (addressId: string) => {
      try {
        return await marketplaceService.calculateShipping(
          addressId,
          state.cart,
        );
      } catch (error) {
        console.error("Failed to calculate shipping:", error);
        throw error;
      }
    },
    [state.cart],
  );

  const applyPromotion = useCallback(
    async (code: string) => {
      try {
        // Mock promotion logic
        if (code === "WELCOME10") {
          return {
            discount: getCartTotal() * 0.1,
            description: "10% off your order",
          };
        }
        throw new Error("Invalid promo code");
      } catch (error) {
        console.error("Failed to apply promotion:", error);
        throw error;
      }
    },
    [getCartTotal],
  );

  const getRecommendedProducts = useCallback(async (productId?: string) => {
    try {
      return await marketplaceService.getRecommendedProducts(productId);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return [];
    }
  }, []);

  return {
    // State
    ...state,
    isAuthenticated,

    // Computed values
    cartTotal: getCartTotal(),
    cartItemsCount: getCartItemsCount(),

    // Actions
    searchProducts,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    createOrder,
    updateOrderStatus,
    addAddress,
    addPaymentMethod,
    calculateShipping,
    applyPromotion,
    getRecommendedProducts,

    // Utilities
    isInCart,
    isInWishlist,

    // Refresh data
    refresh: loadInitialData,
  };
}

export default useMarketplace;

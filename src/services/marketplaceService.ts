// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
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

export class MarketplaceService {
  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      return data.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image || "",
        productCount: category.product_count || 0,
        featured: category.featured || false,
        subcategories: [] // Would need to fetch subcategories separately
      }));
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error("Error fetching category:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        image: data.image || "",
        productCount: data.product_count || 0,
        featured: data.featured || false,
        subcategories: []
      };
    } catch (error) {
      console.error("Error in getCategoryBySlug:", error);
      return null;
    }
  }

  // Products
  static async getProducts(filters: ProductFilter = {}): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles!seller_id(full_name, username, avatar_url, is_verified)
        `);

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.subcategoryId) {
        query = query.eq('subcategory_id', filters.subcategoryId);
      }

      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.featuredOnly) {
        query = query.eq('is_featured', true);
      }

      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20);

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      return data.map(product => ({
        id: product.id,
        sellerId: product.seller_id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        discountPrice: product.discount_price,
        image: product.image_url || "",
        images: product.image_url ? [product.image_url] : [],
        category: product.category || "",
        subcategory: product.subcategory || undefined,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        inStock: product.in_stock || false,
        stockQuantity: product.stock_quantity || 0,
        isNew: product.is_new || false,
        isFeatured: product.is_featured || false,
        isSponsored: product.is_sponsored || false,
        tags: product.tags || [],
        sellerName: product.seller?.full_name || "Unknown Seller",
        sellerAvatar: product.seller?.avatar_url || "",
        sellerVerified: product.seller?.is_verified || false,
        condition: product.condition || "new",
        brand: product.brand || undefined,
        model: product.model || undefined,
        createdAt: new Date(product.created_at).toISOString(),
        updatedAt: new Date(product.updated_at).toISOString()
      }));
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!seller_id(full_name, username, avatar_url, is_verified)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        sellerId: data.seller_id,
        name: data.name,
        description: data.description || "",
        price: data.price,
        discountPrice: data.discount_price,
        image: data.image_url || "",
        images: data.image_url ? [data.image_url] : [],
        category: data.category || "",
        subcategory: data.subcategory || undefined,
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        inStock: data.in_stock || false,
        stockQuantity: data.stock_quantity || 0,
        isNew: data.is_new || false,
        isFeatured: data.is_featured || false,
        isSponsored: data.is_sponsored || false,
        tags: data.tags || [],
        sellerName: data.seller?.full_name || "Unknown Seller",
        sellerAvatar: data.seller?.avatar_url || "",
        sellerVerified: data.seller?.is_verified || false,
        condition: data.condition || "new",
        brand: data.brand || undefined,
        model: data.model || undefined,
        createdAt: new Date(data.created_at).toISOString(),
        updatedAt: new Date(data.updated_at).toISOString()
      };
    } catch (error) {
      console.error("Error in getProductById:", error);
      return null;
    }
  }

  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          seller_id: productData.sellerId,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          discount_price: productData.discountPrice,
          currency: productData.currency,
          category_id: productData.categoryId,
          subcategory_id: productData.subcategoryId,
          image_url: productData.imageUrl,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity,
          is_featured: productData.isFeatured,
          is_sponsored: productData.isSponsored,
          boost_until: productData.boostExpiresAt?.toISOString(),
          tags: productData.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        return null;
      }

      return {
        id: data.id,
        sellerId: data.seller_id,
        name: data.name,
        description: data.description || "",
        price: data.price,
        discountPrice: data.discount_price,
        currency: data.currency || "USD",
        image: data.image_url || "",
        images: data.image_url ? [data.image_url] : [],
        category: data.category || "",
        subcategory: data.subcategory || undefined,
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        inStock: data.in_stock || false,
        stockQuantity: data.stock_quantity || 0,
        isNew: data.is_new || false,
        isFeatured: data.is_featured || false,
        isSponsored: data.is_sponsored || false,
        tags: data.tags || [],
        sellerName: "", // Would need to fetch seller data
        sellerAvatar: "",
        sellerVerified: false,
        condition: data.condition || "new",
        brand: data.brand || undefined,
        model: data.model || undefined,
        createdAt: new Date(data.created_at).toISOString(),
        updatedAt: new Date(data.updated_at).toISOString()
      };
    } catch (error) {
      console.error("Error in createProduct:", error);
      return null;
    }
  }

  // Reviews
  static async getReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }

      return data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.profiles?.full_name || "Anonymous",
        userAvatar: review.profiles?.avatar_url || "",
        rating: review.rating,
        title: review.title || "",
        comment: review.comment || "",
        helpfulCount: review.helpful_count || 0,
        verifiedPurchase: review.verified_purchase || false,
        createdAt: new Date(review.created_at),
        updatedAt: new Date(review.updated_at)
      }));
    } catch (error) {
      console.error("Error in getReviews:", error);
      return [];
    }
  }

  static async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.productId,
          user_id: reviewData.userId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          helpful_count: reviewData.helpfulCount,
          verified_purchase: reviewData.verifiedPurchase,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating review:", error);
        return null;
      }

      // Update product rating and review count
      await this.updateProductRating(reviewData.productId);

      return {
        id: data.id,
        productId: data.product_id,
        userId: data.user_id,
        userName: "", // Would be fetched separately
        userAvatar: "", // Would be fetched separately
        rating: data.rating,
        title: data.title || "",
        comment: data.comment || "",
        helpfulCount: data.helpful_count || 0,
        verifiedPurchase: data.verified_purchase || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in createReview:", error);
      return null;
    }
  }

  static async updateProductRating(productId: string): Promise<void> {
    try {
      // Get all reviews for this product
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) {
        console.error("Error fetching reviews for rating update:", error);
        return;
      }

      if (reviews.length === 0) {
        // Reset rating if no reviews
        await supabase
          .from('products')
          .update({ 
            rating: 0,
            review_count: 0
          })
          .eq('id', productId);
        return;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Update product rating
      await supabase
        .from('products')
        .update({ 
          rating: parseFloat(averageRating.toFixed(2)),
          review_count: reviews.length
        })
        .eq('id', productId);
    } catch (error) {
      console.error("Error updating product rating:", error);
    }
  }

  // Orders
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<Order | null> {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.userId,
          seller_id: orderData.sellerId,
          total_amount: orderData.totalAmount,
          status: orderData.status,
          payment_method: orderData.paymentMethod,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          tracking_number: orderData.trackingNumber,
          estimated_delivery: orderData.estimatedDelivery,
          delivered_at: orderData.deliveredAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return null;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        return null;
      }

      return {
        id: order.id,
        userId: order.user_id,
        sellerId: order.seller_id,
        totalAmount: order.total_amount,
        status: order.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
        paymentMethod: order.payment_method || "",
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number || "",
        estimatedDelivery: order.estimated_delivery ? new Date(order.estimated_delivery) : undefined,
        deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
        items: [], // Would need to fetch items separately
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      return null;
    }
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user orders:", error);
        return [];
      }

      return data.map(order => ({
        id: order.id,
        userId: order.user_id,
        sellerId: order.seller_id,
        totalAmount: order.total_amount,
        status: order.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
        paymentMethod: order.payment_method || "",
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number || "",
        estimatedDelivery: order.estimated_delivery ? new Date(order.estimated_delivery) : undefined,
        deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
        items: [], // Would need to fetch items separately
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      }));
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      return [];
    }
  }

  // Search
  static async searchProducts(query: string, limit = 20): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error("Error searching products:", error);
        return [];
      }

      return data.map(product => ({
        id: product.id,
        type: "product",
        title: product.name,
        description: product.description || "",
        imageUrl: product.image_url || "",
        price: product.price,
        rating: product.rating || 0,
        createdAt: new Date(product.created_at)
      }));
    } catch (error) {
      console.error("Error in searchProducts:", error);
      return [];
    }
  }

  // Stats
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      // Get total products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (productsError) {
        console.error("Error fetching products count:", productsError);
      }

      // Get total orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      if (ordersError) {
        console.error("Error fetching orders count:", ordersError);
      }

      // Get total sellers count
      const { count: sellersCount, error: sellersError } = await supabase
        .from('products')
        .select('seller_id', { count: 'exact' })
        .neq('seller_id', null);

      if (sellersError) {
        console.error("Error fetching sellers count:", sellersError);
      }

      return {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalSellers: sellersCount || 0,
        totalRevenue: 0, // Would need to calculate from orders
        featuredProducts: 0, // Would need to count featured products
        newArrivals: 0 // Would need to count recent products
      };
    } catch (error) {
      console.error("Error in getMarketplaceStats:", error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalSellers: 0,
        totalRevenue: 0,
        featuredProducts: 0,
        newArrivals: 0
      };
    }
  }

  static async getSellerStats(sellerId: string): Promise<SellerStats> {
    try {
      // Get seller's products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('seller_id', sellerId);

      if (productsError) {
        console.error("Error fetching seller products count:", productsError);
      }

      // Get seller's orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('seller_id', sellerId);

      if (ordersError) {
        console.error("Error fetching seller orders count:", ordersError);
      }

      // Get seller's average rating
      const { data: products, error: ratingError } = await supabase
        .from('products')
        .select('rating')
        .eq('seller_id', sellerId);

      if (ratingError) {
        console.error("Error fetching seller ratings:", ratingError);
      }

      const averageRating = products && products.length > 0
        ? products.reduce((sum, product) => sum + (product.rating || 0), 0) / products.length
        : 0;

      // Get seller's marketplace revenue from unified wallet
      let totalRevenue = 0;
      try {
        const response = await fetch(`/api/wallet/sources?userId=${sellerId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          totalRevenue = data.data?.sources?.marketplace?.amount || 0;
        }
      } catch (err) {
        console.warn('Could not fetch marketplace revenue from unified wallet:', err);
      }

      return {
        totalProducts: productsCount || 0,
        totalSales: ordersCount || 0,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(2)),
        responseTime: 0,
        customerSatisfaction: 0
      };
    } catch (error) {
      console.error("Error in getSellerStats:", error);
      return {
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        responseTime: 0,
        customerSatisfaction: 0
      };
    }
  }

  // Get seller's marketplace balance from unified wallet
  static async getSellerBalance(sellerId: string): Promise<number> {
    try {
      const response = await fetch(`/api/wallet/balance?userId=${sellerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.balances?.marketplace || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching seller balance:", error);
      return 0;
    }
  }

  // Get sellers (using marketplace_profiles table)
  static async getSellers(): Promise<SellerProfile[]> {
    try {
      // First try to get from marketplace_profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('marketplace_profiles')
        .select(`
          *,
          users:profiles(user_id, username, full_name, avatar_url)
        `)
        .eq('is_active', true);

      if (profilesError) {
        console.warn("Error fetching marketplace profiles:", profilesError);
        // Fallback to using users table with store information
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(20);

        if (usersError) {
          console.error("Error fetching users:", usersError);
          return [];
        }

        return users.map(user => ({
          id: user.id,
          username: user.username || '',
          name: user.full_name || 'Unknown User',
          avatar: user.avatar_url || '',
          bio: user.bio || '',
          joinedDate: user.created_at || new Date().toISOString(),
          isVerified: user.is_verified || false,
          rating: 0,
          reviewCount: 0,
          productCount: 0,
          salesCount: 0
        }));
      }

      return profiles.map(profile => ({
        id: profile.id,
        username: profile.users?.username || 'user',
        name: profile.users?.full_name || profile.store_name || 'Unknown Seller',
        avatar: profile.users?.avatar_url || profile.store_logo || '',
        bio: profile.store_description || profile.users?.bio || '',
        joinedDate: profile.created_at,
        isVerified: profile.verification_status === 'verified',
        rating: parseFloat(profile.store_rating?.toString() || '0'),
        reviewCount: profile.total_orders || 0,
        productCount: 0, // Would need to fetch from products table
        salesCount: profile.total_sales || 0
      }));
    } catch (error) {
      console.error("Error in getSellers:", error);
      return [];
    }
  }

  // Get reviews for products
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          reviewer:users(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching product reviews:", error);
        return [];
      }

      return data.map(review => ({
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: review.reviewer?.full_name || 'Anonymous User',
        userAvatar: review.reviewer?.avatar_url || '',
        rating: review.rating,
        title: review.title || '',
        comment: review.content || '',
        helpfulCount: review.helpful_count || 0,
        verifiedPurchase: review.verified_purchase || false,
        createdAt: new Date(review.created_at),
        updatedAt: new Date(review.updated_at)
      }));
    } catch (error) {
      console.error("Error in getProductReviews:", error);
      return [];
    }
  }

  // Flash Sales
  static async getActiveFlashSales(): Promise<any[]> {
    try {
      // In a real implementation, we would fetch from the flash_sales table
      // For now, return an empty array as we're using mock data
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Error fetching flash sales:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching flash sales:", error);
      return [];
    }
  }

  static async createFlashSale(flashSaleData: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('flash_sales')
        .insert([{
          title: flashSaleData.title,
          description: flashSaleData.description,
          discount_percentage: flashSaleData.discountPercentage,
          start_date: flashSaleData.startDate,
          end_date: flashSaleData.endDate,
          is_active: flashSaleData.isActive,
          featured_products: flashSaleData.featuredProducts,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating flash sale:", error);
        return null;
      }

      return {
        id: data.id,
        ...data
      };
    } catch (error) {
      console.error("Error creating flash sale:", error);
      return null;
    }
  }

  static async updateFlashSale(id: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('flash_sales')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating flash sale:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating flash sale:", error);
      return null;
    }
  }

  static async deleteFlashSale(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting flash sale:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting flash sale:", error);
      return false;
    }
  }

  // Sponsored Products
  static async getSponsoredProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sponsored_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Error fetching sponsored products:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching sponsored products:", error);
      return [];
    }
  }

  static async createSponsoredProduct(sponsoredProductData: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('sponsored_products')
        .insert([{
          product_id: sponsoredProductData.productId,
          title: sponsoredProductData.title,
          start_date: sponsoredProductData.startDate,
          end_date: sponsoredProductData.endDate,
          is_active: sponsoredProductData.isActive,
          boost_level: sponsoredProductData.boostLevel,
          position: sponsoredProductData.position,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating sponsored product:", error);
        return null;
      }

      return {
        id: data.id,
        ...data
      };
    } catch (error) {
      console.error("Error creating sponsored product:", error);
      return null;
    }
  }

  static async updateSponsoredProduct(id: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('sponsored_products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating sponsored product:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating sponsored product:", error);
      return null;
    }
  }

  static async deleteSponsoredProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sponsored_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting sponsored product:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting sponsored product:", error);
      return false;
    }
  }

  // Campaigns
  static async getCampaigns(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      return data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        type: campaign.type,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        bannerImage: campaign.banner_image,
        bannerText: campaign.banner_text,
        backgroundColor: campaign.background_color,
        textColor: campaign.text_color,
        discountType: campaign.discount_type,
        discountValue: campaign.discount_value,
        usageCount: campaign.usage_count,
        viewCount: campaign.view_count,
        clickCount: campaign.click_count,
        conversionCount: campaign.conversion_count,
        totalRevenue: campaign.total_revenue,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at
      }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  }

  static async createCampaign(campaignData: any): Promise<any | null> {
    try {
      // In a real implementation, we would insert into the campaigns table
      // For now, just return the data with an ID
      return {
        id: `campaign-${Date.now()}`,
        ...campaignData
      };
    } catch (error) {
      console.error("Error creating campaign:", error);
      return null;
    }
  }

  static async updateCampaign(id: string, updates: any): Promise<any | null> {
    try {
      // In a real implementation, we would update the campaigns table
      // For now, just return the updates with the ID
      return {
        id,
        ...updates
      };
    } catch (error) {
      console.error("Error updating campaign:", error);
      return null;
    }
  }

  static async deleteCampaign(id: string): Promise<boolean> {
    try {
      // In a real implementation, we would delete from the campaigns table
      // For now, just return true
      return true;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return false;
    }
  }

  // Marketplace Ads
  static async getActiveAds(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Error fetching ads:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching ads:", error);
      return [];
    }
  }

  static async createAd(adData: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_ads')
        .insert([{
          title: adData.title,
          description: adData.description,
          image_url: adData.imageUrl,
          target_url: adData.targetUrl,
          start_date: adData.startDate,
          end_date: adData.endDate,
          is_active: adData.isActive,
          position: adData.position,
          priority: adData.priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating ad:", error);
        return null;
      }

      return {
        id: data.id,
        ...data
      };
    } catch (error) {
      console.error("Error creating ad:", error);
      return null;
    }
  }

  static async updateAd(id: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_ads')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating ad:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating ad:", error);
      return null;
    }
  }

  static async deleteAd(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('marketplace_ads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting ad:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting ad:", error);
      return false;
    }
  }

  // Get unique tags from all products
  static async getProductTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('tags')
        .not('tags', 'is', null);

      if (error) {
        console.error("Error fetching product tags:", error);
        return [];
      }

      // Extract unique tags from all products
      const allTags = data.flatMap(product => product.tags || []);
      const uniqueTags = [...new Set(allTags)];
      
      return uniqueTags.slice(0, 20); // Return up to 20 tags
    } catch (error) {
      console.error("Error in getProductTags:", error);
      return [];
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error("Error deleting product:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      return false;
    }
  }
}
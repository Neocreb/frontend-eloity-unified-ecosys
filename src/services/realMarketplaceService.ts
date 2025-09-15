import { supabase } from "@/integrations/supabase/client";
import { Product, SellerProfile, Review, Order, CartItem } from "@/types/marketplace";

class RealMarketplaceService {
  // Products
  async getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    sponsored?: boolean;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('active', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.inStock) {
      query = query.gt('stock_quantity', 0);
    }
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters?.sponsored) {
      query = query.eq('is_sponsored', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;

    return data?.map(this.mapDatabaseToProduct) || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? this.mapDatabaseToProduct(data) : null;
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discountPrice,
      image_url: product.image,
      images: product.images,
      category: product.category,
      subcategory: product.subcategory,
      stock_quantity: product.stockQuantity || 0,
      condition: product.condition || 'new',
      brand: product.brand,
      model: product.model,
      is_featured: product.isFeatured || false,
      is_sponsored: product.isSponsored || false,
      tags: product.tags,
      seller_id: product.sellerId,
      specifications: product.specifications,
      variants: product.variants,
      shipping_info: product.shippingInfo,
      return_policy: product.returnPolicy,
      warranty: product.warranty,
      weight: product.weight,
      dimensions: product.dimensions,
      active: true
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToProduct(data);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.price) updateData.price = updates.price;
    if (updates.discountPrice) updateData.discount_price = updates.discountPrice;
    if (updates.image) updateData.image_url = updates.image;
    if (updates.images) updateData.images = updates.images;
    if (updates.category) updateData.category = updates.category;
    if (updates.subcategory) updateData.subcategory = updates.subcategory;
    if (updates.stockQuantity !== undefined) updateData.stock_quantity = updates.stockQuantity;
    if (updates.condition) updateData.condition = updates.condition;
    if (updates.brand) updateData.brand = updates.brand;
    if (updates.model) updateData.model = updates.model;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;
    if (updates.isSponsored !== undefined) updateData.is_sponsored = updates.isSponsored;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.specifications) updateData.specifications = updates.specifications;
    if (updates.variants) updateData.variants = updates.variants;
    if (updates.shippingInfo) updateData.shipping_info = updates.shippingInfo;
    if (updates.returnPolicy) updateData.return_policy = updates.returnPolicy;
    if (updates.warranty) updateData.warranty = updates.warranty;
    if (updates.weight) updateData.weight = updates.weight;
    if (updates.dimensions) updateData.dimensions = updates.dimensions;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToProduct(data);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id);

    return !error;
  }

  // Orders
  async createOrder(cartItems: CartItem[], shippingAddress: any, paymentMethod: any): Promise<Order> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const totalAmount = cartItems.reduce((sum, item) => 
      sum + ((item.product.discountPrice || item.product.price) * item.quantity), 0
    );

    const orderData = {
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price,
        product_name: item.product.name
      }))
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();

    if (error) throw error;

    // Update product stock
    for (const item of cartItems) {
      await supabase
        .from('products')
        .update({ 
          stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`)
        })
        .eq('id', item.productId);
    }

    return this.mapDatabaseToOrder(data);
  }

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapDatabaseToOrder) || [];
  }

  // Reviews
  async addReview(productId: string, rating: number, content: string): Promise<Review> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .single();

    const reviewData = {
      product_id: productId,
      user_id: userId,
      rating,
      content,
      user_name: user?.full_name || 'Anonymous',
      user_avatar: user?.avatar_url
    };

    const { data, error } = await supabase
      .from('product_reviews')
      .insert(reviewData)
      .select('*')
      .single();

    if (error) throw error;

    // Update product rating
    await this.updateProductRating(productId);

    return this.mapDatabaseToReview(data);
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapDatabaseToReview) || [];
  }

  private async updateProductRating(productId: string): Promise<void> {
    const { data: reviews } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      const reviewCount = reviews.length;

      await supabase
        .from('products')
        .update({ 
          rating: avgRating,
          review_count: reviewCount
        })
        .eq('id', productId);
    }
  }

  // Helper mapping functions
  private mapDatabaseToProduct(data: any): Product {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      discountPrice: data.discount_price,
      image: data.image_url,
      images: data.images || [data.image_url],
      category: data.category,
      subcategory: data.subcategory,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      inStock: (data.stock_quantity || 0) > 0,
      stockQuantity: data.stock_quantity || 0,
      condition: data.condition || 'new',
      brand: data.brand,
      model: data.model,
      isNew: data.is_new || false,
      isFeatured: data.is_featured || false,
      isSponsored: data.is_sponsored || false,
      boostedUntil: data.boosted_until,
      tags: data.tags || [],
      sellerId: data.seller_id,
      sellerName: data.seller?.full_name || data.seller?.username || 'Unknown',
      sellerAvatar: data.seller?.avatar_url,
      sellerRating: data.seller?.rating || 0,
      sellerVerified: data.seller?.verified || false,
      specifications: data.specifications || [],
      variants: data.variants || [],
      shippingInfo: data.shipping_info,
      returnPolicy: data.return_policy,
      warranty: data.warranty,
      weight: data.weight,
      dimensions: data.dimensions,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDatabaseToOrder(data: any): Order {
    return {
      id: data.id,
      userId: data.user_id,
      items: data.items || [],
      totalAmount: data.total_amount,
      status: data.status,
      shippingAddress: data.shipping_address,
      paymentMethod: data.payment_method,
      trackingNumber: data.tracking_number,
      estimatedDelivery: data.estimated_delivery,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDatabaseToReview(data: any): Review {
    return {
      id: data.id,
      productId: data.product_id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      rating: data.rating,
      content: data.content,
      createdAt: data.created_at
    };
  }
}

export const realMarketplaceService = new RealMarketplaceService();
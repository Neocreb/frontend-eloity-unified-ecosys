import { supabase } from "@/integrations/supabase/client";
import type { Wishlist, WishlistItem } from "@/types/enhanced-marketplace";

export class WishlistService {
  static async getUserWishlists(userId: string): Promise<Wishlist[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user wishlists:", error);
        return [];
      }

      return data.map((wishlist: any) => ({
        id: wishlist.id,
        userId: wishlist.user_id,
        name: wishlist.name,
        description: wishlist.description || "",
        isDefault: wishlist.is_default || false,
        isPublic: wishlist.is_public || false,
        createdAt: new Date(wishlist.created_at).toISOString(),
        updatedAt: new Date(wishlist.updated_at).toISOString()
      }));
    } catch (error) {
      console.error("Error in getUserWishlists:", error);
      return [];
    }
  }

  static async getWishlistItems(wishlistId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('wishlist_id', wishlistId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error("Error fetching wishlist items:", error);
        return [];
      }

      return data.map((item: any) => ({
        id: item.id,
        wishlistId: item.wishlist_id,
        productId: item.product_id,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description || "",
          price: item.product.price,
          discountPrice: item.product.discount_price,
          image: item.product.image_url || "",
          category: item.product.category || "",
          rating: item.product.rating || 0,
          reviewCount: item.product.review_count || 0,
          inStock: item.product.in_stock || false,
          sellerName: item.product.seller_name || "Unknown Seller",
          sellerVerified: item.product.seller_verified || false,
          createdAt: new Date(item.product.created_at).toISOString(),
          updatedAt: new Date(item.product.updated_at).toISOString()
        } : undefined,
        addedAt: new Date(item.added_at).toISOString(),
        priority: item.priority || 1,
        notes: item.notes || "",
        targetPrice: item.target_price || undefined,
        notifyOnSale: item.notify_on_sale || false,
        notifyOnRestock: item.notify_on_restock || false,
        priceWhenAdded: item.price_when_added || undefined,
        lowestPriceSeen: item.lowest_price_seen || undefined
      }));
    } catch (error) {
      console.error("Error in getWishlistItems:", error);
      return [];
    }
  }

  static async createWishlist(userId: string, name: string, description?: string): Promise<Wishlist | null> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: userId,
          name,
          description,
          is_default: false,
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating wishlist:", error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description || "",
        isDefault: data.is_default || false,
        isPublic: data.is_public || false,
        createdAt: new Date(data.created_at).toISOString(),
        updatedAt: new Date(data.updated_at).toISOString()
      };
    } catch (error) {
      console.error("Error in createWishlist:", error);
      return null;
    }
  }

  static async addToWishlist(wishlistId: string, productId: string): Promise<WishlistItem | null> {
    try {
      // First, get the product price
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError);
        return null;
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert([{
          wishlist_id: wishlistId,
          product_id: productId,
          added_at: new Date().toISOString(),
          price_when_added: productData.price,
          priority: 1,
          notify_on_sale: false,
          notify_on_restock: false
        }])
        .select()
        .single();

      if (error) {
        console.error("Error adding to wishlist:", error);
        return null;
      }

      return {
        id: data.id,
        wishlistId: data.wishlist_id,
        productId: data.product_id,
        addedAt: new Date(data.added_at).toISOString(),
        priority: data.priority || 1,
        notes: data.notes || "",
        targetPrice: data.target_price || undefined,
        notifyOnSale: data.notify_on_sale || false,
        notifyOnRestock: data.notify_on_restock || false,
        priceWhenAdded: data.price_when_added || undefined,
        lowestPriceSeen: data.lowest_price_seen || undefined
      };
    } catch (error) {
      console.error("Error in addToWishlist:", error);
      return null;
    }
  }

  static async removeFromWishlist(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error removing from wishlist:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in removeFromWishlist:", error);
      return false;
    }
  }

  static async setPriceAlert(productId: string, targetPrice: number): Promise<boolean> {
    try {
      // In a real implementation, this would set up a price alert for the user
      console.log(`Price alert set for product ${productId} at $${targetPrice}`);
      return true;
    } catch (error) {
      console.error("Error setting price alert:", error);
      return false;
    }
  }
}

export const wishlistService = new WishlistService();
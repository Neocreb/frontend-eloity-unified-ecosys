import { MarketplaceService } from "./marketplaceService";
import type { Product } from "@/types/marketplace";
import { supabase } from "@/integrations/supabase/client";

export class ProductService {
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await MarketplaceService.getProductById(id);
    } catch (error) {
      console.error("Error fetching product by ID:", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  static async getProducts(filters: any = {}): Promise<Product[]> {
    try {
      // Use MarketplaceService to fetch products with filters
      return await MarketplaceService.getProducts(filters);
    } catch (error) {
      console.error("Error fetching products:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  static async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      // First, get the product to determine its category
      const product = await this.getProductById(productId);
      if (!product) return [];

      // Then, fetch related products from the same category (excluding the current product)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', productId)
        .limit(10);

      if (error) {
        console.error("Error fetching related products:", error instanceof Error ? error.message : String(error));
        return [];
      }

      return data.map((product: any) => ({
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
      console.error("Error fetching related products:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  static async createProduct(productData: any): Promise<Product | null> {
    try {
      return await MarketplaceService.createProduct(productData);
    } catch (error) {
      console.error("Error creating product:", error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      return await MarketplaceService.deleteProduct(productId);
    } catch (error) {
      console.error("Error deleting product:", error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}

export const productService = new ProductService();

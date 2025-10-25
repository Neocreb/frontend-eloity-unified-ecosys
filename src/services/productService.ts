import { MarketplaceService } from "./marketplaceService";
import type { Product } from "@/types/marketplace";

export class ProductService {
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await MarketplaceService.getProductById(id);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return null;
    }
  }

  static async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      // For now, we'll return an empty array as a placeholder
      // In a real implementation, this would fetch related products based on category, tags, etc.
      return [];
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }
}

export const productService = new ProductService();
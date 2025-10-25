import { MarketplaceService } from "./marketplaceService";
import type { Category } from "@/types/marketplace";

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    try {
      return await MarketplaceService.getCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await MarketplaceService.getCategoryBySlug(slug);
    } catch (error) {
      console.error("Error fetching category by slug:", error);
      return null;
    }
  }
}

export const categoryService = new CategoryService();
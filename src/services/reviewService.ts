import { MarketplaceService } from "./marketplaceService";
import type { Review } from "@/types/marketplace";

export class ReviewService {
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      return await MarketplaceService.getReviews(productId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error fetching product reviews:", errorMessage);
      return [];
    }
  }
}

export const reviewService = new ReviewService();

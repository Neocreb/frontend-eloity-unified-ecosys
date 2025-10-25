import { MarketplaceService } from "./marketplaceService";
import type { Review } from "@/types/marketplace";

export class ReviewService {
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      return await MarketplaceService.getReviews(productId);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      return [];
    }
  }
}

export const reviewService = new ReviewService();
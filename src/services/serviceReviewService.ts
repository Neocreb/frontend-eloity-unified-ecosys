// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface ServiceReview {
  id: string;
  serviceId: string;
  userId: string;
  rating: number; // 1-5
  reviewText?: string;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface ServiceRatingSummary {
  serviceId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

export interface ReviewSubmission {
  serviceId: string;
  rating: number;
  reviewText?: string;
}

class ServiceReviewService {
  /**
   * Get all reviews for a service
   */
  async getServiceReviews(serviceId: string, limit = 10, offset = 0): Promise<ServiceReview[]> {
    try {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("*")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data?.map(this.mapFromDatabase) || [];
    } catch (error) {
      console.error("Error fetching service reviews:", error);
      return [];
    }
  }

  /**
   * Get user's review for a service
   */
  async getUserReview(serviceId: string, userId: string): Promise<ServiceReview | null> {
    try {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("*")
        .eq("service_id", serviceId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      console.error("Error fetching user review:", error);
      return null;
    }
  }

  /**
   * Get rating summary for a service
   */
  async getServiceRatingSummary(serviceId: string): Promise<ServiceRatingSummary | null> {
    try {
      const { data, error } = await supabase
        .from("service_rating_summary")
        .select("*")
        .eq("service_id", serviceId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (!data) {
        return {
          serviceId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      }

      return {
        serviceId: data.service_id,
        averageRating: data.average_rating,
        totalReviews: data.total_reviews,
        ratingDistribution: {
          fiveStars: data.five_stars || 0,
          fourStars: data.four_stars || 0,
          threeStars: data.three_stars || 0,
          twoStars: data.two_stars || 0,
          oneStar: data.one_star || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching rating summary:", error);
      return null;
    }
  }

  /**
   * Submit or update a review
   */
  async submitReview(
    userId: string,
    submission: ReviewSubmission
  ): Promise<ServiceReview | null> {
    try {
      // Check if user already has a review for this service
      const existingReview = await this.getUserReview(submission.serviceId, userId);

      if (existingReview) {
        // Update existing review
        const { data, error } = await supabase
          .from("service_reviews")
          .update({
            rating: submission.rating,
            review_text: submission.reviewText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id)
          .select()
          .single();

        if (error) throw error;
        return data ? this.mapFromDatabase(data) : null;
      } else {
        // Create new review
        const { data: userData } = await supabase.auth.getUser();
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();

        const { data, error } = await supabase
          .from("service_reviews")
          .insert({
            service_id: submission.serviceId,
            user_id: userId,
            rating: submission.rating,
            review_text: submission.reviewText,
            is_helpful: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data ? this.mapFromDatabase(data) : null;
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      return null;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("service_reviews")
        .update({
          is_helpful: supabase.rpc("increment_helpful", { review_id: reviewId }),
        })
        .eq("id", reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      return false;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("service_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      return false;
    }
  }

  /**
   * Get reviews for multiple services
   */
  async getMultipleServiceRatings(serviceIds: string[]): Promise<Record<string, ServiceRatingSummary>> {
    try {
      const { data, error } = await supabase
        .from("service_rating_summary")
        .select("*")
        .in("service_id", serviceIds);

      if (error) throw error;

      const result: Record<string, ServiceRatingSummary> = {};
      serviceIds.forEach(id => {
        const summary = data?.find(d => d.service_id === id);
        result[id] = summary ? {
          serviceId: summary.service_id,
          averageRating: summary.average_rating || 0,
          totalReviews: summary.total_reviews || 0,
          ratingDistribution: {
            fiveStars: summary.five_stars || 0,
            fourStars: summary.four_stars || 0,
            threeStars: summary.three_stars || 0,
            twoStars: summary.two_stars || 0,
            oneStar: summary.one_star || 0,
          },
        } : {
          serviceId: id,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      });

      return result;
    } catch (error) {
      console.error("Error fetching multiple ratings:", error);
      const result: Record<string, ServiceRatingSummary> = {};
      serviceIds.forEach(id => {
        result[id] = {
          serviceId: id,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            fiveStars: 0,
            fourStars: 0,
            threeStars: 0,
            twoStars: 0,
            oneStar: 0,
          },
        };
      });
      return result;
    }
  }

  /**
   * Map database response to interface
   */
  private mapFromDatabase(data: any): ServiceReview {
    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      rating: data.rating,
      reviewText: data.review_text,
      isHelpful: data.is_helpful || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userName: data.user_name,
    };
  }
}

export const serviceReviewService = new ServiceReviewService();

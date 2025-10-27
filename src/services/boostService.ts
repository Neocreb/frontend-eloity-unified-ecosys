import { apiCall } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export interface Boost {
  id: string;
  type: string;
  referenceId: string;
  boostType: string;
  duration: number;
  cost: string;
  currency: string;
  status: string;
  startDate?: string;
  endDate?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  createdAt: string;
}

export interface BoostRequest {
  type: "freelance_job" | "product" | "post" | "profile";
  referenceId: string;
  boostType: "featured" | "top_listing" | "premium_placement" | "highlight";
  duration: number; // in hours
  paymentMethod: "USDT" | "eloity_points";
}

export interface BoostPerformance {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgConversionRate: number;
  totalRevenue: number;
  topPerformingBoosts: any[];
}

class BoostServiceClass {
  async requestBoost(
    data: BoostRequest,
  ): Promise<{ success: boolean; boostId: string }> {
    const response = await apiCall("/api/boost/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  async getUserBoosts(status?: string): Promise<Boost[]> {
    try {
      let query = supabase
        .from('boosts')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching user boosts:", error);
        return [];
      }

      return data.map(boost => ({
        id: boost.id,
        type: boost.type,
        referenceId: boost.reference_id,
        boostType: boost.boost_type,
        duration: boost.duration,
        cost: boost.cost,
        currency: boost.currency,
        status: boost.status,
        startDate: boost.start_date,
        endDate: boost.end_date,
        impressions: boost.impressions,
        clicks: boost.clicks,
        conversions: boost.conversions,
        createdAt: boost.created_at,
      }));
    } catch (error) {
      console.error("Error in getUserBoosts:", error);
      return [];
    }
  }

  async getBoostPerformance(userId: string): Promise<BoostPerformance> {
    try {
      // Get all boosts for the user
      const { data: boosts, error } = await supabase
        .from('boosts')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching boost performance:", error);
        // Return default performance data
        return {
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          avgCTR: 0,
          avgConversionRate: 0,
          totalRevenue: 0,
          topPerformingBoosts: [],
        };
      }

      // Calculate performance metrics
      const totalImpressions = boosts.reduce((sum, boost) => sum + (boost.impressions || 0), 0);
      const totalClicks = boosts.reduce((sum, boost) => sum + (boost.clicks || 0), 0);
      const totalConversions = boosts.reduce((sum, boost) => sum + (boost.conversions || 0), 0);
      
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      
      // Calculate total revenue (simplified)
      const totalRevenue = boosts.reduce((sum, boost) => sum + parseFloat(boost.cost || "0"), 0);

      // Get top performing boosts
      const topPerformingBoosts = [...boosts]
        .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
        .slice(0, 5);

      return {
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCTR,
        avgConversionRate,
        totalRevenue,
        topPerformingBoosts: topPerformingBoosts.map(boost => ({
          id: boost.id,
          type: boost.type,
          boostType: boost.boost_type,
          impressions: boost.impressions,
          clicks: boost.clicks,
          conversions: boost.conversions,
          ctr: boost.impressions ? (boost.clicks || 0) / boost.impressions * 100 : 0,
          conversionRate: boost.clicks ? (boost.conversions || 0) / boost.clicks * 100 : 0,
        })),
      };
    } catch (error) {
      console.error("Error in getBoostPerformance:", error);
      // Return default performance data
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgCTR: 0,
        avgConversionRate: 0,
        totalRevenue: 0,
        topPerformingBoosts: [],
      };
    }
  }

  static getBoostTypeName(type: string): string {
    const names = {
      featured: "Featured Listing",
      top_listing: "Top Placement",
      premium_placement: "Premium Placement",
      highlight: "Highlight",
    };
    return names[type as keyof typeof names] || type;
  }

  static getBoostTypeDescription(type: string): string {
    const descriptions = {
      featured: "Appear in the featured section with enhanced visibility",
      top_listing: "Stay at the top of relevant listings",
      premium_placement: "Get premium placement across the platform",
      highlight: "Add visual highlighting to your content",
    };
    return (
      descriptions[type as keyof typeof descriptions] ||
      "Boost your content visibility"
    );
  }

  static calculateBoostCost(boostType: string, duration: number): number {
    const baseCosts = {
      featured: 100,
      top_listing: 200,
      premium_placement: 300,
      highlight: 50,
    };

    const baseCost = baseCosts[boostType as keyof typeof baseCosts] || 100;
    return baseCost * (duration / 24); // Cost per day
  }

  static getBoostStatusColor(status: string): string {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  static getTargetTypeName(type: string): string {
    const names = {
      freelance_job: "Freelance Job",
      product: "Product",
      post: "Post",
      profile: "Profile",
    };
    return names[type as keyof typeof names] || type;
  }
}

// Export both class and instance
export const BoostService = BoostServiceClass;
export const boostService = new BoostServiceClass();
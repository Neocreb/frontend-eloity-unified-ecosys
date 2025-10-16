import { apiCall } from "@/lib/api";

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
    const queryParams = status ? `?status=${status}` : "";
    const response = await apiCall(`/api/boosts${queryParams}`);
    return response.boosts;
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

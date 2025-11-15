import { supabase } from "@/lib/supabase/client";

export interface SponsoredContent {
  id: string;
  creatorId: string;
  brandId: string;
  title: string;
  description: string;
  contentType: "video" | "image" | "post" | "story" | "live_stream" | "reel";
  category: string;
  targetAudience: {
    ageRange: [number, number];
    interests: string[];
    location: string[];
    gender?: "male" | "female" | "any";
  };
  campaign: {
    id: string;
    name: string;
    budget: number;
    duration: number; // days
    objectives: string[];
    guidelines: string[];
  };
  deliverables: {
    contentCount: number;
    postSchedule: string[];
    requirements: string[];
    hashtags: string[];
    mentions: string[];
  };
  compensation: {
    type: "fixed" | "performance" | "hybrid";
    amount: number;
    performanceMetrics?: {
      viewsRequired?: number;
      engagementRate?: number;
      conversions?: number;
    };
    bonuses?: Array<{
      condition: string;
      amount: number;
    }>;
  };
  timeline: {
    applicationDeadline: string;
    contentDeadline: string;
    reviewPeriod: number; // days
  };
  status:
    | "draft"
    | "active"
    | "in_progress"
    | "under_review"
    | "completed"
    | "cancelled";
  metrics: {
    applications: number;
    selectedCreators: number;
    totalViews: number;
    totalEngagement: number;
    conversionRate: number;
    roi: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatorApplication {
  id: string;
  contentId: string;
  creatorId: string;
  brandId: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  proposal: {
    pitch: string;
    deliverables: string[];
    timeline: string;
    additionalValue: string;
  };
  creatorProfile: {
    followerCount: number;
    engagementRate: number;
    avgViews: number;
    demographics: any;
    previousBrands: string[];
    portfolio: string[];
  };
  negotiation: {
    proposedRate: number;
    counterOffer?: number;
    terms: string[];
    revisions: number;
  };
  contract: {
    signed: boolean;
    signedAt?: string;
    terms: string;
    deliverables: string[];
    payment: {
      schedule: "upfront" | "milestone" | "completion";
      amount: number;
      milestones?: Array<{
        description: string;
        percentage: number;
        dueDate: string;
      }>;
    };
  };
  performance: {
    contentSubmitted: boolean;
    submittedAt?: string;
    approvalStatus: "pending" | "approved" | "needs_revision";
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      clickThroughRate: number;
      conversions: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  industry: string;
  website: string;
  logo: string;
  verified: boolean;
  rating: number;
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
  budget: {
    total: number;
    available: number;
    spent: number;
  };
  preferences: {
    contentTypes: string[];
    industries: string[];
    followerRange: [number, number];
    engagementRate: number;
    demographics: any;
  };
  paymentInfo: {
    verified: boolean;
    methods: string[];
    currency: string;
  };
  createdAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  verified: boolean;
  tier: "nano" | "micro" | "macro" | "mega";
  stats: {
    followers: number;
    avgViews: number;
    engagementRate: number;
    completionRate: number;
  };
  content: {
    types: string[];
    categories: string[];
    languages: string[];
    uploadFrequency: string;
  };
  audience: {
    demographics: {
      ageGroups: Record<string, number>;
      gender: Record<string, number>;
      locations: Record<string, number>;
    };
    interests: string[];
    peak_hours: string[];
  };
  collaboration: {
    openToSponsorship: boolean;
    rates: {
      post: number;
      story: number;
      video: number;
      live: number;
    };
    previousBrands: string[];
    testimonials: Array<{
      brandId: string;
      rating: number;
      review: string;
      date: string;
    }>;
  };
  portfolio: {
    featuredContent: string[];
    caseStudies: Array<{
      title: string;
      description: string;
      metrics: any;
      assets: string[];
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  description: string;
  objectives: string[];
  budget: number;
  duration: number;
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  targeting: {
    creatorTiers: string[];
    followerRange: [number, number];
    engagementRate: number;
    contentTypes: string[];
    categories: string[];
    locations: string[];
    demographics: any;
  };
  content: SponsoredContent[];
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      name: string;
      date: string;
      completed: boolean;
    }>;
  };
  performance: {
    totalReach: number;
    totalEngagement: number;
    clickThroughRate: number;
    conversionRate: number;
    roi: number;
    costPerAcquisition: number;
  };
  createdAt: string;
  updatedAt: string;
}

class SponsoredContentService {
  // Sponsored Content Management
  async createSponsoredContent(
    data: Omit<SponsoredContent, "id" | "createdAt" | "updatedAt" | "metrics">,
  ): Promise<SponsoredContent | null> {
    try {
      const { data: result, error } = await (supabase as any)
        .from("sponsored_content")
        .insert({
          ...data,
          metrics: {
            applications: 0,
            selectedCreators: 0,
            totalViews: 0,
            totalEngagement: 0,
            conversionRate: 0,
            roi: 0,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return this.mapDbToSponsoredContent(result);
    } catch (error) {
      console.error("Error creating sponsored content:", error);
      return null;
    }
  }

  async getSponsoredContent(filters?: {
    category?: string;
    contentType?: string;
    budgetRange?: [number, number];
    status?: string;
  }): Promise<SponsoredContent[]> {
    try {
      let query = (supabase as any).from("sponsored_content").select("*");

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.contentType) {
        query = query.eq("content_type", filters.contentType);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data.map(this.mapDbToSponsoredContent);
    } catch (error) {
      console.error("Error getting sponsored content:", error);
      return [];
    }
  }

  async searchSponsoredContent(
    query: string,
    filters?: any,
  ): Promise<SponsoredContent[]> {
    try {
      // Sanitize query to prevent complex parsing issues
      const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9_\-.\s]/g, '');
      const { data, error } = await (supabase as any)
        .from("sponsored_content")
        .select("*")
        .or(
          `title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,category.ilike.%${sanitizedQuery}%`,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(this.mapDbToSponsoredContent);
    } catch (error) {
      console.error("Error searching sponsored content:", error);
      return [];
    }
  }

  // Creator Applications
  async applyToSponsoredContent(
    contentId: string,
    creatorId: string,
    application: CreatorApplication["proposal"],
  ): Promise<CreatorApplication | null> {
    try {
      // Get creator profile data
      const creatorProfile = await this.getCreatorProfile(creatorId);
      if (!creatorProfile) throw new Error("Creator profile not found");

      const { data, error } = await (supabase as any)
        .from("creator_applications")
        .insert({
          content_id: contentId,
          creator_id: creatorId,
          brand_id: await this.getBrandIdFromContent(contentId),
          status: "pending",
          proposal: application,
          creator_profile: {
            followerCount: creatorProfile.stats.followers,
            engagementRate: creatorProfile.stats.engagementRate,
            avgViews: creatorProfile.stats.avgViews,
            demographics: creatorProfile.audience.demographics,
            previousBrands: creatorProfile.collaboration.previousBrands,
            portfolio: creatorProfile.portfolio.featuredContent,
          },
          negotiation: {
            proposedRate: 0,
            terms: [],
            revisions: 0,
          },
          contract: {
            signed: false,
            terms: "",
            deliverables: [],
            payment: {
              schedule: "completion",
              amount: 0,
            },
          },
          performance: {
            contentSubmitted: false,
            approvalStatus: "pending",
            metrics: {
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
              clickThroughRate: 0,
              conversions: 0,
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;

      // Update application count
      await this.updateContentMetrics(contentId, { applications: 1 });

      return this.mapDbToApplication(data);
    } catch (error) {
      console.error("Error applying to sponsored content:", error);
      return null;
    }
  }

  async getCreatorApplications(
    creatorId: string,
    status?: string,
  ): Promise<CreatorApplication[]> {
    try {
      let query = (supabase as any)
        .from("creator_applications")
        .select("*")
        .eq("creator_id", creatorId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data.map(this.mapDbToApplication);
    } catch (error) {
      console.error("Error getting creator applications:", error);
      return [];
    }
  }

  async getBrandApplications(
    brandId: string,
    status?: string,
  ): Promise<CreatorApplication[]> {
    try {
      let query = (supabase as any)
        .from("creator_applications")
        .select("*")
        .eq("brand_id", brandId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data.map(this.mapDbToApplication);
    } catch (error) {
      console.error("Error getting brand applications:", error);
      return [];
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: CreatorApplication["status"],
    negotiation?: Partial<CreatorApplication["negotiation"]>,
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (negotiation) {
        updateData.negotiation = negotiation;
      }

      const { error } = await (supabase as any)
        .from("creator_applications")
        .update(updateData)
        .eq("id", applicationId);

      return !error;
    } catch (error) {
      console.error("Error updating application status:", error);
      return false;
    }
  }

  // Creator Profile Management
  async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("creator_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.mapDbToCreatorProfile(data) : null;
    } catch (error) {
      console.error("Error getting creator profile:", error);
      return null;
    }
  }

  async updateCreatorProfile(
    userId: string,
    updates: Partial<CreatorProfile>,
  ): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from("creator_profiles")
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error("Error updating creator profile:", error);
      return false;
    }
  }

  async searchCreators(filters: {
    tier?: string;
    followerRange?: [number, number];
    engagementRate?: number;
    categories?: string[];
    location?: string;
  }): Promise<CreatorProfile[]> {
    try {
      let query = (supabase as any).from("creator_profiles").select("*");

      if (filters.tier) {
        query = query.eq("tier", filters.tier);
      }

      const { data, error } = await query.order("stats->followers", {
        ascending: false,
      });

      if (error) throw error;
      return data.map(this.mapDbToCreatorProfile);
    } catch (error) {
      console.error("Error searching creators:", error);
      return [];
    }
  }

  // Brand Management
  async getBrand(brandId: string): Promise<Brand | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();

      if (error) throw error;
      return this.mapDbToBrand(data);
    } catch (error) {
      console.error("Error getting brand:", error);
      return null;
    }
  }

  async createBrand(
    brandData: Omit<Brand, "id" | "createdAt">,
  ): Promise<Brand | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("brands")
        .insert({
          ...brandData,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return this.mapDbToBrand(data);
    } catch (error) {
      console.error("Error creating brand:", error);
      return null;
    }
  }

  // Campaign Management
  async createCampaign(
    campaignData: Omit<Campaign, "id" | "createdAt" | "updatedAt">,
  ): Promise<Campaign | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .insert({
          ...campaignData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return this.mapDbToCampaign(data);
    } catch (error) {
      console.error("Error creating campaign:", error);
      return null;
    }
  }

  async getCampaigns(brandId: string): Promise<Campaign[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(this.mapDbToCampaign);
    } catch (error) {
      console.error("Error getting campaigns:", error);
      return [];
    }
  }

  // Analytics
  async getCreatorEarnings(
    creatorId: string,
    period?: string,
  ): Promise<{
    total: number;
    thisMonth: number;
    avgPerProject: number;
    completed: number;
    pending: number;
  }> {
    try {
      const applications = await this.getCreatorApplications(
        creatorId,
        "approved",
      );

      const completed = applications.filter(
        (app) => app.performance.contentSubmitted,
      ).length;
      const pending = applications.filter(
        (app) => app.status === "approved" && !app.performance.contentSubmitted,
      ).length;

      const totalEarnings = applications
        .filter((app) => app.performance.contentSubmitted)
        .reduce((sum, app) => sum + app.contract.payment.amount, 0);

      const thisMonth = applications
        .filter((app) => {
          const submittedDate = app.performance.submittedAt;
          return (
            submittedDate &&
            new Date(submittedDate).getMonth() === new Date().getMonth()
          );
        })
        .reduce((sum, app) => sum + app.contract.payment.amount, 0);

      return {
        total: totalEarnings,
        thisMonth,
        avgPerProject: completed > 0 ? totalEarnings / completed : 0,
        completed,
        pending,
      };
    } catch (error) {
      console.error("Error getting creator earnings:", error);
      return {
        total: 0,
        thisMonth: 0,
        avgPerProject: 0,
        completed: 0,
        pending: 0,
      };
    }
  }

  async getBrandAnalytics(brandId: string): Promise<{
    totalSpent: number;
    activeCampaigns: number;
    totalReach: number;
    avgEngagement: number;
    roi: number;
  }> {
    try {
      const campaigns = await this.getCampaigns(brandId);

      const totalSpent = campaigns.reduce(
        (sum, campaign) => sum + campaign.budget,
        0,
      );
      const activeCampaigns = campaigns.filter(
        (c) => c.status === "active",
      ).length;
      const totalReach = campaigns.reduce(
        (sum, campaign) => sum + campaign.performance.totalReach,
        0,
      );
      const avgEngagement =
        campaigns.length > 0
          ? campaigns.reduce(
              (sum, campaign) => sum + campaign.performance.totalEngagement,
              0,
            ) / campaigns.length
          : 0;
      const roi =
        campaigns.reduce((sum, campaign) => sum + campaign.performance.roi, 0) /
        campaigns.length;

      return {
        totalSpent,
        activeCampaigns,
        totalReach,
        avgEngagement,
        roi: roi || 0,
      };
    } catch (error) {
      console.error("Error getting brand analytics:", error);
      return {
        totalSpent: 0,
        activeCampaigns: 0,
        totalReach: 0,
        avgEngagement: 0,
        roi: 0,
      };
    }
  }

  // Helper Methods
  private async getBrandIdFromContent(contentId: string): Promise<string> {
    try {
      const { data, error } = await (supabase as any)
        .from("sponsored_content")
        .select("brand_id")
        .eq("id", contentId)
        .single();

      if (error) throw error;
      return data.brand_id;
    } catch (error) {
      console.error("Error getting brand ID:", error);
      return "";
    }
  }

  private async updateContentMetrics(
    contentId: string,
    updates: Partial<SponsoredContent["metrics"]>,
  ): Promise<void> {
    try {
      await (supabase as any)
        .from("sponsored_content")
        .update({
          metrics: updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId);
    } catch (error) {
      console.error("Error updating content metrics:", error);
    }
  }

  // Mapping functions
  private mapDbToSponsoredContent(data: any): SponsoredContent {
    return {
      id: data.id,
      creatorId: data.creator_id,
      brandId: data.brand_id,
      title: data.title,
      description: data.description,
      contentType: data.content_type,
      category: data.category,
      targetAudience: data.target_audience,
      campaign: data.campaign,
      deliverables: data.deliverables,
      compensation: data.compensation,
      timeline: data.timeline,
      status: data.status,
      metrics: data.metrics,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDbToApplication(data: any): CreatorApplication {
    return {
      id: data.id,
      contentId: data.content_id,
      creatorId: data.creator_id,
      brandId: data.brand_id,
      status: data.status,
      proposal: data.proposal,
      creatorProfile: data.creator_profile,
      negotiation: data.negotiation,
      contract: data.contract,
      performance: data.performance,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDbToCreatorProfile(data: any): CreatorProfile {
    return {
      id: data.id,
      userId: data.user_id,
      verified: data.verified,
      tier: data.tier,
      stats: data.stats,
      content: data.content,
      audience: data.audience,
      collaboration: data.collaboration,
      portfolio: data.portfolio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapDbToBrand(data: any): Brand {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      industry: data.industry,
      website: data.website,
      logo: data.logo,
      verified: data.verified,
      rating: data.rating,
      campaigns: data.campaigns,
      budget: data.budget,
      preferences: data.preferences,
      paymentInfo: data.payment_info,
      createdAt: data.created_at,
    };
  }

  private mapDbToCampaign(data: any): Campaign {
    return {
      id: data.id,
      brandId: data.brand_id,
      name: data.name,
      description: data.description,
      objectives: data.objectives,
      budget: data.budget,
      duration: data.duration,
      status: data.status,
      targeting: data.targeting,
      content: data.content || [],
      timeline: data.timeline,
      performance: data.performance,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const sponsoredContentService = new SponsoredContentService();

import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/enhanced-marketplace";

export class CampaignService {
  static async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching active campaigns:", error);
        return [];
      }

      return data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        type: campaign.type,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        bannerImage: campaign.banner_image,
        bannerText: campaign.banner_text,
        backgroundColor: campaign.background_color,
        textColor: campaign.text_color,
        discountType: campaign.discount_type,
        discountValue: campaign.discount_value,
        maxDiscount: campaign.max_discount,
        minOrderAmount: campaign.min_order_amount,
        maxParticipants: campaign.max_participants,
        maxProductsPerSeller: campaign.max_products_per_seller,
        usageLimit: campaign.usage_limit,
        usageCount: campaign.usage_count,
        status: campaign.status,
        isPublic: campaign.is_public,
        requiresApproval: campaign.requires_approval,
        createdBy: campaign.created_by,
        viewCount: campaign.view_count,
        clickCount: campaign.click_count,
        conversionCount: campaign.conversion_count,
        totalRevenue: campaign.total_revenue,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
      }));
    } catch (error) {
      console.error("Error in getActiveCampaigns:", error);
      return [];
    }
  }

  static async getCampaignById(campaignId: string): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        console.error("Error fetching campaign:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        startDate: data.start_date,
        endDate: data.end_date,
        bannerImage: data.banner_image,
        bannerText: data.banner_text,
        backgroundColor: data.background_color,
        textColor: data.text_color,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        maxDiscount: data.max_discount,
        minOrderAmount: data.min_order_amount,
        maxParticipants: data.max_participants,
        maxProductsPerSeller: data.max_products_per_seller,
        usageLimit: data.usage_limit,
        usageCount: data.usage_count,
        status: data.status,
        isPublic: data.is_public,
        requiresApproval: data.requires_approval,
        createdBy: data.created_by,
        viewCount: data.view_count,
        clickCount: data.click_count,
        conversionCount: data.conversion_count,
        totalRevenue: data.total_revenue,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error in getCampaignById:", error);
      return null;
    }
  }

  static async getUserCampaigns(userId: string): Promise<Campaign[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user campaigns:", error);
        return [];
      }

      return data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        type: campaign.type,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        bannerImage: campaign.banner_image,
        bannerText: campaign.banner_text,
        backgroundColor: campaign.background_color,
        textColor: campaign.text_color,
        discountType: campaign.discount_type,
        discountValue: campaign.discount_value,
        maxDiscount: campaign.max_discount,
        minOrderAmount: campaign.min_order_amount,
        maxParticipants: campaign.max_participants,
        maxProductsPerSeller: campaign.max_products_per_seller,
        usageLimit: campaign.usage_limit,
        usageCount: campaign.usage_count,
        status: campaign.status,
        isPublic: campaign.is_public,
        requiresApproval: campaign.requires_approval,
        createdBy: campaign.created_by,
        viewCount: campaign.view_count,
        clickCount: campaign.click_count,
        conversionCount: campaign.conversion_count,
        totalRevenue: campaign.total_revenue,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
      }));
    } catch (error) {
      console.error("Error in getUserCampaigns:", error);
      return [];
    }
  }

  static async createCampaign(campaignData: any): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          name: campaignData.name,
          slug: campaignData.slug,
          description: campaignData.description,
          type: campaignData.type,
          start_date: campaignData.startDate,
          end_date: campaignData.endDate,
          banner_image: campaignData.bannerImage,
          banner_text: campaignData.bannerText,
          background_color: campaignData.backgroundColor,
          text_color: campaignData.textColor,
          discount_type: campaignData.discountType,
          discount_value: campaignData.discountValue,
          max_discount: campaignData.maxDiscount,
          min_order_amount: campaignData.minOrderAmount,
          max_participants: campaignData.maxParticipants,
          max_products_per_seller: campaignData.maxProductsPerSeller,
          usage_limit: campaignData.usageLimit,
          status: campaignData.status,
          is_public: campaignData.isPublic,
          requires_approval: campaignData.requiresApproval,
          created_by: campaignData.createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating campaign:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        startDate: data.start_date,
        endDate: data.end_date,
        bannerImage: data.banner_image,
        bannerText: data.banner_text,
        backgroundColor: data.background_color,
        textColor: data.text_color,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        maxDiscount: data.max_discount,
        minOrderAmount: data.min_order_amount,
        maxParticipants: data.max_participants,
        maxProductsPerSeller: data.max_products_per_seller,
        usageLimit: data.usage_limit,
        usageCount: data.usage_count,
        status: data.status,
        isPublic: data.is_public,
        requiresApproval: data.requires_approval,
        createdBy: data.created_by,
        viewCount: data.view_count,
        clickCount: data.click_count,
        conversionCount: data.conversion_count,
        totalRevenue: data.total_revenue,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error in createCampaign:", error);
      return null;
    }
  }

  static async updateCampaign(campaignId: string, updates: any): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        console.error("Error updating campaign:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type,
        startDate: data.start_date,
        endDate: data.end_date,
        bannerImage: data.banner_image,
        bannerText: data.banner_text,
        backgroundColor: data.background_color,
        textColor: data.text_color,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        maxDiscount: data.max_discount,
        minOrderAmount: data.min_order_amount,
        maxParticipants: data.max_participants,
        maxProductsPerSeller: data.max_products_per_seller,
        usageLimit: data.usage_limit,
        usageCount: data.usage_count,
        status: data.status,
        isPublic: data.is_public,
        requiresApproval: data.requires_approval,
        createdBy: data.created_by,
        viewCount: data.view_count,
        clickCount: data.click_count,
        conversionCount: data.conversion_count,
        totalRevenue: data.total_revenue,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error in updateCampaign:", error);
      return null;
    }
  }

  static async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error("Error deleting campaign:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteCampaign:", error);
      return false;
    }
  }
}

export const campaignService = new CampaignService();
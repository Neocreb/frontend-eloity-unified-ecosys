// Chat ad service using Supabase database
import { supabase } from "@/integrations/supabase/client";

export interface ChatAdRecord {
  id: string;
  sponsor?: string;
  title: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  is_active?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatAdDatabaseRecord {
  id: string;
  sponsor?: string;
  title: string;
  body?: string;
  image_url?: string;
  cta_label?: string;
  cta_url?: string;
  is_active?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = "chat_ads_config";

const DEFAULT_ADS: ChatAdRecord[] = [
  {
    id: "ad_1",
    sponsor: "Acme Corp",
    title: "Upgrade your trading tools",
    body: "Get advanced market analytics and signals. Try 14 days free.",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=60",
    ctaLabel: "Learn More",
    ctaUrl: "https://example.com",
  },
  {
    id: "ad_2",
    sponsor: "CloudCache",
    title: "Fast, secure file storage for teams",
    body: "Store chat attachments reliably and securely.",
    image: "https://images.unsplash.com/photo-1508830524289-0adcbe822b40?w=800&q=60",
    ctaLabel: "Get Started",
    ctaUrl: "https://example.com",
  },
];

export const chatAdsService = {
  // Fetch ads from database
  async getAdsForThread(threadId?: string): Promise<ChatAdRecord[]> {
    try {
      // Fetch from database
      const { data, error } = await supabase
        .from('chat_ads')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching chat ads from database:', error);
        return DEFAULT_ADS;
      }

      // Transform database records to match expected format
      return data.map((ad: ChatAdDatabaseRecord) => ({
        id: ad.id,
        sponsor: ad.sponsor,
        title: ad.title,
        body: ad.body,
        image: ad.image_url,
        ctaLabel: ad.cta_label,
        ctaUrl: ad.cta_url,
        is_active: ad.is_active,
        priority: ad.priority,
        created_at: ad.created_at,
        updated_at: ad.updated_at
      }));
    } catch (e) {
      console.error('Error fetching chat ads:', e);
      return DEFAULT_ADS;
    }
  },

  // Default ads for fallback
  getDefaultAds(): ChatAdRecord[] {
    return DEFAULT_ADS;
  },

  // Track ad click (simplified)
  async trackAdClick(adId: string): Promise<void> {
    try {
      // In a real implementation, you might want to track clicks in a separate table
      console.log(`Ad clicked: ${adId}`);
    } catch (e) {
      console.error('Error tracking ad click:', e);
    }
  },

  // Save ads config to localStorage as backup
  saveAdsConfig(ads: ChatAdRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ads }));
    } catch (e) {
      console.error('Error saving ads config to localStorage:', e);
    }
  },

  // Create a new ad
  async createAd(ad: Omit<ChatAdRecord, 'id'>): Promise<ChatAdRecord | null> {
    try {
      const adData = {
        sponsor: ad.sponsor,
        title: ad.title,
        body: ad.body,
        image_url: ad.image,
        cta_label: ad.ctaLabel,
        cta_url: ad.ctaUrl,
        is_active: ad.is_active !== undefined ? ad.is_active : true,
        priority: ad.priority || 0
      };

      const { data, error } = await supabase
        .from('chat_ads')
        .insert(adData)
        .select()
        .single();

      if (error) {
        console.error('Error creating ad in database:', error);
        return null;
      }

      // Transform to match expected format
      const newAd: ChatAdRecord = {
        id: data.id,
        sponsor: data.sponsor,
        title: data.title,
        body: data.body,
        image: data.image_url,
        ctaLabel: data.cta_label,
        ctaUrl: data.cta_url,
        is_active: data.is_active,
        priority: data.priority,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return newAd;
    } catch (e) {
      console.error('Error creating ad:', e);
      return null;
    }
  },

  // Update an existing ad
  async updateAd(ad: ChatAdRecord): Promise<boolean> {
    try {
      const adData = {
        sponsor: ad.sponsor,
        title: ad.title,
        body: ad.body,
        image_url: ad.image,
        cta_label: ad.ctaLabel,
        cta_url: ad.ctaUrl,
        is_active: ad.is_active,
        priority: ad.priority,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_ads')
        .update(adData)
        .eq('id', ad.id);

      if (error) {
        console.error('Error updating ad in database:', error);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error updating ad:', e);
      return false;
    }
  },

  // Delete an ad
  async deleteAd(adId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_ads')
        .delete()
        .eq('id', adId);

      if (error) {
        console.error('Error deleting ad from database:', error);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error deleting ad:', e);
      return false;
    }
  }
};
// Simple local mock ad service for chat monetization

export interface ChatAdRecord {
  id: string;
  sponsor?: string;
  title: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaUrl?: string;
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
  // Return configured ads; in future this can fetch from API
  getAdsForThread(threadId?: string): ChatAdRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_ADS;
      const cfg = JSON.parse(raw);
      if (cfg && Array.isArray(cfg.ads) && cfg.ads.length > 0) return cfg.ads;
      return DEFAULT_ADS;
    } catch (e) {
      return DEFAULT_ADS;
    }
  },

  // Simple tracking stub
  trackAdClick(adId: string) {
    try {
      const key = `chat_ad_click_${adId}`;
      const current = parseInt(localStorage.getItem(key) || "0", 10);
      localStorage.setItem(key, String(current + 1));
    } catch (e) {}
  },

  // Admin helpers
  saveAdsConfig(ads: ChatAdRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ads }));
    } catch (e) {}
  },
};

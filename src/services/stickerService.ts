// @ts-nocheck
import { 
  StickerData, 
  StickerPackData, 
  UserStickerLibrary, 
  StickerReport, 
  StickerCreationRequest,
  StickerUsageData,
  StickerSearchFilters,
  StickerCategory,
  EMOJI_STICKER_PACKS
} from "@/types/sticker";

class StickerService {
  private baseUrl = "/api/stickers";
  
  // User Library Management
  async getUserLibrary(userId: string): Promise<UserStickerLibrary> {
    try {
      const response = await fetch(`${this.baseUrl}/library/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user library");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user library:", error);
      // Return default library with emoji packs
      return {
        recentStickers: [],
        favoriteStickers: [],
        downloadedPacks: EMOJI_STICKER_PACKS,
        customPacks: [],
      };
    }
  }

  async addStickerToFavorites(userId: string, stickerId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/library/${userId}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickerId }),
      });
    } catch (error) {
      console.error("Error adding sticker to favorites:", error);
      throw error;
    }
  }

  async removeStickerFromFavorites(userId: string, stickerId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/library/${userId}/favorites/${stickerId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error removing sticker from favorites:", error);
      throw error;
    }
  }

  async addRecentSticker(userId: string, stickerId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/library/${userId}/recent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stickerId }),
      });
    } catch (error) {
      console.error("Error adding recent sticker:", error);
      // Fail silently for recent stickers
    }
  }

  // Sticker Pack Management
  async getAvailablePacks(filters?: StickerSearchFilters): Promise<StickerPackData[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.category) queryParams.append("category", filters.category);
      if (filters?.isPremium !== undefined) queryParams.append("premium", filters.isPremium.toString());
      if (filters?.isAnimated !== undefined) queryParams.append("animated", filters.isAnimated.toString());
      if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters?.tags?.length) queryParams.append("tags", filters.tags.join(","));

      const response = await fetch(`${this.baseUrl}/packs?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch sticker packs");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching sticker packs:", error);
      // Return default emoji packs
      return EMOJI_STICKER_PACKS;
    }
  }

  async getPackById(packId: string): Promise<StickerPackData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/packs/${packId}`);
      if (!response.ok) throw new Error("Failed to fetch sticker pack");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching sticker pack:", error);
      return EMOJI_STICKER_PACKS.find(pack => pack.id === packId) || null;
    }
  }

  async downloadPack(userId: string, packId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/packs/${packId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Error downloading sticker pack:", error);
      throw error;
    }
  }

  async ratePack(userId: string, packId: string, rating: number, review?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/packs/${packId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, rating, review }),
      });
    } catch (error) {
      console.error("Error rating sticker pack:", error);
      throw error;
    }
  }

  // Sticker Search
  async searchStickers(query: string, filters?: StickerSearchFilters): Promise<StickerData[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", query);
      if (filters?.category) queryParams.append("category", filters.category);
      if (filters?.isPremium !== undefined) queryParams.append("premium", filters.isPremium.toString());
      if (filters?.isAnimated !== undefined) queryParams.append("animated", filters.isAnimated.toString());
      if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy);

      const response = await fetch(`${this.baseUrl}/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to search stickers");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching stickers:", error);
      return [];
    }
  }

  async getTrendingStickers(limit = 20): Promise<StickerData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch trending stickers");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching trending stickers:", error);
      return [];
    }
  }

  // Usage Analytics
  async recordStickerUsage(userId: string, usageData: StickerUsageData): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/usage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...usageData }),
      });
    } catch (error) {
      console.error("Error recording sticker usage:", error);
      // Fail silently for analytics
    }
  }

  async getStickerAnalytics(stickerId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${stickerId}/analytics`);
      if (!response.ok) throw new Error("Failed to fetch sticker analytics");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching sticker analytics:", error);
      return null;
    }
  }

  // Content Moderation
  async reportSticker(report: Omit<StickerReport, "id" | "status" | "createdAt">): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error("Error reporting sticker:", error);
      throw error;
    }
  }

  async reportPack(packId: string, reportedBy: string, reason: string, description?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/packs/${packId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedBy, reason, description }),
      });
    } catch (error) {
      console.error("Error reporting sticker pack:", error);
      throw error;
    }
  }

  // User-Generated Content
  async createStickerPack(userId: string, request: Omit<StickerCreationRequest, "id" | "userId" | "status" | "createdAt">): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...request }),
      });
      
      if (!response.ok) throw new Error("Failed to create sticker pack");
      
      const data = await response.json();
      return data.requestId;
    } catch (error) {
      console.error("Error creating sticker pack:", error);
      throw error;
    }
  }

  async getCreationRequests(userId: string): Promise<StickerCreationRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/create/requests/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch creation requests");
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching creation requests:", error);
      return [];
    }
  }

  async uploadStickerFile(file: File, requestId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("requestId", requestId);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload sticker file");
      
      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("Error uploading sticker file:", error);
      throw error;
    }
  }

  // Sticker Sharing
  async forwardSticker(stickerId: string, fromUserId: string, toConversations: string[]): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/${stickerId}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId, toConversations }),
      });
    } catch (error) {
      console.error("Error forwarding sticker:", error);
      throw error;
    }
  }

  async shareStickerPack(packId: string, userId: string, shareMethod: "link" | "social"): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/packs/${packId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, shareMethod }),
      });

      if (!response.ok) throw new Error("Failed to share sticker pack");
      
      const data = await response.json();
      return data.shareUrl;
    } catch (error) {
      console.error("Error sharing sticker pack:", error);
      throw error;
    }
  }

  // Utility methods
  async optimizeStickerForChat(sticker: StickerData): Promise<StickerData> {
    // Optimize sticker for chat use (resize, compress, etc.)
    const optimizedSticker = { ...sticker };
    
    // Ensure reasonable size for chat
    if (optimizedSticker.width > 128 || optimizedSticker.height > 128) {
      const aspectRatio = optimizedSticker.width / optimizedSticker.height;
      if (optimizedSticker.width > optimizedSticker.height) {
        optimizedSticker.width = 128;
        optimizedSticker.height = Math.round(128 / aspectRatio);
      } else {
        optimizedSticker.height = 128;
        optimizedSticker.width = Math.round(128 * aspectRatio);
      }
    }

    return optimizedSticker;
  }

  // Cache management
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(method: string, params: any[]): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  private async getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const stickerService = new StickerService();
export default stickerService;

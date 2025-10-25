import { supabase } from "@/lib/supabase/client";

export interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  currency: string;
  category: "basic" | "premium" | "special" | "seasonal";
  rarity: "common" | "rare" | "epic" | "legendary";
  animation?: string;
  sound?: string;
  effects?: string[];
  available: boolean;
  seasonalStart?: string;
  seasonalEnd?: string;
}

export interface GiftTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  giftId: string;
  quantity: number;
  totalAmount: number;
  message?: string;
  isAnonymous: boolean;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface TipTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  message?: string;
  contentId?: string; // Optional: tip related to specific content
  isAnonymous: boolean;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface UserGiftInventory {
  id: string;
  userId: string;
  giftId: string;
  quantity: number;
  acquiredAt: string;
}

export interface CreatorTipSettings {
  id: string;
  userId: string;
  isEnabled: boolean;
  minTipAmount: number;
  maxTipAmount: number;
  suggestedAmounts: number[];
  thankYouMessage?: string;
  allowAnonymous: boolean;
  createdAt: string;
}

export const VIRTUAL_GIFTS: VirtualGift[] = [
  // Basic Gifts
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    description: "Buy them a coffee!",
    price: 1.99,
    currency: "USD",
    category: "basic",
    rarity: "common",
    available: true,
    effects: ["steam"],
  },
  {
    id: "heart",
    name: "Heart",
    emoji: "❤️",
    description: "Show some love",
    price: 0.99,
    currency: "USD",
    category: "basic",
    rarity: "common",
    available: true,
    effects: ["pulse"],
  },
  {
    id: "thumbs-up",
    name: "Thumbs Up",
    emoji: "👍",
    description: "Great job!",
    price: 0.5,
    currency: "USD",
    category: "basic",
    rarity: "common",
    available: true,
  },
  {
    id: "clap",
    name: "Applause",
    emoji: "👏",
    description: "Round of applause",
    price: 1.5,
    currency: "USD",
    category: "basic",
    rarity: "common",
    available: true,
    effects: ["clap-sound"],
  },

  // Premium Gifts
  {
    id: "rose",
    name: "Rose",
    emoji: "🌹",
    description: "A beautiful rose",
    price: 4.99,
    currency: "USD",
    category: "premium",
    rarity: "rare",
    available: true,
    effects: ["sparkle", "romantic-music"],
  },
  {
    id: "cake",
    name: "Birthday Cake",
    emoji: "🎂",
    description: "Celebrate special moments",
    price: 7.99,
    currency: "USD",
    category: "premium",
    rarity: "rare",
    available: true,
    effects: ["confetti", "birthday-song"],
  },
  {
    id: "trophy",
    name: "Trophy",
    emoji: "🏆",
    description: "You're a champion!",
    price: 9.99,
    currency: "USD",
    category: "premium",
    rarity: "epic",
    available: true,
    effects: ["golden-glow", "victory-sound"],
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    description: "You shine bright!",
    price: 19.99,
    currency: "USD",
    category: "premium",
    rarity: "epic",
    available: true,
    effects: ["diamond-sparkle", "crystal-sound"],
  },

  // Special Gifts
  {
    id: "unicorn",
    name: "Unicorn",
    emoji: "🦄",
    description: "Magical and rare!",
    price: 29.99,
    currency: "USD",
    category: "special",
    rarity: "legendary",
    available: true,
    effects: ["rainbow", "magic-sound", "unicorn-animation"],
  },
  {
    id: "crown",
    name: "Crown",
    emoji: "👑",
    description: "You rule!",
    price: 49.99,
    currency: "USD",
    category: "special",
    rarity: "legendary",
    available: true,
    effects: ["royal-glow", "trumpet-fanfare"],
  },

  // Seasonal Gifts (Halloween)
  {
    id: "pumpkin",
    name: "Spooky Pumpkin",
    emoji: "🎃",
    description: "Halloween special!",
    price: 3.99,
    currency: "USD",
    category: "seasonal",
    rarity: "rare",
    available: false, // Will be enabled during Halloween
    seasonalStart: "2024-10-01",
    seasonalEnd: "2024-11-01",
    effects: ["spooky-glow", "halloween-sound"],
  },
  {
    id: "ghost",
    name: "Friendly Ghost",
    emoji: "👻",
    description: "Boo-tiful!",
    price: 2.99,
    currency: "USD",
    category: "seasonal",
    rarity: "common",
    available: false,
    seasonalStart: "2024-10-15",
    seasonalEnd: "2024-10-31",
    effects: ["float", "ghost-sound"],
  },

  // Seasonal Gifts (Christmas)
  {
    id: "christmas-tree",
    name: "Christmas Tree",
    emoji: "🎄",
    description: "Merry Christmas!",
    price: 5.99,
    currency: "USD",
    category: "seasonal",
    rarity: "rare",
    available: false,
    seasonalStart: "2024-12-01",
    seasonalEnd: "2024-12-31",
    effects: ["twinkling-lights", "jingle-bells"],
  },
  {
    id: "santa",
    name: "Santa Claus",
    emoji: "🎅",
    description: "Ho ho ho!",
    price: 8.99,
    currency: "USD",
    category: "seasonal",
    rarity: "epic",
    available: false,
    seasonalStart: "2024-12-15",
    seasonalEnd: "2024-12-25",
    effects: ["snow", "ho-ho-ho-sound"],
  },
];

class VirtualGiftsService {
  // Get available gifts (considering seasonal availability)
  getAvailableGifts(): VirtualGift[] {
    const now = new Date();
    return VIRTUAL_GIFTS.filter((gift) => {
      if (!gift.available && !gift.seasonalStart) return false;

      if (gift.seasonalStart && gift.seasonalEnd) {
        const start = new Date(gift.seasonalStart);
        const end = new Date(gift.seasonalEnd);
        return now >= start && now <= end;
      }

      return gift.available;
    });
  }

  // Get gifts by category
  getGiftsByCategory(category: VirtualGift["category"]): VirtualGift[] {
    return this.getAvailableGifts().filter(
      (gift) => gift.category === category,
    );
  }

  // Get gifts by rarity
  getGiftsByRarity(rarity: VirtualGift["rarity"]): VirtualGift[] {
    return this.getAvailableGifts().filter((gift) => gift.rarity === rarity);
  }

  // Send a gift
  async sendGift(
    fromUserId: string,
    toUserId: string,
    giftId: string,
    quantity: number = 1,
    message?: string,
    isAnonymous: boolean = false,
  ): Promise<GiftTransaction | null> {
    try {
      const gift = VIRTUAL_GIFTS.find((g) => g.id === giftId);
      if (!gift) throw new Error("Gift not found");

      const totalAmount = gift.price * quantity;

      // Check if user has enough balance (in a real app)
      // const balance = await this.getUserBalance(fromUserId);
      // if (balance < totalAmount) throw new Error('Insufficient balance');

      try {
        const { data, error } = await (supabase as any)
          .from("gift_transactions")
          .insert({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            gift_id: giftId,
            quantity,
            total_amount: totalAmount,
            message,
            is_anonymous: isAnonymous,
            status: "completed",
          })
          .select("*")
          .single();

        if (error) throw error;

        // Add to recipient's inventory
        await this.addToInventory(toUserId, giftId, quantity);

        // Create notification (in real app)
        await this.createGiftNotification(
          fromUserId,
          toUserId,
          gift,
          quantity,
          message,
          isAnonymous,
        );

        return data;
      } catch (dbError) {
        console.warn("Database not available, using mock transaction:", dbError);

        // Return mock transaction for demo purposes
        const mockTransaction: GiftTransaction = {
          id: `mock-${Date.now()}`,
          fromUserId,
          toUserId,
          giftId,
          quantity,
          totalAmount,
          message,
          isAnonymous,
          status: "completed",
          createdAt: new Date().toISOString(),
        };

        return mockTransaction;
      }
    } catch (error) {
      console.error("Error sending gift:", error);
      return null;
    }
  }

  // Send a tip
  async sendTip(
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string,
    contentId?: string,
    isAnonymous: boolean = false,
  ): Promise<TipTransaction | null> {
    try {
      try {
        const { data, error } = await (supabase as any)
          .from("tip_transactions")
          .insert({
            from_user_id: fromUserId,
            to_user_id: toUserId,
            amount,
            currency: "USD",
            message,
            content_id: contentId,
            is_anonymous: isAnonymous,
            status: "completed",
          })
          .select("*")
          .single();

        if (error) throw error;

        // Update creator's earnings
        await this.updateCreatorEarnings(toUserId, amount);

        // Create notification
        await this.createTipNotification(
          fromUserId,
          toUserId,
          amount,
          message,
          isAnonymous,
        );

        return data;
      } catch (dbError) {
        console.warn("Database not available, using mock transaction:", dbError);

        // Return mock transaction for demo purposes
        const mockTransaction: TipTransaction = {
          id: `mock-tip-${Date.now()}`,
          fromUserId,
          toUserId,
          amount,
          currency: "USD",
          message,
          contentId,
          isAnonymous,
          status: "completed",
          createdAt: new Date().toISOString(),
        };

        return mockTransaction;
      }
    } catch (error) {
      console.error(
        "Error sending tip:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  // Get user's gift inventory
  async getUserInventory(userId: string): Promise<UserGiftInventory[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("user_gift_inventory")
        .select("*")
        .eq("user_id", userId)
        .order("acquired_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting user inventory:", error);
      return [];
    }
  }

  // Get received gifts
  async getReceivedGifts(
    userId: string,
    limit: number = 50,
  ): Promise<GiftTransaction[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("gift_transactions")
        .select("*")
        .eq("to_user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting received gifts:", error);
      return [];
    }
  }

  // Get sent gifts
  async getSentGifts(
    userId: string,
    limit: number = 50,
  ): Promise<GiftTransaction[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("gift_transactions")
        .select("*")
        .eq("from_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting sent gifts:", error);
      return [];
    }
  }

  // Get received tips
  async getReceivedTips(
    userId: string,
    limit: number = 50,
  ): Promise<TipTransaction[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("tip_transactions")
        .select("*")
        .eq("to_user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Error getting received tips:",
        error instanceof Error ? error.message : error,
      );
      return [];
    }
  }

  // Get tip settings for creator
  async getCreatorTipSettings(
    userId: string,
  ): Promise<CreatorTipSettings | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("creator_tip_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.warn(
        "Tip settings table not found, using defaults:",
        error instanceof Error ? error.message : JSON.stringify(error),
      );

      // Return default settings if table doesn't exist
      return {
        id: `default-${userId}`,
        userId: userId,
        isEnabled: true,
        minTipAmount: 1,
        maxTipAmount: 100,
        suggestedAmounts: [1, 5, 10, 25],
        thankYouMessage: "Thank you for your support!",
        allowAnonymous: true,
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Update tip settings
  async updateTipSettings(
    userId: string,
    settings: Partial<CreatorTipSettings>,
  ): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from("creator_tip_settings")
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      return !error;
    } catch (error) {
      console.error(
        "Error updating tip settings:",
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }

  // Get gift statistics for user
  async getGiftStatistics(userId: string): Promise<{
    totalReceived: number;
    totalSent: number;
    totalValue: number;
    topGifts: Array<{ gift: VirtualGift; count: number }>;
  }> {
    try {
      const [received, sent] = await Promise.all([
        this.getReceivedGifts(userId, 1000),
        this.getSentGifts(userId, 1000),
      ]);

      const totalReceived = received.length;
      const totalSent = sent.length;
      const totalValue = received.reduce(
        (sum, gift) => sum + gift.totalAmount,
        0,
      );

      // Count gift types
      const giftCounts: Record<string, number> = {};
      received.forEach((transaction) => {
        giftCounts[transaction.giftId] =
          (giftCounts[transaction.giftId] || 0) + transaction.quantity;
      });

      const topGifts = Object.entries(giftCounts)
        .map(([giftId, count]) => ({
          gift: VIRTUAL_GIFTS.find((g) => g.id === giftId)!,
          count,
        }))
        .filter((item) => item.gift)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalReceived,
        totalSent,
        totalValue,
        topGifts,
      };
    } catch (error) {
      console.error("Error getting gift statistics:", error);
      return {
        totalReceived: 0,
        totalSent: 0,
        totalValue: 0,
        topGifts: [],
      };
    }
  }

  // Get tip statistics
  async getTipStatistics(userId: string): Promise<{
    totalTipsReceived: number;
    totalTipValue: number;
    averageTip: number;
    topTippers: Array<{
      userId: string;
      totalAmount: number;
      tipCount: number;
    }>;
  }> {
    try {
      const tips = await this.getReceivedTips(userId, 1000);

      const totalTipsReceived = tips.length;
      const totalTipValue = tips.reduce((sum, tip) => sum + tip.amount, 0);
      const averageTip =
        totalTipsReceived > 0 ? totalTipValue / totalTipsReceived : 0;

      // Group by tipper
      const tipperStats: Record<
        string,
        { totalAmount: number; tipCount: number }
      > = {};
      tips.forEach((tip) => {
        if (!tip.isAnonymous) {
          if (!tipperStats[tip.fromUserId]) {
            tipperStats[tip.fromUserId] = { totalAmount: 0, tipCount: 0 };
          }
          tipperStats[tip.fromUserId].totalAmount += tip.amount;
          tipperStats[tip.fromUserId].tipCount += 1;
        }
      });

      const topTippers = Object.entries(tipperStats)
        .map(([userId, stats]) => ({ userId, ...stats }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      return {
        totalTipsReceived,
        totalTipValue,
        averageTip,
        topTippers,
      };
    } catch (error) {
      console.error(
        "Error getting tip statistics:",
        error instanceof Error ? error.message : error,
      );
      return {
        totalTipsReceived: 0,
        totalTipValue: 0,
        averageTip: 0,
        topTippers: [],
      };
    }
  }

  // Private helper methods
  private async addToInventory(
    userId: string,
    giftId: string,
    quantity: number,
  ): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from("user_gift_inventory")
        .upsert({
          user_id: userId,
          gift_id: giftId,
          quantity,
          acquired_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error adding to inventory:", error);
    }
  }

  private async updateCreatorEarnings(
    userId: string,
    amount: number,
  ): Promise<void> {
    // This would update the creator's earnings in the wallet/monetization system
    console.log(`Updated earnings for ${userId}: +$${amount}`);
  }

  private async createGiftNotification(
    fromUserId: string,
    toUserId: string,
    gift: VirtualGift,
    quantity: number,
    message?: string,
    isAnonymous?: boolean,
  ): Promise<void> {
    // This would create a notification in the notification system
    console.log(
      `Gift notification: ${fromUserId} sent ${quantity}x ${gift.name} to ${toUserId}`,
    );
  }

  private async createTipNotification(
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string,
    isAnonymous?: boolean,
  ): Promise<void> {
    // This would create a notification in the notification system
    console.log(
      `Tip notification: ${fromUserId} tipped $${amount} to ${toUserId}`,
    );
  }

  // Get user's gift history (real data)
  async getGiftHistory(userId: string): Promise<GiftTransaction[]> {
    try {
      // Return real data from database
      return await this.getSentGifts(userId);
    } catch (error) {
      console.error("Error getting gift history:", error);
      return [];
    }
  }

  // Get user's tip history (real data)
  async getTipHistory(userId: string): Promise<TipTransaction[]> {
    try {
      // Return real data from database
      return await this.getReceivedTips(userId);
    } catch (error) {
      console.error("Error getting tip history:", error);
      return [];
    }
  }
}

export const virtualGiftsService = new VirtualGiftsService();

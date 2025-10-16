// @ts-nocheck
// Activity types constants
const ACTIVITY_TYPES = [
  "post_content",
  "like_post", 
  "comment_post",
  "share_content",
  "daily_login",
  "purchase_product"
] as const;

export interface ActivityRewardResponse {
  success: boolean;
  status: string;
  eloits: number;
  walletBonus: number;
  newTrustScore: number;
  riskScore: number;
  message: string;
}

export interface ActivityContext {
  ip?: string;
  deviceId?: string;
  sessionId?: string;
  userAgent?: string;
  location?: string;
  timeSpent?: number;
  clickDepth?: number;
  referrer?: string;
}

export class ActivityRewardService {
  private static apiBase = "/api";

  static async logActivity(params: {
    userId: string;
    actionType: (typeof ACTIVITY_TYPES)[number];
    targetId?: string;
    targetType?: string;
    value?: number;
    context?: ActivityContext;
    metadata?: Record<string, any>;
  }): Promise<ActivityRewardResponse> {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No auth token found, skipping reward tracking");
        return {
          success: false,
          status: "no_auth",
          eloits: 0,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: "No authentication token",
        };
      }

      const response = await fetch(`${this.apiBase}/creator/reward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: params.userId,
          actionType: params.actionType,
          targetId: params.targetId,
          targetType: params.targetType,
          value: params.value,
          context: {
            ip: params.context?.ip,
            deviceId: this.getDeviceId(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            location: params.context?.location,
            timeSpent: params.context?.timeSpent,
            clickDepth: params.context?.clickDepth,
            referrer: document.referrer || params.context?.referrer,
          },
          metadata: params.metadata,
        }),
      });

      if (!response.ok) {
        console.error("Failed to log activity:", response.statusText);
        throw new Error(`Failed to log activity: ${response.statusText}`);
      }

      const result = await response.json();

      // Log success for debugging
      if (result.success && result.eloits > 0) {
        console.log(
          `🎉 Reward earned! +${result.eloits} Eloits${result.walletBonus > 0 ? ` +$${result.walletBonus.toFixed(4)} wallet bonus` : ""}`,
        );
      }

      return result;
    } catch (error) {
      console.error("Error logging activity:", error);
      return {
        success: false,
        status: "error",
        eloits: 0,
        walletBonus: 0,
        newTrustScore: 0,
        riskScore: 0,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Convenience methods for common activities
  static async logPostCreated(
    userId: string,
    postId: string,
    metadata?: Record<string, any>,
  ) {
    return this.logActivity({
      userId,
      actionType: "post_content",
      targetId: postId,
      targetType: "post",
      metadata,
    });
  }

  static async logPostLiked(
    userId: string,
    postId: string,
    timeSpent?: number,
  ) {
    return this.logActivity({
      userId,
      actionType: "like_post",
      targetId: postId,
      targetType: "post",
      context: {
        timeSpent,
      },
    });
  }

  static async logComment(
    userId: string,
    postId: string,
    commentLength?: number,
  ) {
    return this.logActivity({
      userId,
      actionType: "comment_post",
      targetId: postId,
      targetType: "post",
      metadata: {
        commentLength,
      },
    });
  }

  static async logShare(userId: string, targetId: string, targetType: string) {
    return this.logActivity({
      userId,
      actionType: "share_content",
      targetId,
      targetType,
    });
  }

  static async logDailyLogin(userId: string) {
    return this.logActivity({
      userId,
      actionType: "daily_login",
    });
  }

  static async logPurchase(userId: string, productId: string, amount: number, metadata?: Record<string, any>) {
    return this.logActivity({
      userId,
      actionType: "purchase_product",
      targetId: productId,
      targetType: "product",
      value: amount,
      metadata,
    });
  }

  // Utility methods
  private static getDeviceId(): string {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = "dev_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }

  private static showRewardNotification(
    eloits: number,
    walletBonus: number,
  ) {
    // This would integrate with your notification system
    console.log(
      `🎉 Reward earned! +${eloits} Eloits${walletBonus > 0 ? ` +$${walletBonus.toFixed(4)} wallet bonus` : ""}`,
    );

    // You can integrate with react-hot-toast or your existing notification system
    // toast.success(`🎉 +${eloits} Eloits earned!`);
  }

  // Get reward summary
  static async getRewardSummary(period: string = "7d") {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(
        `${this.apiBase}/creator/reward-summary?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch reward summary");

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching reward summary:", error);
      return null;
    }
  }

  // Get reward history
  static async getRewardHistory(page: number = 1, limit: number = 20) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(
        `${this.apiBase}/creator/reward-history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch reward history");

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching reward history:", error);
      return null;
    }
  }
}

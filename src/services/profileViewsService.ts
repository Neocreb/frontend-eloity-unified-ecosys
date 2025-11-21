import { supabase } from "@/integrations/supabase/client";

export interface ProfileViewer {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  isOnline?: boolean;
  lastViewed?: string;
  viewCount?: number;
  location?: string;
  device?: string;
  referrer?: string;
  timeSpent?: string;
}

export interface ViewStats {
  totalViews: number;
  uniqueViewers: number;
  avgViewTime: string;
  topLocation: string;
  peakHour: string;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export class ProfileViewsService {
  async recordProfileView(
    profileId: string,
    viewerData: {
      viewerId?: string;
      viewerUsername?: string;
      viewerDisplayName?: string;
      viewerAvatar?: string;
      location?: string;
      deviceType?: string;
      referrerSource?: string;
      timeSpentSeconds?: number;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase.from("profile_views").insert({
        profile_id: profileId,
        viewer_id: viewerData.viewerId,
        viewer_username: viewerData.viewerUsername,
        viewer_display_name: viewerData.viewerDisplayName,
        viewer_avatar: viewerData.viewerAvatar,
        location: viewerData.location,
        device_type: viewerData.deviceType,
        referrer_source: viewerData.referrerSource,
        time_spent_seconds: viewerData.timeSpentSeconds || 0,
        is_online: true,
        last_viewed_at: new Date().toISOString(),
      });

      if (error) {
        console.warn("Error recording profile view:", error.message);
      }
    } catch (err: any) {
      console.warn("Error recording profile view:", err?.message || err);
    }
  }

  async getProfileViewers(profileId: string): Promise<ProfileViewer[]> {
    try {
      const { data, error } = await supabase
        .from("profile_views")
        .select("*")
        .eq("profile_id", profileId)
        .order("last_viewed_at", { ascending: false })
        .limit(100);

      if (error) {
        if (error.message.includes("does not exist")) {
          console.log(
            "profile_views table not found. Run the migration script to create it."
          );
          return [];
        }
        console.warn("Error fetching profile viewers:", error.message);
        return [];
      }

      return (data || []).map((view: any) => ({
        id: view.id,
        username: view.viewer_username || "Anonymous",
        displayName: view.viewer_display_name || "Unknown User",
        avatar: view.viewer_avatar || "",
        verified: false,
        isOnline: view.is_online,
        lastViewed: this.formatTime(view.last_viewed_at),
        viewCount: 1,
        location: view.location || "Unknown",
        device: view.device_type || "Unknown",
        referrer: view.referrer_source || "Direct",
        timeSpent: this.formatTimeSpent(view.time_spent_seconds || 0),
      }));
    } catch (err: any) {
      console.warn("Error fetching profile viewers:", err?.message || err);
      return [];
    }
  }

  async getProfileViewStats(profileId: string): Promise<ViewStats> {
    try {
      const { data, error } = await supabase
        .from("profile_view_stats")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error) {
        if (error.message.includes("does not exist")) {
          return this.getDefaultViewStats();
        }
        console.warn("Error fetching view stats:", error.message);
        return this.getDefaultViewStats();
      }

      if (!data) {
        return this.getDefaultViewStats();
      }

      return {
        totalViews: data.total_views || 0,
        uniqueViewers: data.unique_viewers || 0,
        avgViewTime: this.formatTimeSpent(data.avg_view_time_seconds || 0),
        topLocation: data.top_location || "Unknown",
        peakHour: data.peak_hour ? `${data.peak_hour}:00` : "N/A",
        deviceBreakdown: {
          mobile: data.mobile_views || 0,
          desktop: data.desktop_views || 0,
          tablet: data.tablet_views || 0,
        },
      };
    } catch (err: any) {
      console.warn("Error fetching view stats:", err?.message || err);
      return this.getDefaultViewStats();
    }
  }

  async updateProfileViewStats(
    profileId: string,
    stats: Partial<ViewStats>
  ): Promise<void> {
    try {
      const currentStats = await this.getProfileViewStats(profileId);

      const { error } = await supabase
        .from("profile_view_stats")
        .upsert(
          {
            profile_id: profileId,
            total_views: stats.totalViews || currentStats.totalViews,
            unique_viewers: stats.uniqueViewers || currentStats.uniqueViewers,
            avg_view_time_seconds: this.parseTimeSpent(
              stats.avgViewTime || currentStats.avgViewTime
            ),
            top_location:
              stats.topLocation || currentStats.topLocation || "Unknown",
            peak_hour: stats.peakHour ? parseInt(stats.peakHour) : null,
            mobile_views: stats.deviceBreakdown?.mobile || 0,
            desktop_views: stats.deviceBreakdown?.desktop || 0,
            tablet_views: stats.deviceBreakdown?.tablet || 0,
            last_updated: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );

      if (error) {
        console.warn("Error updating view stats:", error.message);
      }
    } catch (err: any) {
      console.warn("Error updating view stats:", err?.message || err);
    }
  }

  private getDefaultViewStats(): ViewStats {
    return {
      totalViews: 0,
      uniqueViewers: 0,
      avgViewTime: "0m 0s",
      topLocation: "Unknown",
      peakHour: "N/A",
      deviceBreakdown: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      },
    };
  }

  private formatTime(timestamp: string | null): string {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "just now";
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString();
  }

  private formatTimeSpent(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  private parseTimeSpent(timeStr: string): number {
    const match = timeStr.match(/(\d+)m\s*(\d+)s/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }
    return 0;
  }
}

export const profileViewsService = new ProfileViewsService();

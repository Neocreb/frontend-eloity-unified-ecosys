// @ts-nocheck
import { supabase } from "@/lib/supabase/client";

export interface LiveStream {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category:
    | "gaming"
    | "education"
    | "music"
    | "talk"
    | "entertainment"
    | "business"
    | "trading"
    | "art"
    | "other";
  thumbnailUrl?: string;
  status: "scheduled" | "live" | "ended" | "paused";
  quality: "720p" | "1080p" | "1440p" | "4k";
  viewerCount: number;
  maxViewers: number;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  isPrivate: boolean;
  requiresSubscription: boolean;
  monetizationEnabled: boolean;
  streamKey: string;
  rtmpUrl: string;
  playbackUrl: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  chatEnabled: boolean;
  moderationEnabled: boolean;
  tags: string[];
  language: string;
  createdAt: string;
  streamerName: string;
  streamerAvatar?: string;
}

export interface StreamViewer {
  id: string;
  streamId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  watchTime: number; // in seconds
  interactionCount: number;
  giftsSent: number;
  tipsSent: number;
}

export interface StreamMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  type: "chat" | "gift" | "tip" | "system" | "moderation";
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface StreamDonation {
  id: string;
  streamId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  timestamp: string;
}

export interface StreamSettings {
  id: string;
  userId: string;
  defaultQuality: LiveStream["quality"];
  autoStart: boolean;
  enableNotifications: boolean;
  allowedViewers: "everyone" | "subscribers" | "followers" | "custom";
  customViewers: string[];
  chatModeration: "none" | "auto" | "manual";
  bannedWords: string[];
  slowMode: boolean;
  slowModeDelay: number; // seconds
  requireVerification: boolean;
  monetizationSettings: {
    minTipAmount: number;
    maxTipAmount: number;
    suggestedAmounts: number[];
    enableSuperChat: boolean;
    enableMemberships: boolean;
  };
  recordingSettings: {
    autoRecord: boolean;
    quality: "low" | "medium" | "high";
    saveToCloud: boolean;
    autoDelete: boolean;
    deleteAfterDays: number;
  };
}

export interface StreamAnalytics {
  streamId: string;
  totalViewers: number;
  averageViewTime: number;
  peakViewers: number;
  totalWatchTime: number;
  chatMessages: number;
  donations: number;
  totalDonationAmount: number;
  newFollowers: number;
  newSubscribers: number;
  engagementRate: number;
  viewerRetention: number[];
  topChatters: Array<{ userId: string; messageCount: number }>;
  topDonors: Array<{ userId: string; totalAmount: number }>;
  viewerCountByHour: Array<{ hour: string; count: number }>;
  audienceGeography: Array<{ country: string; count: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
}

class LiveStreamingService {
  private streams: Map<string, RTCPeerConnection> = new Map();
  private streamSettings: StreamSettings | null = null;

  // Stream Management
  async createStream(
    streamData: Omit<
      LiveStream,
      "id" | "streamKey" | "rtmpUrl" | "playbackUrl" | "createdAt"
    >,
  ): Promise<LiveStream | null> {
    try {
      // Generate stream credentials
      const streamKey = this.generateStreamKey();
      const rtmpUrl = `rtmp://live.eloity.com/live/${streamKey}`;
      const playbackUrl = `https://live.eloity.com/hls/${streamKey}/index.m3u8`;

      const { data, error } = await (supabase as any)
        .from("live_streams")
        .insert({
          ...streamData,
          stream_key: streamKey,
          rtmp_url: rtmpUrl,
          playback_url: playbackUrl,
          viewer_count: 0,
          max_viewers: 0,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return this.mapDbStreamToStream(data);
    } catch (error) {
      console.error("Error creating stream:", error);
      return null;
    }
  }

  async startStream(streamId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from("live_streams")
        .update({
          status: "live",
          start_time: new Date().toISOString(),
        })
        .eq("id", streamId);

      if (error) throw error;

      // Initialize WebRTC connection
      await this.initializeWebRTCStream(streamId);

      // Notify subscribers
      await this.notifyStreamStart(streamId);

      return true;
    } catch (error) {
      console.error("Error starting stream:", error);
      return false;
    }
  }

  async endStream(streamId: string): Promise<boolean> {
    try {
      const stream = await this.getStream(streamId);
      if (!stream) return false;

      const endTime = new Date().toISOString();
      const duration = stream.startTime
        ? Math.floor((Date.now() - new Date(stream.startTime).getTime()) / 1000)
        : 0;

      const { error } = await (supabase as any)
        .from("live_streams")
        .update({
          status: "ended",
          end_time: endTime,
          duration,
        })
        .eq("id", streamId);

      if (error) throw error;

      // Clean up WebRTC connection
      this.cleanupWebRTCStream(streamId);

      // Generate analytics
      await this.generateStreamAnalytics(streamId);

      return true;
    } catch (error) {
      console.error("Error ending stream:", error);
      return false;
    }
  }

  async pauseStream(streamId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from("live_streams")
        .update({ status: "paused" })
        .eq("id", streamId);

      return !error;
    } catch (error) {
      console.error("Error pausing stream:", error);
      return false;
    }
  }

  async resumeStream(streamId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from("live_streams")
        .update({ status: "live" })
        .eq("id", streamId);

      return !error;
    } catch (error) {
      console.error("Error resuming stream:", error);
      return false;
    }
  }

  // Stream Discovery
  async getStream(streamId: string): Promise<LiveStream | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("live_streams")
        .select("*")
        .eq("id", streamId)
        .single();

      if (error) throw error;
      return this.mapDbStreamToStream(data);
    } catch (error) {
      console.error("Error getting stream:", error);
      return null;
    }
  }

  async getUserStreams(
    userId: string,
    status?: LiveStream["status"],
  ): Promise<LiveStream[]> {
    try {
      let query = (supabase as any)
        .from("live_streams")
        .select("*")
        .eq("user_id", userId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return data.map(this.mapDbStreamToStream);
    } catch (error) {
      console.error("Error getting user streams:", error);
      return [];
    }
  }

  async getLiveStreams(
    limit: number = 20,
    category?: string,
  ): Promise<LiveStream[]> {
    try {
      let query = (supabase as any)
        .from("live_streams")
        .select("*")
        .eq("status", "live")
        .eq("is_private", false);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query
        .order("viewer_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn(
          "Database not available, using mock data for live streams:",
          error.message || error,
        );
        return this.getMockLiveStreams(limit);
      }
      return data
        ? data.map(this.mapDbStreamToStream)
        : this.getMockLiveStreams(limit);
    } catch (error) {
      console.warn(
        "Database not available, using mock data for live streams:",
        error instanceof Error ? error.message : error,
      );
      return this.getMockLiveStreams(limit);
    }
  }

  async searchStreams(query: string, category?: string): Promise<LiveStream[]> {
    try {
      let dbQuery = (supabase as any)
        .from("live_streams")
        .select("*")
        .eq("is_private", false)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`,
        );

      if (category && category !== "all") {
        dbQuery = dbQuery.eq("category", category);
      }

      const { data, error } = await dbQuery
        .order("viewer_count", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(this.mapDbStreamToStream);
    } catch (error) {
      console.error("Error searching streams:", error);
      return [];
    }
  }

  // Viewer Management
  async joinStream(streamId: string, userId: string): Promise<boolean> {
    try {
      // Record viewer join
      await (supabase as any).from("stream_viewers").insert({
        stream_id: streamId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        watch_time: 0,
        interaction_count: 0,
        gifts_sent: 0,
        tips_sent: 0,
      });

      // Update stream viewer count
      await this.updateViewerCount(streamId, 1);

      return true;
    } catch (error) {
      console.error("Error joining stream:", error);
      console.log(`User ${userId} joined stream ${streamId}`);
      return true;
    }
  }

  async leaveStream(streamId: string, userId: string): Promise<boolean> {
    try {
      // Calculate watch time
      const { data: viewerData } = await (supabase as any)
        .from("stream_viewers")
        .select("joined_at")
        .eq("stream_id", streamId)
        .eq("user_id", userId)
        .single();

      if (viewerData) {
        const watchTime = Math.floor(
          (Date.now() - new Date(viewerData.joined_at).getTime()) / 1000,
        );

        // Update viewer record
        await (supabase as any)
          .from("stream_viewers")
          .update({
            left_at: new Date().toISOString(),
            watch_time: watchTime,
          })
          .eq("stream_id", streamId)
          .eq("user_id", userId);
      }

      // Update stream viewer count
      await this.updateViewerCount(streamId, -1);

      return true;
    } catch (error) {
      console.error("Error leaving stream:", error);
      console.log(`User ${userId} left stream ${streamId}`);
      return true;
    }
  }

  private async updateViewerCount(
    streamId: string,
    delta: number,
  ): Promise<void> {
    try {
      const { data: stream } = await (supabase as any)
        .from("live_streams")
        .select("viewer_count, max_viewers")
        .eq("id", streamId)
        .single();

      if (stream) {
        const newCount = Math.max(0, stream.viewer_count + delta);
        const maxViewers = Math.max(stream.max_viewers, newCount);

        await (supabase as any)
          .from("live_streams")
          .update({
            viewer_count: newCount,
            max_viewers: maxViewers,
          })
          .eq("id", streamId);
      }
    } catch (error) {
      console.error("Error updating viewer count:", error);
    }
  }

  // Chat & Messaging
  async sendMessage(
    streamId: string,
    userId: string,
    username: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Check for spam/moderation
      if (await this.isMessageBlocked(streamId, message)) {
        return false;
      }

      const { error } = await (supabase as any).from("stream_messages").insert({
        stream_id: streamId,
        user_id: userId,
        username,
        message,
        type: "chat",
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      // Update interaction count
      await this.updateUserInteraction(streamId, userId);

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  async getStreamMessages(
    streamId: string,
    limit: number = 50,
  ): Promise<StreamMessage[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("stream_messages")
        .select("*")
        .eq("stream_id", streamId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.reverse(); // Return in chronological order
    } catch (error) {
      console.error(
        "Error getting stream messages:",
        error instanceof Error ? error.message : error,
      );
      // Return mock messages for demo
      return [
        {
          id: "1",
          streamId,
          userId: "user-1",
          username: "CryptoTrader",
          userAvatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          message: "Great analysis! 🚀",
          type: "chat",
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: "2",
          streamId,
          userId: "user-2",
          username: "ArtLover",
          userAvatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          message: "This is amazing work!",
          type: "chat",
          timestamp: new Date(Date.now() - 30000).toISOString(),
        },
      ];
    }
  }

  // Monetization
  async sendDonation(
    streamId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    message?: string,
    isAnonymous: boolean = false,
  ): Promise<StreamDonation | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("stream_donations")
        .insert({
          stream_id: streamId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          amount,
          currency: "USD",
          message,
          is_anonymous: isAnonymous,
          timestamp: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;

      // Add system message to chat
      if (!isAnonymous) {
        await this.sendSystemMessage(
          streamId,
          `💰 ${amount > 0 ? `$${amount} donation` : "Donation"} received!${message ? ` "${message}"` : ""}`,
        );
      }

      // Update user interaction
      await this.updateUserInteraction(streamId, fromUserId);

      return data;
    } catch (error) {
      console.error("Error sending donation:", error);
      return null;
    }
  }

  // Stream Settings
  async getStreamSettings(userId: string): Promise<StreamSettings | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("stream_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || this.createDefaultSettings(userId);
    } catch (error) {
      console.error("Error getting stream settings:", error);
      return null;
    }
  }

  async updateStreamSettings(
    userId: string,
    settings: Partial<StreamSettings>,
  ): Promise<boolean> {
    try {
      const { error } = await (supabase as any).from("stream_settings").upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (error) {
      console.error("Error updating stream settings:", error);
      return false;
    }
  }

  // Analytics
  async getStreamAnalytics(streamId: string): Promise<StreamAnalytics | null> {
    try {
      const [stream, viewers, messages, donations] = await Promise.all([
        this.getStream(streamId),
        this.getStreamViewers(streamId),
        this.getStreamMessages(streamId, 1000),
        this.getStreamDonations(streamId),
      ]);

      if (!stream) return null;

      const totalViewers = viewers.length;
      const totalWatchTime = viewers.reduce((sum, v) => sum + v.watchTime, 0);
      const averageViewTime =
        totalViewers > 0 ? totalWatchTime / totalViewers : 0;
      const totalDonationAmount = donations.reduce(
        (sum, d) => sum + d.amount,
        0,
      );

      return {
        streamId,
        totalViewers,
        averageViewTime,
        peakViewers: stream.maxViewers,
        totalWatchTime,
        chatMessages: messages.filter((m) => m.type === "chat").length,
        donations: donations.length,
        totalDonationAmount,
        newFollowers: 0, // Would need follower tracking
        newSubscribers: 0, // Would need subscription tracking
        engagementRate:
          totalViewers > 0 ? (messages.length / totalViewers) * 100 : 0,
        viewerRetention: [], // Would need detailed tracking
        topChatters: [],
        topDonors: [],
        viewerCountByHour: [],
        audienceGeography: [],
        deviceTypes: [],
      };
    } catch (error) {
      console.error("Error getting stream analytics:", error);
      return null;
    }
  }

  // WebRTC Integration
  private async initializeWebRTCStream(streamId: string): Promise<void> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN servers for production
        ],
      });

      // Set up peer connection handlers
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to viewers
          this.broadcastICECandidate(streamId, event.candidate);
        }
      };

      peerConnection.ontrack = (event) => {
        // Handle incoming stream from broadcaster
        console.log("Received stream track:", event);
      };

      this.streams.set(streamId, peerConnection);
    } catch (error) {
      console.error("Error initializing WebRTC stream:", error);
    }
  }

  private cleanupWebRTCStream(streamId: string): void {
    const peerConnection = this.streams.get(streamId);
    if (peerConnection) {
      peerConnection.close();
      this.streams.delete(streamId);
    }
  }

  // Helper Methods
  private generateStreamKey(): string {
    return `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapDbStreamToStream(data: any): LiveStream {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      quality: data.quality,
      viewerCount: data.viewer_count,
      maxViewers: data.max_viewers,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      isPrivate: data.is_private,
      requiresSubscription: data.requires_subscription,
      monetizationEnabled: data.monetization_enabled,
      streamKey: data.stream_key,
      rtmpUrl: data.rtmp_url,
      playbackUrl: data.playback_url,
      recordingEnabled: data.recording_enabled,
      recordingUrl: data.recording_url,
      chatEnabled: data.chat_enabled,
      moderationEnabled: data.moderation_enabled,
      tags: data.tags || [],
      language: data.language,
      createdAt: data.created_at,
    };
  }

  private async createDefaultSettings(userId: string): Promise<StreamSettings> {
    const defaultSettings: StreamSettings = {
      id: `settings_${userId}`,
      userId,
      defaultQuality: "1080p",
      autoStart: false,
      enableNotifications: true,
      allowedViewers: "everyone",
      customViewers: [],
      chatModeration: "auto",
      bannedWords: [],
      slowMode: false,
      slowModeDelay: 5,
      requireVerification: false,
      monetizationSettings: {
        minTipAmount: 1,
        maxTipAmount: 1000,
        suggestedAmounts: [5, 10, 25, 50],
        enableSuperChat: true,
        enableMemberships: false,
      },
      recordingSettings: {
        autoRecord: false,
        quality: "high",
        saveToCloud: true,
        autoDelete: false,
        deleteAfterDays: 30,
      },
    };

    await this.updateStreamSettings(userId, defaultSettings);
    return defaultSettings;
  }

  private async isMessageBlocked(
    streamId: string,
    message: string,
  ): Promise<boolean> {
    const settings = this.streamSettings;
    if (!settings || !settings.bannedWords.length) return false;

    const lowerMessage = message.toLowerCase();
    return settings.bannedWords.some((word) =>
      lowerMessage.includes(word.toLowerCase()),
    );
  }

  private async updateUserInteraction(
    streamId: string,
    userId: string,
  ): Promise<void> {
    try {
      await (supabase as any)
        .from("stream_viewers")
        .update({
          interaction_count: (supabase as any).raw("interaction_count + 1"),
        })
        .eq("stream_id", streamId)
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error updating user interaction:", error);
    }
  }

  private async sendSystemMessage(
    streamId: string,
    message: string,
  ): Promise<void> {
    try {
      await (supabase as any).from("stream_messages").insert({
        stream_id: streamId,
        user_id: "system",
        username: "System",
        message,
        type: "system",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending system message:", error);
    }
  }

  private async notifyStreamStart(streamId: string): Promise<void> {
    // Implementation would send notifications to followers/subscribers
    console.log(`Stream ${streamId} started - sending notifications`);
  }

  private async generateStreamAnalytics(streamId: string): Promise<void> {
    // Implementation would generate detailed analytics
    console.log(`Generating analytics for stream ${streamId}`);
  }

  private async getStreamViewers(streamId: string): Promise<StreamViewer[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("stream_viewers")
        .select("*")
        .eq("stream_id", streamId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting stream viewers:", error);
      return [];
    }
  }

  private async getStreamDonations(
    streamId: string,
  ): Promise<StreamDonation[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("stream_donations")
        .select("*")
        .eq("stream_id", streamId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting stream donations:", error);
      return [];
    }
  }

  private broadcastICECandidate(
    streamId: string,
    candidate: RTCIceCandidate,
  ): void {
    // Implementation would broadcast ICE candidate to all viewers
    console.log(`Broadcasting ICE candidate for stream ${streamId}`, candidate);
  }

  // Additional methods for demo compatibility
  async reactToStream(streamId: string, reaction: string): Promise<boolean> {
    console.log(`Reacting to stream ${streamId} with ${reaction}`);
    return true;
  }

  async startStreamDemo(streamData: any): Promise<LiveStream> {
    console.log("Starting demo stream with data:", streamData);
    const mockStream = this.getMockLiveStreams(1)[0];
    return {
      ...mockStream,
      id: `stream-${Date.now()}`,
      title: streamData.title || mockStream.title,
      description: streamData.description || mockStream.description,
      category: streamData.category || mockStream.category,
      userId: streamData.streamerId || mockStream.userId,
    };
  }

  // Mock data for when database is not available
  private getMockLiveStreams(limit: number): LiveStream[] {
    const mockStreams: LiveStream[] = [
      {
        id: "stream-1",
        userId: "user-1",
        title: "🚀 Crypto Trading Masterclass - Live Analysis",
        description:
          "Join me for real-time crypto market analysis and trading strategies. We'll cover Bitcoin, Ethereum, and emerging altcoins!",
        category: "trading",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
        status: "live",
        quality: "1080p",
        viewerCount: 1247,
        maxViewers: 1450,
        startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isPrivate: false,
        requiresSubscription: false,
        monetizationEnabled: true,
        streamKey: "sk_1234567890",
        rtmpUrl: "rtmp://live.eloity.com/live/sk_1234567890",
        playbackUrl: "https://live.eloity.com/hls/sk_1234567890/index.m3u8",
        recordingEnabled: true,
        chatEnabled: true,
        moderationEnabled: true,
        tags: ["crypto", "trading", "bitcoin", "live"],
        language: "en",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        streamerName: "CryptoMaster",
        streamerAvatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "stream-2",
        userId: "user-2",
        title: "🎨 Digital Art Creation - Painting with Light",
        description:
          "Watch me create stunning digital artwork using the latest techniques. Interactive session with viewer suggestions!",
        category: "art",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
        status: "live",
        quality: "1440p",
        viewerCount: 823,
        maxViewers: 920,
        startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        isPrivate: false,
        requiresSubscription: false,
        monetizationEnabled: true,
        streamKey: "sk_0987654321",
        rtmpUrl: "rtmp://live.eloity.com/live/sk_0987654321",
        playbackUrl: "https://live.eloity.com/hls/sk_0987654321/index.m3u8",
        recordingEnabled: true,
        chatEnabled: true,
        moderationEnabled: true,
        tags: ["art", "digital", "creative", "painting"],
        language: "en",
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        streamerName: "ArtisticSoul",
        streamerAvatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      },
      {
        id: "stream-3",
        userId: "user-3",
        title: "🎮 Epic Gaming Session - New Game Release",
        description:
          "First look at the hottest new game release! Join for epic gameplay, tips, and giveaways throughout the stream.",
        category: "gaming",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop",
        status: "live",
        quality: "4k",
        viewerCount: 2156,
        maxViewers: 2340,
        startTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        isPrivate: false,
        requiresSubscription: false,
        monetizationEnabled: true,
        streamKey: "sk_1122334455",
        rtmpUrl: "rtmp://live.eloity.com/live/sk_1122334455",
        playbackUrl: "https://live.eloity.com/hls/sk_1122334455/index.m3u8",
        recordingEnabled: true,
        chatEnabled: true,
        moderationEnabled: true,
        tags: ["gaming", "new-release", "giveaway", "live"],
        language: "en",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        streamerName: "GameMaster99",
        streamerAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
    ];
    return mockStreams.slice(0, limit);
  }
}

export const liveStreamingService = new LiveStreamingService();

import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api";
import {
  UserProfile,
  ExtendedUser,
  MockUser,
  MarketplaceProfile,
  FreelanceProfile,
  CryptoProfile,
} from "@/types/user";

// Enhanced profile service with comprehensive profile management
export class ProfileService {
  // Basic profile operations
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      // Try to fetch from API first
      const response = await apiClient.getProfileByUsername(username) as any;
      if (response?.profile) {
        return this.formatUserProfile(response.profile);
      }

      // Fallback to direct database query (use simple query to avoid PostgREST relationship issues)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.warn(
          "User not found in database:",
          error.message
        );
        return null;
      }

      return this.formatUserProfile(data);
    } catch (error: any) {
      console.warn("Error fetching user by username:", error?.message || error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      // Try to fetch from API first
      const response = await apiClient.getProfile(userId) as any;
      if (response?.profile) {
        return this.formatUserProfile(response.profile);
      }

      // Fallback to direct database query (use simple query to avoid PostgREST relationship issues)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.warn("User not found in database:", error.message);
        return null;
      }

      return this.formatUserProfile(data);
    } catch (error: any) {
      console.warn("Error fetching user by ID:", error?.message || error);
      return null;
    }
  }

  // Follow/Unfollow functionality
  async getFollowersCount(userId: string): Promise<number> {
    try {
      // Try API first
      const response = await apiClient.getFollowers(userId) as any;
      if (response?.count !== undefined) {
        return response.count;
      }

      // Fallback to direct database query
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) {
        console.warn(
          `Followers table query failed: ${error.message}. Using fallback value.`,
        );
        return 0;
      }
      return count || 0;
    } catch (error: any) {
      console.warn("Error fetching followers count:", error?.message || error);
      return 0;
    }
  }

  async getFollowingCount(userId: string): Promise<number> {
    try {
      // Try API first
      const response = await apiClient.getFollowing(userId) as any;
      if (response?.count !== undefined) {
        return response.count;
      }

      // Fallback to direct database query
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (error) {
        console.warn(
          `Following table query failed: ${error.message}. Using fallback value.`,
        );
        return 0;
      }
      return count || 0;
    } catch (error: any) {
      console.warn("Error fetching following count:", error?.message || error);
      return 0;
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Try API first
      const response = await apiClient.checkFollowStatus(followerId, followingId) as any;
      if (response?.isFollowing !== undefined) {
        return response.isFollowing;
      }

      // Fallback to direct database query
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();

      if (error) {
        console.warn(
          `Follow status query failed: ${error.message}. Defaulting to not following.`,
        );
        return false;
      }
      return !!data;
    } catch (error: any) {
      console.warn("Error checking follow status:", error?.message || error);
      return false;
    }
  }

  async toggleFollow(
    followerId: string,
    followingId: string,
    currentlyFollowing: boolean,
  ): Promise<void> {
    try {
      if (currentlyFollowing) {
        // Try API first
        try {
          await apiClient.unfollowUser(followerId, followingId);
        } catch (apiError) {
          // Fallback to direct database query
          const { error } = await supabase
            .from("followers")
            .delete()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);

          if (error) throw error;
        }
      } else {
        // Try API first
        try {
          await apiClient.followUser(followerId, followingId);
        } catch (apiError) {
          // Fallback to direct database query
          const { error } = await supabase
            .from("followers")
            .insert([{
              follower_id: followerId,
              following_id: followingId,
            }]);

          if (error) throw error;
        }
      }
    } catch (error: any) {
      console.error("Error toggling follow status:", error?.message || error);
      throw error;
    }
  }

  // Content fetching
  async getUserPosts(userId: string) {
    try {
      // Try API first
      const response = await apiClient.getUserPosts(userId) as any;
      if (response?.posts) {
        return response.posts;
      }

      // Fallback to direct database query
      const { data, error } = await supabase
        .from("posts")
        .select('*')
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          `Posts table query failed: ${error.message}. This is expected if the posts table doesn't exist yet.`,
        );
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.warn(
        `Error fetching user posts for ${userId}:`,
        error?.message || error,
      );
      return [];
    }
  }

  async getUserProducts(userId: string) {
    try {
      // Try API first
      const response = await apiClient.getSellerProducts(userId) as any;
      if (response?.products) {
        return response.products;
      }

      // Fallback to direct database query
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          profiles:seller_id(*)
        `,
        )
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          `Products table query failed: ${error.message}. This is expected if the products table doesn't exist yet.`,
        );
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.warn(
        `Error fetching user products for ${userId}:`,
        error?.message || error,
      );
      return [];
    }
  }

  async getUserServices(userId: string) {
    try {
      // Try freelance API first
      const response = await apiClient.getFreelanceJobs({ freelancer_id: userId }) as any;
      if (response?.services) {
        return response.services;
      }

      // Fallback to direct database query
      const { data, error } = await supabase
        .from("freelance_profiles")
        .select('*')
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.warn(
          `Freelance services table query failed: ${error.message}. This is expected if the freelance_services table doesn't exist yet.`,
        );
        return [];
      }
      
      // Extract services from services_offered field
      if (data && data[0] && data[0].services_offered) {
        try {
          const services = typeof data[0].services_offered === 'string' 
            ? JSON.parse(data[0].services_offered)
            : data[0].services_offered;
          return Array.isArray(services) ? services : [];
        } catch (parseError) {
          console.warn('Error parsing services_offered:', parseError);
          return [];
        }
      }
      return [];
    } catch (error: any) {
      console.warn(
        `Error fetching user services for ${userId}:`,
        error?.message || error,
      );
      return [];
    }
  }

  // Profile updates
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> {
    try {
      // Try API first
      try {
        const response = await apiClient.updateProfile(userId, updates) as any;
        if (response?.profile) {
          return this.formatUserProfile(response.profile);
        }
      } catch (apiError) {
        // Fallback to direct database query
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", userId)
          .select(
            `
            *,
            marketplace_profiles(*),
            freelance_profiles(*),
            crypto_profiles(*)
          `,
          )
          .single();

        if (error) throw error;
        return this.formatUserProfile(data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async updateMarketplaceProfile(
    userId: string,
    updates: Partial<MarketplaceProfile>,
  ): Promise<MarketplaceProfile> {
    try {
      // First check if marketplace profile exists
      const { data: existing } = await supabase
        .from("marketplace_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      let result;
      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from("marketplace_profiles")
          .update(updates)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("marketplace_profiles")
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error("Error updating marketplace profile:", error);
      throw error;
    }
  }

  async updateFreelanceProfile(
    userId: string,
    updates: Partial<FreelanceProfile>,
  ): Promise<FreelanceProfile> {
    try {
      // First check if freelance profile exists
      const { data: existing } = await supabase
        .from("freelance_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      let result;
      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from("freelance_profiles")
          .update(updates)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("freelance_profiles")
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error("Error updating freelance profile:", error);
      throw error;
    }
  }

  async updateCryptoProfile(
    userId: string,
    updates: Partial<CryptoProfile>,
  ): Promise<CryptoProfile> {
    try {
      // First check if crypto profile exists
      const { data: existing } = await supabase
        .from("crypto_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      let result;
      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from("crypto_profiles")
          .update(updates)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("crypto_profiles")
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error("Error updating crypto profile:", error);
      throw error;
    }
  }

  // Mock user generation removed - using real API calls only
  // This method is kept for backward compatibility but returns null
  generateMockUser(identifier: string): MockUser | null {
    console.warn('Mock user generation disabled. Use real API calls instead.');
    return null;
  }

  // Helper methods for formatting
  private formatUserProfile(data: any): UserProfile {
    return {
      id: data.user_id || data.id,
      username: data.username,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      banner_url: data.banner_url,
      bio: data.bio,
      location: data.location,
      website: data.website,
      email: data.email,
      phone: data.phone,
      is_verified: data.is_verified,
      points: data.points,
      level: data.level,
      reputation: data.reputation,
      followers_count: data.followers_count,
      following_count: data.following_count,
      posts_count: data.posts_count,
      profile_visibility: data.profile_visibility,
      join_date: data.created_at,
      last_active: data.last_active,
      is_online: data.is_online,
      skills: data.skills || [],
      interests: data.interests || [],
      languages: data.languages || ["English"],
      marketplace_profile: data.marketplace_profiles?.[0],
      freelance_profile: data.freelance_profiles?.[0],
      crypto_profile: data.crypto_profiles?.[0],
      achievements: data.achievements || [],
      badges: data.badges || [],
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Legacy exports for backward compatibility
export const getUserByUsername = (username: string) =>
  profileService.getUserByUsername(username);
export const getFollowersCount = (userId: string) =>
  profileService.getFollowersCount(userId);
export const getFollowingCount = (userId: string) =>
  profileService.getFollowingCount(userId);
export const isFollowing = (followerId: string, followingId: string) =>
  profileService.isFollowing(followerId, followingId);
export const toggleFollow = (
  followerId: string,
  followingId: string,
  currentlyFollowing: boolean,
) => profileService.toggleFollow(followerId, followingId, currentlyFollowing);
export const getUserPosts = (userId: string) =>
  profileService.getUserPosts(userId);
export const getUserProducts = (userId: string) =>
  profileService.getUserProducts(userId);

// Additional legacy exports
export const fetchUserProfile = (userId: string) =>
  profileService.getUserById(userId);
export const getUserPointsAndLevel = async (userId: string) => {
  const profile = await profileService.getUserById(userId);
  return {
    points: profile?.points || 0,
    level: profile?.level || "bronze",
  };
};
export const updateUserProfile = (
  userId: string,
  profileData: Partial<UserProfile>,
) => profileService.updateProfile(userId, profileData);

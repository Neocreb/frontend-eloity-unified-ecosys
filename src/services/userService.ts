import { supabase } from "@/integrations/supabase/client";

// Generic type for database records
type DbRecord = {
  [key: string]: any;
};

export interface UserWithProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  name: string | null;
  avatar: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean | null;
  points: number | null;
  level: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile: DbRecord | null;
}

// Type assertion to bypass TypeScript errors for missing table types
const supabaseClient: any = supabase;

export class UserService {
  // Get user by ID (try users table first, then profiles table)
  static async getUserById(userId: string): Promise<UserWithProfile | null> {
    try {
      // First try to get from users table
      const usersResponse = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!usersResponse.error && usersResponse.data) {
        // Found in users table, now get profile if exists
        const profilesResponse = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Construct UserWithProfile object from user data
        const userData = usersResponse.data;
        return {
          id: userData.id,
          username: userData.username || null,
          full_name: userData.full_name || null,
          name: userData.full_name || null,
          avatar: userData.avatar_url || null,
          avatar_url: userData.avatar_url || null,
          bio: userData.bio || null,
          is_verified: userData.is_verified || false,
          points: userData.points || 0,
          level: userData.level || null,
          role: userData.role || null,
          created_at: userData.created_at || null,
          updated_at: userData.updated_at || null,
          profile: profilesResponse.data || null
        };
      }

      // If not found in users table, try profiles table
      const profilesResponse = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profilesResponse.error) {
        console.error("Error fetching user profile:", profilesResponse.error);
        return null;
      }

      // Construct UserWithProfile object from profile data
      const profileData = profilesResponse.data;
      return {
        id: profileData.user_id,
        username: profileData.username || null,
        full_name: profileData.full_name || null,
        name: profileData.name || null,
        avatar: profileData.avatar || null,
        avatar_url: profileData.avatar_url || null,
        bio: profileData.bio || null,
        is_verified: profileData.is_verified || false,
        points: profileData.points || 0,
        level: profileData.level || null,
        role: profileData.role || null,
        created_at: profileData.created_at || null,
        updated_at: profileData.updated_at || null,
        profile: profileData
      };
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  }

  // Get user by username (try users table first, then profiles table)
  static async getUserByUsername(username: string): Promise<UserWithProfile | null> {
    try {
      // First try to get from users table
      const usersResponse = await supabaseClient
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (!usersResponse.error && usersResponse.data) {
        // Found in users table, now get profile if exists
        const profilesResponse = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', usersResponse.data.id)
          .single();

        // Construct UserWithProfile object from user data
        const userData = usersResponse.data;
        return {
          id: userData.id,
          username: userData.username || null,
          full_name: userData.full_name || null,
          name: userData.full_name || null,
          avatar: userData.avatar_url || null,
          avatar_url: userData.avatar_url || null,
          bio: userData.bio || null,
          is_verified: userData.is_verified || false,
          points: userData.points || 0,
          level: userData.level || null,
          role: userData.role || null,
          created_at: userData.created_at || null,
          updated_at: userData.updated_at || null,
          profile: profilesResponse.data || null
        };
      }

      // If not found in users table, try profiles table
      const profilesResponse = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profilesResponse.error) {
        console.error("Error fetching user by username:", profilesResponse.error);
        return null;
      }

      // Construct UserWithProfile object from profile data
      const profileData = profilesResponse.data;
      return {
        id: profileData.user_id,
        username: profileData.username || null,
        full_name: profileData.full_name || null,
        name: profileData.name || null,
        avatar: profileData.avatar || null,
        avatar_url: profileData.avatar_url || null,
        bio: profileData.bio || null,
        is_verified: profileData.is_verified || false,
        points: profileData.points || 0,
        level: profileData.level || null,
        role: profileData.role || null,
        created_at: profileData.created_at || null,
        updated_at: profileData.updated_at || null,
        profile: profileData
      };
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return null;
    }
  }

  // Get user profile by user ID
  static async getUserProfile(userId: string): Promise<DbRecord | null> {
    try {
      const response = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (response.error) {
        console.error("Error fetching user profile:", response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: Partial<DbRecord>): Promise<DbRecord | null> {
    try {
      // First check if profile exists
      const checkResponse = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      let result;
      if (checkResponse.data) {
        // Update existing profile
        result = await supabaseClient
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new profile
        const insertData = {
          user_id: userId,
          ...profileData
        };
        result = await supabaseClient
          .from('profiles')
          .insert([insertData])
          .select()
          .single();
      }

      if (result.error) {
        console.error("Error updating user profile:", result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return null;
    }
  }

  // Create or update user in users table
  static async createOrUpdateUser(userData: Partial<DbRecord>): Promise<DbRecord | null> {
    try {
      if (!userData.email) {
        console.error("User email is required to create or update user");
        return null;
      }

      // First check if user exists by email
      const checkResponse = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      let result;
      if (checkResponse.data) {
        // Update existing user
        result = await supabaseClient
          .from('users')
          .update(userData)
          .eq('id', checkResponse.data.id)
          .select()
          .single();
      } else {
        // Create new user
        const insertData = {
          ...userData
        };
        result = await supabaseClient
          .from('users')
          .insert([insertData])
          .select()
          .single();
      }

      if (result.error) {
        console.error("Error creating or updating user:", result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error in createOrUpdateUser:", error);
      return null;
    }
  }

  // Get followers count
  static async getFollowersCount(userId: string): Promise<number> {
    try {
      const response = await supabaseClient
        .from('followers')
        .select('*', { count: 'exact' })
        .eq('following_id', userId);

      if (response.error) {
        console.error("Error fetching followers count:", response.error);
        return 0;
      }

      return response.count || 0;
    } catch (error) {
      console.error("Error in getFollowersCount:", error);
      return 0;
    }
  }

  // Get following count
  static async getFollowingCount(userId: string): Promise<number> {
    try {
      const response = await supabaseClient
        .from('followers')
        .select('*', { count: 'exact' })
        .eq('follower_id', userId);

      if (response.error) {
        console.error("Error fetching following count:", response.error);
        return 0;
      }

      return response.count || 0;
    } catch (error) {
      console.error("Error in getFollowingCount:", error);
      return 0;
    }
  }

  // Check if user is following another user
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await supabaseClient
        .from('followers')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (response.error) {
        console.error("Error checking follow status:", response.error);
        return false;
      }

      return !!response.data;
    } catch (error) {
      console.error("Error in isFollowing:", error);
      return false;
    }
  }

  // Follow a user
  static async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Check if already following
      const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
      if (isAlreadyFollowing) {
        return true;
      }

      const response = await supabaseClient
        .from('followers')
        .insert([{
          follower_id: followerId,
          following_id: followingId,
        }]);

      if (response.error) {
        console.error("Error following user:", response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in followUser:", error);
      return false;
    }
  }

  // Unfollow a user
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const response = await supabaseClient
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (response.error) {
        console.error("Error unfollowing user:", response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in unfollowUser:", error);
      return false;
    }
  }

  // Get user's followers
  static async getUserFollowers(userId: string, limit = 20, offset = 0): Promise<UserWithProfile[]> {
    try {
      const response = await supabaseClient
        .from('followers')
        .select('follower_id')
        .eq('following_id', userId)
        .range(offset, offset + limit - 1);

      if (response.error) {
        console.error("Error fetching user followers:", response.error);
        return [];
      }

      // For now, return empty array since we don't have the full profile data
      return [];
    } catch (error) {
      console.error("Error in getUserFollowers:", error);
      return [];
    }
  }

  // Get user's following
  static async getUserFollowing(userId: string, limit = 20, offset = 0): Promise<UserWithProfile[]> {
    try {
      const response = await supabaseClient
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1);

      if (response.error) {
        console.error("Error fetching user following:", response.error);
        return [];
      }

      // For now, return empty array since we don't have the full profile data
      return [];
    } catch (error) {
      console.error("Error in getUserFollowing:", error);
      return [];
    }
  }

  // Search users
  static async searchUsers(query: string, limit = 20): Promise<UserWithProfile[]> {
    try {
      // Search in users table first
      const usersResponse = await supabaseClient
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit);

      if (!usersResponse.error && usersResponse.data && usersResponse.data.length > 0) {
        // Found users in users table
        return usersResponse.data.map((user: any) => ({
          id: user.id,
          username: user.username || null,
          full_name: user.full_name || null,
          name: user.full_name || null,
          avatar: user.avatar_url || null,
          avatar_url: user.avatar_url || null,
          bio: user.bio || null,
          is_verified: user.is_verified || false,
          points: user.points || 0,
          level: user.level || null,
          role: user.role || null,
          created_at: user.created_at || null,
          updated_at: user.updated_at || null,
          profile: null
        }));
      }

      // If not found in users table, search in profiles table
      const profilesResponse = await supabaseClient
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit);

      if (profilesResponse.error) {
        console.error("Error searching users:", profilesResponse.error);
        return [];
      }

      return profilesResponse.data.map((profile: any) => ({
        id: profile.user_id,
        username: profile.username || null,
        full_name: profile.full_name || null,
        name: profile.name || null,
        avatar: profile.avatar || null,
        avatar_url: profile.avatar_url || null,
        bio: profile.bio || null,
        is_verified: profile.is_verified || false,
        points: profile.points || 0,
        level: profile.level || null,
        role: profile.role || null,
        created_at: profile.created_at || null,
        updated_at: profile.updated_at || null,
        profile: profile
      }));
    } catch (error) {
      console.error("Error in searchUsers:", error);
      return [];
    }
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isFollowing: boolean;
  } | null> {
    try {
      // Get followers count
      const followersCount = await this.getFollowersCount(userId);
      
      // Get following count
      const followingCount = await this.getFollowingCount(userId);
      
      // Get posts count (assuming there's a posts table)
      const postsResponse = await supabaseClient
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);
      
      if (postsResponse.error) {
        console.error("Error fetching posts count:", postsResponse.error);
      }

      return {
        followersCount,
        followingCount,
        postsCount: postsResponse.count || 0,
        isFollowing: false // This would need to be set based on current user context
      };
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return null;
    }
  }
}
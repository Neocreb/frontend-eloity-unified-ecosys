import { supabase } from "@/lib/supabase/client";
import {
  UserProfile,
  ExtendedUser,
  MockUser,
  MarketplaceProfile,
  FreelanceProfile,
  CryptoProfile,
} from "@/types/user";
import { mockUsers, searchMockUsers } from "@/data/mockUsers";

// Enhanced profile service with comprehensive profile management
export class ProfileService {
  // Basic profile operations
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      // First check if it's a predefined mock user
      if (mockUsers[username]) {
        console.log(`Using predefined mock user: ${username}`);
        return mockUsers[username].profile!;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          marketplace_profiles(*),
          freelance_profiles(*),
          crypto_profiles(*)
        `,
        )
        .eq("username", username)
        .single();

      if (error) {
        console.warn(
          "User not found in database, checking mock users or generating new mock user",
        );

        // Search in mock users by partial match
        const mockSearchResults = searchMockUsers(username);
        if (mockSearchResults.length > 0) {
          return mockSearchResults[0].profile!;
        }

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
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          marketplace_profiles(*),
          freelance_profiles(*),
          crypto_profiles(*)
        `,
        )
        .eq("user_id", userId)
        .single();

      if (error) {
        console.warn("User not found in database, generating mock user");
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
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) {
        console.warn(
          `Followers table query failed: ${error.message}. Using mock data.`,
        );
        return Math.floor(Math.random() * 1000) + 100;
      }
      return count || 0;
    } catch (error: any) {
      console.warn("Error fetching followers count:", error?.message || error);
      return Math.floor(Math.random() * 1000) + 100; // Return mock data on error
    }
  }

  async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      if (error) {
        console.warn(
          `Following table query failed: ${error.message}. Using mock data.`,
        );
        return Math.floor(Math.random() * 500) + 50;
      }
      return count || 0;
    } catch (error: any) {
      console.warn("Error fetching following count:", error?.message || error);
      return Math.floor(Math.random() * 500) + 50; // Return mock data on error
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
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
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", followerId)
          .eq("following_id", followingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("followers")
          .insert({ follower_id: followerId, following_id: followingId });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error toggling follow status:", error?.message || error);
      throw error;
    }
  }

  // Content fetching
  async getUserPosts(userId: string) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id(*)
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          `Posts table query failed: ${error.message}. This is expected if the posts table doesn't exist yet.`,
        );
        return null;
      }
      return data;
    } catch (error: any) {
      console.warn(
        `Error fetching user posts for ${userId}:`,
        error?.message || error,
      );
      // Return empty array instead of null to avoid further errors
      return [];
    }
  }

  async getUserProducts(userId: string) {
    try {
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
        return null;
      }
      return data;
    } catch (error: any) {
      console.warn(
        `Error fetching user products for ${userId}:`,
        error?.message || error,
      );
      // Return empty array instead of null to avoid further errors
      return [];
    }
  }

  async getUserServices(userId: string) {
    try {
      const { data, error } = await supabase
        .from("freelance_services")
        .select(
          `
          *,
          profiles:freelancer_id(*)
        `,
        )
        .eq("freelancer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          `Freelance services table query failed: ${error.message}. This is expected if the freelance_services table doesn't exist yet.`,
        );
        return null;
      }
      return data;
    } catch (error: any) {
      console.warn(
        `Error fetching user services for ${userId}:`,
        error?.message || error,
      );
      // Return empty array instead of null to avoid further errors
      return [];
    }
  }

  // Profile updates
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> {
    try {
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

  // Mock user generation for demonstration
  generateMockUser(identifier: string): MockUser {
    // First check if it's a predefined mock user
    if (mockUsers[identifier]) {
      console.log(`Using predefined mock user: ${identifier}`);
      return mockUsers[identifier];
    }

    // Generate a new mock user
    const mockUserId = `mock-${identifier}-${Date.now()}`;
    const displayName =
      identifier.charAt(0).toUpperCase() +
      identifier.slice(1).replace(/[_-]/g, " ");

    // Generate random user characteristics
    const userTypes = ["seller", "freelancer", "trader", "creator", "business"];
    const userType = userTypes[Math.floor(Math.random() * userTypes.length)];

    const baseProfile: UserProfile = {
      id: mockUserId,
      username: identifier,
      full_name: displayName,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=256`,
      banner_url: `https://source.unsplash.com/1200x400/?${userType},technology`,
      bio: this.generateBio(userType),
      location: this.getRandomLocation(),
      website: `https://${identifier}.dev`,
      is_verified: Math.random() > 0.6,
      points: Math.floor(Math.random() * 10000) + 500,
      level: this.getRandomLevel(),
      reputation: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      followers_count: Math.floor(Math.random() * 5000) + 100,
      following_count: Math.floor(Math.random() * 1000) + 50,
      posts_count: Math.floor(Math.random() * 200) + 10,
      profile_views: Math.floor(Math.random() * 50000) + 1000,
      join_date: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      last_active: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000,
      ).toISOString(),
      is_online: Math.random() > 0.5,
      profile_visibility: "public",
      skills: this.getRandomSkills(userType),
      interests: this.getRandomInterests(),
      languages: ["English"],
      achievements: this.generateAchievements(userType),
      badges: this.generateBadges(userType),
    };

    // Add role-specific profiles
    if (userType === "seller" || Math.random() > 0.7) {
      baseProfile.marketplace_profile =
        this.generateMarketplaceProfile(mockUserId);
    }

    if (userType === "freelancer" || Math.random() > 0.8) {
      baseProfile.freelance_profile = this.generateFreelanceProfile(mockUserId);
    }

    if (userType === "trader" || Math.random() > 0.6) {
      baseProfile.crypto_profile = this.generateCryptoProfile(mockUserId);
    }

    const mockUser: MockUser = {
      id: mockUserId,
      email: `${identifier}@example.com`,
      name: displayName,
      avatar: baseProfile.avatar_url!,
      points: baseProfile.points!,
      level: baseProfile.level!,
      role: "user",
      created_at: baseProfile.join_date!,
      user_metadata: {
        name: displayName,
        avatar: baseProfile.avatar_url!,
      },
      profile: baseProfile,
      app_metadata: {},
      aud: "authenticated",
      username: () => identifier,
      mock_data: {
        posts: this.generateMockPosts(baseProfile),
        products: this.generateMockProducts(baseProfile),
        services: this.generateMockServices(baseProfile),
        trades: this.generateMockTrades(baseProfile),
        reviews: this.generateMockReviews(baseProfile),
        followers: [],
        following: [],
      },
    } as MockUser;

    return mockUser;
  }

  // Helper methods for formatting and mock data generation
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

  private generateBio(userType: string): string {
    const bios = {
      seller:
        "Passionate entrepreneur building amazing products for the community. Quality and customer satisfaction are my top priorities! 🛍️✨",
      freelancer:
        "Full-stack developer & designer with 5+ years of experience. I bring ideas to life through clean code and beautiful designs. 💻🎨",
      trader:
        "Crypto enthusiast and experienced trader. Always learning about blockchain technology and market trends. 📈₿",
      creator:
        "Content creator sharing insights about technology, lifestyle, and personal growth. Let's connect and grow together! 🚀📱",
      business:
        "Official business account. We're committed to innovation and excellence in everything we do. Building the future, one solution at a time. 🏢🌟",
    };
    return bios[userType as keyof typeof bios] || bios.creator;
  }

  private getRandomLocation(): string {
    const locations = [
      "San Francisco, CA",
      "New York, NY",
      "London, UK",
      "Berlin, Germany",
      "Tokyo, Japan",
      "Sydney, Australia",
      "Toronto, Canada",
      "Amsterdam, Netherlands",
      "Singapore",
      "Paris, France",
      "Barcelona, Spain",
      "Los Angeles, CA",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private getRandomLevel(): string {
    const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
    const weights = [0.3, 0.35, 0.2, 0.1, 0.05]; // Bronze most common, diamond rarest
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return levels[i];
    }
    return "bronze";
  }

  private getRandomSkills(userType: string): string[] {
    const skillSets = {
      seller: [
        "E-commerce",
        "Product Photography",
        "Customer Service",
        "Marketing",
        "Inventory Management",
      ],
      freelancer: [
        "JavaScript",
        "React",
        "Node.js",
        "Python",
        "UI/UX Design",
        "Project Management",
      ],
      trader: [
        "Technical Analysis",
        "Risk Management",
        "Portfolio Management",
        "Market Research",
        "Cryptocurrency",
      ],
      creator: [
        "Content Creation",
        "Social Media",
        "Photography",
        "Video Editing",
        "Community Building",
      ],
      business: [
        "Leadership",
        "Strategy",
        "Operations",
        "Finance",
        "Team Management",
      ],
    };
    const skills =
      skillSets[userType as keyof typeof skillSets] || skillSets.creator;
    return skills.slice(0, Math.floor(Math.random() * 3) + 3);
  }

  private getRandomInterests(): string[] {
    const interests = [
      "Technology",
      "Travel",
      "Photography",
      "Music",
      "Sports",
      "Cooking",
      "Reading",
      "Gaming",
      "Art",
      "Fitness",
      "Nature",
      "Movies",
      "Fashion",
      "Science",
      "History",
      "Language Learning",
      "Entrepreneurship",
    ];
    return interests
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 3);
  }

  private generateAchievements(userType: string): any[] {
    return [
      {
        id: "early_adopter",
        name: "Early Adopter",
        description: "Joined in the first month",
        icon: "🚀",
        category: "milestone",
        rarity: "rare",
        earned_at: new Date(
          Date.now() - 100 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "verified_user",
        name: "Verified User",
        description: "Completed profile verification",
        icon: "✅",
        category: "verification",
        rarity: "common",
        earned_at: new Date(
          Date.now() - 80 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
  }

  private generateBadges(userType: string): any[] {
    return [
      {
        id: "trusted_member",
        name: "Trusted Member",
        description: "Maintained excellent reputation",
        icon: "🛡️",
        color: "blue",
        earned_at: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        type: "achievement",
      },
    ];
  }

  private generateMarketplaceProfile(userId: string): MarketplaceProfile {
    const storeNames = [
      "Tech Haven",
      "Digital Marketplace",
      "Quality Goods Co.",
      "Innovative Solutions",
    ];
    return {
      seller_id: userId,
      store_name: storeNames[Math.floor(Math.random() * storeNames.length)],
      store_description:
        "We provide high-quality products with excellent customer service.",
      business_type: Math.random() > 0.5 ? "business" : "individual",
      store_rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      total_sales: Math.floor(Math.random() * 1000) + 50,
      total_orders: Math.floor(Math.random() * 500) + 25,
      response_rate: Math.round((Math.random() * 0.2 + 0.8) * 100),
      response_time: "< 2 hours",
      is_store_active: true,
      seller_level: "gold",
      store_categories: ["Electronics", "Accessories"],
    };
  }

  private generateFreelanceProfile(userId: string): FreelanceProfile {
    return {
      freelancer_id: userId,
      professional_title: "Full Stack Developer",
      hourly_rate: Math.floor(Math.random() * 100) + 25,
      availability: "available",
      experience_level: "intermediate",
      years_experience: Math.floor(Math.random() * 10) + 2,
      completed_projects: Math.floor(Math.random() * 50) + 10,
      client_satisfaction: Math.round((Math.random() * 0.3 + 0.7) * 100),
      freelance_rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      is_available_for_hire: true,
      specializations: ["Web Development", "Mobile Apps"],
      services_offered: [],
    };
  }

  private generateCryptoProfile(userId: string): CryptoProfile {
    return {
      crypto_user_id: userId,
      trading_experience: "intermediate",
      risk_tolerance: "medium",
      preferred_trading_pairs: ["BTC/USD", "ETH/USD"],
      total_trades: Math.floor(Math.random() * 100) + 20,
      successful_trades: Math.floor(Math.random() * 80) + 15,
      p2p_trading_enabled: true,
      p2p_rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      kyc_level: Math.floor(Math.random() * 3) + 1,
      two_factor_enabled: true,
    };
  }

  private generateMockPosts(profile: UserProfile): any[] {
    return [
      {
        id: "1",
        content:
          "Just launched my new product line! Really excited about the feedback so far 🚀",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 100) + 10,
        comments: Math.floor(Math.random() * 20) + 2,
      },
    ];
  }

  private generateMockProducts(profile: UserProfile): any[] {
    if (!profile.marketplace_profile) return [];
    return [
      {
        id: "1",
        name: "Premium Wireless Headphones",
        price: 199.99,
        image: "https://source.unsplash.com/400x400/?headphones",
        rating: 4.8,
        category: "Electronics",
      },
    ];
  }

  private generateMockServices(profile: UserProfile): any[] {
    if (!profile.freelance_profile) return [];
    return [
      {
        id: "1",
        title: "Full Stack Web Development",
        description:
          "Complete web application development from design to deployment",
        price_range: { min: 500, max: 5000 },
        delivery_time: 14,
      },
    ];
  }

  private generateMockTrades(profile: UserProfile): any[] {
    if (!profile.crypto_profile) return [];
    return [
      {
        id: "1",
        pair: "BTC/USD",
        amount: 0.1,
        price: 45000,
        type: "buy",
        status: "completed",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  private generateMockReviews(profile: UserProfile): any[] {
    return [
      {
        id: "1",
        rating: 5,
        comment: "Excellent service and quality products!",
        reviewer_name: "Happy Customer",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
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

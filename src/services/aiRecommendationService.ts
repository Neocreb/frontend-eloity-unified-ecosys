// @ts-nocheck
import { Post } from "@/types/post";
import { Video } from "@/types/video";
import { Product } from "@/types/marketplace";
import { BlogPost } from "@/types/blog";

export interface UserPreferences {
  categories: string[];
  interactions: string[];
  viewHistory: string[];
  searchHistory: string[];
  engagementPatterns: {
    timeOfDay: string[];
    contentTypes: string[];
    creators: string[];
  };
}

export interface RecommendationScore {
  id: string;
  score: number;
  reasons: string[];
  category: string;
}

export interface ContentRecommendations {
  posts: Post[];
  videos: Video[];
  products: Product[];
  blogs: BlogPost[];
  creators: any[];
  trending: any[];
}

// Mock AI recommendation engine
class AIRecommendationService {
  private userPreferences: Map<string, UserPreferences> = new Map();

  // Analyze user behavior and generate preferences
  analyzeUserBehavior(userId: string, interactions: any[]): UserPreferences {
    const existing = this.userPreferences.get(userId) || {
      categories: [],
      interactions: [],
      viewHistory: [],
      searchHistory: [],
      engagementPatterns: {
        timeOfDay: [],
        contentTypes: [],
        creators: [],
      },
    };

    // Extract patterns from interactions
    const categories = interactions
      .filter((i) => i.type === "view" || i.type === "like")
      .map((i) => i.category)
      .filter(Boolean);

    const contentTypes = interactions.map((i) => i.contentType).filter(Boolean);

    const creators = interactions
      .filter((i) => i.type === "follow" || i.type === "like")
      .map((i) => i.creatorId)
      .filter(Boolean);

    const updated: UserPreferences = {
      categories: [...new Set([...existing.categories, ...categories])],
      interactions: [
        ...existing.interactions,
        ...interactions.map((i) => i.type),
      ],
      viewHistory: [
        ...existing.viewHistory,
        ...interactions
          .filter((i) => i.type === "view")
          .map((i) => i.contentId),
      ],
      searchHistory: existing.searchHistory,
      engagementPatterns: {
        timeOfDay: existing.engagementPatterns.timeOfDay,
        contentTypes: [
          ...new Set([
            ...existing.engagementPatterns.contentTypes,
            ...contentTypes,
          ]),
        ],
        creators: [
          ...new Set([...existing.engagementPatterns.creators, ...creators]),
        ],
      },
    };

    this.userPreferences.set(userId, updated);
    return updated;
  }

  // Calculate content relevance score
  calculateRelevanceScore(content: any, preferences: UserPreferences): number {
    let score = 0;

    // Category matching
    if (content.category && preferences.categories.includes(content.category)) {
      score += 30;
    }

    // Creator preference
    if (
      content.author?.id &&
      preferences.engagementPatterns.creators.includes(content.author.id)
    ) {
      score += 25;
    }

    // Content type preference
    if (
      content.type &&
      preferences.engagementPatterns.contentTypes.includes(content.type)
    ) {
      score += 20;
    }

    // Engagement signals
    if (content.likes > 100) score += 10;
    if (content.comments > 50) score += 10;
    if (content.shares > 10) score += 5;

    // Recency boost
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(content.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceCreated < 1) score += 15;
    else if (daysSinceCreated < 7) score += 10;
    else if (daysSinceCreated < 30) score += 5;

    return Math.min(score, 100);
  }

  // Get personalized post recommendations
  async getPersonalizedPosts(
    userId: string,
    availablePosts: Post[],
  ): Promise<Post[]> {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) {
      // Return trending posts for new users
      return availablePosts
        .map((post, index) => ({
          ...post,
          id: post.id || `post-${index}-${Date.now()}`,
        }))
        .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
        .slice(0, 10);
    }

    const scoredPosts = availablePosts
      .map((post, index) => ({
        ...post,
        id: post.id || `post-${index}-${Date.now()}`, // Ensure unique ID
        aiScore: this.calculateRelevanceScore(post, preferences),
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 15);

    return scoredPosts;
  }

  // Get personalized video recommendations
  async getPersonalizedVideos(
    userId: string,
    availableVideos: Video[],
  ): Promise<Video[]> {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) {
      return availableVideos
        .map((video, index) => ({
          ...video,
          id: video.id || `video-${index}-${Date.now()}`,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    }

    const scoredVideos = availableVideos
      .map((video, index) => ({
        ...video,
        id: video.id || `video-${index}-${Date.now()}`, // Ensure unique ID
        aiScore: this.calculateRelevanceScore(video, preferences),
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 12);

    return scoredVideos;
  }

  // Get personalized product recommendations
  async getPersonalizedProducts(
    userId: string,
    availableProducts: any[],
  ): Promise<any[]> {
    const preferences = this.userPreferences.get(userId);
    if (!preferences) {
      return availableProducts
        .map((product, index) => ({
          ...product,
          id: product.id || `product-${index}-${Date.now()}`,
        }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
    }

    const scoredProducts = availableProducts
      .map((product, index) => ({
        ...product,
        id: product.id || `product-${index}-${Date.now()}`, // Ensure unique ID
        aiScore: this.calculateRelevanceScore(product, preferences),
      }))
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 10);

    return scoredProducts;
  }

  // Get trending content across categories
  async getTrendingContent(): Promise<any[]> {
    // Mock trending algorithm
    return [
      {
        id: "trend-1",
        title: "AI Revolution in Social Media",
        type: "article",
        category: "technology",
        engagement: 1250,
        trendScore: 95,
      },
      {
        id: "trend-2",
        title: "Crypto Market Analysis",
        type: "video",
        category: "finance",
        engagement: 890,
        trendScore: 87,
      },
      {
        id: "trend-3",
        title: "Remote Work Best Practices",
        type: "post",
        category: "business",
        engagement: 650,
        trendScore: 82,
      },
    ];
  }

  // Get content recommendations based on current context
  async getContextualRecommendations(
    userId: string,
    currentContent: any,
    contentType: "posts" | "videos" | "products" | "blogs",
  ): Promise<any[]> {
    const preferences = this.userPreferences.get(userId);

    // Mock contextual recommendations based on current content
    const recommendations = [
      {
        id: "rec-1",
        title: `More like "${currentContent.title}"`,
        reason: "Similar content",
        relevanceScore: 92,
      },
      {
        id: "rec-2",
        title: "Trending in your interests",
        reason: "Based on your activity",
        relevanceScore: 88,
      },
      {
        id: "rec-3",
        title: "Popular with similar users",
        reason: "Collaborative filtering",
        relevanceScore: 85,
      },
    ];

    return recommendations;
  }

  // Update user preferences based on interaction
  trackInteraction(
    userId: string,
    interaction: {
      type: "view" | "like" | "share" | "comment" | "follow";
      contentId: string;
      contentType: string;
      category?: string;
      creatorId?: string;
      timestamp: Date;
    },
  ): void {
    const preferences = this.userPreferences.get(userId) || {
      categories: [],
      interactions: [],
      viewHistory: [],
      searchHistory: [],
      engagementPatterns: {
        timeOfDay: [],
        contentTypes: [],
        creators: [],
      },
    };

    // Update interaction history
    preferences.interactions.push(interaction.type);

    if (interaction.type === "view") {
      preferences.viewHistory.push(interaction.contentId);
    }

    if (interaction.category) {
      preferences.categories.push(interaction.category);
    }

    if (interaction.creatorId) {
      preferences.engagementPatterns.creators.push(interaction.creatorId);
    }

    preferences.engagementPatterns.contentTypes.push(interaction.contentType);

    // Keep only recent data (last 1000 interactions)
    preferences.interactions = preferences.interactions.slice(-1000);
    preferences.viewHistory = preferences.viewHistory.slice(-1000);

    this.userPreferences.set(userId, preferences);
  }

  // Get smart feed algorithm
  async getSmartFeed(userId: string, availableContent: any[]): Promise<any[]> {
    const preferences = this.userPreferences.get(userId);

    if (!preferences) {
      // New user - show trending and diverse content
      return this.getNewUserFeed(availableContent);
    }

    // Experienced user - personalized feed
    const personalizedContent = availableContent
      .map((content, index) => ({
        ...content,
        id: content.id || `generated-${index}-${Date.now()}`, // Ensure unique ID
        aiScore: this.calculateRelevanceScore(content, preferences),
        reason: this.getRecommendationReason(content, preferences),
      }))
      .sort((a, b) => b.aiScore - a.aiScore);

    // Mix personalized with some trending content (80/20 split)
    const personalizedPortion = personalizedContent.slice(
      0,
      Math.floor(personalizedContent.length * 0.8),
    );
    const trendingPortion = availableContent
      .filter((content) => !personalizedPortion.includes(content))
      .sort(
        (a, b) =>
          b.likes + b.comments + b.shares - (a.likes + a.comments + a.shares),
      )
      .slice(0, Math.floor(personalizedContent.length * 0.2));

    return [...personalizedPortion, ...trendingPortion];
  }

  private getNewUserFeed(availableContent: any[]): any[] {
    // Show diverse, high-quality content to new users
    const categories = [
      ...new Set(availableContent.map((c) => c.category).filter(Boolean)),
    ];
    const diverseFeed: any[] = [];

    categories.forEach((category) => {
      const categoryContent = availableContent
        .filter((c) => c.category === category)
        .map((content, index) => ({
          ...content,
          id: content.id || `new-user-${category}-${index}-${Date.now()}`,
        }))
        .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
        .slice(0, 2);

      diverseFeed.push(...categoryContent);
    });

    return diverseFeed.slice(0, 20);
  }

  private getRecommendationReason(
    content: any,
    preferences: UserPreferences,
  ): string {
    if (content.category && preferences.categories.includes(content.category)) {
      return `Popular in ${content.category}`;
    }
    if (
      content.author?.id &&
      preferences.engagementPatterns.creators.includes(content.author.id)
    ) {
      return `From ${content.author.name}`;
    }
    if (content.likes > 100) {
      return "Trending now";
    }
    return "Recommended for you";
  }
}

export const aiRecommendationService = new AIRecommendationService();

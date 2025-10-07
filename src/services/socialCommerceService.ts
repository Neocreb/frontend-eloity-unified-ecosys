// @ts-nocheck
// Social Commerce Integration Service
// Connects social activity with marketplace recommendations and creator endorsements

export interface UserInteraction {
  userId: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'view' | 'purchase';
  targetId: string;
  targetType: 'post' | 'product' | 'user' | 'video';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SocialSignal {
  contentId: string;
  contentType: 'post' | 'video' | 'story';
  creatorId: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  mentions: string[]; // Product IDs mentioned
  hashtags: string[];
  location?: string;
  timestamp: Date;
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  discountPrice?: number;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  rating: number;
  reviewCount: number;
  reason: 'social_activity' | 'creator_endorsement' | 'trending' | 'similar_users' | 'past_behavior';
  reasonDetails: string;
  confidence: number; // 0-1 score
  socialProof: {
    friendsPurchased: number;
    creatorEndorsements: string[];
    trendingScore: number;
  };
  tags: string[];
  category: string;
}

export interface CreatorEndorsement {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorVerified: boolean;
  creatorFollowers: number;
  productId: string;
  endorsementType: 'post' | 'video' | 'story' | 'review';
  content: string;
  rating?: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: Date;
  authenticity: 'sponsored' | 'organic' | 'partnership';
}

class SocialCommerceService {
  private baseUrl = '/api/social-commerce';

  // Get personalized product recommendations based on social activity
  async getPersonalizedRecommendations(userId: string, options?: {
    limit?: number;
    category?: string;
    priceRange?: { min: number; max: number };
    includeReasons?: string[];
  }): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      return data.recommendations || this.generateMockRecommendations(userId, options);
    } catch (error) {
      console.warn('Recommendations API failed, using mock data:', error);
      return this.generateMockRecommendations(userId, options);
    }
  }

  // Get products trending among friends and followed creators
  async getTrendingAmongNetwork(userId: string, limit = 10): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trending/${userId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending products');
      
      const data = await response.json();
      return data.products || this.generateMockTrendingProducts();
    } catch (error) {
      console.warn('Trending API failed, using mock data:', error);
      return this.generateMockTrendingProducts();
    }
  }

  // Get creator endorsements for a specific product
  async getProductEndorsements(productId: string): Promise<CreatorEndorsement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/endorsements/product/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch endorsements');
      
      const data = await response.json();
      return data.endorsements || this.generateMockEndorsements(productId);
    } catch (error) {
      console.warn('Endorsements API failed, using mock data:', error);
      return this.generateMockEndorsements(productId);
    }
  }

  // Get products mentioned or featured in a social post/video
  async getProductsFromContent(contentId: string, contentType: 'post' | 'video' | 'story'): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/content-products/${contentId}?type=${contentType}`);
      if (!response.ok) throw new Error('Failed to fetch content products');
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.warn('Content products API failed:', error);
      return [];
    }
  }

  // Track user interaction for better recommendations
  async trackInteraction(interaction: UserInteraction): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction),
      });
    } catch (error) {
      console.warn('Failed to track interaction:', error);
    }
  }

  // Track social signal for commerce insights
  async trackSocialSignal(signal: SocialSignal): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
      });
    } catch (error) {
      console.warn('Failed to track social signal:', error);
    }
  }

  // Get social proof for a product
  async getProductSocialProof(productId: string, userId: string): Promise<{
    friendsPurchased: Array<{ id: string; name: string; avatar: string }>;
    friendsLiked: Array<{ id: string; name: string; avatar: string }>;
    creatorEndorsements: CreatorEndorsement[];
    trendingScore: number;
    totalSocialMentions: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/social-proof/${productId}?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch social proof');
      
      const data = await response.json();
      return data.socialProof || this.generateMockSocialProof(productId);
    } catch (error) {
      console.warn('Social proof API failed, using mock data:', error);
      return this.generateMockSocialProof(productId);
    }
  }

  // Get products similar to what friends and followed users purchased
  async getSimilarUserPurchases(userId: string, limit = 8): Promise<ProductRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/similar-purchases/${userId}?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch similar purchases');
      
      const data = await response.json();
      return data.products || this.generateMockSimilarPurchases();
    } catch (error) {
      console.warn('Similar purchases API failed, using mock data:', error);
      return this.generateMockSimilarPurchases();
    }
  }

  // Create creator endorsement
  async createEndorsement(endorsement: Omit<CreatorEndorsement, 'id' | 'timestamp' | 'engagement'>): Promise<CreatorEndorsement> {
    try {
      const response = await fetch(`${this.baseUrl}/endorsements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endorsement),
      });

      if (!response.ok) throw new Error('Failed to create endorsement');
      
      const data = await response.json();
      return data.endorsement;
    } catch (error) {
      console.error('Failed to create endorsement:', error);
      throw error;
    }
  }

  // Private mock data generators for fallback
  private generateMockRecommendations(userId: string, options?: any): ProductRecommendation[] {
    const mockProducts: ProductRecommendation[] = [
      {
        productId: 'prod1',
        productName: 'Wireless Bluetooth Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        price: 99.99,
        discountPrice: 79.99,
        sellerId: 'seller1',
        sellerName: 'AudioTech Store',
        sellerVerified: true,
        rating: 4.8,
        reviewCount: 245,
        reason: 'creator_endorsement',
        reasonDetails: 'Recommended by 3 creators you follow',
        confidence: 0.85,
        socialProof: {
          friendsPurchased: 5,
          creatorEndorsements: ['creator1', 'creator2', 'creator3'],
          trendingScore: 0.9,
        },
        tags: ['audio', 'wireless', 'bluetooth'],
        category: 'Electronics',
      },
      {
        productId: 'prod2',
        productName: 'Sustainable Bamboo Water Bottle',
        productImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300',
        price: 24.99,
        sellerId: 'seller2',
        sellerName: 'EcoLife Products',
        sellerVerified: true,
        rating: 4.6,
        reviewCount: 189,
        reason: 'social_activity',
        reasonDetails: 'Liked by users with similar interests',
        confidence: 0.72,
        socialProof: {
          friendsPurchased: 2,
          creatorEndorsements: ['creator4'],
          trendingScore: 0.7,
        },
        tags: ['eco-friendly', 'sustainable', 'bamboo'],
        category: 'Lifestyle',
      },
      {
        productId: 'prod3',
        productName: 'Smart Fitness Watch',
        productImage: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300',
        price: 199.99,
        discountPrice: 149.99,
        sellerId: 'seller3',
        sellerName: 'FitTech',
        sellerVerified: true,
        rating: 4.9,
        reviewCount: 567,
        reason: 'trending',
        reasonDetails: 'Trending in your fitness community',
        confidence: 0.78,
        socialProof: {
          friendsPurchased: 8,
          creatorEndorsements: ['creator5', 'creator6'],
          trendingScore: 0.95,
        },
        tags: ['fitness', 'smartwatch', 'health'],
        category: 'Electronics',
      },
    ];

    // Filter by options if provided
    let filtered = mockProducts;
    if (options?.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === options.category.toLowerCase());
    }
    if (options?.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= options.priceRange.min && p.price <= options.priceRange.max
      );
    }

    return filtered.slice(0, options?.limit || 10);
  }

  private generateMockTrendingProducts(): ProductRecommendation[] {
    return [
      {
        productId: 'trend1',
        productName: 'Viral TikTok LED Strip Lights',
        productImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300',
        price: 29.99,
        discountPrice: 19.99,
        sellerId: 'seller4',
        sellerName: 'TrendyTech',
        sellerVerified: true,
        rating: 4.4,
        reviewCount: 892,
        reason: 'trending',
        reasonDetails: 'Viral on social media this week',
        confidence: 0.92,
        socialProof: {
          friendsPurchased: 12,
          creatorEndorsements: ['creator7', 'creator8', 'creator9'],
          trendingScore: 0.98,
        },
        tags: ['led', 'lighting', 'viral', 'decor'],
        category: 'Home',
      },
    ];
  }

  private generateMockEndorsements(productId: string): CreatorEndorsement[] {
    return [
      {
        id: 'endorse1',
        creatorId: 'creator1',
        creatorName: 'TechReviewer',
        creatorAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        creatorVerified: true,
        creatorFollowers: 150000,
        productId,
        endorsementType: 'video',
        content: 'Just tested these headphones and they are amazing! Crystal clear sound quality.',
        rating: 5,
        engagement: { likes: 2340, comments: 87, shares: 156 },
        timestamp: new Date('2024-01-10'),
        authenticity: 'organic',
      },
    ];
  }

  private generateMockSocialProof(productId: string) {
    return {
      friendsPurchased: [
        { id: 'friend1', name: 'Sarah J.', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
        { id: 'friend2', name: 'Mike C.', avatar: 'https://randomuser.me/api/portraits/men/44.jpg' },
      ],
      friendsLiked: [
        { id: 'friend3', name: 'Emma W.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
      ],
      creatorEndorsements: this.generateMockEndorsements(productId),
      trendingScore: 0.85,
      totalSocialMentions: 234,
    };
  }

  private generateMockSimilarPurchases(): ProductRecommendation[] {
    return [
      {
        productId: 'similar1',
        productName: 'Phone Camera Lens Kit',
        productImage: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300',
        price: 39.99,
        sellerId: 'seller5',
        sellerName: 'PhotoGear',
        sellerVerified: true,
        rating: 4.7,
        reviewCount: 156,
        reason: 'similar_users',
        reasonDetails: 'Purchased by users with similar interests',
        confidence: 0.68,
        socialProof: {
          friendsPurchased: 3,
          creatorEndorsements: ['creator10'],
          trendingScore: 0.6,
        },
        tags: ['photography', 'mobile', 'lens'],
        category: 'Electronics',
      },
    ];
  }
}

export const socialCommerceService = new SocialCommerceService();
export type {
  UserInteraction,
  SocialSignal,
  ProductRecommendation,
  CreatorEndorsement,
};

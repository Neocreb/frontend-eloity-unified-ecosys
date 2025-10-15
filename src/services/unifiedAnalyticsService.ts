// Note: Import actual services here when connecting to real APIs
// import { socialCommerceService } from './socialCommerceService';
// import { globalSearchService } from './globalSearchService';
import { supabase } from "@/integrations/supabase/client";

// Unified Analytics Data Types
export interface PlatformMetrics {
  social: SocialMediaMetrics;
  ecommerce: EcommerceMetrics;
  freelance: FreelanceMetrics;
  crypto: CryptoMetrics;
  creatorEconomy: CreatorEconomyMetrics;
  crossPlatform: CrossPlatformMetrics;
}

export interface SocialMediaMetrics {
  posts: {
    totalPosts: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    engagementRate: number;
    reach: number;
    impressions: number;
    topPerformingPosts: PostPerformance[];
  };
  stories: {
    totalStories: number;
    avgViews: number;
    completionRate: number;
    interactionRate: number;
    topPerformingStories: StoryPerformance[];
  };
  videos: {
    totalVideos: number;
    avgViews: number;
    avgWatchTime: number;
    retentionRate: number;
    monetizationRevenue: number;
    topPerformingVideos: VideoPerformance[];
  };
  audience: {
    totalFollowers: number;
    newFollowers: number;
    followerGrowthRate: number;
    demographics: AudienceDemographics;
    peakActivityTimes: ActivityTime[];
  };
  engagement: {
    totalEngagements: number;
    engagementRate: number;
    responsiveness: number;
    communityGrowth: number;
  };
}

export interface EcommerceMetrics {
  sales: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
    returnCustomerRate: number;
    topSellingProducts: ProductPerformance[];
  };
  products: {
    totalProducts: number;
    activeListings: number;
    avgRating: number;
    totalReviews: number;
    inventoryTurnover: number;
    productPerformance: ProductAnalytics[];
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    customerRetention: number;
    avgLifetimeValue: number;
    customerSatisfaction: number;
    geographicDistribution: GeographicData[];
  };
  marketing: {
    campaignPerformance: CampaignAnalytics[];
    adSpend: number;
    roas: number; // Return on Ad Spend
    organicTraffic: number;
    paidTraffic: number;
  };
}

export interface FreelanceMetrics {
  projects: {
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    avgProjectValue: number;
    completionRate: number;
    onTimeDelivery: number;
    topSkills: SkillPerformance[];
  };
  clients: {
    totalClients: number;
    repeatClients: number;
    clientRetention: number;
    avgClientRating: number;
    clientSatisfaction: number;
    clientGrowth: number;
  };
  earnings: {
    totalEarnings: number;
    avgHourlyRate: number;
    monthlyRecurring: number;
    earningsGrowth: number;
    paymentSuccess: number;
    earningsBySkill: SkillEarnings[];
  };
  performance: {
    overallRating: number;
    responseTime: number;
    deliveryTime: number;
    revisionRate: number;
    disputeRate: number;
    successScore: number;
  };
}

export interface CryptoMetrics {
  portfolio: {
    totalValue: number;
    totalPnL: number;
    bestPerforming: CoinPerformance[];
    worstPerforming: CoinPerformance[];
    diversificationScore: number;
    riskScore: number;
  };
  trading: {
    totalTrades: number;
    successfulTrades: number;
    winRate: number;
    avgProfit: number;
    avgLoss: number;
    totalVolume: number;
    tradingFrequency: number;
  };
  p2p: {
    totalP2PTrades: number;
    completionRate: number;
    avgTradeTime: number;
    userRating: number;
    totalP2PVolume: number;
    trustScore: number;
  };
  staking: {
    totalStaked: number;
    stakingRewards: number;
    avgAPY: number;
    stakingDuration: number;
    validatorPerformance: ValidatorData[];
  };
  transactions: {
    totalTransactions: number;
    avgTransactionValue: number;
    avgFees: number;
    transactionFrequency: number;
    networkUsage: NetworkData[];
  };
}

export interface CreatorEconomyMetrics {
  revenue: {
    totalRevenue: number;
    tipsReceived: number;
    subscriptionRevenue: number;
    adRevenue: number;
    sponsorshipDeals: number;
    merchandiseSales: number;
    affiliateCommissions: number;
  };
  monetization: {
    tipsCount: number;
    avgTipAmount: number;
    subscriptionCount: number;
    avgSubscriptionValue: number;
    conversionRate: number;
    churRate: number;
  };
  creator: {
    contentCreated: number;
    monetizedContent: number;
    fanbase: number;
    superfans: number;
    engagementValue: number;
    creatorScore: number;
  };
  partnerships: {
    activePartnerships: number;
    completedDeals: number;
    avgDealValue: number;
    partnershipSuccess: number;
    brandReach: number;
  };
  activity: {
    rewardPoints: number;
    activityStreak: number;
    levelProgress: number;
    achievements: number;
    referralEarnings: number;
  };
}

export interface CrossPlatformMetrics {
  unified: {
    totalRevenue: number;
    totalViews: number;
    totalEngagement: number;
    crossPlatformUsers: number;
    featureAdoption: FeatureAdoptionData[];
  };
  insights: {
    topPerformingFeature: string;
    revenueDistribution: RevenueDistribution[];
    userJourney: UserJourneyData[];
    retentionAcrossFeatures: RetentionData[];
  };
  predictions: {
    revenueForecasts: ForecastData[];
    growthPredictions: GrowthData[];
    riskAssessments: RiskData[];
    opportunities: OpportunityData[];
  };
}

// Supporting interfaces
export interface PostPerformance {
  id: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
    reach: number;
  engagementRate: number;
  timestamp: Date;
}

export interface StoryPerformance {
  id: string;
  type: 'image' | 'video' | 'poll' | 'quiz';
  views: number;
  interactions: number;
  completionRate: number;
  timestamp: Date;
}

export interface VideoPerformance {
  id: string;
  title: string;
  views: number;
  watchTime: number;
  likes: number;
  comments: number;
  shares: number;
  revenue: number;
  retentionRate: number;
  timestamp: Date;
}

export interface AudienceDemographics {
  ageGroups: { range: string; percentage: number }[];
  genderDistribution: { gender: string; percentage: number }[];
  locationDistribution: { location: string; percentage: number }[];
  interests: { interest: string; percentage: number }[];
}

export interface ActivityTime {
  hour: number;
  day: string;
  engagementRate: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  reviews: number;
  conversionRate: number;
}

export interface ProductAnalytics {
  id: string;
  name: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  profitMargin: number;
}

export interface GeographicData {
  country: string;
  revenue: number;
  customers: number;
  avgOrderValue: number;
}

export interface CampaignAnalytics {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
}

export interface SkillPerformance {
  skill: string;
  projects: number;
  avgRating: number;
  avgPrice: number;
  demand: number;
}

export interface SkillEarnings {
  skill: string;
  earnings: number;
  hours: number;
  hourlyRate: number;
}

export interface CoinPerformance {
  symbol: string;
  name: string;
  holdings: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export interface ValidatorData {
  validator: string;
  stakedAmount: number;
  rewards: number;
  apy: number;
  uptime: number;
}

export interface NetworkData {
  network: string;
  transactions: number;
  volume: number;
  avgFee: number;
}

export interface FeatureAdoptionData {
  feature: string;
  users: number;
  usage: number;
  retention: number;
}

export interface RevenueDistribution {
  source: string;
  amount: number;
  percentage: number;
  growth: number;
}

export interface UserJourneyData {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface RetentionData {
  feature: string;
  day1: number;
  day7: number;
  day30: number;
  day90: number;
}

export interface ForecastData {
  period: string;
  predictedRevenue: number;
  confidence: number;
  factors: string[];
}

export interface GrowthData {
  metric: string;
  currentValue: number;
  predictedValue: number;
  growthRate: number;
  timeframe: string;
}

export interface RiskData {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface OpportunityData {
  opportunity: string;
  potential: number;
  effort: number;
  priority: number;
  description: string;
}

// Analytics Service Class
class UnifiedAnalyticsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Main method to get all platform metrics
  async getPlatformMetrics(userId: string, timeRange: string = '30d'): Promise<PlatformMetrics> {
    const cacheKey = `platform_metrics_${userId}_${timeRange}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const [social, ecommerce, freelance, crypto, creatorEconomy, crossPlatform] = await Promise.all([
        this.getSocialMediaMetrics(userId, timeRange),
        this.getEcommerceMetrics(userId, timeRange),
        this.getFreelanceMetrics(userId, timeRange),
        this.getCryptoMetrics(userId, timeRange),
        this.getCreatorEconomyMetrics(userId, timeRange),
        this.getCrossPlatformMetrics(userId, timeRange)
      ]);

      const metrics: PlatformMetrics = {
        social,
        ecommerce,
        freelance,
        crypto,
        creatorEconomy,
        crossPlatform
      };

      this.cache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      });

      return metrics;
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      return this.getMockPlatformMetrics();
    }
  }

  // Social Media Analytics
  async getSocialMediaMetrics(userId: string, timeRange: string): Promise<SocialMediaMetrics> {
    try {
      // Fetch real data from Supabase
      // Get posts metrics
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('id, content, like_count, comment_count, share_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Get followers count
      const { data: followersData, error: followersError } = await supabase
        .from('followers')
        .select('id')
        .eq('following_id', userId);

      if (followersError) throw followersError;

      // Get videos metrics
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, title, view_count, like_count, comment_count, share_count, duration')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (videosError) throw videosError;

      // Calculate metrics
      const totalPosts = postsData?.length || 0;
      const avgLikes = totalPosts > 0 ? postsData.reduce((sum, post) => sum + (post.like_count || 0), 0) / totalPosts : 0;
      const avgComments = totalPosts > 0 ? postsData.reduce((sum, post) => sum + (post.comment_count || 0), 0) / totalPosts : 0;
      const avgShares = totalPosts > 0 ? postsData.reduce((sum, post) => sum + (post.share_count || 0), 0) / totalPosts : 0;
      const engagementRate = totalPosts > 0 ? ((avgLikes + avgComments + avgShares) / totalPosts) * 100 : 0;
      const reach = totalPosts * 100; // Simplified reach calculation
      const impressions = totalPosts * 500; // Simplified impressions calculation

      const topPerformingPosts = (postsData || []).slice(0, 2).map(post => ({
        id: post.id,
        content: post.content || '',
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: post.share_count || 0,
        reach: (post.like_count || 0) * 10,
        engagementRate: ((post.like_count || 0) + (post.comment_count || 0) + (post.share_count || 0)) / 3,
        timestamp: new Date(post.created_at)
      }));

      // Video metrics
      const totalVideos = videosData?.length || 0;
      const avgViews = totalVideos > 0 ? videosData.reduce((sum, video) => sum + (video.view_count || 0), 0) / totalVideos : 0;
      const avgWatchTime = totalVideos > 0 ? videosData.reduce((sum, video) => sum + (video.duration || 0), 0) / totalVideos : 0;
      const retentionRate = 75; // Simplified retention rate
      const monetizationRevenue = totalVideos * 2.5; // Simplified revenue calculation

      const topPerformingVideos = (videosData || []).slice(0, 1).map(video => ({
        id: video.id,
        title: video.title || '',
        views: video.view_count || 0,
        watchTime: video.duration || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        revenue: (video.view_count || 0) * 0.01,
        retentionRate: 75,
        timestamp: new Date()
      }));

      return {
        posts: {
          totalPosts,
          avgLikes,
          avgComments,
          avgShares,
          engagementRate,
          reach,
          impressions,
          topPerformingPosts
        },
        stories: {
          totalStories: 0,
          avgViews: 0,
          completionRate: 0,
          interactionRate: 0,
          topPerformingStories: []
        },
        videos: {
          totalVideos,
          avgViews,
          avgWatchTime,
          retentionRate,
          monetizationRevenue,
          topPerformingVideos
        },
        audience: {
          totalFollowers: followersData?.length || 0,
          newFollowers: 0,
          followerGrowthRate: 0,
          demographics: {
            ageGroups: [],
            genderDistribution: [],
            locationDistribution: [],
            interests: []
          },
          peakActivityTimes: []
        },
        engagement: {
          totalEngagements: 0,
          engagementRate: 0,
          responsiveness: 0,
          communityGrowth: 0
        }
      };
    } catch (error) {
      console.error('Error fetching social media metrics:', error);
      // Fallback to mock data
      return {
        posts: {
          totalPosts: 0,
          avgLikes: 0,
          avgComments: 0,
          avgShares: 0,
          engagementRate: 0,
          reach: 0,
          impressions: 0,
          topPerformingPosts: []
        },
        stories: {
          totalStories: 0,
          avgViews: 0,
          completionRate: 0,
          interactionRate: 0,
          topPerformingStories: []
        },
        videos: {
          totalVideos: 0,
          avgViews: 0,
          avgWatchTime: 0,
          retentionRate: 0,
          monetizationRevenue: 0,
          topPerformingVideos: []
        },
        audience: {
          totalFollowers: 0,
          newFollowers: 0,
          followerGrowthRate: 0,
          demographics: {
            ageGroups: [],
            genderDistribution: [],
            locationDistribution: [],
            interests: []
          },
          peakActivityTimes: []
        },
        engagement: {
          totalEngagements: 0,
          engagementRate: 0,
          responsiveness: 0,
          communityGrowth: 0
        }
      };
    }
  }

  // E-commerce Analytics
  async getEcommerceMetrics(userId: string, timeRange: string): Promise<EcommerceMetrics> {
    try {
      // Get products count
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, rating')
        .eq('seller_id', userId);

      if (productsError) throw productsError;

      // Get orders count and revenue
      const { data: ordersData, error: ordersError } = await supabase
        .from('marketplace_orders')
        .select('id, total, status')
        .eq('seller_id', userId);

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalProducts = productsData?.length || 0;
      const activeListings = productsData?.filter(p => p.price > 0).length || 0;
      const avgRating = totalProducts > 0 ? productsData.reduce((sum, product) => sum + (product.rating || 0), 0) / totalProducts : 0;
      const totalReviews = totalProducts; // Simplified

      const totalOrders = ordersData?.length || 0;
      const completedOrders = ordersData?.filter(order => order.status === 'completed').length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      const returnCustomerRate = 25; // Simplified

      const topSellingProducts = (productsData || []).slice(0, 2).map(product => ({
        id: product.id,
        name: product.name || '',
        sales: 5, // Simplified
        revenue: 100, // Simplified
        rating: product.rating || 0,
        reviews: 1,
        conversionRate: 5
      }));

      return {
        sales: {
          totalRevenue,
          totalOrders: completedOrders,
          avgOrderValue,
          conversionRate,
          returnCustomerRate,
          topSellingProducts
        },
        products: {
          totalProducts,
          activeListings,
          avgRating,
          totalReviews,
          inventoryTurnover: 0,
          productPerformance: []
        },
        customers: {
          totalCustomers: 0,
          newCustomers: 0,
          customerRetention: 0,
          avgLifetimeValue: 0,
          customerSatisfaction: 0,
          geographicDistribution: []
        },
        marketing: {
          campaignPerformance: [],
          adSpend: 0,
          roas: 0,
          organicTraffic: 0,
          paidTraffic: 0
        }
      };
    } catch (error) {
      console.error('Error fetching ecommerce metrics:', error);
      // Fallback to mock data
      return {
        sales: {
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          conversionRate: 0,
          returnCustomerRate: 0,
          topSellingProducts: []
        },
        products: {
          totalProducts: 0,
          activeListings: 0,
          avgRating: 0,
          totalReviews: 0,
          inventoryTurnover: 0,
          productPerformance: []
        },
        customers: {
          totalCustomers: 0,
          newCustomers: 0,
          customerRetention: 0,
          avgLifetimeValue: 0,
          customerSatisfaction: 0,
          geographicDistribution: []
        },
        marketing: {
          campaignPerformance: [],
          adSpend: 0,
          roas: 0,
          organicTraffic: 0,
          paidTraffic: 0
        }
      };
    }
  }

  // Freelance Analytics
  async getFreelanceMetrics(userId: string, timeRange: string): Promise<FreelanceMetrics> {
    try {
      // Get freelance projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('freelance_projects')
        .select('id, status, budget')
        .eq('freelancer_id', userId);

      if (projectsError) throw projectsError;

      // Calculate metrics
      const totalProjects = projectsData?.length || 0;
      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;
      const activeProjects = projectsData?.filter(p => p.status === 'active').length || 0;
      const avgProjectValue = totalProjects > 0 ? projectsData.reduce((sum, project) => sum + (parseFloat(project.budget) || 0), 0) / totalProjects : 0;
      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      const onTimeDelivery = 95; // Simplified
      const overallRating = 4.8; // Simplified

      return {
        projects: {
          totalProjects,
          completedProjects,
          activeProjects,
          avgProjectValue,
          completionRate,
          onTimeDelivery,
          topSkills: []
        },
        clients: {
          totalClients: 0,
          repeatClients: 0,
          clientRetention: 0,
          avgClientRating: 0,
          clientSatisfaction: 0,
          clientGrowth: 0
        },
        earnings: {
          totalEarnings: projectsData?.reduce((sum, project) => sum + (parseFloat(project.budget) || 0), 0) || 0,
          avgHourlyRate: 0,
          monthlyRecurring: 0,
          earningsGrowth: 0,
          paymentSuccess: 0,
          earningsBySkill: []
        },
        performance: {
          overallRating,
          responseTime: 0,
          deliveryTime: 0,
          revisionRate: 0,
          disputeRate: 0,
          successScore: 0
        }
      };
    } catch (error) {
      console.error('Error fetching freelance metrics:', error);
      // Fallback to mock data
      return {
        projects: {
          totalProjects: 0,
          completedProjects: 0,
          activeProjects: 0,
          avgProjectValue: 0,
          completionRate: 0,
          onTimeDelivery: 0,
          topSkills: []
        },
        clients: {
          totalClients: 0,
          repeatClients: 0,
          clientRetention: 0,
          avgClientRating: 0,
          clientSatisfaction: 0,
          clientGrowth: 0
        },
        earnings: {
          totalEarnings: 0,
          avgHourlyRate: 0,
          monthlyRecurring: 0,
          earningsGrowth: 0,
          paymentSuccess: 0,
          earningsBySkill: []
        },
        performance: {
          overallRating: 0,
          responseTime: 0,
          deliveryTime: 0,
          revisionRate: 0,
          disputeRate: 0,
          successScore: 0
        }
      };
    }
  }

  // Crypto Analytics  
  async getCryptoMetrics(userId: string, timeRange: string): Promise<CryptoMetrics> {
    try {
      // Get wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('btc_balance, eth_balance, usdt_balance')
        .eq('user_id', userId)
        .single();

      if (walletError) throw walletError;

      // Simplified crypto metrics
      const btcValue = (walletData?.btc_balance || 0) * 50000; // Mock BTC price
      const ethValue = (walletData?.eth_balance || 0) * 3000;  // Mock ETH price
      const usdtValue = walletData?.usdt_balance || 0;         // USDT price is 1
      const totalValue = btcValue + ethValue + usdtValue;
      const totalPnL = totalValue * 0.1; // Simplified PnL

      return {
        portfolio: {
          totalValue,
          totalPnL,
          bestPerforming: [
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              holdings: walletData?.btc_balance || 0,
              value: btcValue,
              pnl: btcValue * 0.1,
              pnlPercentage: 10
            }
          ],
          worstPerforming: [],
          diversificationScore: 75,
          riskScore: 40
        },
        trading: {
          totalTrades: 0,
          successfulTrades: 0,
          winRate: 0,
          avgProfit: 0,
          avgLoss: 0,
          totalVolume: 0,
          tradingFrequency: 0
        },
        p2p: {
          totalP2PTrades: 0,
          completionRate: 0,
          avgTradeTime: 0,
          userRating: 0,
          totalP2PVolume: 0,
          trustScore: 0
        },
        staking: {
          totalStaked: 0,
          stakingRewards: 0,
          avgAPY: 0,
          stakingDuration: 0,
          validatorPerformance: []
        },
        transactions: {
          totalTransactions: 0,
          avgTransactionValue: 0,
          avgFees: 0,
          transactionFrequency: 0,
          networkUsage: []
        }
      };
    } catch (error) {
      console.error('Error fetching crypto metrics:', error);
      // Fallback to mock data
      return {
        portfolio: {
          totalValue: 0,
          totalPnL: 0,
          bestPerforming: [],
          worstPerforming: [],
          diversificationScore: 0,
          riskScore: 0
        },
        trading: {
          totalTrades: 0,
          successfulTrades: 0,
          winRate: 0,
          avgProfit: 0,
          avgLoss: 0,
          totalVolume: 0,
          tradingFrequency: 0
        },
        p2p: {
          totalP2PTrades: 0,
          completionRate: 0,
          avgTradeTime: 0,
          userRating: 0,
          totalP2PVolume: 0,
          trustScore: 0
        },
        staking: {
          totalStaked: 0,
          stakingRewards: 0,
          avgAPY: 0,
          stakingDuration: 0,
          validatorPerformance: []
        },
        transactions: {
          totalTransactions: 0,
          avgTransactionValue: 0,
          avgFees: 0,
          transactionFrequency: 0,
          networkUsage: []
        }
      };
    }
  }

  // Creator Economy Analytics
  async getCreatorEconomyMetrics(userId: string, timeRange: string): Promise<CreatorEconomyMetrics> {
    try {
      // Get videos for creator metrics
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('id, view_count, like_count, comment_count')
        .eq('user_id', userId);

      if (videosError) throw videosError;

      // Calculate metrics
      const contentCreated = videosData?.length || 0;
      const totalViews = videosData?.reduce((sum, video) => sum + (video.view_count || 0), 0) || 0;
      const totalLikes = videosData?.reduce((sum, video) => sum + (video.like_count || 0), 0) || 0;
      const totalComments = videosData?.reduce((sum, video) => sum + (video.comment_count || 0), 0) || 0;

      return {
        revenue: {
          totalRevenue: totalViews * 0.01, // Simplified
          tipsReceived: 0,
          subscriptionRevenue: 0,
          adRevenue: 0,
          sponsorshipDeals: 0,
          merchandiseSales: 0,
          affiliateCommissions: 0
        },
        monetization: {
          tipsCount: 0,
          avgTipAmount: 0,
          subscriptionCount: 0,
          avgSubscriptionValue: 0,
          conversionRate: 0,
          churRate: 0
        },
        creator: {
          contentCreated,
          monetizedContent: 0,
          fanbase: 0,
          superfans: 0,
          engagementValue: (totalLikes + totalComments) / (contentCreated || 1),
          creatorScore: 85
        },
        partnerships: {
          activePartnerships: 0,
          completedDeals: 0,
          avgDealValue: 0,
          partnershipSuccess: 0,
          brandReach: 0
        },
        activity: {
          rewardPoints: 0,
          activityStreak: 0,
          levelProgress: 0,
          achievements: 0,
          referralEarnings: 0
        }
      };
    } catch (error) {
      console.error('Error fetching creator economy metrics:', error);
      // Fallback to mock data
      return {
        revenue: {
          totalRevenue: 0,
          tipsReceived: 0,
          subscriptionRevenue: 0,
          adRevenue: 0,
          sponsorshipDeals: 0,
          merchandiseSales: 0,
          affiliateCommissions: 0
        },
        monetization: {
          tipsCount: 0,
          avgTipAmount: 0,
          subscriptionCount: 0,
          avgSubscriptionValue: 0,
          conversionRate: 0,
          churRate: 0
        },
        creator: {
          contentCreated: 0,
          monetizedContent: 0,
          fanbase: 0,
          superfans: 0,
          engagementValue: 0,
          creatorScore: 0
        },
        partnerships: {
          activePartnerships: 0,
          completedDeals: 0,
          avgDealValue: 0,
          partnershipSuccess: 0,
          brandReach: 0
        },
        activity: {
          rewardPoints: 0,
          activityStreak: 0,
          levelProgress: 0,
          achievements: 0,
          referralEarnings: 0
        }
      };
    }
  }

  // Cross-Platform Analytics
  async getCrossPlatformMetrics(userId: string, timeRange: string): Promise<CrossPlatformMetrics> {
    try {
      // Get user's activities across platforms
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, activity_type')
        .eq('user_id', userId);

      if (activitiesError) throw activitiesError;

      // Calculate cross-platform metrics
      const totalActivities = activitiesData?.length || 0;
      const featureAdoption = [
        {
          feature: 'Social Media',
          users: 1000,
          usage: totalActivities * 2,
          retention: 85
        },
        {
          feature: 'E-commerce',
          users: 500,
          usage: totalActivities,
          retention: 70
        }
      ];

      return {
        unified: {
          totalRevenue: 5000, // Simplified
          totalViews: totalActivities * 100,
          totalEngagement: totalActivities * 5,
          crossPlatformUsers: 1500,
          featureAdoption
        },
        insights: {
          topPerformingFeature: 'Social Media',
          revenueDistribution: [
            { source: 'E-commerce', amount: 3000, percentage: 60, growth: 15 },
            { source: 'Freelance', amount: 1000, percentage: 20, growth: 25 },
            { source: 'Crypto', amount: 500, percentage: 10, growth: 35 },
            { source: 'Creator Economy', amount: 500, percentage: 10, growth: 20 }
          ],
          userJourney: [],
          retentionAcrossFeatures: []
        },
        predictions: {
          revenueForecasts: [
            {
              period: 'Next Month',
              predictedRevenue: 6000,
              confidence: 85,
              factors: ['Seasonal trends', 'Feature adoption']
            }
          ],
          growthPredictions: [],
          riskAssessments: [],
          opportunities: [
            {
              opportunity: 'Cross-Platform Integration',
              potential: 90,
              effort: 70,
              priority: 95,
              description: 'Integrate social commerce with crypto payments'
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching cross-platform metrics:', error);
      // Fallback to mock data
      return {
        unified: {
          totalRevenue: 0,
          totalViews: 0,
          totalEngagement: 0,
          crossPlatformUsers: 0,
          featureAdoption: []
        },
        insights: {
          topPerformingFeature: 'None',
          revenueDistribution: [],
          userJourney: [],
          retentionAcrossFeatures: []
        },
        predictions: {
          revenueForecasts: [],
          growthPredictions: [],
          riskAssessments: [],
          opportunities: []
        }
      };
    }
  }

  // Export functionality
  async exportAnalytics(userId: string, format: 'csv' | 'pdf' | 'json', timeRange: string = '30d'): Promise<string> {
    const metrics = await this.getPlatformMetrics(userId, timeRange);
    
    switch (format) {
      case 'json':
        return JSON.stringify(metrics, null, 2);
      case 'csv':
        return this.convertToCSV(metrics);
      case 'pdf':
        return await this.generatePDFReport(metrics);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private convertToCSV(metrics: PlatformMetrics): string {
    // Convert metrics to CSV format
    let csv = 'Feature,Metric,Value\n';
    
    // Social Media
    csv += `Social Media,Total Posts,${metrics.social.posts.totalPosts}\n`;
    csv += `Social Media,Engagement Rate,${metrics.social.posts.engagementRate}%\n`;
    csv += `Social Media,Total Followers,${metrics.social.audience.totalFollowers}\n`;
    
    // E-commerce
    csv += `E-commerce,Total Revenue,$${metrics.ecommerce.sales.totalRevenue}\n`;
    csv += `E-commerce,Total Orders,${metrics.ecommerce.sales.totalOrders}\n`;
    csv += `E-commerce,Conversion Rate,${metrics.ecommerce.sales.conversionRate}%\n`;
    
    // Add more metrics as needed
    
    return csv;
  }

  private async generatePDFReport(metrics: PlatformMetrics): Promise<string> {
    // In production, this would generate an actual PDF
    // For now, return a placeholder
    return 'PDF report generation would be implemented here';
  }

  private getMockPlatformMetrics(): PlatformMetrics {
    // Fallback mock data when real APIs fail
    return {
      social: {
        posts: { totalPosts: 0, avgLikes: 0, avgComments: 0, avgShares: 0, engagementRate: 0, reach: 0, impressions: 0, topPerformingPosts: [] },
        stories: { totalStories: 0, avgViews: 0, completionRate: 0, interactionRate: 0, topPerformingStories: [] },
        videos: { totalVideos: 0, avgViews: 0, avgWatchTime: 0, retentionRate: 0, monetizationRevenue: 0, topPerformingVideos: [] },
        audience: { totalFollowers: 0, newFollowers: 0, followerGrowthRate: 0, demographics: { ageGroups: [], genderDistribution: [], locationDistribution: [], interests: [] }, peakActivityTimes: [] },
        engagement: { totalEngagements: 0, engagementRate: 0, responsiveness: 0, communityGrowth: 0 }
      },
      ecommerce: {
        sales: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, conversionRate: 0, returnCustomerRate: 0, topSellingProducts: [] },
        products: { totalProducts: 0, activeListings: 0, avgRating: 0, totalReviews: 0, inventoryTurnover: 0, productPerformance: [] },
        customers: { totalCustomers: 0, newCustomers: 0, customerRetention: 0, avgLifetimeValue: 0, customerSatisfaction: 0, geographicDistribution: [] },
        marketing: { campaignPerformance: [], adSpend: 0, roas: 0, organicTraffic: 0, paidTraffic: 0 }
      },
      freelance: {
        projects: { totalProjects: 0, completedProjects: 0, activeProjects: 0, avgProjectValue: 0, completionRate: 0, onTimeDelivery: 0, topSkills: [] },
        clients: { totalClients: 0, repeatClients: 0, clientRetention: 0, avgClientRating: 0, clientSatisfaction: 0, clientGrowth: 0 },
        earnings: { totalEarnings: 0, avgHourlyRate: 0, monthlyRecurring: 0, earningsGrowth: 0, paymentSuccess: 0, earningsBySkill: [] },
        performance: { overallRating: 0, responseTime: 0, deliveryTime: 0, revisionRate: 0, disputeRate: 0, successScore: 0 }
      },
      crypto: {
        portfolio: { totalValue: 0, totalPnL: 0, bestPerforming: [], worstPerforming: [], diversificationScore: 0, riskScore: 0 },
        trading: { totalTrades: 0, successfulTrades: 0, winRate: 0, avgProfit: 0, avgLoss: 0, totalVolume: 0, tradingFrequency: 0 },
        p2p: { totalP2PTrades: 0, completionRate: 0, avgTradeTime: 0, userRating: 0, totalP2PVolume: 0, trustScore: 0 },
        staking: { totalStaked: 0, stakingRewards: 0, avgAPY: 0, stakingDuration: 0, validatorPerformance: [] },
        transactions: { totalTransactions: 0, avgTransactionValue: 0, avgFees: 0, transactionFrequency: 0, networkUsage: [] }
      },
      creatorEconomy: {
        revenue: { totalRevenue: 0, tipsReceived: 0, subscriptionRevenue: 0, adRevenue: 0, sponsorshipDeals: 0, merchandiseSales: 0, affiliateCommissions: 0 },
        monetization: { tipsCount: 0, avgTipAmount: 0, subscriptionCount: 0, avgSubscriptionValue: 0, conversionRate: 0, churRate: 0 },
        creator: { contentCreated: 0, monetizedContent: 0, fanbase: 0, superfans: 0, engagementValue: 0, creatorScore: 0 },
        partnerships: { activePartnerships: 0, completedDeals: 0, avgDealValue: 0, partnershipSuccess: 0, brandReach: 0 },
        activity: { rewardPoints: 0, activityStreak: 0, levelProgress: 0, achievements: 0, referralEarnings: 0 }
      },
      crossPlatform: {
        unified: { totalRevenue: 0, totalViews: 0, totalEngagement: 0, crossPlatformUsers: 0, featureAdoption: [] },
        insights: { topPerformingFeature: 'None', revenueDistribution: [], userJourney: [], retentionAcrossFeatures: [] },
        predictions: { revenueForecasts: [], growthPredictions: [], riskAssessments: [], opportunities: [] }
      }
    };
  }
}

export const unifiedAnalyticsService = new UnifiedAnalyticsService();
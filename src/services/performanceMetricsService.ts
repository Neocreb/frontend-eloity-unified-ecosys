import { supabase } from '@/integrations/supabase/client';

// Types for performance metrics
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  unit?: string;
  category: string;
  timestamp: string;
}

export interface PlatformPerformance {
  platform: string;
  totalViews: number;
  totalEngagement: number;
  totalRevenue: number;
  growthRate: number;
  metrics: PerformanceMetric[];
}

// Format numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate growth rate between two values
const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Determine trend based on change value
const determineTrend = (change: number): 'up' | 'down' | 'neutral' => {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
};

// Fetch video performance metrics
export const fetchVideoPerformance = async (): Promise<PlatformPerformance> => {
  try {
    // Get current period data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: currentVideos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, view_count, like_count, comment_count, share_count, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (videosError) throw videosError;
    
    // Get video analytics data
    const { data: videoAnalytics, error: analyticsError } = await supabase
      .from('video_analytics')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString());
    
    if (analyticsError) throw analyticsError;
    
    // Calculate current period metrics
    const totalVideos = currentVideos.length;
    const totalViews = currentVideos.reduce((sum: number, video: any) => sum + (video.view_count || 0), 0);
    const totalLikes = currentVideos.reduce((sum: number, video: any) => sum + (video.like_count || 0), 0);
    const totalComments = currentVideos.reduce((sum: number, video: any) => sum + (video.comment_count || 0), 0);
    const totalShares = currentVideos.reduce((sum: number, video: any) => sum + (video.share_count || 0), 0);
    
    // Calculate previous period data (previous 30 days)
    const previousPeriodStart = new Date(thirtyDaysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    
    const { data: previousVideos, error: previousVideosError } = await supabase
      .from('videos')
      .select('id, view_count, like_count, comment_count, share_count')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (previousVideosError) throw previousVideosError;
    
    const previousViews = previousVideos.reduce((sum: number, video: any) => sum + (video.view_count || 0), 0);
    const previousLikes = previousVideos.reduce((sum: number, video: any) => sum + (video.like_count || 0), 0);
    const previousComments = previousVideos.reduce((sum: number, video: any) => sum + (video.comment_count || 0), 0);
    
    // Calculate growth rates
    const viewGrowth = calculateGrowthRate(totalViews, previousViews);
    const likeGrowth = calculateGrowthRate(totalLikes, previousLikes);
    const commentGrowth = calculateGrowthRate(totalComments, previousComments);
    
    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    const previousEngagementRate = previousViews > 0 ? ((previousLikes + previousComments) / previousViews) * 100 : 0;
    const engagementGrowth = calculateGrowthRate(engagementRate, previousEngagementRate);
    
    return {
      platform: 'Video',
      totalViews,
      totalEngagement: totalLikes + totalComments,
      totalRevenue: 0, // Would need to calculate from monetization data
      growthRate: viewGrowth,
      metrics: [
        {
          id: 'video-total',
          name: 'Total Videos',
          value: totalVideos,
          previousValue: previousVideos.length,
          change: calculateGrowthRate(totalVideos, previousVideos.length),
          trend: determineTrend(calculateGrowthRate(totalVideos, previousVideos.length)),
          category: 'Content',
          timestamp: new Date().toISOString()
        },
        {
          id: 'video-views',
          name: 'Total Views',
          value: formatNumber(totalViews),
          previousValue: formatNumber(previousViews),
          change: viewGrowth,
          trend: determineTrend(viewGrowth),
          unit: 'views',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'video-likes',
          name: 'Total Likes',
          value: formatNumber(totalLikes),
          previousValue: formatNumber(previousLikes),
          change: likeGrowth,
          trend: determineTrend(likeGrowth),
          unit: 'likes',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'video-comments',
          name: 'Total Comments',
          value: formatNumber(totalComments),
          previousValue: formatNumber(previousComments),
          change: commentGrowth,
          trend: determineTrend(commentGrowth),
          unit: 'comments',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'video-engagement-rate',
          name: 'Engagement Rate',
          value: engagementRate.toFixed(2) + '%',
          previousValue: previousEngagementRate.toFixed(2) + '%',
          change: engagementGrowth,
          trend: determineTrend(engagementGrowth),
          unit: 'rate',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'video-shares',
          name: 'Total Shares',
          value: formatNumber(totalShares),
          change: 0, // Would need previous period data
          trend: 'neutral',
          unit: 'shares',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching video performance:', error);
    throw error;
  }
};

// Fetch social/feed performance metrics
export const fetchSocialPerformance = async (): Promise<PlatformPerformance> => {
  try {
    // Get current period data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, view_count, created_at, post_likes(id), post_comments(id)')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (postsError) throw postsError;
    
    // Calculate current period metrics
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.post_likes?.length || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.post_comments?.length || 0), 0);
    
    // Calculate previous period data (previous 30 days)
    const previousPeriodStart = new Date(thirtyDaysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    
    const { data: previousPosts, error: previousPostsError } = await supabase
      .from('posts')
      .select('id, post_likes(id), post_comments(id)')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (previousPostsError) throw previousPostsError;
    
    const previousLikes = previousPosts.reduce((sum: number, post: any) => sum + (post.post_likes?.length || 0), 0);
    const previousComments = previousPosts.reduce((sum: number, post: any) => sum + (post.post_comments?.length || 0), 0);
    
    // Calculate growth rates
    const likeGrowth = calculateGrowthRate(totalLikes, previousLikes);
    const commentGrowth = calculateGrowthRate(totalComments, previousComments);
    
    // Calculate engagement rate
    const engagementRate = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts) * 100 : 0;
    const previousEngagementRate = previousPosts.length > 0 ? ((previousLikes + previousComments) / previousPosts.length) * 100 : 0;
    const engagementGrowth = calculateGrowthRate(engagementRate, previousEngagementRate);
    
    return {
      platform: 'Feed & Social',
      totalViews: 0, // Posts don't have explicit view counts in this schema
      totalEngagement: totalLikes + totalComments,
      totalRevenue: 0,
      growthRate: engagementGrowth,
      metrics: [
        {
          id: 'social-posts',
          name: 'Total Posts',
          value: totalPosts,
          previousValue: previousPosts.length,
          change: calculateGrowthRate(totalPosts, previousPosts.length),
          trend: determineTrend(calculateGrowthRate(totalPosts, previousPosts.length)),
          category: 'Content',
          timestamp: new Date().toISOString()
        },
        {
          id: 'social-likes',
          name: 'Total Likes',
          value: formatNumber(totalLikes),
          previousValue: formatNumber(previousLikes),
          change: likeGrowth,
          trend: determineTrend(likeGrowth),
          unit: 'likes',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'social-comments',
          name: 'Total Comments',
          value: formatNumber(totalComments),
          previousValue: formatNumber(previousComments),
          change: commentGrowth,
          trend: determineTrend(commentGrowth),
          unit: 'comments',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        },
        {
          id: 'social-engagement-rate',
          name: 'Engagement Rate',
          value: engagementRate.toFixed(2) + '%',
          previousValue: previousEngagementRate.toFixed(2) + '%',
          change: engagementGrowth,
          trend: determineTrend(engagementGrowth),
          unit: 'rate',
          category: 'Engagement',
          timestamp: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching social performance:', error);
    throw error;
  }
};

// Fetch marketplace performance metrics
export const fetchMarketplacePerformance = async (): Promise<PlatformPerformance> => {
  try {
    // Get current period data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, total_sales, total_reviews, average_rating, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (productsError) throw productsError;
    
    // Calculate current period metrics
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum: number, product: any) => sum + (product.price * (product.total_sales || 0)), 0);
    const totalSales = products.reduce((sum: number, product: any) => sum + (product.total_sales || 0), 0);
    const avgRating = totalProducts > 0 ? 
      (products.reduce((sum: number, product: any) => sum + (parseFloat(product.average_rating) || 0), 0) / totalProducts) : 0;
    
    // Calculate previous period data (previous 30 days)
    const previousPeriodStart = new Date(thirtyDaysAgo);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    
    const { data: previousProducts, error: previousProductsError } = await supabase
      .from('products')
      .select('id, price, total_sales')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    if (previousProductsError) throw previousProductsError;
    
    const previousRevenue = previousProducts.reduce((sum: number, product: any) => sum + (product.price * (product.total_sales || 0)), 0);
    const previousSales = previousProducts.reduce((sum: number, product: any) => sum + (product.total_sales || 0), 0);
    
    // Calculate growth rates
    const revenueGrowth = calculateGrowthRate(totalRevenue, previousRevenue);
    const salesGrowth = calculateGrowthRate(totalSales, previousSales);
    
    return {
      platform: 'Marketplace',
      totalViews: 0, // Would need view count data
      totalEngagement: 0, // Would need engagement data
      totalRevenue,
      growthRate: revenueGrowth,
      metrics: [
        {
          id: 'marketplace-products',
          name: 'Products Listed',
          value: totalProducts,
          previousValue: previousProducts.length,
          change: calculateGrowthRate(totalProducts, previousProducts.length),
          trend: determineTrend(calculateGrowthRate(totalProducts, previousProducts.length)),
          category: 'Content',
          timestamp: new Date().toISOString()
        },
        {
          id: 'marketplace-revenue',
          name: 'Total Revenue',
          value: formatCurrency(totalRevenue),
          previousValue: formatCurrency(previousRevenue),
          change: revenueGrowth,
          trend: determineTrend(revenueGrowth),
          unit: 'revenue',
          category: 'Financial',
          timestamp: new Date().toISOString()
        },
        {
          id: 'marketplace-sales',
          name: 'Units Sold',
          value: formatNumber(totalSales),
          previousValue: formatNumber(previousSales),
          change: salesGrowth,
          trend: determineTrend(salesGrowth),
          unit: 'sales',
          category: 'Sales',
          timestamp: new Date().toISOString()
        },
        {
          id: 'marketplace-rating',
          name: 'Avg Rating',
          value: avgRating.toFixed(1),
          change: 0, // Would need previous period data
          trend: 'neutral',
          unit: 'stars',
          category: 'Quality',
          timestamp: new Date().toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching marketplace performance:', error);
    throw error;
  }
};

// Fetch overall platform performance
export const fetchPlatformPerformance = async (): Promise<PlatformPerformance[]> => {
  try {
    const [videoPerformance, socialPerformance, marketplacePerformance] = await Promise.all([
      fetchVideoPerformance(),
      fetchSocialPerformance(),
      fetchMarketplacePerformance()
    ]);
    
    return [videoPerformance, socialPerformance, marketplacePerformance];
  } catch (error) {
    console.error('Error fetching platform performance:', error);
    throw error;
  }
};

// Fetch real-time performance metrics
export const fetchRealTimePerformance = async (): Promise<PerformanceMetric[]> => {
  try {
    // Get recent activity (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Get recent posts
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (postsError) throw postsError;
    
    // Get recent videos
    const { data: recentVideos, error: videosError } = await supabase
      .from('videos')
      .select('id, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (videosError) throw videosError;
    
    // Get recent products
    const { data: recentProducts, error: productsError } = await supabase
      .from('products')
      .select('id, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString());
    
    if (productsError) throw productsError;
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    // Count recent activity in the last hour
    const recentPostCount = recentPosts.filter((post: any) => new Date(post.created_at) > oneHourAgo).length;
    const recentVideoCount = recentVideos.filter((video: any) => new Date(video.created_at) > oneHourAgo).length;
    const recentProductCount = recentProducts.filter((product: any) => new Date(product.created_at) > oneHourAgo).length;
    
    // Count recent activity in the last 4 hours for comparison
    const previousPostCount = recentPosts.filter((post: any) => 
      new Date(post.created_at) > fourHoursAgo && new Date(post.created_at) <= oneHourAgo
    ).length;
    const previousVideoCount = recentVideos.filter((video: any) => 
      new Date(video.created_at) > fourHoursAgo && new Date(video.created_at) <= oneHourAgo
    ).length;
    const previousProductCount = recentProducts.filter((product: any) => 
      new Date(product.created_at) > fourHoursAgo && new Date(product.created_at) <= oneHourAgo
    ).length;
    
    // Calculate trends
    const postTrend = recentPostCount > previousPostCount ? 'up' : recentPostCount < previousPostCount ? 'down' : 'neutral';
    const videoTrend = recentVideoCount > previousVideoCount ? 'up' : recentVideoCount < previousVideoCount ? 'down' : 'neutral';
    const productTrend = recentProductCount > previousProductCount ? 'up' : recentProductCount < previousProductCount ? 'down' : 'neutral';
    
    // Calculate changes
    const postChange = previousPostCount > 0 ? ((recentPostCount - previousPostCount) / previousPostCount) * 100 : 0;
    const videoChange = previousVideoCount > 0 ? ((recentVideoCount - previousVideoCount) / previousVideoCount) * 100 : 0;
    const productChange = previousProductCount > 0 ? ((recentProductCount - previousProductCount) / previousProductCount) * 100 : 0;
    
    return [
      {
        id: 'realtime-posts',
        name: 'Posts (Last Hour)',
        value: recentPostCount,
        previousValue: previousPostCount,
        change: postChange,
        trend: postTrend,
        category: 'Real-time',
        timestamp: now.toISOString()
      },
      {
        id: 'realtime-videos',
        name: 'Videos (Last Hour)',
        value: recentVideoCount,
        previousValue: previousVideoCount,
        change: videoChange,
        trend: videoTrend,
        category: 'Real-time',
        timestamp: now.toISOString()
      },
      {
        id: 'realtime-products',
        name: 'Products (Last Hour)',
        value: recentProductCount,
        previousValue: previousProductCount,
        change: productChange,
        trend: productTrend,
        category: 'Real-time',
        timestamp: now.toISOString()
      }
    ];
  } catch (error) {
    console.error('Error fetching real-time performance:', error);
    throw error;
  }
};

// Set up real-time performance monitoring
export const setupRealTimePerformanceMonitoring = (callback: (metrics: PerformanceMetric[]) => void) => {
  try {
    // Set up periodic polling for real-time metrics
    const intervalId = setInterval(async () => {
      try {
        const metrics = await fetchRealTimePerformance();
        callback(metrics);
      } catch (error) {
        console.error('Error in real-time performance monitoring:', error);
      }
    }, 30000); // Update every 30 seconds
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  } catch (error) {
    console.error('Error setting up real-time performance monitoring:', error);
    return () => {};
  }
};

// Subscribe to real-time database changes
export const subscribeToRealTimeChanges = (callback: (table: string, action: string, data: any) => void) => {
  try {
    // Subscribe to posts changes
    const postsSubscription = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload: any) => {
          callback('posts', 'INSERT', payload.new);
        }
      )
      .subscribe();
    
    // Subscribe to videos changes
    const videosSubscription = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'videos' },
        (payload: any) => {
          callback('videos', 'INSERT', payload.new);
        }
      )
      .subscribe();
    
    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload: any) => {
          callback('products', 'INSERT', payload.new);
        }
      )
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(videosSubscription);
      supabase.removeChannel(productsSubscription);
    };
  } catch (error) {
    console.error('Error setting up real-time subscriptions:', error);
    return () => {};
  }
};

export default {
  fetchVideoPerformance,
  fetchSocialPerformance,
  fetchMarketplacePerformance,
  fetchPlatformPerformance,
  fetchRealTimePerformance
};
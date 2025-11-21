import { supabase } from "@/integrations/supabase/client";
import cache from '@/utils/cache';

// Types for demographics data
interface User {
  id: string;
  date_of_birth: string | null;
  gender: string | null;
  location: string | null;
  interests: string[] | null;
  followers_count?: number;
  engagement_rate?: number;
  revenue_data?: {
    optimization_tips?: { title: string; description: string; impact: string; effort: string }[];
  };
}

export interface AgeDemographic {
  range: string;
  percentage: number;
  count: string;
}

export interface GenderDemographic {
  gender: string;
  percentage: number;
  count: string;
}

export interface LocationDemographic {
  location: string;
  percentage: number;
  count: string;
}

export interface InterestDemographic {
  interest: string;
  percentage: number;
}

export interface UserDemographics {
  age: AgeDemographic[];
  gender: GenderDemographic[];
  location: LocationDemographic[];
  interests: InterestDemographic[];
  totalFollowers: string;
  growthRate: string;
  peakHours: { time: string; activity: number }[];
  bestDays: { day: string; activity: number }[];
  engagementMetrics: { metric: string; value: string; description: string }[];
  contentRecommendations: { type: string; topic: string; reason: string; potential: string; confidence: number }[];
  audienceGrowthStrategies: { strategy: string; description: string; impact: string; effort: string }[];
  marketTrends: { trend: string; growth: string; opportunity: string; timeline: string; difficulty: string }[];
  revenueOptimizationTips: { title: string; description: string; impact: string; effort: string }[];
  dailyInsight: string;
}

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Utility function to categorize age into ranges
const getAgeRange = (age: number): string => {
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  if (age >= 45 && age <= 54) return "45-54";
  return "55+";
};

// Utility function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Fetch user demographics data
export const fetchUserDemographics = async (): Promise<UserDemographics> => {
  // Check cache first
  const cacheKey = 'userDemographics';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Fetch all user profiles with demographic information
    const { data: users, error } = await supabase
      .from('profiles')
      .select('user_id, date_of_birth, gender, location, interests')
      .not('date_of_birth', 'is', null);

    if (error) {
      console.error('Error fetching user demographics:', error);
      throw error;
    }

    // Process age demographics
    const ageCounts: Record<string, number> = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0
    };

    // Process gender demographics
    const genderCounts: Record<string, number> = {
      "Male": 0,
      "Female": 0,
      "Other": 0
    };

    // Process location demographics
    const locationCounts: Record<string, number> = {};

    // Process interests
    const interestCounts: Record<string, number> = {};

    // Total user count for percentage calculations
    let totalUsers = users.length;

    // Process each user
    users.forEach((user: User) => {
      // Age processing
      if (user.date_of_birth) {
        const age = calculateAge(user.date_of_birth);
        const ageRange = getAgeRange(age);
        ageCounts[ageRange] = (ageCounts[ageRange] || 0) + 1;
      }

      // Gender processing
      if (user.gender) {
        const gender = user.gender.toLowerCase();
        if (gender === 'male') {
          genderCounts["Male"]++;
        } else if (gender === 'female') {
          genderCounts["Female"]++;
        } else {
          genderCounts["Other"]++;
        }
      }

      // Location processing
      if (user.location) {
        const location = user.location;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }

      // Interests processing (assuming interests is stored as a JSON array)
      if (user.interests && Array.isArray(user.interests)) {
        user.interests.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });

    // Convert age counts to demographics array
    const ageDemographics: AgeDemographic[] = Object.entries(ageCounts)
      .map(([range, count]) => ({
        range,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Convert gender counts to demographics array
    const genderDemographics: GenderDemographic[] = Object.entries(genderCounts)
      .filter(([_, count]) => count > 0) // Only include genders that have users
      .map(([gender, count]) => ({
        gender,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Convert location counts to demographics array (top 6 locations)
    const locationEntries = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 6);

    // Add "Others" category if there are more than 6 locations
    let othersCount = 0;
    if (Object.keys(locationCounts).length > 6) {
      othersCount = Object.values(locationCounts)
        .sort((a, b) => b - a)
        .slice(6)
        .reduce((sum, count) => sum + count, 0);
    }

    const locationDemographics: LocationDemographic[] = locationEntries
      .map(([location, count]) => ({
        location,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        count: formatNumber(count)
      }));

    // Add "Others" if needed
    if (othersCount > 0) {
      locationDemographics.push({
        location: "Others",
        percentage: totalUsers > 0 ? Math.round((othersCount / totalUsers) * 100) : 0,
        count: formatNumber(othersCount)
      });
    }

    // Convert interest counts to demographics array (top 5 interests)
    const interestEntries = Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 5);

    const interestDemographics: InterestDemographic[] = interestEntries
      .map(([interest, count]) => ({
        interest,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      }));

    // Fetch real analytics data for the current user
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Calculate total followers (real value from analytics or fallback to user count)
    const totalFollowers = analyticsData?.followers_count 
      ? formatNumber(analyticsData.followers_count) 
      : formatNumber(totalUsers * 150); // Fallback to mock value based on user count
    
    // Calculate growth rate (real value from analytics or fallback to mock)
    const growthRate = analyticsData?.engagement_rate 
      ? "+" + analyticsData.engagement_rate.toFixed(1) + "%"
      : "+" + (Math.random() * 10 + 5).toFixed(1) + "%"; // Fallback to mock value
    
    // Peak hours data (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be calculated from actual user activity data
    const peakHours = [
      { time: "6-9 AM", activity: 25 },
      { time: "12-3 PM", activity: 35 },
      { time: "6-9 PM", activity: 30 },
      { time: "9-12 PM", activity: 20 }
    ];
    
    // Best days data (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be calculated from actual user activity data
    const bestDays = [
      { day: "Tuesday", activity: 25 },
      { day: "Wednesday", activity: 30 },
      { day: "Thursday", activity: 20 },
      { day: "Monday", activity: 15 },
      { day: "Friday", activity: 10 }
    ];
    
    // Engagement metrics (real values from analytics or fallback to mock)
    const engagementMetrics = analyticsData 
      ? [
          { metric: "Total Posts", value: formatNumber(analyticsData.posts_count || 0), description: "Published content" },
          { metric: "Likes Received", value: formatNumber(analyticsData.likes_received || 0), description: "Total likes on your content" },
          { metric: "Comments Received", value: formatNumber(analyticsData.comments_received || 0), description: "Total comments on your content" },
          { metric: "Active Minutes", value: formatNumber(analyticsData.active_minutes || 0), description: "Time spent on platform" },
          { metric: "Engagement Rate", value: (analyticsData.engagement_rate || 0).toFixed(1) + "%", description: "Interaction with your content" },
          { metric: "Followers", value: totalFollowers, description: "Your total follower count" }
        ]
      : [
          { metric: "Average Session", value: "4:25", description: "Time spent per visit" },
          { metric: "Pages per Session", value: "3.2", description: "Average page views" },
          { metric: "Return Visitor Rate", value: "75%", description: "Repeat audience" },
          { metric: "Share Rate", value: "12%", description: "Content sharing" },
          { metric: "Comment Rate", value: "8%", description: "Active commenting" },
          { metric: "Save Rate", value: "15%", description: "Content saves" }
        ];
    
    // Content recommendations (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be generated from AI analysis of user preferences
    const contentRecommendations = [
      {
        type: "Blog Post",
        topic: "Industry Trends Analysis",
        reason: "High interest from audience",
        potential: "2,500 views, 150 shares",
        confidence: 85
      },
      {
        type: "Video Tutorial",
        topic: "Advanced Platform Features",
        reason: "High demand topic in your audience",
        potential: "5,200 views, 2,800 likes",
        confidence: 78
      },
      {
        type: "Live Stream",
        topic: "Q&A: Expert Insights",
        reason: "Your live content performs 3x better",
        potential: "450 viewers, 600 comments",
        confidence: 82
      },
      {
        type: "Product Launch",
        topic: "Premium Course: Skill Development",
        reason: "Your audience shows high interest in education",
        potential: "85 sales, $4,200 revenue",
        confidence: 90
      }
    ];
    
    // Audience growth strategies (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be generated from AI analysis of growth patterns
    const audienceGrowthStrategies = [
      {
        strategy: "Cross-Platform Promotion",
        description: "Promote your content on social media",
        impact: "+25% more views",
        effort: "Low"
      },
      {
        strategy: "Collaboration Opportunities",
        description: "Partner with creators in your niche",
        impact: "+40% audience growth",
        effort: "Medium"
      },
      {
        strategy: "Trending Topic Integration",
        description: "Create content around trending topics",
        impact: "+45% more reach",
        effort: "Low"
      },
      {
        strategy: "Community Building",
        description: "Start a Discord or Telegram group",
        impact: "+20% higher engagement",
        effort: "High"
      }
    ];
    
    // Market trends (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be fetched from market research APIs
    const marketTrends = [
      {
        trend: "AI & Automation",
        growth: "35%",
        opportunity: "Create AI tool reviews and tutorials",
        timeline: "Next 30 days",
        difficulty: "Medium"
      },
      {
        trend: "Sustainable Tech",
        growth: "30%",
        opportunity: "Green technology investment content",
        timeline: "Next 60 days",
        difficulty: "Low"
      },
      {
        trend: "Remote Work Tools",
        growth: "22%",
        opportunity: "Productivity and freelance tools reviews",
        timeline: "Ongoing",
        difficulty: "Low"
      },
      {
        trend: "Regulatory Compliance",
        growth: "42%",
        opportunity: "Educational content on compliance",
        timeline: "Immediate",
        difficulty: "High"
      },
      {
        trend: "Creator Economy",
        growth: "40%",
        opportunity: "Monetization strategy guides",
        timeline: "Next 14 days",
        difficulty: "Medium"
      },
      {
        trend: "Web3 Development",
        growth: "45%",
        opportunity: "DeFi and blockchain tutorials",
        timeline: "Next 45 days",
        difficulty: "High"
      }
    ];
    
    // Revenue optimization tips (mock values - could be enhanced with real data if available)
    // In a real implementation, this would be generated from AI analysis of revenue patterns
    const revenueOptimizationTips = [
      {
        title: "Optimize Video Content",
        description: "Your videos have high engagement but low monetization. Consider adding sponsored segments.",
        impact: "High",
        effort: "Low"
      },
      {
        title: "Expand Marketplace",
        description: "Add premium product tiers to increase average order value by 35%.",
        impact: "High",
        effort: "Medium"
      },
      {
        title: "Leverage Live Streaming",
        description: "Your live streams generate 3x more revenue per viewer. Increase frequency.",
        impact: "Medium",
        effort: "Low"
      },
      {
        title: "Cross-Platform Promotion",
        description: "Promote high-value content across all platforms to maximize reach.",
        impact: "Medium",
        effort: "Low"
      }
    ];
    
    // Daily insight (mock value - could be enhanced with real data if available)
    // In a real implementation, this would be generated from AI analysis of user data
    const dailyInsights = [
      "Your video content has 3x higher engagement than posts. Increase video production by 40% to boost overall performance.",
      "Post content between 6-9 PM for 45% higher engagement. Your current posting time is suboptimal.",
      "Add premium tiers to your marketplace. Similar creators see 60% revenue increase with tiered pricing.",
      "Your audience is growing fastest in the 25-34 age group. Consider creating content specifically for this demographic.",
      "Engagement drops by 30% on weekends. Try scheduling important content for weekdays."
    ];
    const dailyInsight = dailyInsights[0]; // Use first insight instead of random for consistency
    
    const result = {
      age: ageDemographics,
      gender: genderDemographics,
      location: locationDemographics,
      interests: interestDemographics,
      totalFollowers,
      growthRate,
      peakHours,
      bestDays,
      engagementMetrics,
      contentRecommendations,
      audienceGrowthStrategies,
      marketTrends,
      revenueOptimizationTips,
      dailyInsight
    };

    // Cache the result for 10 minutes
    cache.set(cacheKey, result, 10 * 60 * 1000);

    return result;
  } catch (error) {
    console.error('Error processing user demographics:', error);
    throw error; // Propagate the error instead of returning fallback data
  }
};

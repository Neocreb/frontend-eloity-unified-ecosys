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
    // Fetch all users with demographic information
    const { data: users, error } = await supabase
      .from('users')
      .select('id, date_of_birth, gender, location, interests')
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

    // Calculate total followers (mock value based on user count)
    const totalFollowers = formatNumber(totalUsers * 150); // Assuming each user has ~150 followers
    
    // Calculate growth rate (mock value)
    const growthRate = "+" + (Math.random() * 10 + 5).toFixed(1) + "%";
    
    // Peak hours data (mock values)
    const peakHours = [
      { time: "6-9 AM", activity: Math.floor(Math.random() * 30) + 20 },
      { time: "12-3 PM", activity: Math.floor(Math.random() * 40) + 30 },
      { time: "6-9 PM", activity: Math.floor(Math.random() * 35) + 25 },
      { time: "9-12 PM", activity: Math.floor(Math.random() * 25) + 15 }
    ];
    
    // Best days data (mock values)
    const bestDays = [
      { day: "Tuesday", activity: Math.floor(Math.random() * 20) + 20 },
      { day: "Wednesday", activity: Math.floor(Math.random() * 25) + 25 },
      { day: "Thursday", activity: Math.floor(Math.random() * 20) + 15 },
      { day: "Monday", activity: Math.floor(Math.random() * 15) + 10 },
      { day: "Friday", activity: Math.floor(Math.random() * 15) + 5 }
    ];
    
    // Engagement metrics (mock values)
    const engagementMetrics = [
      { metric: "Average Session", value: "4:" + (Math.floor(Math.random() * 30) + 20), description: "Time spent per visit" },
      { metric: "Pages per Session", value: (Math.random() * 2 + 2).toFixed(1), description: "Average page views" },
      { metric: "Return Visitor Rate", value: Math.floor(Math.random() * 30 + 60) + "%", description: "Repeat audience" },
      { metric: "Share Rate", value: Math.floor(Math.random() * 10 + 8) + "%", description: "Content sharing" },
      { metric: "Comment Rate", value: Math.floor(Math.random() * 5 + 5) + "%", description: "Active commenting" },
      { metric: "Save Rate", value: Math.floor(Math.random() * 10 + 10) + "%", description: "Content saves" }
    ];
    
    // Content recommendations (mock values)
    const contentRecommendations = [
      {
        type: "Blog Post",
        topic: "Blockchain 101: An Introduction",
        reason: "High interest from audience",
        potential: `${(Math.floor(Math.random() * 1000) + 1000).toFixed(0)} views, ${formatNumber(Math.floor(Math.random() * 100) + 50)}`,
        confidence: Math.floor(Math.random() * 20 + 75)
      },
      {
        type: "Video Tutorial",
        topic: "Advanced Crypto Trading Strategies",
        reason: "High demand topic in your audience",
        potential: `${(Math.floor(Math.random() * 3000) + 3000).toFixed(0)} views, ${formatNumber(Math.floor(Math.random() * 1000) + 1500)}`,
        confidence: Math.floor(Math.random() * 20 + 65)
      },
      {
        type: "Live Stream",
        topic: "Q&A: Building Online Business",
        reason: "Your live content performs 3x better",
        potential: `${(Math.floor(Math.random() * 200) + 200).toFixed(0)} viewers, ${formatNumber(Math.floor(Math.random() * 300) + 300)}`,
        confidence: Math.floor(Math.random() * 20 + 70)
      },
      {
        type: "Product Launch",
        topic: "Premium Course: Freelance Mastery",
        reason: "Your audience shows high interest in education",
        potential: `${(Math.floor(Math.random() * 50) + 50).toFixed(0)} sales, ${formatNumber(Math.floor(Math.random() * 3000) + 3000)}`,
        confidence: Math.floor(Math.random() * 15 + 80)
      }
    ];
    
    // Audience growth strategies (mock values)
    const audienceGrowthStrategies = [
      {
        strategy: "Cross-Platform Promotion",
        description: "Promote your video content on social media",
        impact: "+" + Math.floor(Math.random() * 10 + 20) + "% more views",
        effort: "Low"
      },
      {
        strategy: "Collaboration Opportunities",
        description: "Partner with creators in your niche",
        impact: "+" + Math.floor(Math.random() * 15 + 30) + "% audience growth",
        effort: "Medium"
      },
      {
        strategy: "Trending Topic Integration",
        description: "Create content around #CryptoEducation",
        impact: "+" + Math.floor(Math.random() * 15 + 35) + "% more reach",
        effort: "Low"
      },
      {
        strategy: "Community Building",
        description: "Start a Discord or Telegram group",
        impact: "+" + Math.floor(Math.random() * 10 + 15) + "% higher engagement",
        effort: "High"
      }
    ];
    
    // Market trends (mock values)
    const marketTrends = [
      {
        trend: "AI & Automation",
        growth: Math.floor(Math.random() * 10 + 30) + "%",
        opportunity: "Create AI tool reviews and tutorials",
        timeline: "Next 30 days",
        difficulty: "Medium"
      },
      {
        trend: "Sustainable Tech",
        growth: Math.floor(Math.random() * 10 + 25) + "%",
        opportunity: "Green technology investment content",
        timeline: "Next 60 days",
        difficulty: "Low"
      },
      {
        trend: "Remote Work Tools",
        growth: Math.floor(Math.random() * 10 + 18) + "%",
        opportunity: "Productivity and freelance tools reviews",
        timeline: "Ongoing",
        difficulty: "Low"
      },
      {
        trend: "Crypto Regulations",
        growth: Math.floor(Math.random() * 10 + 38) + "%",
        opportunity: "Educational content on compliance",
        timeline: "Immediate",
        difficulty: "High"
      },
      {
        trend: "Creator Economy",
        growth: Math.floor(Math.random() * 10 + 35) + "%",
        opportunity: "Monetization strategy guides",
        timeline: "Next 14 days",
        difficulty: "Medium"
      },
      {
        trend: "Web3 Development",
        growth: Math.floor(Math.random() * 10 + 40) + "%",
        opportunity: "DeFi and blockchain tutorials",
        timeline: "Next 45 days",
        difficulty: "High"
      }
    ];
    
    // Revenue optimization tips (mock values)
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
    
    // Daily insight (mock value)
    const dailyInsights = [
      "Your video content has 3x higher engagement than posts. Increase video production by 40% to boost overall performance.",
      "Post content between 6-9 PM for 45% higher engagement. Your current posting time is suboptimal.",
      "Add premium tiers to your marketplace. Similar creators see 60% revenue increase with tiered pricing.",
      "Your audience is growing fastest in the 25-34 age group. Consider creating content specifically for this demographic.",
      "Engagement drops by 30% on weekends. Try scheduling important content for weekdays."
    ];
    const dailyInsight = dailyInsights[Math.floor(Math.random() * dailyInsights.length)];
    
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
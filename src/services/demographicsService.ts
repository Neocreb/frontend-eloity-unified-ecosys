import { fetchUserDemographics } from '@/services/userDemographicsService';

// Create a DemographicsService class to match the expected interface
export class DemographicsService {
  // This method matches the usage in EnhancedCreatorDashboard.tsx
  static async getProcessedDemographics(userId: string) {
    try {
      // For now, we'll return the user demographics data
      // In a more complex implementation, we might process this data specifically for the user
      const demographicsData = await fetchUserDemographics();
      return demographicsData;
    } catch (error) {
      console.error('Error fetching processed demographics:', error);
      // Return a default/fallback object to prevent app crashes
      return {
        age: [],
        gender: [],
        location: [],
        interests: [],
        totalFollowers: "0",
        growthRate: "0%",
        peakHours: [],
        bestDays: [],
        engagementMetrics: [],
        contentRecommendations: [],
        audienceGrowthStrategies: [],
        marketTrends: [],
        revenueOptimizationTips: [],
        dailyInsight: "Demographic data currently unavailable."
      };
    }
  }
}
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FeatureAnalytics, ContentAnalytics } from '@/services/analyticsService';
import { UserDemographics } from '@/services/userDemographicsService';
import { fetchPlatformAnalytics, fetchTopPerformingContent } from '@/services/analyticsService';
import { fetchUserDemographics } from '@/services/userDemographicsService';

interface RealtimeAnalyticsData {
  platformFeatures: FeatureAnalytics[];
  topPerformingContent: ContentAnalytics[];
  userDemographics: UserDemographics | null;
  isLoading: boolean;
  error: Error | null;
}

export const useRealtimeAnalytics = (userId: string | null) => {
  const [data, setData] = useState<RealtimeAnalyticsData>({
    platformFeatures: [],
    topPerformingContent: [],
    userDemographics: null,
    isLoading: true,
    error: null
  });

  const refreshData = useCallback(async () => {
    if (!userId) return;

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch all data in parallel
      const [platformFeatures, topPerformingContent, userDemographics] = await Promise.all([
        fetchPlatformAnalytics(),
        fetchTopPerformingContent(),
        fetchUserDemographics()
      ]);

      setData({
        platformFeatures,
        topPerformingContent,
        userDemographics,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
      }
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch analytics data. Please check your connection and try again.';
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: new Error(errorMessage)
      }));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setData({
        platformFeatures: [],
        topPerformingContent: [],
        userDemographics: null,
        isLoading: false,
        error: null
      });
      return;
    }

    // Initial data load
    refreshData();

    // Set up real-time subscriptions
    const subscriptions = [
      // Subscribe to posts changes
      supabase
        .channel('posts-analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts'
          },
          () => {
            // Refresh posts analytics when posts change
            refreshData();
          }
        )
        .subscribe(),

      // Subscribe to videos changes
      supabase
        .channel('videos-analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'videos'
          },
          () => {
            // Refresh videos analytics when videos change
            refreshData();
          }
        )
        .subscribe(),

      // Subscribe to products changes
      supabase
        .channel('products-analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          () => {
            // Refresh products analytics when products change
            refreshData();
          }
        )
        .subscribe(),

      // Subscribe to content_analytics changes
      supabase
        .channel('content-analytics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'content_analytics'
          },
          () => {
            // Refresh content analytics when content_analytics change
            refreshData();
          }
        )
        .subscribe(),

      // Subscribe to users changes (for demographics)
      supabase
        .channel('users-demographics')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users'
          },
          () => {
            // Refresh user demographics when users change
            refreshData();
          }
        )
        .subscribe()
    ];

    // Clean up subscriptions
    return () => {
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, [userId, refreshData]);

  return {
    ...data,
    refreshData
  };
};
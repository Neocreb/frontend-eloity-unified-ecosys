import { supabase } from '@/integrations/supabase/client';

// Types for feature configuration
export interface FeatureConfiguration {
  id: string;
  user_id: string;
  feature_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Default configurations for different features
const DEFAULT_CONFIGURATIONS: Record<string, Record<string, any>> = {
  "Feed & Social": {
    postVisibility: "public",
    commentNotifications: true,
    likeNotifications: true,
    shareNotifications: true,
    autoSaveDrafts: true,
    scheduledPosts: 5
  },
  "Video": {
    defaultQuality: "1080p",
    autoCaptions: true,
    monetization: false,
    allowDownloads: true,
    maxVideoLength: 3600, // seconds
    scheduledStreams: 3
  },
  "Marketplace": {
    defaultCurrency: "USD",
    autoApproveProducts: false,
    commissionRate: 10,
    maxListings: 50,
    featuredProducts: 5
  },
  "Freelance": {
    jobNotifications: true,
    bidLimit: 10,
    autoAcceptReviews: false,
    featuredProfile: false,
    maxActiveProjects: 5
  },
  "Finance": {
    currency: "USD",
    notifications: true,
    autoInvest: false,
    riskTolerance: "medium",
    dailyLimit: 10000
  },
  "Engagement": {
    messageNotifications: true,
    callNotifications: true,
    autoAway: 30, // minutes
    readReceipts: true,
    typingIndicators: true
  },
  "Live Streaming": {
    defaultQuality: "720p",
    autoRecord: false,
    allowDownloads: false,
    maxViewers: 1000,
    scheduledStreams: 5
  },
  "Events & Calendar": {
    eventNotifications: true,
    reminderTime: 30, // minutes
    autoShare: false,
    maxEvents: 20,
    recurringEvents: true
  }
};

// Fetch feature configuration for a user
export const fetchFeatureConfiguration = async (
  userId: string,
  featureName: string
): Promise<FeatureConfiguration | null> => {
  try {
    const { data, error } = await supabase
      .from('feature_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, return null
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching feature configuration:', error);
    return null;
  }
};

// Create or update feature configuration
export const saveFeatureConfiguration = async (
  userId: string,
  featureName: string,
  isEnabled: boolean,
  config: Record<string, any> = {}
): Promise<FeatureConfiguration> => {
  try {
    // First try to update existing configuration
    const { data: existing, error: fetchError } = await supabase
      .from('feature_configurations')
      .select('id')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single();

    if (existing) {
      // Update existing configuration
      const { data, error } = await supabase
        .from('feature_configurations')
        .update({
          is_enabled: isEnabled,
          config: config
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new configuration
      const { data, error } = await supabase
        .from('feature_configurations')
        .insert({
          user_id: userId,
          feature_name: featureName,
          is_enabled: isEnabled,
          config: config
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving feature configuration:', error);
    throw error;
  }
};

// Get default configuration for a feature
export const getDefaultConfiguration = (featureName: string): Record<string, any> => {
  return DEFAULT_CONFIGURATIONS[featureName] || {};
};

// Toggle feature enabled/disabled
export const toggleFeature = async (
  userId: string,
  featureName: string,
  currentStatus: boolean
): Promise<boolean> => {
  try {
    const newStatus = !currentStatus;
    
    // Get existing configuration or create default
    let config = getDefaultConfiguration(featureName);
    
    const existingConfig = await fetchFeatureConfiguration(userId, featureName);
    if (existingConfig) {
      config = existingConfig.config;
    }
    
    await saveFeatureConfiguration(userId, featureName, newStatus, config);
    return newStatus;
  } catch (error) {
    console.error('Error toggling feature:', error);
    throw error;
  }
};

// Update specific configuration values
export const updateFeatureConfig = async (
  userId: string,
  featureName: string,
  configUpdates: Record<string, any>
): Promise<FeatureConfiguration> => {
  try {
    // Get existing configuration
    const existingConfig = await fetchFeatureConfiguration(userId, featureName);
    
    let config = { ...getDefaultConfiguration(featureName) };
    
    if (existingConfig) {
      config = { ...config, ...existingConfig.config };
    }
    
    // Apply updates
    config = { ...config, ...configUpdates };
    
    return await saveFeatureConfiguration(userId, featureName, existingConfig?.is_enabled ?? true, config);
  } catch (error) {
    console.error('Error updating feature configuration:', error);
    throw error;
  }
};
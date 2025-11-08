import { 
  fetchFeatureConfiguration, 
  saveFeatureConfiguration, 
  toggleFeature,
  updateFeatureConfig,
  getDefaultConfiguration
} from '@/services/featureConfigurationService';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureActivation {
  id: string;
  user_id: string;
  feature_name: string;
  is_activated: boolean;
  activated_at: string;
  deactivated_at: string | null;
  activation_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Activate a feature for a user
export const activateFeature = async (
  userId: string,
  featureName: string,
  activationReason?: string
): Promise<FeatureActivation> => {
  try {
    // First, ensure the feature is enabled in the configuration
    const existingConfig = await fetchFeatureConfiguration(userId, featureName);
    
    let config = { ...getDefaultConfiguration(featureName) };
    
    if (existingConfig) {
      config = existingConfig.config;
    }
    
    // Save the feature configuration as enabled
    await saveFeatureConfiguration(userId, featureName, true, config);
    
    // Create or update the activation record
    const now = new Date().toISOString();
    
    // Check if there's already an activation record
    const { data: existingActivation, error: fetchError } = await supabase
      .from('feature_activations')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingActivation && existingActivation.is_activated) {
      // Feature is already activated, return the existing record
      return existingActivation;
    }

    let activationRecord;
    
    if (existingActivation) {
      // Update existing activation record
      const { data, error } = await supabase
        .from('feature_activations')
        .update({
          is_activated: true,
          activated_at: now,
          deactivated_at: null,
          activation_reason: activationReason || null,
          updated_at: now
        })
        .eq('id', existingActivation.id)
        .select()
        .single();

      if (error) throw error;
      activationRecord = data;
    } else {
      // Create new activation record
      const { data, error } = await supabase
        .from('feature_activations')
        .insert({
          user_id: userId,
          feature_name: featureName,
          is_activated: true,
          activated_at: now,
          deactivated_at: null,
          activation_reason: activationReason || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      activationRecord = data;
    }

    return activationRecord;
  } catch (error) {
    console.error('Error activating feature:', error);
    throw error;
  }
};

// Deactivate a feature for a user
export const deactivateFeature = async (
  userId: string,
  featureName: string,
  deactivationReason?: string
): Promise<FeatureActivation> => {
  try {
    // First, ensure the feature is disabled in the configuration
    const existingConfig = await fetchFeatureConfiguration(userId, featureName);
    
    let config = { ...getDefaultConfiguration(featureName) };
    
    if (existingConfig) {
      config = existingConfig.config;
    }
    
    // Save the feature configuration as disabled
    await saveFeatureConfiguration(userId, featureName, false, config);
    
    // Update the activation record
    const now = new Date().toISOString();
    
    // Check if there's an activation record
    const { data: existingActivation, error: fetchError } = await supabase
      .from('feature_activations')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!existingActivation) {
      // No activation record exists, create a deactivated one
      const { data, error } = await supabase
        .from('feature_activations')
        .insert({
          user_id: userId,
          feature_name: featureName,
          is_activated: false,
          activated_at: null,
          deactivated_at: now,
          activation_reason: null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Update existing activation record
    const { data, error } = await supabase
      .from('feature_activations')
      .update({
        is_activated: false,
        deactivated_at: now,
        activation_reason: existingActivation.activation_reason,
        updated_at: now
      })
      .eq('id', existingActivation.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deactivating feature:', error);
    throw error;
  }
};

// Get activation status for a feature
export const getFeatureActivationStatus = async (
  userId: string,
  featureName: string
): Promise<FeatureActivation | null> => {
  try {
    const { data, error } = await supabase
      .from('feature_activations')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, return null
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching feature activation status:', error);
    return null;
  }
};

// Get all activated features for a user
export const getUserActivatedFeatures = async (
  userId: string
): Promise<FeatureActivation[]> => {
  try {
    const { data, error } = await supabase
      .from('feature_activations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_activated', true)
      .order('activated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user activated features:', error);
    return [];
  }
};

// Bulk activate features
export const bulkActivateFeatures = async (
  userId: string,
  featureNames: string[],
  activationReason?: string
): Promise<FeatureActivation[]> => {
  try {
    const activations: FeatureActivation[] = [];
    
    for (const featureName of featureNames) {
      const activation = await activateFeature(userId, featureName, activationReason);
      activations.push(activation);
    }
    
    return activations;
  } catch (error) {
    console.error('Error bulk activating features:', error);
    throw error;
  }
};

// Bulk deactivate features
export const bulkDeactivateFeatures = async (
  userId: string,
  featureNames: string[],
  deactivationReason?: string
): Promise<FeatureActivation[]> => {
  try {
    const activations: FeatureActivation[] = [];
    
    for (const featureName of featureNames) {
      const activation = await deactivateFeature(userId, featureName, deactivationReason);
      activations.push(activation);
    }
    
    return activations;
  } catch (error) {
    console.error('Error bulk deactivating features:', error);
    throw error;
  }
};
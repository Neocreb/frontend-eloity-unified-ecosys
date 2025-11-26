import { supabase } from '@/integrations/supabase/client';

export interface CreatorBoost {
  id: string;
  userId: string;
  boostType: 'tier_upgrade' | 'seasonal' | 'promotional' | 'referral';
  multiplier: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  appliedEarnings?: number;
  createdAt: string;
}

export interface BoostConfig {
  id: string;
  boostType: string;
  multiplier: number;
  durationDays: number;
  description: string;
  enabled: boolean;
  conditions?: Record<string, any>;
}

export interface CreatorEarningsWithBoost {
  baseEarnings: number;
  multiplier: number;
  boostEarnings: number;
  totalEarnings: number;
  boostInfo: CreatorBoost | null;
}

class CreatorFundBoostService {
  private readonly TIER_UPGRADE_MULTIPLIER = 1.5;
  private readonly TIER_UPGRADE_DURATION_DAYS = 30;

  /**
   * Apply boost to newly verified Tier 2 creator
   */
  async applyTierUpgradeBoost(userId: string): Promise<CreatorBoost | null> {
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + this.TIER_UPGRADE_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('creator_boosts')
        .insert({
          user_id: userId,
          boost_type: 'tier_upgrade',
          multiplier: this.TIER_UPGRADE_MULTIPLIER,
          description: `Welcome to Tier 2! Earn ${this.TIER_UPGRADE_MULTIPLIER}x for your first month`,
          start_date: startDate,
          end_date: endDate,
          is_active: true,
          created_at: startDate
        })
        .select()
        .single();

      if (error) {
        console.error('Error applying tier upgrade boost:', error);
        return null;
      }

      return this.mapBoostRecord(data);
    } catch (error) {
      console.error('Error applying tier upgrade boost:', error);
      return null;
    }
  }

  /**
   * Get active boost for a creator
   */
  async getActiveBoost(userId: string): Promise<CreatorBoost | null> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('creator_boosts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active boost:', error);
        return null;
      }

      return data ? this.mapBoostRecord(data) : null;
    } catch (error) {
      console.error('Error fetching active boost:', error);
      return null;
    }
  }

  /**
   * Get all boosts for a creator
   */
  async getCreatorBoosts(userId: string): Promise<CreatorBoost[]> {
    try {
      const { data, error } = await supabase
        .from('creator_boosts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching creator boosts:', error);
        return [];
      }

      return data?.map(this.mapBoostRecord) || [];
    } catch (error) {
      console.error('Error fetching creator boosts:', error);
      return [];
    }
  }

  /**
   * Calculate earnings with boost applied
   */
  async calculateEarningsWithBoost(userId: string, baseEarnings: number): Promise<CreatorEarningsWithBoost> {
    try {
      const boost = await this.getActiveBoost(userId);

      if (!boost) {
        return {
          baseEarnings,
          multiplier: 1,
          boostEarnings: 0,
          totalEarnings: baseEarnings,
          boostInfo: null
        };
      }

      const totalEarnings = Math.round(baseEarnings * boost.multiplier * 100) / 100;
      const boostEarnings = Math.round((totalEarnings - baseEarnings) * 100) / 100;

      return {
        baseEarnings,
        multiplier: boost.multiplier,
        boostEarnings,
        totalEarnings,
        boostInfo: boost
      };
    } catch (error) {
      console.error('Error calculating earnings with boost:', error);
      return {
        baseEarnings,
        multiplier: 1,
        boostEarnings: 0,
        totalEarnings: baseEarnings,
        boostInfo: null
      };
    }
  }

  /**
   * Create seasonal boost configuration
   */
  async createSeasonalBoost(
    boostType: 'seasonal' | 'promotional',
    multiplier: number,
    durationDays: number,
    description: string,
    conditions?: Record<string, any>
  ): Promise<BoostConfig | null> {
    try {
      const { data, error } = await supabase
        .from('boost_configurations')
        .insert({
          boost_type: boostType,
          multiplier,
          duration_days: durationDays,
          description,
          enabled: true,
          conditions: conditions || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating seasonal boost:', error);
        return null;
      }

      return this.mapBoostConfig(data);
    } catch (error) {
      console.error('Error creating seasonal boost:', error);
      return null;
    }
  }

  /**
   * Apply seasonal boost to all eligible creators
   */
  async applySeasonalBoostToAll(boostConfigId: string): Promise<number> {
    try {
      const config = await this.getBoostConfig(boostConfigId);
      if (!config) {
        throw new Error('Boost configuration not found');
      }

      // Get all Tier 2 creators
      const { data: creators, error: creatorError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('tier_level', 'tier_2')
        .eq('is_creator', true);

      if (creatorError) {
        console.error('Error fetching creators:', creatorError);
        return 0;
      }

      if (!creators || creators.length === 0) {
        return 0;
      }

      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + config.durationDays * 24 * 60 * 60 * 1000).toISOString();

      const boosts = creators.map(creator => ({
        user_id: creator.user_id,
        boost_type: config.boostType,
        multiplier: config.multiplier,
        description: config.description,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        config_id: boostConfigId,
        created_at: startDate
      }));

      const { error: insertError } = await supabase
        .from('creator_boosts')
        .insert(boosts);

      if (insertError) {
        console.error('Error applying seasonal boosts:', insertError);
        return 0;
      }

      return creators.length;
    } catch (error) {
      console.error('Error applying seasonal boost to all:', error);
      return 0;
    }
  }

  /**
   * Get boost configuration
   */
  async getBoostConfig(configId: string): Promise<BoostConfig | null> {
    try {
      const { data, error } = await supabase
        .from('boost_configurations')
        .select('*')
        .eq('id', configId)
        .single();

      if (error) {
        console.error('Error fetching boost config:', error);
        return null;
      }

      return this.mapBoostConfig(data);
    } catch (error) {
      console.error('Error fetching boost config:', error);
      return null;
    }
  }

  /**
   * Get all boost configurations
   */
  async getAllBoostConfigs(): Promise<BoostConfig[]> {
    try {
      const { data, error } = await supabase
        .from('boost_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching boost configs:', error);
        return [];
      }

      return data?.map(this.mapBoostConfig) || [];
    } catch (error) {
      console.error('Error fetching boost configs:', error);
      return [];
    }
  }

  /**
   * Update boost configuration
   */
  async updateBoostConfig(
    configId: string,
    updates: Partial<BoostConfig>
  ): Promise<BoostConfig | null> {
    try {
      const { data, error } = await supabase
        .from('boost_configurations')
        .update({
          multiplier: updates.multiplier,
          duration_days: updates.durationDays,
          description: updates.description,
          enabled: updates.enabled,
          conditions: updates.conditions
        })
        .eq('id', configId)
        .select()
        .single();

      if (error) {
        console.error('Error updating boost config:', error);
        return null;
      }

      return this.mapBoostConfig(data);
    } catch (error) {
      console.error('Error updating boost config:', error);
      return null;
    }
  }

  /**
   * Get boost usage statistics
   */
  async getBoostStats(): Promise<{
    totalActiveBoosts: number;
    boostsByType: Record<string, number>;
    totalBoostedEarnings: number;
    averageMultiplier: number;
  }> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('creator_boosts')
        .select('boost_type, multiplier, applied_earnings')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      if (error) {
        console.error('Error fetching boost stats:', error);
        return {
          totalActiveBoosts: 0,
          boostsByType: {},
          totalBoostedEarnings: 0,
          averageMultiplier: 0
        };
      }

      if (!data || data.length === 0) {
        return {
          totalActiveBoosts: 0,
          boostsByType: {},
          totalBoostedEarnings: 0,
          averageMultiplier: 0
        };
      }

      const boostsByType: Record<string, number> = {};
      let totalEarnings = 0;
      let totalMultiplier = 0;

      data.forEach(boost => {
        boostsByType[boost.boost_type] = (boostsByType[boost.boost_type] || 0) + 1;
        totalEarnings += boost.applied_earnings || 0;
        totalMultiplier += boost.multiplier;
      });

      return {
        totalActiveBoosts: data.length,
        boostsByType,
        totalBoostedEarnings: Math.round(totalEarnings * 100) / 100,
        averageMultiplier: Math.round((totalMultiplier / data.length) * 100) / 100
      };
    } catch (error) {
      console.error('Error getting boost stats:', error);
      return {
        totalActiveBoosts: 0,
        boostsByType: {},
        totalBoostedEarnings: 0,
        averageMultiplier: 0
      };
    }
  }

  /**
   * Deactivate boost
   */
  async deactivateBoost(boostId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('creator_boosts')
        .update({ is_active: false })
        .eq('id', boostId);

      if (error) {
        console.error('Error deactivating boost:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deactivating boost:', error);
      return false;
    }
  }

  /**
   * Record boost earnings for analytics
   */
  async recordBoostEarnings(boostId: string, earnings: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('creator_boosts')
        .update({
          applied_earnings: earnings
        })
        .eq('id', boostId);

      if (error) {
        console.error('Error recording boost earnings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error recording boost earnings:', error);
      return false;
    }
  }

  /**
   * Helper: Map database record to boost object
   */
  private mapBoostRecord(data: any): CreatorBoost {
    return {
      id: data.id,
      userId: data.user_id,
      boostType: data.boost_type,
      multiplier: data.multiplier,
      description: data.description,
      startDate: data.start_date,
      endDate: data.end_date,
      isActive: data.is_active,
      appliedEarnings: data.applied_earnings,
      createdAt: data.created_at
    };
  }

  /**
   * Helper: Map database record to boost config object
   */
  private mapBoostConfig(data: any): BoostConfig {
    return {
      id: data.id,
      boostType: data.boost_type,
      multiplier: data.multiplier,
      durationDays: data.duration_days,
      description: data.description,
      enabled: data.enabled,
      conditions: data.conditions
    };
  }
}

export const creatorFundBoostService = new CreatorFundBoostService();

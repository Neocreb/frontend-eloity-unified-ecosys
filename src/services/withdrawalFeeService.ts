import { supabase } from '@/integrations/supabase/client';

export interface FeeConfig {
  category: 'marketplace' | 'crypto' | 'creator' | 'freelance';
  feePercentage: number;
  minFee?: number;
  maxFee?: number;
  description: string;
}

export interface FeeCalculation {
  grossAmount: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  category: string;
}

export interface WithdrawalFeeBreakdown {
  category: string;
  source: string;
  grossAmount: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  appliedAt: string;
}

export interface RevenueRecord {
  id: string;
  category: string;
  date: string;
  feeAmount: number;
  grossAmount: number;
  count: number;
}

class WithdrawalFeeService {
  private readonly feeConfigs: Record<string, FeeConfig> = {
    marketplace: {
      category: 'marketplace',
      feePercentage: 1.5,
      minFee: 0.25,
      maxFee: 100,
      description: 'Marketplace seller withdrawal fee'
    },
    crypto: {
      category: 'crypto',
      feePercentage: 0.3,
      minFee: 0.1,
      maxFee: 50,
      description: 'Crypto withdrawal fee'
    },
    creator: {
      category: 'creator',
      feePercentage: 3.0,
      minFee: 0.5,
      maxFee: 200,
      description: 'Creator fund withdrawal fee'
    },
    freelance: {
      category: 'freelance',
      feePercentage: 2.0,
      minFee: 0.25,
      maxFee: 75,
      description: 'Freelance earnings withdrawal fee'
    }
  };

  /**
   * Calculate fee for a withdrawal amount
   */
  calculateFee(amount: number, category: 'marketplace' | 'crypto' | 'creator' | 'freelance'): FeeCalculation {
    const config = this.feeConfigs[category];
    if (!config) {
      throw new Error(`Unknown withdrawal category: ${category}`);
    }

    const feeAmount = Math.max(
      config.minFee || 0,
      Math.min(
        config.maxFee || Infinity,
        amount * (config.feePercentage / 100)
      )
    );

    return {
      grossAmount: amount,
      feePercentage: config.feePercentage,
      feeAmount: Math.round(feeAmount * 100) / 100,
      netAmount: Math.round((amount - feeAmount) * 100) / 100,
      category: config.category
    };
  }

  /**
   * Calculate fees for multiple withdrawal sources
   */
  calculateMultipleFees(withdrawals: Array<{
    amount: number;
    category: 'marketplace' | 'crypto' | 'creator' | 'freelance';
    source: string;
  }>): WithdrawalFeeBreakdown[] {
    return withdrawals.map(withdrawal => {
      const feeCalc = this.calculateFee(withdrawal.amount, withdrawal.category);
      return {
        category: withdrawal.category,
        source: withdrawal.source,
        grossAmount: feeCalc.grossAmount,
        feePercentage: feeCalc.feePercentage,
        feeAmount: feeCalc.feeAmount,
        netAmount: feeCalc.netAmount,
        appliedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Get fee configuration for a category
   */
  getFeeConfig(category: string): FeeConfig | null {
    return this.feeConfigs[category] || null;
  }

  /**
   * Get all fee configurations
   */
  getAllFeeConfigs(): FeeConfig[] {
    return Object.values(this.feeConfigs);
  }

  /**
   * Update fee configuration (admin only)
   */
  async updateFeeConfig(
    category: string,
    feePercentage: number,
    minFee?: number,
    maxFee?: number
  ): Promise<boolean> {
    if (!this.feeConfigs[category]) {
      return false;
    }

    this.feeConfigs[category] = {
      ...this.feeConfigs[category],
      feePercentage,
      ...(minFee !== undefined && { minFee }),
      ...(maxFee !== undefined && { maxFee })
    };

    return true;
  }

  /**
   * Record a fee in the revenue tracking table
   */
  async recordFeeRevenue(
    userId: string,
    feeBreakdown: WithdrawalFeeBreakdown,
    transactionId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawal_fee_revenue')
        .insert({
          user_id: userId,
          category: feeBreakdown.category,
          source: feeBreakdown.source,
          gross_amount: feeBreakdown.grossAmount,
          fee_percentage: feeBreakdown.feePercentage,
          fee_amount: feeBreakdown.feeAmount,
          net_amount: feeBreakdown.netAmount,
          transaction_id: transactionId,
          recorded_at: feeBreakdown.appliedAt
        });

      if (error) {
        console.error('Error recording fee revenue:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error recording fee revenue:', error);
      return false;
    }
  }

  /**
   * Get revenue summary by category
   */
  async getRevenueByCategory(
    startDate?: string,
    endDate?: string
  ): Promise<RevenueRecord[]> {
    try {
      let query = supabase
        .from('withdrawal_fee_revenue')
        .select('category, fee_amount, gross_amount, recorded_at');

      if (startDate) {
        query = query.gte('recorded_at', startDate);
      }
      if (endDate) {
        query = query.lte('recorded_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching revenue by category:', error);
        return [];
      }

      const grouped: Record<string, any> = {};

      data?.forEach((record: any) => {
        const date = new Date(record.recorded_at).toISOString().split('T')[0];
        const key = `${record.category}-${date}`;

        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            category: record.category,
            date,
            feeAmount: 0,
            grossAmount: 0,
            count: 0
          };
        }

        grouped[key].feeAmount += record.fee_amount;
        grouped[key].grossAmount += record.gross_amount;
        grouped[key].count += 1;
      });

      return Object.values(grouped);
    } catch (error) {
      console.error('Error getting revenue by category:', error);
      return [];
    }
  }

  /**
   * Get total revenue generated
   */
  async getTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
    try {
      let query = supabase
        .from('withdrawal_fee_revenue')
        .select('fee_amount');

      if (startDate) {
        query = query.gte('recorded_at', startDate);
      }
      if (endDate) {
        query = query.lte('recorded_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching total revenue:', error);
        return 0;
      }

      return data?.reduce((sum: number, record: any) => sum + (record.fee_amount || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      return 0;
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(): Promise<{
    totalRevenue: number;
    transactionCount: number;
    averageFeeAmount: number;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('withdrawal_fee_revenue')
        .select('fee_amount, category');

      if (error) {
        console.error('Error fetching revenue stats:', error);
        return {
          totalRevenue: 0,
          transactionCount: 0,
          averageFeeAmount: 0,
          categoryBreakdown: {}
        };
      }

      const totalRevenue = data?.reduce((sum: number, r: any) => sum + (r.fee_amount || 0), 0) || 0;
      const transactionCount = data?.length || 0;
      const averageFeeAmount = transactionCount > 0 ? totalRevenue / transactionCount : 0;

      const categoryBreakdown: Record<string, number> = {};
      data?.forEach((record: any) => {
        categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + (record.fee_amount || 0);
      });

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        transactionCount,
        averageFeeAmount: Math.round(averageFeeAmount * 100) / 100,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      return {
        totalRevenue: 0,
        transactionCount: 0,
        averageFeeAmount: 0,
        categoryBreakdown: {}
      };
    }
  }
}

export const withdrawalFeeService = new WithdrawalFeeService();

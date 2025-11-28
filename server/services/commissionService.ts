import { supabaseServer } from '../supabaseServer.js';
import { logger } from '../utils/logger.js';

export interface CommissionSetting {
  id: string;
  service_type: string;
  operator_id: number | null;
  commission_type: 'percentage' | 'fixed_amount' | 'none';
  commission_value: number;
  min_amount?: number;
  max_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionTransaction {
  id: string;
  user_id: string;
  service_type: string;
  operator_id: number;
  operator_name: string;
  recipient: string;
  amount: number;
  reloadly_amount: number;
  commission_earned: number;
  commission_rate: number;
  commission_type: string;
  status: string;
  reloadly_transaction_id?: string;
  reloadly_reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommissionCalculation {
  original_amount: number;
  commission_value: number;
  commission_type: string;
  commission_rate: number;
  final_amount: number;
  reloadly_amount: number;
}

class CommissionService {
  /**
   * Get commission setting for a specific service and operator
   */
  async getCommissionSetting(
    serviceType: string,
    operatorId?: number
  ): Promise<CommissionSetting | null> {
    try {
      const query = supabaseServer
        .from('reloadly_commission_settings')
        .select('*')
        .eq('service_type', serviceType)
        .eq('is_active', true);

      if (operatorId) {
        // Try to get operator-specific setting first
        const { data, error } = await query
          .eq('operator_id', operatorId)
          .single();

        if (!error && data) {
          return data;
        }

        // Fall back to global setting (operator_id = null)
        const { data: globalData, error: globalError } = await supabaseServer
          .from('reloadly_commission_settings')
          .select('*')
          .eq('service_type', serviceType)
          .is('operator_id', null)
          .eq('is_active', true)
          .single();

        if (!globalError && globalData) {
          return globalData;
        }
      } else {
        // Get global setting
        const { data, error } = await supabaseServer
          .from('reloadly_commission_settings')
          .select('*')
          .eq('service_type', serviceType)
          .is('operator_id', null)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          return data;
        }
      }

      return null;
    } catch (error) {
      logger.error('Error getting commission setting:', error);
      throw error;
    }
  }

  /**
   * Get all commission settings
   */
  async getAllCommissionSettings(
    filters?: {
      serviceType?: string;
      isActive?: boolean;
    }
  ): Promise<CommissionSetting[]> {
    try {
      let query = supabaseServer
        .from('reloadly_commission_settings')
        .select('*');

      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query.order('service_type', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting all commission settings:', error);
      throw error;
    }
  }

  /**
   * Create a new commission setting
   */
  async createCommissionSetting(
    setting: Omit<CommissionSetting, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<CommissionSetting> {
    try {
      // Validate
      if (!setting.service_type || !setting.commission_type) {
        throw new Error('Missing required fields: service_type, commission_type');
      }

      if (setting.commission_value < 0) {
        throw new Error('Commission value cannot be negative');
      }

      if (
        setting.commission_type === 'percentage' &&
        setting.commission_value > 100
      ) {
        throw new Error('Percentage commission cannot exceed 100%');
      }

      const { data, error } = await supabaseServer
        .from('reloadly_commission_settings')
        .insert([
          {
            ...setting,
            created_by: userId,
            updated_by: userId
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('Commission setting created', {
        settingId: data.id,
        serviceType: setting.service_type,
        operatorId: setting.operator_id
      });

      return data;
    } catch (error) {
      logger.error('Error creating commission setting:', error);
      throw error;
    }
  }

  /**
   * Update a commission setting
   */
  async updateCommissionSetting(
    settingId: string,
    updates: Partial<CommissionSetting>,
    userId: string
  ): Promise<CommissionSetting> {
    try {
      // Validate
      if (updates.commission_value !== undefined && updates.commission_value < 0) {
        throw new Error('Commission value cannot be negative');
      }

      if (
        updates.commission_type === 'percentage' &&
        updates.commission_value !== undefined &&
        updates.commission_value > 100
      ) {
        throw new Error('Percentage commission cannot exceed 100%');
      }

      const { data, error } = await supabaseServer
        .from('reloadly_commission_settings')
        .update({
          ...updates,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('Commission setting updated', {
        settingId,
        updates
      });

      return data;
    } catch (error) {
      logger.error('Error updating commission setting:', error);
      throw error;
    }
  }

  /**
   * Delete a commission setting
   */
  async deleteCommissionSetting(settingId: string): Promise<void> {
    try {
      const { error } = await supabaseServer
        .from('reloadly_commission_settings')
        .delete()
        .eq('id', settingId);

      if (error) {
        throw error;
      }

      logger.info('Commission setting deleted', { settingId });
    } catch (error) {
      logger.error('Error deleting commission setting:', error);
      throw error;
    }
  }

  /**
   * Calculate commission and final price for a transaction
   */
  async calculateCommission(
    serviceType: string,
    amount: number,
    operatorId?: number
  ): Promise<CommissionCalculation> {
    try {
      const setting = await this.getCommissionSetting(serviceType, operatorId);

      // Default: no commission
      if (!setting || setting.commission_type === 'none') {
        return {
          original_amount: amount,
          commission_value: 0,
          commission_type: 'none',
          commission_rate: 0,
          final_amount: amount,
          reloadly_amount: amount
        };
      }

      // Check min/max amounts
      if (setting.min_amount && amount < setting.min_amount) {
        throw new Error(
          `Amount must be at least ${setting.min_amount} ${serviceType}`
        );
      }

      if (setting.max_amount && amount > setting.max_amount) {
        throw new Error(
          `Amount cannot exceed ${setting.max_amount} ${serviceType}`
        );
      }

      let commissionValue = 0;
      let finalAmount = amount;

      if (setting.commission_type === 'percentage') {
        commissionValue = amount * (setting.commission_value / 100);
        finalAmount = amount + commissionValue;
      } else if (setting.commission_type === 'fixed_amount') {
        commissionValue = setting.commission_value;
        finalAmount = amount + commissionValue;
      }

      return {
        original_amount: amount,
        commission_value: parseFloat(commissionValue.toFixed(4)),
        commission_type: setting.commission_type,
        commission_rate: setting.commission_value,
        final_amount: parseFloat(finalAmount.toFixed(2)),
        reloadly_amount: amount
      };
    } catch (error) {
      logger.error('Error calculating commission:', error);
      throw error;
    }
  }

  /**
   * Record a transaction
   */
  async recordTransaction(
    transaction: Omit<CommissionTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CommissionTransaction> {
    try {
      const { data, error } = await supabaseServer
        .from('reloadly_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('Transaction recorded', {
        transactionId: data.id,
        userId: transaction.user_id,
        amount: transaction.amount
      });

      return data;
    } catch (error) {
      logger.error('Error recording transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<CommissionTransaction> {
    try {
      const { data, error } = await supabaseServer
        .from('reloadly_transactions')
        .update({
          status,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('Transaction status updated', {
        transactionId,
        status
      });

      return data;
    } catch (error) {
      logger.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get user's transactions
   */
  async getUserTransactions(
    userId: string,
    filters?: {
      serviceType?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ transactions: CommissionTransaction[]; total: number }> {
    try {
      let query = supabaseServer
        .from('reloadly_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        transactions: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error getting user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<CommissionTransaction | null> {
    try {
      const { data, error } = await supabaseServer
        .from('reloadly_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get commission statistics
   */
  async getCommissionStats(
    filters?: {
      serviceType?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<{
    total_transactions: number;
    total_amount: number;
    total_commission: number;
    average_commission_rate: number;
    success_rate: number;
  }> {
    try {
      let query = supabaseServer
        .from('reloadly_transactions')
        .select('*');

      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const transactions = data || [];
      const successful = transactions.filter((t) => t.status === 'success');

      const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalCommission = successful.reduce(
        (sum, t) => sum + parseFloat(t.commission_earned),
        0
      );

      return {
        total_transactions: transactions.length,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        total_commission: parseFloat(totalCommission.toFixed(4)),
        average_commission_rate:
          successful.length > 0
            ? parseFloat(
                (
                  successful.reduce((sum, t) => sum + t.commission_rate, 0) /
                  successful.length
                ).toFixed(4)
              )
            : 0,
        success_rate:
          transactions.length > 0
            ? parseFloat(((successful.length / transactions.length) * 100).toFixed(2))
            : 0
      };
    } catch (error) {
      logger.error('Error getting commission stats:', error);
      throw error;
    }
  }

  /**
   * Cache operator data
   */
  async cacheOperator(operatorData: any): Promise<void> {
    try {
      const { error } = await supabaseServer
        .from('reloadly_operator_cache')
        .upsert(
          [
            {
              operator_id: operatorData.id,
              operator_name: operatorData.name,
              country_code: operatorData.country_code || 'NG',
              supports_bundles: operatorData.bundle || false,
              supports_data: operatorData.data || false,
              supports_pin: operatorData.pin || false,
              supports_airtime: !operatorData.pin || false,
              sender_currency_code: operatorData.senderCurrencyCode,
              sender_currency_symbol: operatorData.senderCurrencySymbol,
              destination_currency_code: operatorData.destinationCurrencyCode,
              destination_currency_symbol: operatorData.destinationCurrencySymbol,
              fx_rate: operatorData.fxRate,
              logo_urls: operatorData.logoUrls,
              last_synced: new Date().toISOString()
            }
          ],
          { onConflict: 'operator_id' }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error caching operator:', error);
      // Don't throw - caching failures shouldn't break the flow
    }
  }

  /**
   * Get cached operator
   */
  async getCachedOperator(operatorId: number): Promise<any | null> {
    try {
      const { data, error } = await supabaseServer
        .from('reloadly_operator_cache')
        .select('*')
        .eq('operator_id', operatorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      logger.error('Error getting cached operator:', error);
      return null;
    }
  }
}

export default new CommissionService();

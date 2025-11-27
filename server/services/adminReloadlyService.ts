import { logger } from '../utils/logger.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BillPaymentOperator {
  id: number;
  name: string;
  serviceType: 'airtime' | 'data' | 'utility';
  countryCode: string;
  countryName: string;
  supportsData: boolean;
  supportsAirtime: boolean;
  supportsBundles: boolean;
  commissionRate: number;
  fxRate: number;
  logoUrl?: string;
  isActive: boolean;
}

interface BillPaymentTransaction {
  id: string;
  userId: string;
  transactionType: string;
  providerName: string;
  amount: number;
  status: string;
  reloadlyTransactionId?: string;
  createdAt: string;
}

interface BillPaymentSetting {
  settingKey: string;
  settingValue: any;
  description: string;
}

// Get bill payment transactions
export async function getBillPaymentTransactions(
  userId?: string,
  transactionType?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
) {
  try {
    let query = supabase.from('bill_payment_transactions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error getting bill payment transactions:', error);
    throw error;
  }
}

// Get bill payment operators
export async function getBillPaymentOperators(filters: Partial<BillPaymentOperator> = {}) {
  try {
    let query = supabase.from('bill_payment_operators').select('*');

    // Apply filters
    if (filters.serviceType) {
      query = query.eq('service_type', filters.serviceType);
    }

    if (filters.countryCode) {
      query = query.eq('country_code', filters.countryCode);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    query = query.order('name');

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error getting bill payment operators:', error);
    throw error;
  }
}

// Update operator status
export async function updateOperatorStatus(operatorId: number, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('bill_payment_operators')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', operatorId)
      .select();

    if (error) throw error;

    return data?.[0];
  } catch (error) {
    logger.error('Error updating operator status:', error);
    throw error;
  }
}

// Sync operators from RELOADLY (placeholder implementation)
export async function syncOperatorsFromReloadly(countryCode?: string) {
  try {
    // This would typically call the RELOADLY API to get operators
    // For now, we'll return a placeholder response
    const operators: BillPaymentOperator[] = [
      {
        id: 1,
        name: 'MTN Nigeria',
        serviceType: 'airtime',
        countryCode: 'NG',
        countryName: 'Nigeria',
        supportsData: false,
        supportsAirtime: true,
        supportsBundles: false,
        commissionRate: 2.5,
        fxRate: 1.0,
        isActive: true
      },
      {
        id: 2,
        name: 'Airtel Nigeria',
        serviceType: 'airtime',
        countryCode: 'NG',
        countryName: 'Nigeria',
        supportsData: false,
        supportsAirtime: true,
        supportsBundles: false,
        commissionRate: 2.0,
        fxRate: 1.0,
        isActive: true
      }
    ];

    // Insert or update operators in the database
    for (const operator of operators) {
      const { error: upsertError } = await supabase.from('bill_payment_operators').upsert(
        {
          ...operator,
          service_type: operator.serviceType,
          country_code: operator.countryCode,
          country_name: operator.countryName,
          supports_data: operator.supportsData,
          supports_airtime: operator.supportsAirtime,
          supports_bundles: operator.supportsBundles,
          commission_rate: operator.commissionRate,
          fx_rate: operator.fxRate,
          is_active: operator.isActive,
          last_synced: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      if (upsertError) {
        logger.error('Error upserting operator:', upsertError);
      }
    }

    return operators;
  } catch (error) {
    logger.error('Error syncing operators from RELOADLY:', error);
    throw error;
  }
}

// Get transaction statistics
export async function getTransactionStatistics(userId?: string) {
  try {
    let query = supabase.from('bill_payment_transactions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    const stats = {
      totalTransactions: transactions?.length || 0,
      totalAmount: 0,
      totalFees: 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      averageTransaction: 0,
    };

    transactions?.forEach((t: any) => {
      stats.totalAmount += t.total || 0;
      stats.totalFees += t.fee || 0;
      stats.byType[t.transaction_type] = (stats.byType[t.transaction_type] || 0) + 1;
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
    });

    stats.averageTransaction =
      stats.totalTransactions > 0 ? stats.totalAmount / stats.totalTransactions : 0;

    return stats;
  } catch (error) {
    logger.error('Error getting transaction statistics:', error);
    throw error;
  }
}

// Get or create setting
export async function getSetting(settingKey: string) {
  try {
    const { data, error } = await supabase
      .from('bill_payment_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error getting setting:', error);
    throw error;
  }
}

// Update or create setting
export async function updateSetting(
  settingKey: string,
  settingValue: any,
  adminId: string,
  description?: string,
) {
  try {
    const existing = await getSetting(settingKey);

    const { data, error } = await supabase
      .from('bill_payment_settings')
      .upsert(
        {
          setting_key: settingKey,
          setting_value: settingValue,
          admin_id: adminId,
          description: description || existing?.description,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'setting_key' },
      )
      .select();

    if (error) throw error;

    // Log the action
    await logAuditAction(adminId, 'UPDATE_SETTING', 'bill_payment_settings', settingKey, {
      before: existing?.setting_value,
      after: settingValue,
    });

    return data?.[0];
  } catch (error) {
    logger.error('Error updating setting:', error);
    throw error;
  }
}

// Log audit action
export async function logAuditAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: any,
) {
  try {
    const { error } = await supabase.from('bill_payment_audit_log').insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes: changes || {},
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    logger.info(`Audit log created: ${action} on ${entityType}:${entityId}`);
  } catch (error) {
    logger.error('Error logging audit action:', error);
    // Don't throw error for audit logging failures
  }
}

// Get audit logs
export async function getAuditLogs(limit = 100, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('bill_payment_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    throw error;
  }
}

// Export functions
export default {
  getBillPaymentTransactions,
  getBillPaymentOperators,
  updateOperatorStatus,
  syncOperatorsFromReloadly,
  getTransactionStatistics,
  getSetting,
  updateSetting,
  logAuditAction,
  getAuditLogs,
};
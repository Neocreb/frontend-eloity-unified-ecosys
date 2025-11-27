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
  isActive: boolean;
}

// Get all bill payment transactions with filters
export async function getBillPaymentTransactions(
  filters?: {
    transactionType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  },
  limit = 100,
  offset = 0,
) {
  try {
    let query = supabase
      .from('bill_payment_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      transactions: data || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error('Error fetching bill payment transactions:', error);
    throw error;
  }
}

// Get bill payment operators
export async function getBillPaymentOperators(
  filters?: {
    serviceType?: string;
    countryCode?: string;
    isActive?: boolean;
  },
) {
  try {
    let query = supabase
      .from('bill_payment_operators')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.serviceType) {
      query = query.eq('service_type', filters.serviceType);
    }
    if (filters?.countryCode) {
      query = query.eq('country_code', filters.countryCode);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error fetching bill payment operators:', error);
    throw error;
  }
}

// Update operator status
export async function updateOperatorStatus(operatorId: number, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('bill_payment_operators')
      .update({ is_active: isActive, last_synced: new Date().toISOString() })
      .eq('id', operatorId)
      .select();

    if (error) throw error;

    return data?.[0];
  } catch (error) {
    logger.error('Error updating operator status:', error);
    throw error;
  }
}

// Sync operators from RELOADLY
export async function syncOperatorsFromReloadly(countryCode?: string) {
  try {
    const reloadlyService = await import('./reloadlyService.js');

    // Get operators from RELOADLY
    const operators = countryCode
      ? await reloadlyService.getOperatorsByCountry(countryCode)
      : [];

    if (!operators || operators.length === 0) {
      throw new Error('No operators found from RELOADLY');
    }

    // Prepare data for insertion
    const operatorsToInsert = operators.map((op: any) => ({
      id: op.id,
      name: op.name,
      service_type: op.data ? 'data' : op.bundle ? 'airtime' : 'airtime',
      country_code: countryCode || 'unknown',
      country_name: op.countryName || '',
      supports_data: op.data || false,
      supports_airtime: op.bundle || true,
      supports_bundles: op.bundle || false,
      commission_rate: op.commission || 0,
      fx_rate: op.fxRate || 1,
      logo_url: op.logoUrls?.[0] || null,
      is_active: true,
      metadata: {
        original_response: op,
      },
      last_synced: new Date().toISOString(),
    }));

    // Upsert operators
    const { data, error } = await supabase
      .from('bill_payment_operators')
      .upsert(operatorsToInsert, { onConflict: 'id' })
      .select();

    if (error) throw error;

    logger.info(`Successfully synced ${data?.length || 0} operators from RELOADLY`);
    return data || [];
  } catch (error) {
    logger.error('Error syncing operators from RELOADLY:', error);
    throw error;
  }
}

// Get transaction statistics
export async function getTransactionStatistics(
  startDate?: string,
  endDate?: string,
) {
  try {
    const filters: any = {};
    if (startDate) filters.gte = ['created_at', startDate];
    if (endDate) filters.lte = ['created_at', endDate];

    // Get all transactions in date range
    const { data: transactions, error } = await supabase
      .from('bill_payment_transactions')
      .select('*')
      .gte('created_at', startDate || '2020-01-01')
      .lte('created_at', endDate || new Date().toISOString());

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

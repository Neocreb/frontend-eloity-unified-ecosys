import { db } from '../utils/db.js';
import { logger } from '../utils/logger.js';

export interface CommissionSetting {
  id: string;
  service_type: 'airtime' | 'data' | 'utilities' | 'gift_cards' | 'all';
  operator_id?: number;
  commission_type: 'percentage' | 'fixed_amount' | 'none';
  percentage_value?: string;
  fixed_amount?: string;
  currency_code: string;
  is_active: boolean;
  applied_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommissionResult {
  base_amount: number;
  commission_amount: number;
  total_charged: number;
  commission_type: 'percentage' | 'fixed_amount' | 'none';
  percentage_value?: string;
  fixed_amount?: string;
}

export interface CommissionTransaction {
  id: string;
  transaction_id: string;
  user_id: string;
  service_type: string;
  operator_id?: number;
  base_amount: string;
  commission_type: string;
  commission_amount: string;
  total_charged: string;
  currency_code: string;
  status: string;
  created_at: Date;
}

// Get all commission settings
export async function getCommissionSettings(): Promise<CommissionSetting[]> {
  try {
    const settings = await db.query.commission_settings.findMany();
    return settings as CommissionSetting[];
  } catch (error) {
    logger.error('Error getting commission settings:', error);
    throw error;
  }
}

// Get commission settings for a specific service
export async function getCommissionSettingsByService(
  serviceType: 'airtime' | 'data' | 'utilities' | 'gift_cards'
): Promise<CommissionSetting | null> {
  try {
    // First try to find a specific setting for this service
    const specific = await db.query.commission_settings.findFirst({
      where: (table) => {
        const conditions = [];
        if (table.service_type === serviceType && table.is_active === true) {
          return table.service_type === serviceType && table.is_active === true;
        }
        return undefined;
      },
    });

    if (specific) return specific as CommissionSetting;

    // Fall back to 'all' setting
    const allSetting = await db.query.commission_settings.findFirst({
      where: (table) => table.service_type === 'all' && table.is_active === true,
    });

    return allSetting as CommissionSetting | null;
  } catch (error) {
    logger.error(`Error getting commission settings for service ${serviceType}:`, error);
    throw error;
  }
}

// Get commission settings for specific operator
export async function getCommissionByOperator(
  serviceType: 'airtime' | 'data' | 'utilities' | 'gift_cards',
  operatorId: number
): Promise<CommissionSetting | null> {
  try {
    // First try operator-specific setting
    const operatorSetting = await db.query.commission_settings.findFirst({
      where: (table) => {
        const conditions = [];
        if (
          table.service_type === serviceType &&
          table.operator_id === operatorId &&
          table.is_active === true
        ) {
          return (
            table.service_type === serviceType &&
            table.operator_id === operatorId &&
            table.is_active === true
          );
        }
        return undefined;
      },
    });

    if (operatorSetting) return operatorSetting as CommissionSetting;

    // Fall back to service-wide setting
    return getCommissionSettingsByService(serviceType);
  } catch (error) {
    logger.error(`Error getting commission for operator ${operatorId}:`, error);
    throw error;
  }
}

// Create or update commission setting
export async function setCommissionSetting(
  serviceType: 'airtime' | 'data' | 'utilities' | 'gift_cards' | 'all',
  commissionType: 'percentage' | 'fixed_amount' | 'none',
  values: {
    percentage_value?: string;
    fixed_amount?: string;
    operator_id?: number;
    currency_code?: string;
  },
  adminId: string
): Promise<CommissionSetting> {
  try {
    // Check if setting exists
    const existing = await db.query.commission_settings.findFirst({
      where: (table) => {
        if (values.operator_id) {
          return (
            table.service_type === serviceType &&
            table.operator_id === values.operator_id
          );
        }
        return table.service_type === serviceType && table.operator_id === null;
      },
    });

    if (existing) {
      // Update existing
      const updated = await db
        .update(db.schema.commission_settings)
        .set({
          commission_type: commissionType,
          percentage_value: values.percentage_value,
          fixed_amount: values.fixed_amount,
          currency_code: values.currency_code || 'USD',
          updated_at: new Date(),
          applied_by: adminId,
        })
        .where(
          values.operator_id
            ? (table) =>
                table.service_type === serviceType &&
                table.operator_id === values.operator_id
            : (table) =>
                table.service_type === serviceType && table.operator_id === null
        );

      return await getCommissionSettingsByService(serviceType as any);
    } else {
      // Create new
      const created = await db.insert(db.schema.commission_settings).values({
        service_type: serviceType,
        operator_id: values.operator_id,
        commission_type: commissionType,
        percentage_value: values.percentage_value,
        fixed_amount: values.fixed_amount,
        currency_code: values.currency_code || 'USD',
        is_active: true,
        applied_by: adminId,
      });

      return created[0] as CommissionSetting;
    }
  } catch (error) {
    logger.error('Error setting commission:', error);
    throw error;
  }
}

// Disable commission setting
export async function disableCommissionSetting(settingId: string): Promise<void> {
  try {
    await db
      .update(db.schema.commission_settings)
      .set({ is_active: false, updated_at: new Date() })
      .where((table) => table.id === settingId);
  } catch (error) {
    logger.error('Error disabling commission setting:', error);
    throw error;
  }
}

// Calculate commission based on settings
export async function calculateCommission(
  serviceType: 'airtime' | 'data' | 'utilities' | 'gift_cards',
  baseAmount: number,
  operatorId?: number
): Promise<CommissionResult> {
  try {
    let setting: CommissionSetting | null = null;

    if (operatorId) {
      setting = await getCommissionByOperator(serviceType, operatorId);
    } else {
      setting = await getCommissionSettingsByService(serviceType);
    }

    // If no setting found or commission type is 'none'
    if (!setting || setting.commission_type === 'none') {
      return {
        base_amount: baseAmount,
        commission_amount: 0,
        total_charged: baseAmount,
        commission_type: 'none',
      };
    }

    if (setting.commission_type === 'percentage') {
      const percentage = parseFloat(setting.percentage_value || '0');
      const commissionAmount = (baseAmount * percentage) / 100;

      return {
        base_amount: baseAmount,
        commission_amount: parseFloat(commissionAmount.toFixed(2)),
        total_charged: parseFloat((baseAmount + commissionAmount).toFixed(2)),
        commission_type: 'percentage',
        percentage_value: setting.percentage_value,
      };
    } else if (setting.commission_type === 'fixed_amount') {
      const fixedAmount = parseFloat(setting.fixed_amount || '0');

      return {
        base_amount: baseAmount,
        commission_amount: fixedAmount,
        total_charged: parseFloat((baseAmount + fixedAmount).toFixed(2)),
        commission_type: 'fixed_amount',
        fixed_amount: setting.fixed_amount,
      };
    }

    return {
      base_amount: baseAmount,
      commission_amount: 0,
      total_charged: baseAmount,
      commission_type: 'none',
    };
  } catch (error) {
    logger.error('Error calculating commission:', error);
    throw error;
  }
}

// Record commission transaction
export async function recordCommissionTransaction(
  transactionId: string,
  userId: string,
  serviceType: string,
  baseAmount: number,
  commissionAmount: number,
  commissionType: string,
  currencyCode: string = 'USD',
  operatorId?: number
): Promise<CommissionTransaction> {
  try {
    const created = await db.insert(db.schema.commission_transactions).values({
      transaction_id: transactionId,
      user_id: userId,
      service_type: serviceType,
      operator_id: operatorId,
      base_amount: baseAmount.toString(),
      commission_type: commissionType,
      commission_amount: commissionAmount.toString(),
      total_charged: (baseAmount + commissionAmount).toString(),
      currency_code: currencyCode,
      status: 'completed',
    });

    return created[0] as CommissionTransaction;
  } catch (error) {
    logger.error('Error recording commission transaction:', error);
    throw error;
  }
}

// Get commission transactions for reporting
export async function getCommissionTransactions(
  filters?: {
    service_type?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
  }
): Promise<CommissionTransaction[]> {
  try {
    let query = db.query.commission_transactions.findMany();

    // Apply filters if provided
    if (filters) {
      // This is a simplified example - actual filtering would depend on your db library
      // You may need to adjust based on your specific ORM
    }

    return query as Promise<CommissionTransaction[]>;
  } catch (error) {
    logger.error('Error getting commission transactions:', error);
    throw error;
  }
}

// Get commission statistics
export async function getCommissionStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total_transactions: number;
  total_commission: number;
  by_service_type: Record<string, number>;
  by_commission_type: Record<string, number>;
}> {
  try {
    const transactions = await db.query.commission_transactions.findMany();

    const stats = {
      total_transactions: transactions.length,
      total_commission: 0,
      by_service_type: {} as Record<string, number>,
      by_commission_type: {} as Record<string, number>,
    };

    transactions.forEach((tx: any) => {
      const commission = parseFloat(tx.commission_amount);
      stats.total_commission += commission;

      // Group by service type
      if (!stats.by_service_type[tx.service_type]) {
        stats.by_service_type[tx.service_type] = 0;
      }
      stats.by_service_type[tx.service_type] += commission;

      // Group by commission type
      if (!stats.by_commission_type[tx.commission_type]) {
        stats.by_commission_type[tx.commission_type] = 0;
      }
      stats.by_commission_type[tx.commission_type] += commission;
    });

    return stats;
  } catch (error) {
    logger.error('Error getting commission stats:', error);
    throw error;
  }
}

export default {
  getCommissionSettings,
  getCommissionSettingsByService,
  getCommissionByOperator,
  setCommissionSetting,
  disableCommissionSetting,
  calculateCommission,
  recordCommissionTransaction,
  getCommissionTransactions,
  getCommissionStats,
};

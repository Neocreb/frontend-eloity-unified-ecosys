import commissionService from './commissionService.js';
import reloadlyService from './reloadlyService.js';
import { logger } from '../utils/logger.js';

interface TransactionPayload {
  operatorId: number;
  amount: number;
  recipientPhone?: string;
  email?: string;
  userId: string;
  serviceType: string;
  operatorName?: string;
}

interface TransactionResult {
  success: boolean;
  error?: string;
  data?: {
    transactionId: string;
    status: string;
    referenceId: string;
    operatorName: string;
    originalAmount: number;
    finalAmount: number;
    commission: number;
    commissionRate: number;
    reloadlyTransactionId?: string;
  };
}

/**
 * Enhanced RELOADLY Service with Commission Integration
 * This service handles commission calculations and transaction recording
 */
class ReloadlyEnhancedService {
  /**
   * Send airtime topup with commission calculation
   */
  async sendAirtimeTopupWithCommission(
    payload: TransactionPayload
  ): Promise<TransactionResult> {
    try {
      const { operatorId, amount, recipientPhone, userId, serviceType } = payload;

      // 1. Calculate commission
      const calculation = await commissionService.calculateCommission(
        serviceType,
        amount,
        operatorId
      );

      // 2. Get operator details
      const operator = await reloadlyService.getOperatorById(operatorId);

      // 3. Record transaction in platform DB (before sending to RELOADLY)
      const transaction = await commissionService.recordTransaction({
        user_id: userId,
        service_type: serviceType,
        operator_id: operatorId,
        operator_name: operator?.name || 'Unknown',
        recipient: recipientPhone || '',
        amount: calculation.final_amount,
        reloadly_amount: calculation.reloadly_amount,
        commission_earned: calculation.commission_value,
        commission_rate: calculation.commission_rate,
        commission_type: calculation.commission_type,
        status: 'processing',
        metadata: {
          original_amount: calculation.original_amount,
          user_requested_amount: amount
        }
      });

      // 4. Send to RELOADLY
      const reloadlyResult = await reloadlyService.sendAirtimeTopup(
        operatorId,
        amount,
        recipientPhone || '',
        userId
      );

      // 5. Update transaction with RELOADLY response
      if (reloadlyResult.success) {
        await commissionService.updateTransactionStatus(transaction.id, 'success', {
          reloadly_transaction_id: reloadlyResult.transactionId,
          reloadly_reference_id: reloadlyResult.referenceId
        });

        // 6. Cache operator for future use
        await commissionService.cacheOperator({
          id: operatorId,
          name: operator?.name,
          country_code: 'NG',
          ...operator
        });

        return {
          success: true,
          data: {
            transactionId: transaction.id,
            status: 'success',
            referenceId: reloadlyResult.referenceId,
            operatorName: operator?.name || 'Unknown',
            originalAmount: calculation.original_amount,
            finalAmount: calculation.final_amount,
            commission: calculation.commission_value,
            commissionRate: calculation.commission_rate,
            reloadlyTransactionId: reloadlyResult.transactionId
          }
        };
      } else {
        await commissionService.updateTransactionStatus(transaction.id, 'failed', {
          error: reloadlyResult.error
        });

        return {
          success: false,
          error: reloadlyResult.error || 'Failed to process airtime topup'
        };
      }
    } catch (error: unknown) {
      logger.error('Error in sendAirtimeTopupWithCommission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send data bundle with commission calculation
   */
  async sendDataBundleWithCommission(
    payload: TransactionPayload
  ): Promise<TransactionResult> {
    try {
      const { operatorId, amount, recipientPhone, userId, serviceType } = payload;

      // 1. Calculate commission
      const calculation = await commissionService.calculateCommission(
        serviceType,
        amount,
        operatorId
      );

      // 2. Get operator details
      const operator = await reloadlyService.getOperatorById(operatorId);

      // 3. Record transaction in platform DB
      const transaction = await commissionService.recordTransaction({
        user_id: userId,
        service_type: serviceType,
        operator_id: operatorId,
        operator_name: operator?.name || 'Unknown',
        recipient: recipientPhone || '',
        amount: calculation.final_amount,
        reloadly_amount: calculation.reloadly_amount,
        commission_earned: calculation.commission_value,
        commission_rate: calculation.commission_rate,
        commission_type: calculation.commission_type,
        status: 'processing',
        metadata: {
          original_amount: calculation.original_amount,
          user_requested_amount: amount
        }
      });

      // 4. Send to RELOADLY
      const reloadlyResult = await reloadlyService.sendDataBundle(
        operatorId,
        amount,
        recipientPhone || '',
        userId
      );

      // 5. Update transaction with RELOADLY response
      if (reloadlyResult.success) {
        await commissionService.updateTransactionStatus(transaction.id, 'success', {
          reloadly_transaction_id: reloadlyResult.transactionId,
          reloadly_reference_id: reloadlyResult.referenceId
        });

        return {
          success: true,
          data: {
            transactionId: transaction.id,
            status: 'success',
            referenceId: reloadlyResult.referenceId,
            operatorName: operator?.name || 'Unknown',
            originalAmount: calculation.original_amount,
            finalAmount: calculation.final_amount,
            commission: calculation.commission_value,
            commissionRate: calculation.commission_rate,
            reloadlyTransactionId: reloadlyResult.transactionId
          }
        };
      } else {
        await commissionService.updateTransactionStatus(transaction.id, 'failed', {
          error: reloadlyResult.error
        });

        return {
          success: false,
          error: reloadlyResult.error || 'Failed to process data bundle'
        };
      }
    } catch (error: unknown) {
      logger.error('Error in sendDataBundleWithCommission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Pay utility bill with commission calculation
   */
  async payUtilityBillWithCommission(
    payload: TransactionPayload
  ): Promise<TransactionResult> {
    try {
      const { operatorId, amount, recipientPhone, userId, serviceType } = payload;

      // 1. Calculate commission
      const calculation = await commissionService.calculateCommission(
        serviceType,
        amount,
        operatorId
      );

      // 2. Get operator details
      const operator = await reloadlyService.getOperatorById(operatorId);

      // 3. Record transaction in platform DB
      const transaction = await commissionService.recordTransaction({
        user_id: userId,
        service_type: serviceType,
        operator_id: operatorId,
        operator_name: operator?.name || 'Unknown',
        recipient: recipientPhone || '',
        amount: calculation.final_amount,
        reloadly_amount: calculation.reloadly_amount,
        commission_earned: calculation.commission_value,
        commission_rate: calculation.commission_rate,
        commission_type: calculation.commission_type,
        status: 'processing',
        metadata: {
          original_amount: calculation.original_amount,
          user_requested_amount: amount
        }
      });

      // 4. Send to RELOADLY
      const reloadlyResult = await reloadlyService.payUtilityBill(
        operatorId,
        amount,
        recipientPhone || '',
        userId
      );

      // 5. Update transaction with RELOADLY response
      if (reloadlyResult.success) {
        await commissionService.updateTransactionStatus(transaction.id, 'success', {
          reloadly_transaction_id: reloadlyResult.transactionId,
          reloadly_reference_id: reloadlyResult.referenceId
        });

        return {
          success: true,
          data: {
            transactionId: transaction.id,
            status: 'success',
            referenceId: reloadlyResult.referenceId,
            operatorName: operator?.name || 'Unknown',
            originalAmount: calculation.original_amount,
            finalAmount: calculation.final_amount,
            commission: calculation.commission_value,
            commissionRate: calculation.commission_rate,
            reloadlyTransactionId: reloadlyResult.transactionId
          }
        };
      } else {
        await commissionService.updateTransactionStatus(transaction.id, 'failed', {
          error: reloadlyResult.error
        });

        return {
          success: false,
          error: reloadlyResult.error || 'Failed to process utility bill payment'
        };
      }
    } catch (error: unknown) {
      logger.error('Error in payUtilityBillWithCommission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Purchase gift card with commission calculation
   */
  async purchaseGiftCardWithCommission(
    payload: TransactionPayload
  ): Promise<TransactionResult> {
    try {
      const { operatorId, amount, email, userId, serviceType, operatorName } = payload;

      // 1. Calculate commission
      const calculation = await commissionService.calculateCommission(
        serviceType,
        amount,
        operatorId
      );

      // 2. Record transaction in platform DB
      const transaction = await commissionService.recordTransaction({
        user_id: userId,
        service_type: serviceType,
        operator_id: operatorId,
        operator_name: operatorName || 'Gift Card',
        recipient: email || '',
        amount: calculation.final_amount,
        reloadly_amount: calculation.reloadly_amount,
        commission_earned: calculation.commission_value,
        commission_rate: calculation.commission_rate,
        commission_type: calculation.commission_type,
        status: 'processing',
        metadata: {
          original_amount: calculation.original_amount,
          user_requested_amount: amount,
          product_id: operatorId
        }
      });

      // 3. Send to RELOADLY
      const reloadlyResult = await reloadlyService.purchaseGiftCard(
        operatorId,
        amount,
        email || '',
        userId
      );

      // 4. Update transaction with RELOADLY response
      if (reloadlyResult.success) {
        await commissionService.updateTransactionStatus(transaction.id, 'success', {
          reloadly_transaction_id: reloadlyResult.transactionId,
          reloadly_reference_id: reloadlyResult.referenceId
        });

        return {
          success: true,
          data: {
            transactionId: transaction.id,
            status: 'success',
            referenceId: reloadlyResult.referenceId,
            operatorName: operatorName || 'Gift Card',
            originalAmount: calculation.original_amount,
            finalAmount: calculation.final_amount,
            commission: calculation.commission_value,
            commissionRate: calculation.commission_rate,
            reloadlyTransactionId: reloadlyResult.transactionId
          }
        };
      } else {
        await commissionService.updateTransactionStatus(transaction.id, 'failed', {
          error: reloadlyResult.error
        });

        return {
          success: false,
          error: reloadlyResult.error || 'Failed to process gift card purchase'
        };
      }
    } catch (error: unknown) {
      logger.error('Error in purchaseGiftCardWithCommission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get operators with cached data
   */
  async getOperatorsByCountryEnhanced(countryCode: string) {
    try {
      // Fetch fresh operators from RELOADLY
      const operators = await reloadlyService.getOperatorsByCountry(countryCode);

      // Cache each operator
      for (const operator of operators) {
        await commissionService.cacheOperator({
          id: operator.id,
          name: operator.name,
          country_code: countryCode,
          ...operator
        });
      }

      return operators;
    } catch (error: unknown) {
      logger.error('Error getting operators:', error);
      throw error;
    }
  }

  /**
   * Get operator with cached data and commission info
   */
  async getOperatorByIdEnhanced(operatorId: number) {
    try {
      // Try to get fresh data
      let operator = await reloadlyService.getOperatorById(operatorId);

      // Cache it
      if (operator) {
        await commissionService.cacheOperator(operator);
      }

      return operator;
    } catch (error: unknown) {
      logger.error('Error getting operator:', error);
      // Fallback to cached data
      const cached = await commissionService.getCachedOperator(operatorId);
      if (cached) {
        return cached;
      }
      throw error;
    }
  }
}

export default new ReloadlyEnhancedService();

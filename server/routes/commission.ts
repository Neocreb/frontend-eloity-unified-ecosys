import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { tierAccessControl } from '../middleware/tierAccessControl.js';
import commissionService from '../services/commissionService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ============================================================================
// ADMIN ENDPOINTS - Commission Settings Management
// ============================================================================

/**
 * GET /api/commission/settings
 * Get all commission settings
 */
router.get('/settings', authenticateToken, tierAccessControl(['admin']), async (req, res) => {
  try {
    const { serviceType, isActive } = req.query;

    const filters = {
      serviceType: serviceType as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    };

    const settings = await commissionService.getAllCommissionSettings(filters);

    res.json({
      success: true,
      data: settings
    });
  } catch (error: unknown) {
    logger.error('Error getting commission settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/commission/settings/:serviceType
 * Get commission settings for a specific service type
 */
router.get(
  '/settings/:serviceType',
  authenticateToken,
  tierAccessControl(['admin']),
  async (req, res) => {
    try {
      const { serviceType } = req.params;

      const settings = await commissionService.getAllCommissionSettings({
        serviceType
      });

      res.json({
        success: true,
        data: settings
      });
    } catch (error: unknown) {
      logger.error('Error getting service type settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

/**
 * POST /api/commission/settings
 * Create a new commission setting
 */
router.post('/settings', authenticateToken, tierAccessControl(['admin']), async (req, res) => {
  try {
    const { service_type, operator_id, commission_type, commission_value, min_amount, max_amount, is_active } = req.body;

    if (!service_type || !commission_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: service_type, commission_type'
      });
    }

    const setting = await commissionService.createCommissionSetting(
      {
        service_type,
        operator_id: operator_id || null,
        commission_type,
        commission_value: parseFloat(commission_value),
        min_amount: min_amount ? parseFloat(min_amount) : undefined,
        max_amount: max_amount ? parseFloat(max_amount) : undefined,
        is_active: is_active !== false
      },
      req.userId as string
    );

    res.status(201).json({
      success: true,
      data: setting
    });
  } catch (error: unknown) {
    logger.error('Error creating commission setting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * PUT /api/commission/settings/:settingId
 * Update a commission setting
 */
router.put(
  '/settings/:settingId',
  authenticateToken,
  tierAccessControl(['admin']),
  async (req, res) => {
    try {
      const { settingId } = req.params;
      const { commission_type, commission_value, min_amount, max_amount, is_active } = req.body;

      const updates: any = {};

      if (commission_type) updates.commission_type = commission_type;
      if (commission_value !== undefined) updates.commission_value = parseFloat(commission_value);
      if (min_amount !== undefined) updates.min_amount = parseFloat(min_amount);
      if (max_amount !== undefined) updates.max_amount = parseFloat(max_amount);
      if (is_active !== undefined) updates.is_active = is_active;

      const setting = await commissionService.updateCommissionSetting(
        settingId,
        updates,
        req.userId as string
      );

      res.json({
        success: true,
        data: setting
      });
    } catch (error: unknown) {
      logger.error('Error updating commission setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }
);

/**
 * DELETE /api/commission/settings/:settingId
 * Delete a commission setting
 */
router.delete(
  '/settings/:settingId',
  authenticateToken,
  tierAccessControl(['admin']),
  async (req, res) => {
    try {
      const { settingId } = req.params;

      await commissionService.deleteCommissionSetting(settingId);

      res.json({
        success: true,
        message: 'Commission setting deleted'
      });
    } catch (error: unknown) {
      logger.error('Error deleting commission setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

/**
 * GET /api/commission/operator/:serviceType/:operatorId
 * Get commission setting for a specific operator
 */
router.get(
  '/operator/:serviceType/:operatorId',
  authenticateToken,
  async (req, res) => {
    try {
      const { serviceType, operatorId } = req.params;

      const setting = await commissionService.getCommissionSetting(
        serviceType,
        parseInt(operatorId)
      );

      res.json({
        success: true,
        data: setting || {
          commission_type: 'none',
          commission_value: 0,
          commission_rate: 0
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting operator commission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

// ============================================================================
// USER ENDPOINTS - Commission Calculations & Transactions
// ============================================================================

/**
 * POST /api/commission/calculate
 * Calculate final price with commission for a transaction
 */
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { service_type, amount, operator_id } = req.body;

    if (!service_type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: service_type, amount'
      });
    }

    const calculation = await commissionService.calculateCommission(
      service_type,
      parseFloat(amount),
      operator_id ? parseInt(operator_id) : undefined
    );

    res.json({
      success: true,
      data: calculation
    });
  } catch (error: unknown) {
    logger.error('Error calculating commission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/commission/transactions
 * Get user's transaction history
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { serviceType, status, limit = '10', offset = '0' } = req.query;

    const { transactions, total } = await commissionService.getUserTransactions(userId, {
      serviceType: serviceType as string | undefined,
      status: status as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total
        }
      }
    });
  } catch (error: unknown) {
    logger.error('Error getting transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/commission/transactions/:transactionId
 * Get a specific transaction
 */
router.get('/transactions/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId as string;

    const transaction = await commissionService.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify ownership
    if (transaction.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this transaction'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error: unknown) {
    logger.error('Error getting transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/commission/stats
 * Get commission statistics (admin only)
 */
router.get('/stats', authenticateToken, tierAccessControl(['admin']), async (req, res) => {
  try {
    const { serviceType, status, startDate, endDate } = req.query;

    const stats = await commissionService.getCommissionStats({
      serviceType: serviceType as string | undefined,
      status: status as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: unknown) {
    logger.error('Error getting commission stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/commission/transactions
 * Record a new transaction (called internally by reloadly service)
 */
router.post('/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      service_type,
      operator_id,
      operator_name,
      recipient,
      amount,
      reloadly_amount,
      commission_earned,
      commission_rate,
      commission_type,
      status = 'pending',
      reloadly_transaction_id,
      reloadly_reference_id,
      metadata
    } = req.body;

    const userId = req.userId as string;

    if (!service_type || !operator_id || !recipient || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const transaction = await commissionService.recordTransaction({
      user_id: userId,
      service_type,
      operator_id: parseInt(operator_id),
      operator_name,
      recipient,
      amount: parseFloat(amount),
      reloadly_amount: parseFloat(reloadly_amount),
      commission_earned: parseFloat(commission_earned),
      commission_rate: parseFloat(commission_rate),
      commission_type,
      status,
      reloadly_transaction_id,
      reloadly_reference_id,
      metadata
    });

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error: unknown) {
    logger.error('Error recording transaction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ success: false, error: errorMessage });
  }
});

export default router;

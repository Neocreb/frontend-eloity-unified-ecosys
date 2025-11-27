import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { tierAccessControl } from '../middleware/tierAccessControl.js';
import commissionService from '../services/commissionService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all commission settings
router.get('/settings', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const settings = await commissionService.getCommissionSettings();
    res.json({ success: true, settings });
  } catch (error: unknown) {
    logger.error('Get commission settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get commission settings';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get commission settings for a service
router.get('/settings/:serviceType', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const { serviceType } = req.params;
    const setting = await commissionService.getCommissionSettingsByService(
      serviceType as any
    );
    res.json({ success: true, setting });
  } catch (error: unknown) {
    logger.error('Get commission setting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get commission setting';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get commission for specific operator
router.get('/operator/:serviceType/:operatorId', authenticateToken, async (req, res) => {
  try {
    const { serviceType, operatorId } = req.params;
    const setting = await commissionService.getCommissionByOperator(
      serviceType as any,
      parseInt(operatorId)
    );
    res.json({ success: true, setting });
  } catch (error: unknown) {
    logger.error('Get operator commission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get operator commission';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Set commission setting
router.post('/settings', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const { serviceType, commissionType, percentageValue, fixedAmount, operatorId, currencyCode } =
      req.body;
    const adminId = req.userId;

    if (!serviceType || !commissionType) {
      return res.status(400).json({
        success: false,
        error: 'serviceType and commissionType are required',
      });
    }

    // Validate commission type
    if (!['percentage', 'fixed_amount', 'none'].includes(commissionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid commission type. Must be percentage, fixed_amount, or none',
      });
    }

    // Validate values based on commission type
    if (commissionType === 'percentage' && !percentageValue) {
      return res.status(400).json({
        success: false,
        error: 'percentageValue is required for percentage commission type',
      });
    }

    if (commissionType === 'fixed_amount' && !fixedAmount) {
      return res.status(400).json({
        success: false,
        error: 'fixedAmount is required for fixed_amount commission type',
      });
    }

    const setting = await commissionService.setCommissionSetting(
      serviceType,
      commissionType,
      {
        percentage_value: percentageValue,
        fixed_amount: fixedAmount,
        operator_id: operatorId,
        currency_code: currencyCode,
      },
      adminId
    );

    res.json({
      success: true,
      message: 'Commission setting updated successfully',
      setting,
    });
  } catch (error: unknown) {
    logger.error('Set commission setting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to set commission setting';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Disable commission setting
router.post('/settings/:settingId/disable', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const { settingId } = req.params;

    await commissionService.disableCommissionSetting(settingId);

    res.json({
      success: true,
      message: 'Commission setting disabled successfully',
    });
  } catch (error: unknown) {
    logger.error('Disable commission setting error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to disable commission setting';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Calculate commission
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { serviceType, baseAmount, operatorId } = req.body;

    if (!serviceType || !baseAmount) {
      return res.status(400).json({
        success: false,
        error: 'serviceType and baseAmount are required',
      });
    }

    const result = await commissionService.calculateCommission(
      serviceType,
      parseFloat(baseAmount),
      operatorId
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    logger.error('Calculate commission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate commission';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get commission transactions
router.get('/transactions', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const { serviceType, limit } = req.query;

    const filters = {
      service_type: serviceType as string | undefined,
      limit: limit ? parseInt(limit as string) : 100,
    };

    const transactions = await commissionService.getCommissionTransactions(filters);

    res.json({
      success: true,
      transactions,
    });
  } catch (error: unknown) {
    logger.error('Get commission transactions error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get commission transactions';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get commission statistics
router.get('/stats', authenticateToken, tierAccessControl, async (req, res) => {
  try {
    const stats = await commissionService.getCommissionStats();

    res.json({
      success: true,
      ...stats,
    });
  } catch (error: unknown) {
    logger.error('Get commission stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get commission stats';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

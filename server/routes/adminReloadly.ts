import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.js';
import { tierAccessControl } from '../middleware/tierAccessControl.js';
import adminReloadlyService from '../services/adminReloadlyService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware to verify admin access
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin (can be expanded based on your admin roles)
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Admin verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rate limiters for admin endpoints
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many read requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 write requests per windowMs
  message: { error: 'Too many write requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit sync operations to 5 per hour
  message: { error: 'Too many sync requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply middleware
router.use(authenticateToken);
router.use(requireAdmin);

// Get all bill payment transactions
router.get('/transactions', readLimiter, async (req, res) => {
  try {
    const { type, status, startDate, endDate, userId, limit = 100, offset = 0 } = req.query;

    const filters: any = {};
    if (type) filters.transactionType = type;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (userId) filters.userId = userId;

    const result = await adminReloadlyService.getBillPaymentTransactions(
      filters,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({ success: true, ...result });
  } catch (error: unknown) {
    logger.error('Error fetching transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get transaction statistics
router.get('/transactions/statistics', readLimiter, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await adminReloadlyService.getTransactionStatistics(
      startDate as string,
      endDate as string,
    );

    res.json({ success: true, statistics: stats });
  } catch (error: unknown) {
    logger.error('Error fetching statistics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get bill payment operators
router.get('/operators', readLimiter, async (req, res) => {
  try {
    const { serviceType, countryCode, isActive } = req.query;

    const filters: any = {};
    if (serviceType) filters.serviceType = serviceType;
    if (countryCode) filters.countryCode = countryCode;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const operators = await adminReloadlyService.getBillPaymentOperators(filters);

    res.json({ success: true, operators });
  } catch (error: unknown) {
    logger.error('Error fetching operators:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Update operator status
router.patch('/operators/:operatorId', writeLimiter, async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { isActive } = req.body;

    if (!operatorId || isActive === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const operator = await adminReloadlyService.updateOperatorStatus(
      parseInt(operatorId),
      isActive,
    );

    await adminReloadlyService.logAuditAction(
      req.user.id,
      'UPDATE_OPERATOR',
      'bill_payment_operators',
      operatorId,
      { isActive },
    );

    res.json({ success: true, operator });
  } catch (error: unknown) {
    logger.error('Error updating operator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Sync operators from RELOADLY
router.post('/operators/sync', syncLimiter, async (req, res) => {
  try {
    const { countryCode } = req.body;

    const operators = await adminReloadlyService.syncOperatorsFromReloadly(countryCode);

    await adminReloadlyService.logAuditAction(
      req.user.id,
      'SYNC_OPERATORS',
      'bill_payment_operators',
      countryCode || 'all',
      { count: operators.length },
    );

    res.json({ success: true, synced: operators.length, operators });
  } catch (error: unknown) {
    logger.error('Error syncing operators:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get settings
router.get('/settings/:settingKey', readLimiter, async (req, res) => {
  try {
    const { settingKey } = req.params;

    const setting = await adminReloadlyService.getSetting(settingKey);

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ success: true, setting });
  } catch (error: unknown) {
    logger.error('Error fetching setting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Update settings
router.post('/settings', writeLimiter, async (req, res) => {
  try {
    const { settingKey, settingValue, description } = req.body;

    if (!settingKey || settingValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const setting = await adminReloadlyService.updateSetting(
      settingKey,
      settingValue,
      req.user.id,
      description,
    );

    res.json({ success: true, setting });
  } catch (error: unknown) {
    logger.error('Error updating setting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get audit logs
router.get('/audit-logs', readLimiter, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const logs = await adminReloadlyService.getAuditLogs(
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({ success: true, logs });
  } catch (error: unknown) {
    logger.error('Error fetching audit logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;

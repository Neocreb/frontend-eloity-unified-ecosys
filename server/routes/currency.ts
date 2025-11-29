import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getExchangeRates,
  getExchangeRate,
  convertAmount,
  refreshExchangeRates,
  getLastUpdateTime,
  getCachedRateCount
} from '../services/currencyService.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /api/currency/rates
 * Get all cached exchange rates
 */
router.get('/rates', async (req, res) => {
  try {
    const rates = getExchangeRates();
    res.json({
      success: true,
      rates,
      cachedCount: getCachedRateCount(),
      lastUpdated: getLastUpdateTime()
    });
  } catch (error: unknown) {
    logger.error('Get exchange rates error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/currency/rate/:from/:to
 * Get exchange rate between two currencies
 */
router.get('/rate/:from/:to', (req, res) => {
  try {
    const { from, to } = req.params;
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    
    const rate = getExchangeRate(fromCode, toCode);
    
    if (rate === null) {
      return res.status(404).json({
        success: false,
        error: `Exchange rate not found for ${fromCode} to ${toCode}`
      });
    }
    
    res.json({
      success: true,
      from: fromCode,
      to: toCode,
      rate,
      lastUpdated: getLastUpdateTime()
    });
  } catch (error: unknown) {
    logger.error('Get exchange rate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/currency/convert
 * Convert amount from one currency to another
 */
router.post('/convert', (req, res) => {
  try {
    const { amount, from, to } = req.body;
    
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'amount, from, and to are required'
      });
    }
    
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    const convertedAmount = convertAmount(parseFloat(amount), fromCode, toCode);
    
    res.json({
      success: true,
      from: fromCode,
      to: toCode,
      originalAmount: parseFloat(amount),
      convertedAmount,
      rate: getExchangeRate(fromCode, toCode),
      lastUpdated: getLastUpdateTime()
    });
  } catch (error: unknown) {
    logger.error('Currency conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/currency/refresh
 * Manually trigger exchange rate refresh (admin only)
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. Admin access required.'
      });
    }
    
    await refreshExchangeRates();
    
    res.json({
      success: true,
      message: 'Exchange rates refreshed successfully',
      cachedCount: getCachedRateCount(),
      lastUpdated: getLastUpdateTime()
    });
  } catch (error: unknown) {
    logger.error('Refresh exchange rates error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/currency/status
 * Get currency service status
 */
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      cachedRates: getCachedRateCount(),
      lastUpdated: getLastUpdateTime(),
      status: 'operational'
    });
  } catch (error: unknown) {
    logger.error('Get currency status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

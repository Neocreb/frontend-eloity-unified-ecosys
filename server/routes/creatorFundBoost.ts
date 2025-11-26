import { Router, Request, Response } from 'express';
import { creatorFundBoostService } from '../../src/services/creatorFundBoostService';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../../src/integrations/supabase/client';

const router = Router();

// Helper middleware
const verifyAuth = requireAuth;

const verifyAdmin = (req: any, res: Response, next: Function) => {
  const userRole = req.user?.role;
  if (userRole !== 'admin' && userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/creator-boost/my-boost
 * Get active boost for current user
 */
router.get('/my-boost', verifyAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const boost = await creatorFundBoostService.getActiveBoost(userId);
    res.json({ success: true, data: boost });
  } catch (error) {
    console.error('Error fetching active boost:', error);
    res.status(500).json({ error: 'Failed to fetch active boost' });
  }
});

/**
 * GET /api/creator-boost/my-boosts
 * Get all boosts for current user (active and expired)
 */
router.get('/my-boosts', verifyAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const boosts = await creatorFundBoostService.getCreatorBoosts(userId);
    res.json({ success: true, data: boosts });
  } catch (error) {
    console.error('Error fetching creator boosts:', error);
    res.status(500).json({ error: 'Failed to fetch creator boosts' });
  }
});

/**
 * POST /api/creator-boost/calculate-earnings
 * Calculate earnings with boost applied
 */
router.post('/calculate-earnings', verifyAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const earnings = await creatorFundBoostService.calculateEarningsWithBoost(userId, amount);
    res.json({ success: true, data: earnings });
  } catch (error) {
    console.error('Error calculating earnings:', error);
    res.status(500).json({ error: 'Failed to calculate earnings' });
  }
});

/**
 * POST /api/creator-boost/admin/apply-tier-upgrade/:userId
 * Apply tier upgrade boost to a user (admin)
 */
router.post('/admin/apply-tier-upgrade/:userId', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { userId } = req.params;

    const boost = await creatorFundBoostService.applyTierUpgradeBoost(userId);

    if (!boost) {
      return res.status(400).json({ error: 'Failed to apply tier upgrade boost' });
    }

    res.json({ success: true, data: boost });
  } catch (error) {
    console.error('Error applying tier upgrade boost:', error);
    res.status(500).json({ error: 'Failed to apply tier upgrade boost' });
  }
});

/**
 * GET /api/creator-boost/admin/configurations
 * Get all boost configurations (admin)
 */
router.get('/admin/configurations', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const configs = await creatorFundBoostService.getAllBoostConfigs();
    res.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching boost configurations:', error);
    res.status(500).json({ error: 'Failed to fetch boost configurations' });
  }
});

/**
 * POST /api/creator-boost/admin/configurations
 * Create new boost configuration (admin)
 */
router.post('/admin/configurations', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { boostType, multiplier, durationDays, description, conditions, enabled } = req.body;

    if (!boostType || !multiplier || !durationDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const config = await creatorFundBoostService.createSeasonalBoost(
      boostType,
      multiplier,
      durationDays,
      description || '',
      conditions
    );

    if (!config) {
      return res.status(400).json({ error: 'Failed to create boost configuration' });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error creating boost configuration:', error);
    res.status(500).json({ error: 'Failed to create boost configuration' });
  }
});

/**
 * PATCH /api/creator-boost/admin/configurations/:configId
 * Update boost configuration (admin)
 */
router.patch('/admin/configurations/:configId', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { configId } = req.params;
    const { multiplier, durationDays, description, enabled, conditions } = req.body;

    const config = await creatorFundBoostService.updateBoostConfig(configId, {
      multiplier,
      durationDays,
      description,
      enabled,
      conditions
    });

    if (!config) {
      return res.status(404).json({ error: 'Boost configuration not found' });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating boost configuration:', error);
    res.status(500).json({ error: 'Failed to update boost configuration' });
  }
});

/**
 * POST /api/creator-boost/admin/seasonal/apply/:configId
 * Apply seasonal boost to all eligible creators (admin)
 */
router.post('/admin/seasonal/apply/:configId', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { configId } = req.params;

    const appliedCount = await creatorFundBoostService.applySeasonalBoostToAll(configId);

    res.json({
      success: true,
      data: {
        appliedCount,
        message: `Boost applied to ${appliedCount} creators`
      }
    });
  } catch (error) {
    console.error('Error applying seasonal boost:', error);
    res.status(500).json({ error: 'Failed to apply seasonal boost' });
  }
});

/**
 * GET /api/creator-boost/admin/stats
 * Get boost statistics (admin)
 */
router.get('/admin/stats', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const stats = await creatorFundBoostService.getBoostStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching boost stats:', error);
    res.status(500).json({ error: 'Failed to fetch boost stats' });
  }
});

/**
 * POST /api/creator-boost/admin/deactivate/:boostId
 * Deactivate a boost (admin)
 */
router.post('/admin/deactivate/:boostId', verifyAuth, verifyAdmin, async (req: any, res: Response) => {
  try {
    const { boostId } = req.params;

    const success = await creatorFundBoostService.deactivateBoost(boostId);

    if (!success) {
      return res.status(400).json({ error: 'Failed to deactivate boost' });
    }

    res.json({ success: true, message: 'Boost deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating boost:', error);
    res.status(500).json({ error: 'Failed to deactivate boost' });
  }
});

/**
 * POST /api/creator-boost/record-earnings/:boostId
 * Record earnings for a boost (internal use)
 */
router.post('/record-earnings/:boostId', verifyAuth, async (req: any, res: Response) => {
  try {
    const { boostId } = req.params;
    const { earnings } = req.body;

    if (!earnings || earnings <= 0) {
      return res.status(400).json({ error: 'Valid earnings amount required' });
    }

    const success = await creatorFundBoostService.recordBoostEarnings(boostId, earnings);

    if (!success) {
      return res.status(400).json({ error: 'Failed to record boost earnings' });
    }

    res.json({ success: true, message: 'Boost earnings recorded' });
  } catch (error) {
    console.error('Error recording boost earnings:', error);
    res.status(500).json({ error: 'Failed to record boost earnings' });
  }
});

export default router;

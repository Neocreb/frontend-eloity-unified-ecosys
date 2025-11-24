import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getUserTierInfo,
  getTierAccessSummary,
  canAccessFeature,
  upgradeTierAfterKYC,
  logTierChange,
} from '../middleware/tierAccessControl.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/tier/current
 * Get current user's tier information
 */
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tierInfo = await getUserTierInfo(userId);

    if (!tierInfo) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      success: true,
      data: tierInfo,
    });
  } catch (error) {
    logger.error('Error getting current tier:', error);
    res.status(500).json({ error: 'Failed to get tier information' });
  }
});

/**
 * GET /api/tier/access-summary
 * Get comprehensive access summary for user
 */
router.get('/access-summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const summary = await getTierAccessSummary(userId);

    if (!summary) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Error getting access summary:', error);
    res.status(500).json({ error: 'Failed to get access summary' });
  }
});

/**
 * POST /api/tier/check-access
 * Check if user can access a specific feature
 */
router.post('/check-access', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { featureName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!featureName) {
      return res.status(400).json({ error: 'featureName is required' });
    }

    const access = await canAccessFeature(userId, featureName);

    res.json({
      success: true,
      data: {
        feature: featureName,
        allowed: access.allowed,
        reason: access.reason,
        requiresKYC: access.requiresKYC,
      },
    });
  } catch (error) {
    logger.error('Error checking feature access:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

/**
 * POST /api/tier/upgrade-after-kyc
 * Upgrade user to Tier 2 after KYC verification
 * This is typically called by the KYC verification service
 */
router.post('/upgrade-after-kyc', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const success = await upgradeTierAfterKYC(userId);

    if (!success) {
      return res.status(400).json({ error: 'Failed to upgrade tier' });
    }

    const tierInfo = await getUserTierInfo(userId);

    res.json({
      success: true,
      message: 'User upgraded to Tier 2',
      data: tierInfo,
    });
  } catch (error) {
    logger.error('Error upgrading tier:', error);
    res.status(500).json({ error: 'Failed to upgrade tier' });
  }
});

/**
 * GET /api/tier/features
 * Get available features based on user's tier
 */
router.get('/features', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const summary = await getTierAccessSummary(userId);

    if (!summary) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      success: true,
      data: {
        currentTier: summary.currentTier,
        accessible: summary.accessibleFeatures,
        restricted: summary.restrictedFeatures,
        kycVerified: summary.kycVerified,
      },
    });
  } catch (error) {
    logger.error('Error getting features:', error);
    res.status(500).json({ error: 'Failed to get features' });
  }
});

export default router;

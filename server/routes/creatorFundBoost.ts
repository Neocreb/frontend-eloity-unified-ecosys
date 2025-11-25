import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../utils/db.js';
import { profiles, user_rewards } from '../../shared/enhanced-schema.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Creator Fund Boost Configuration
const BOOST_CONFIG = {
  tier2NewCreator: {
    multiplier: 1.5,
    durationDays: 30,
    description: 'New Tier 2 Creator Boost - 1.5x earnings for 30 days',
    maxBoosts: 1
  },
  seasonalPromotions: [
    {
      id: 'summer_2024',
      name: 'Summer Creator Surge',
      description: 'Boost your earnings this summer with 1.25x multiplier',
      multiplier: 1.25,
      badgeTrialDays: 14,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      eligibility: ['tier_2'],
      maxParticipants: 5000
    },
    {
      id: 'holiday_2024',
      name: 'Holiday Creator Celebration',
      description: '1.5x earnings boost + free premium features during holidays',
      multiplier: 1.5,
      badgeTrialDays: 30,
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      eligibility: ['tier_2'],
      maxParticipants: 10000
    },
    {
      id: 'new_year_2025',
      name: 'New Year New Heights',
      description: 'Start 2025 strong with 1.3x earnings multiplier',
      multiplier: 1.3,
      badgeTrialDays: 7,
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      eligibility: ['tier_2'],
      maxParticipants: 8000
    }
  ]
};

/**
 * GET /api/creator-fund/stats
 * Get creator fund statistics including active boosts
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];
    const isTier2 = profile.tier_level === 'tier_2';

    // Mock active boosts - in production would query from creator_boosts table
    const activeBoosters = [];
    if (isTier2 && profile.tier_upgraded_at) {
      const upgradeDate = new Date(profile.tier_upgraded_at);
      const boostEndDate = new Date(upgradeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (new Date() < boostEndDate) {
        activeBoosters.push({
          id: `boost_${userId}`,
          userId,
          boostType: 'new_tier_2',
          multiplier: 1.5,
          baseBenefit: '50% earnings increase',
          description: 'New Tier 2 Creator Boost - 1.5x earnings for 30 days',
          startDate: upgradeDate.toISOString(),
          endDate: boostEndDate.toISOString(),
          isActive: true,
          totalBoosted: 500,
          appliedEarnings: 250
        });
      }
    }

    // Get current season
    const now = new Date();
    const activeSeason = BOOST_CONFIG.seasonalPromotions.find(
      promo => new Date(promo.startDate) <= now && now <= new Date(promo.endDate)
    );

    // Mock stats
    const totalEarnings = 10000;
    const boostedEarnings = activeBoosters.length > 0 ? totalEarnings * 0.33 : 0;

    res.json({
      success: true,
      data: {
        totalEarnings,
        boostedEarnings,
        standardEarnings: totalEarnings - boostedEarnings,
        activeBoosters,
        activeSeason: activeSeason ? {
          ...activeSeason,
          currentParticipants: Math.floor((activeSeason.maxParticipants || 1000) * 0.6)
        } : null,
        tier2UpgradeDate: isTier2 ? profile.tier_upgraded_at : null,
        daysInBoostPeriod: isTier2 && profile.tier_upgraded_at
          ? Math.max(0, 30 - Math.floor(
              (Date.now() - new Date(profile.tier_upgraded_at).getTime()) / (1000 * 60 * 60 * 24)
            ))
          : null
      }
    });
  } catch (error) {
    logger.error('Error fetching creator fund stats:', error);
    res.status(500).json({ error: 'Failed to fetch creator fund stats' });
  }
});

/**
 * GET /api/creator-fund/boosts/active
 * Get active boosts for creator
 */
router.get('/boosts/active', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];
    const activeBoosters = [];

    // Check if eligible for Tier 2 boost
    if (profile.tier_level === 'tier_2' && profile.tier_upgraded_at) {
      const upgradeDate = new Date(profile.tier_upgraded_at);
      const boostEndDate = new Date(upgradeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (new Date() < boostEndDate) {
        activeBoosters.push({
          id: `boost_${userId}`,
          userId,
          boostType: 'new_tier_2',
          multiplier: 1.5,
          baseBenefit: '50% earnings increase',
          description: 'New Tier 2 Creator Boost - 1.5x earnings for 30 days',
          startDate: upgradeDate.toISOString(),
          endDate: boostEndDate.toISOString(),
          isActive: true,
          totalBoosted: 0,
          appliedEarnings: 0
        });
      }
    }

    res.json({
      success: true,
      data: activeBoosters
    });
  } catch (error) {
    logger.error('Error fetching active boosts:', error);
    res.status(500).json({ error: 'Failed to fetch active boosts' });
  }
});

/**
 * GET /api/creator-fund/boosts/history
 * Get boost history for creator
 */
router.get('/boosts/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Mock history - in production would query from creator_boosts table
    const mockHistory = [
      {
        id: 'hist_1',
        userId,
        boostType: 'new_tier_2' as const,
        multiplier: 1.5,
        baseBenefit: '50% earnings increase',
        description: 'New Tier 2 Creator Boost',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        totalBoosted: 500,
        appliedEarnings: 250
      },
      {
        id: 'hist_2',
        userId,
        boostType: 'seasonal' as const,
        multiplier: 1.25,
        baseBenefit: 'Seasonal multiplier',
        description: 'Spring Promotion 2024',
        startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        totalBoosted: 300,
        appliedEarnings: 75
      }
    ];

    res.json({
      success: true,
      data: mockHistory.slice(0, Number(limit))
    });
  } catch (error) {
    logger.error('Error fetching boost history:', error);
    res.status(500).json({ error: 'Failed to fetch boost history' });
  }
});

/**
 * POST /api/creator-fund/boosts/apply-tier2
 * Apply Tier 2 new creator boost
 */
router.post('/boosts/apply-tier2', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];

    // Check tier
    if (profile.tier_level !== 'tier_2') {
      return res.status(400).json({ error: 'Only Tier 2 creators can claim this boost' });
    }

    // Check if already has active boost
    if (profile.tier_upgraded_at) {
      const upgradeDate = new Date(profile.tier_upgraded_at);
      const boostEndDate = new Date(upgradeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (new Date() < boostEndDate) {
        return res.status(400).json({
          error: 'You already have an active Tier 2 boost',
          expiresAt: boostEndDate.toISOString()
        });
      }
    }

    // In production: Create entry in creator_boosts table
    logger.info(`Tier 2 boost applied for user ${userId}`);

    res.json({
      success: true,
      message: 'Tier 2 creator boost activated',
      data: {
        multiplier: BOOST_CONFIG.tier2NewCreator.multiplier,
        duration: BOOST_CONFIG.tier2NewCreator.durationDays,
        activatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error applying Tier 2 boost:', error);
    res.status(500).json({ error: 'Failed to apply Tier 2 boost' });
  }
});

/**
 * GET /api/creator-fund/seasonal-promotions
 * Get all seasonal promotions
 */
router.get('/seasonal-promotions', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const promotions = BOOST_CONFIG.seasonalPromotions.map(promo => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      const isActive = startDate <= now && now <= endDate;

      return {
        ...promo,
        isActive,
        currentParticipants: Math.floor((promo.maxParticipants || 1000) * 0.6)
      };
    });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    logger.error('Error fetching seasonal promotions:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal promotions' });
  }
});

/**
 * POST /api/creator-fund/seasonal-promotions/:promotionId/claim
 * Claim seasonal promotion boost
 */
router.post(
  '/seasonal-promotions/:promotionId/claim',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { promotionId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user profile
      const userProfile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.user_id, userId))
        .limit(1);

      if (!userProfile.length) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Find promotion
      const promotion = BOOST_CONFIG.seasonalPromotions.find(p => p.id === promotionId);

      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      // Check eligibility
      const userTier = userProfile[0].tier_level;
      if (!promotion.eligibility.includes(userTier)) {
        return res.status(403).json({
          error: `This promotion requires ${promotion.eligibility.join(' or ')} tier`
        });
      }

      // Check if active
      const now = new Date();
      if (!(new Date(promotion.startDate) <= now && now <= new Date(promotion.endDate))) {
        return res.status(400).json({ error: 'This promotion is not currently active' });
      }

      logger.info(`Seasonal promotion claimed: ${promotionId} by user ${userId}`);

      res.json({
        success: true,
        message: 'Seasonal promotion claimed successfully',
        data: {
          promotionId,
          multiplier: promotion.multiplier,
          badgeTrialDays: promotion.badgeTrialDays || 0,
          activatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error claiming seasonal promotion:', error);
      res.status(500).json({ error: 'Failed to claim seasonal promotion' });
    }
  }
);

/**
 * GET /api/creator-fund/boost-opportunities
 * Get available boost opportunities for creator
 */
router.get('/boost-opportunities', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];
    const opportunities = [];

    // Tier 2 new creator boost
    if (profile.tier_level === 'tier_2' && profile.tier_upgraded_at) {
      const upgradeDate = new Date(profile.tier_upgraded_at);
      const boostEndDate = new Date(upgradeDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (new Date() < boostEndDate) {
        opportunities.push({
          type: 'tier_upgrade',
          title: 'New Tier 2 Creator Boost',
          description: 'Earn 1.5x of your regular earnings for the next 30 days',
          multiplier: 1.5,
          duration: 30,
          requirements: ['Tier 2 account'],
          reward: '50% earnings increase',
          claimUrl: '/creator-studio?tab=boosts'
        });
      }
    }

    // Seasonal opportunities
    const now = new Date();
    const activeSeasons = BOOST_CONFIG.seasonalPromotions.filter(
      promo =>
        new Date(promo.startDate) <= now &&
        now <= new Date(promo.endDate) &&
        promo.eligibility.includes(profile.tier_level)
    );

    for (const season of activeSeasons) {
      opportunities.push({
        type: 'seasonal',
        title: season.name,
        description: season.description,
        multiplier: season.multiplier,
        duration: Math.ceil(
          (new Date(season.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        requirements: [`${season.eligibility.join(' or ')} tier`],
        reward: `${(season.multiplier * 100).toFixed(0)}% earnings increase${
          season.badgeTrialDays ? ` + ${season.badgeTrialDays} day badge trial` : ''
        }`
      });
    }

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    logger.error('Error fetching boost opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch boost opportunities' });
  }
});

/**
 * GET /api/creator-fund/check-tier2-eligibility
 * Check Tier 2 eligibility for boost
 */
router.get('/check-tier2-eligibility', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user profile
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];

    if (profile.tier_level !== 'tier_2') {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'Must be Tier 2 creator to qualify for this boost'
        }
      });
    }

    if (!profile.tier_upgraded_at) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'Tier 2 upgrade date not found'
        }
      });
    }

    const upgradeDate = new Date(profile.tier_upgraded_at);
    const boostEndDate = new Date(upgradeDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(
      0,
      Math.ceil((boostEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    if (daysRemaining <= 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: 'Your 30-day boost period has ended'
        }
      });
    }

    res.json({
      success: true,
      data: {
        eligible: true,
        daysRemaining,
        reason: `You have ${daysRemaining} days remaining in your boost period`
      }
    });
  } catch (error) {
    logger.error('Error checking Tier 2 eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

export default router;

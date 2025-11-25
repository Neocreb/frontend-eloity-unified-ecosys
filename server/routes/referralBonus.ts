import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../utils/db.js';
import { profiles, user_rewards } from '../../shared/enhanced-schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const router = express.Router();

// Referral bonus configuration
const REFERRAL_CONFIG = {
  tier1: {
    referrerBonus: 50, // tokens
    refereeBonus: 25, // tokens
    maxReferrals: 100,
    bonusExpiryDays: 90
  },
  tier2: {
    referrerBonus: 100, // tokens
    refereeBonus: 50, // tokens + premium
    premiumDays: 7,
    maxReferrals: 999,
    bonusExpiryDays: 90
  }
};

/**
 * POST /api/referral/generate-code
 * Generate a new referral code for user
 */
router.post('/generate-code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already has a code
    // In production, would check referral_codes table
    const referralCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    // Get user profile for name
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      success: true,
      data: {
        code: referralCode,
        referrerId: userId,
        referrerName: userProfile[0].username || 'User',
        createdAt: new Date().toISOString(),
        usageCount: 0,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error generating referral code:', error);
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

/**
 * GET /api/referral/code
 * Get user's referral code
 */
router.get('/code', authenticateToken, async (req: Request, res: Response) => {
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

    // In production, fetch from referral_codes table
    const mockCode = `REF${userId.slice(0, 8).toUpperCase()}`;

    res.json({
      success: true,
      data: {
        code: mockCode,
        referrerId: userId,
        referrerName: userProfile[0].username || 'User',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 3,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error fetching referral code:', error);
    res.status(500).json({ error: 'Failed to fetch referral code' });
  }
});

/**
 * GET /api/referral/stats
 * Get referral statistics for user
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, query from referral tables
    res.json({
      success: true,
      data: {
        totalReferrals: 5,
        successfulReferrals: 3,
        totalBonusEarned: 250,
        pendingBonuses: 2,
        recentReferrals: [
          {
            id: '1',
            referrerId: userId,
            refereeId: 'user2',
            referralCode: 'REF12345678',
            bonusAmount: 100,
            bonusType: 'tokens',
            bonusValue: '100',
            status: 'credited',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            referrerId: userId,
            refereeId: 'user3',
            referralCode: 'REF12345678',
            bonusAmount: 100,
            bonusType: 'tokens',
            bonusValue: '100',
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    });
  } catch (error) {
    logger.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

/**
 * POST /api/referral/apply
 * Apply a referral code to current user
 */
router.post('/apply', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    // Get user profile to determine tier
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Validate code format (basic)
    if (code.length < 8) {
      return res.status(400).json({ error: 'Invalid referral code format' });
    }

    const isTier2 = userProfile[0].tier_level === 'tier_2';
    const config = isTier2 ? REFERRAL_CONFIG.tier2 : REFERRAL_CONFIG.tier1;

    // In production:
    // 1. Verify code exists and is valid
    // 2. Create referral record
    // 3. Award bonuses to both referrer and referee
    // 4. If tier 2, grant premium days

    logger.info(`Referral code applied: ${userId} used code ${code}`);

    res.json({
      success: true,
      message: 'Referral code applied successfully',
      bonus: {
        amount: config.refereeBonus,
        type: 'tokens',
        premiumDays: isTier2 ? config.premiumDays : 0
      }
    });
  } catch (error) {
    logger.error('Error applying referral code:', error);
    res.status(500).json({ error: 'Failed to apply referral code' });
  }
});

/**
 * GET /api/referral/bonuses
 * Get all bonuses for current user
 */
router.get('/bonuses', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, query from referral_bonuses table
    const mockBonuses = [
      {
        id: '1',
        referrerId: userId,
        refereeId: 'user1',
        referralCode: 'REF12345678',
        bonusAmount: 50,
        bonusType: 'tokens',
        bonusValue: '50',
        status: 'credited',
        claimedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        referrerId: userId,
        refereeId: 'user2',
        referralCode: 'REF12345678',
        bonusAmount: 100,
        bonusType: 'tokens',
        bonusValue: '100',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockBonuses
    });
  } catch (error) {
    logger.error('Error fetching bonuses:', error);
    res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
});

/**
 * POST /api/referral/bonuses/:bonusId/claim
 * Claim a referral bonus
 */
router.post('/bonuses/:bonusId/claim', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { bonusId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production:
    // 1. Verify bonus belongs to user
    // 2. Update bonus status to 'credited'
    // 3. Add tokens/badge to user account
    // 4. Create notification

    logger.info(`Bonus claimed by user ${userId}: ${bonusId}`);

    res.json({
      success: true,
      message: 'Bonus claimed successfully'
    });
  } catch (error) {
    logger.error('Error claiming bonus:', error);
    res.status(500).json({ error: 'Failed to claim bonus' });
  }
});

/**
 * GET /api/referral/validate/:code
 * Validate a referral code
 */
router.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!code || code.length < 8) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    // In production, check if code exists and is active
    const isValid = true; // Placeholder

    if (!isValid) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    res.json({
      success: true,
      data: { valid: true, code }
    });
  } catch (error) {
    logger.error('Error validating code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

/**
 * GET /api/referral/leaderboard
 * Get top referrers leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // In production, query from referral tables with aggregation
    const mockLeaderboard = [
      { rank: 1, username: 'top_referrer', referrals: 150, earnings: 7500 },
      { rank: 2, username: 'active_user', referrals: 89, earnings: 4450 },
      { rank: 3, username: 'community_member', referrals: 67, earnings: 3350 }
    ];

    res.json({
      success: true,
      data: mockLeaderboard.slice(0, Number(limit))
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;

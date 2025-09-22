import express from 'express';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { referral_links, referral_events } from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';
import { db } from '../../server/enhanced-index.js'; // Use shared database connection

const router = express.Router();

// Generate referral link
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      type = 'general',
      campaignId,
      customCode,
      description,
      expiresAt,
      maxUses
    } = req.body;

    // Generate referral code
    const referralCode = customCode || `SC${userId.substring(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Build referral URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const referralUrl = `${baseUrl}/join?ref=${referralCode}`;

    // Check if custom code already exists
    if (customCode) {
      const existingLink = await db.select().from(referral_links)
        .where(eq(referral_links.referral_code, referralCode))
        .limit(1);
      
      if (existingLink.length > 0) {
        return res.status(400).json({ error: 'Referral code already exists' });
      }
    }

    // Create referral link
    const newLink = await db.insert(referral_links).values({
      referrer_id: userId,
      referral_code: referralCode,
      referral_url: referralUrl,
      type,
      campaign_id: campaignId,
      description,
      expires_at: expiresAt,
      max_uses: maxUses
    }).returning();

    logger.info('Referral link generated', { userId, referralCode });
    
    res.status(201).json({
      success: true,
      data: {
        id: newLink[0].id,
        referralCode: newLink[0].referral_code,
        referralUrl: newLink[0].referral_url,
        type: newLink[0].type,
        campaignId: newLink[0].campaign_id,
        clickCount: newLink[0].click_count,
        signupCount: newLink[0].signup_count,
        conversionCount: newLink[0].conversion_count,
        referrerReward: Number(newLink[0].referrer_reward),
        refereeReward: Number(newLink[0].referee_reward),
        revenueSharePercentage: Number(newLink[0].revenue_share_percentage),
        isActive: newLink[0].is_active,
        maxUses: newLink[0].max_uses,
        currentUses: newLink[0].current_uses,
        expiresAt: newLink[0].expires_at,
        description: newLink[0].description,
        createdAt: newLink[0].created_at
      }
    });
  } catch (error) {
    logger.error('Error generating referral link:', error);
    res.status(500).json({ error: 'Failed to generate referral link' });
  }
});

// Get user's referral links
router.get('/links', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const links = await db.select().from(referral_links)
      .where(eq(referral_links.referrer_id, userId))
      .orderBy(desc(referral_links.created_at));

    const formattedLinks = links.map(link => ({
      id: link.id,
      referralCode: link.referral_code,
      referralUrl: link.referral_url,
      type: link.type,
      campaignId: link.campaign_id,
      clickCount: link.click_count,
      signupCount: link.signup_count,
      conversionCount: link.conversion_count,
      referrerReward: Number(link.referrer_reward),
      refereeReward: Number(link.referee_reward),
      revenueSharePercentage: Number(link.revenue_share_percentage),
      isActive: link.is_active,
      maxUses: link.max_uses,
      currentUses: link.current_uses,
      expiresAt: link.expires_at,
      description: link.description,
      createdAt: link.created_at
    }));

    res.json({
      success: true,
      data: formattedLinks
    });
  } catch (error) {
    logger.error('Error fetching referral links:', error);
    res.status(500).json({ error: 'Failed to fetch referral links' });
  }
});

// Get referral statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get total stats from referral_links
    const linkStats = await db.select({
      totalClicks: sql`COALESCE(SUM(${referral_links.click_count}), 0)`,
      totalSignups: sql`COALESCE(SUM(${referral_links.signup_count}), 0)`,
      totalConversions: sql`COALESCE(SUM(${referral_links.conversion_count}), 0)`,
      activeLinks: sql`COUNT(CASE WHEN ${referral_links.is_active} = true THEN 1 END)`
    }).from(referral_links)
      .where(eq(referral_links.referrer_id, userId))
      .groupBy();

    // Get earnings from referral_events
    const earningsStats = await db.select({
      totalEarnings: sql`COALESCE(SUM(${referral_events.reward_amount}), 0)`,
      thisMonthEarnings: sql`COALESCE(SUM(CASE WHEN ${referral_events.created_at} >= date_trunc('month', CURRENT_DATE) THEN ${referral_events.reward_amount} ELSE 0 END), 0)`,
      pendingRewards: sql`COALESCE(SUM(CASE WHEN ${referral_events.is_reward_claimed} = false THEN ${referral_events.reward_amount} ELSE 0 END), 0)`
    }).from(referral_events)
      .where(eq(referral_events.referrer_id, userId))
      .groupBy();

    const stats = linkStats[0] || { totalClicks: 0, totalSignups: 0, totalConversions: 0, activeLinks: 0 };
    const earnings = earningsStats[0] || { totalEarnings: 0, thisMonthEarnings: 0, pendingRewards: 0 };

    const conversionRate = Number(stats.totalClicks) > 0 
      ? (Number(stats.totalSignups) / Number(stats.totalClicks)) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalReferrals: Number(stats.totalSignups),
        totalEarnings: Number(earnings.totalEarnings),
        conversionRate: Number(conversionRate.toFixed(2)),
        activeReferrals: Number(stats.activeLinks),
        lifetimeCommissions: Number(earnings.totalEarnings),
        thisMonthEarnings: Number(earnings.thisMonthEarnings),
        pendingRewards: Number(earnings.pendingRewards)
      }
    });
  } catch (error) {
    logger.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Track referral click
router.post('/track-click', async (req, res) => {
  try {
    const { referralCode } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrerUrl = req.get('Referer');

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    // Find the referral link
    const link = await db.select().from(referral_links)
      .where(and(
        eq(referral_links.referral_code, referralCode),
        eq(referral_links.is_active, true)
      ))
      .limit(1);

    if (link.length === 0) {
      return res.status(404).json({ error: 'Referral link not found or inactive' });
    }

    const referralLink = link[0];

    // Check if link has expired
    if (referralLink.expires_at && new Date(referralLink.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Referral link has expired' });
    }

    // Check if link has reached max uses
    if (referralLink.max_uses && referralLink.current_uses >= referralLink.max_uses) {
      return res.status(400).json({ error: 'Referral link has reached maximum uses' });
    }

    // Record the click event
    await db.insert(referral_events).values({
      referral_link_id: referralLink.id,
      referrer_id: referralLink.referrer_id,
      event_type: 'click',
      ip_address: clientIp,
      user_agent: userAgent,
      referrer_url: referrerUrl
    });

    // Update click count
    await db.update(referral_links)
      .set({ 
        click_count: sql`${referral_links.click_count} + 1`,
        current_uses: sql`${referral_links.current_uses} + 1`,
        updated_at: new Date()
      })
      .where(eq(referral_links.id, referralLink.id));

    logger.info('Referral click tracked', { referralCode, clientIp });

    res.json({
      success: true,
      message: 'Referral click tracked successfully'
    });
  } catch (error) {
    logger.error('Error tracking referral click:', error);
    res.status(500).json({ error: 'Failed to track referral click' });
  }
});

// Record signup conversion
router.post('/record-signup', authenticateToken, async (req, res) => {
  try {
    const { referralCode, userId: newUserId } = req.body;
    
    // Use req.userId as the referrer ID
    const referrerId = req.userId;

    if (!referralCode || !newUserId) {
      return res.status(400).json({ error: 'Referral code and user ID are required' });
    }

    // Find the referral link
    const link = await db.select().from(referral_links)
      .where(and(
        eq(referral_links.referral_code, referralCode),
        eq(referral_links.referrer_id, referrerId),
        eq(referral_links.is_active, true)
      ))
      .limit(1);

    if (link.length === 0) {
      return res.status(404).json({ error: 'Referral link not found or inactive' });
    }

    const referralLink = link[0];

    // Check if this user has already been referred by this link
    const existingEvent = await db.select().from(referral_events)
      .where(and(
        eq(referral_events.referral_link_id, referralLink.id),
        eq(referral_events.referee_id, newUserId),
        eq(referral_events.event_type, 'signup')
      ))
      .limit(1);

    if (existingEvent.length > 0) {
      return res.status(400).json({ error: 'User already signed up through this referral link' });
    }

    // Calculate reward amount
    const rewardAmount = referralLink.referee_reward || 35; // Default $35 reward

    // Record the signup event
    await db.insert(referral_events).values({
      referral_link_id: referralLink.id,
      referrer_id: referrerId,
      referee_id: newUserId,
      event_type: 'signup',
      reward_amount: rewardAmount,
      reward_currency: 'USD'
    });

    // Update signup count
    await db.update(referral_links)
      .set({ 
        signup_count: sql`${referral_links.signup_count} + 1`,
        current_uses: sql`${referral_links.current_uses} + 1`,
        updated_at: new Date()
      })
      .where(eq(referral_links.id, referralLink.id));

    logger.info('Referral signup recorded', { referralCode, newUserId });

    res.json({
      success: true,
      message: 'Referral signup recorded successfully',
      rewardAmount
    });
  } catch (error) {
    logger.error('Error recording referral signup:', error);
    res.status(500).json({ error: 'Failed to record referral signup' });
  }
});

export default router;

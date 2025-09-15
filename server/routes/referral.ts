import express from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { referral_links, referral_events } from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';

const router = express.Router();

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql_client = neon(connectionString);
const db = drizzle(sql_client);

// Generate referral link
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
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
    const userId = req.user?.id;
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
    const userId = req.user?.id;
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

    // Update click count
    await db.update(referral_links)
      .set({ 
        click_count: sql`${referral_links.click_count} + 1`,
        current_uses: sql`${referral_links.current_uses} + 1`,
        updated_at: new Date()
      })
      .where(eq(referral_links.id, referralLink.id));

    // Create referral event
    await db.insert(referral_events).values({
      referral_link_id: referralLink.id,
      referrer_id: referralLink.referrer_id,
      event_type: 'click',
      ip_address: clientIp,
      user_agent: userAgent,
      referrer_url: referrerUrl,
      metadata: { timestamp: new Date().toISOString() }
    });

    logger.info('Referral click tracked', { referralCode, clientIp });
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    logger.error('Error tracking referral click:', error);
    res.status(500).json({ error: 'Failed to track referral click' });
  }
});

// Process referral signup
router.post('/signup', async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      return res.status(400).json({ error: 'Referral code and new user ID are required' });
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

    // Check if user has already signed up through this referral
    const existingEvent = await db.select().from(referral_events)
      .where(and(
        eq(referral_events.referral_link_id, referralLink.id),
        eq(referral_events.referee_id, newUserId),
        eq(referral_events.event_type, 'signup')
      ))
      .limit(1);

    if (existingEvent.length > 0) {
      return res.status(400).json({ error: 'User has already signed up through this referral' });
    }

    // Update signup count
    await db.update(referral_links)
      .set({
        signup_count: sql`${referral_links.signup_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(referral_links.id, referralLink.id));

    // Smart anti-abuse referral reward system
    try {
      // Get referrer user and their recent referral activity
      const referrerUser = await db.select().from(users)
        .where(eq(users.id, referralLink.referrer_id))
        .limit(1);

      if (referrerUser.length > 0) {
        const user = referrerUser[0];
        const baseRewardAmount = 20; // From setup-reward-rules.ts: baseSoftPoints: "20.0"

        // Anti-abuse checks
        const now = new Date();
        const cooldownPeriod = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        const decayWindow = 24 * 60 * 60 * 1000; // 24 hours for decay calculation

        // Check recent referrals for cooldown and decay calculation
        const recentReferrals = await db.select().from(referral_events)
          .where(and(
            eq(referral_events.referrer_id, referralLink.referrer_id),
            eq(referral_events.event_type, 'signup'),
            sql`${referral_events.created_at} > ${new Date(now.getTime() - decayWindow)}`
          ))
          .orderBy(desc(referral_events.created_at));

        // Cooldown check - prevent referrals within 2 hours
        if (recentReferrals.length > 0) {
          const lastReferral = recentReferrals[0];
          const timeSinceLastReferral = now.getTime() - new Date(lastReferral.created_at).getTime();

          if (timeSinceLastReferral < cooldownPeriod) {
            const waitTime = Math.ceil((cooldownPeriod - timeSinceLastReferral) / (1000 * 60)); // minutes
            return res.status(429).json({
              error: `Referral cooldown active. Please wait ${waitTime} minutes before your next referral.`,
              cooldownMinutes: waitTime
            });
          }
        }

        // Progressive trust score requirement
        const referralCount = recentReferrals.length;
        const requiredTrustScore = 15 + Math.floor(referralCount / 5) * 5; // +5 trust per 5 referrals
        const userTrustScore = Number(user.trust_score || 0);

        if (userTrustScore < requiredTrustScore) {
          return res.status(403).json({
            error: `Insufficient trust score. Need ${requiredTrustScore}, have ${userTrustScore}. Build more platform reputation first.`,
            requiredTrustScore,
            currentTrustScore: userTrustScore
          });
        }

        // Apply decay based on recent referral frequency
        let rewardMultiplier = 1.0;
        const decayStart = 3; // Start decay after 3rd referral in 24h
        const decayRate = 0.25; // 25% reduction per additional referral
        const minMultiplier = 0.1; // Minimum 10% of original reward

        if (referralCount >= decayStart) {
          const excessReferrals = referralCount - decayStart + 1;
          rewardMultiplier = Math.max(minMultiplier, 1.0 - (excessReferrals * decayRate));
        }

        const finalRewardAmount = Math.floor(baseRewardAmount * rewardMultiplier);

        // Create pending reward (will be credited after 7 days if referee stays active)
        await db.insert(referral_events).values({
          referral_link_id: referralLink.id,
          referrer_id: referralLink.referrer_id,
          referee_id: newUserId,
          event_type: 'signup',
          reward_amount: finalRewardAmount,
          reward_currency: 'SP', // SoftPoints
          is_reward_claimed: false, // Pending - will be credited after activity validation
          metadata: {
            timestamp: new Date().toISOString(),
            baseReward: baseRewardAmount,
            decayMultiplier: rewardMultiplier,
            finalReward: finalRewardAmount,
            referralCount: referralCount,
            requiredTrustScore: requiredTrustScore,
            antiAbuseSystem: 'smart-decay-cooldown-validation',
            activityValidationPeriod: '7 days',
            validationDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        });

        logger.info('Smart referral reward processed', {
          referralCode,
          newUserId,
          referrerId: referralLink.referrer_id,
          baseReward: baseRewardAmount,
          finalReward: finalRewardAmount,
          decayMultiplier: rewardMultiplier,
          referralCount: referralCount,
          trustScore: userTrustScore
        });
      }
    } catch (creditError) {
      logger.error('Error processing smart referral reward:', creditError);
      // Don't fail the signup if reward crediting fails
    }

    res.json({
      success: true,
      referrerId: referralLink.referrer_id,
      referrerReward: '20 (pending activity validation)', // Will be credited after 7 days if referee stays active
      refereeReward: 35, // Welcome bonus for referee (immediate)
      message: 'Referral signup processed. Referrer reward pending 7-day activity validation.',
      antiAbuseInfo: {
        rewardValidationPeriod: '7 days',
        decaySystemActive: true,
        cooldownPeriod: '2 hours',
        progressiveTrustRequirement: true
      }
    });
  } catch (error) {
    logger.error('Error processing referral signup:', error);
    res.status(500).json({ error: 'Failed to process referral signup' });
  }
});

// Process validated referral rewards (for pending rewards after activity validation)
router.post('/process-validated-rewards', async (req, res) => {
  try {
    const now = new Date();
    const validationPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Find pending rewards that are ready for validation
    const pendingRewards = await db.select({
      event: referral_events,
      referee: users
    })
    .from(referral_events)
    .leftJoin(users, eq(referral_events.referee_id, users.id))
    .where(and(
      eq(referral_events.event_type, 'signup'),
      eq(referral_events.is_reward_claimed, false),
      sql`${referral_events.created_at} < ${new Date(now.getTime() - validationPeriod)}`
    ));

    let processedCount = 0;
    let creditedAmount = 0;

    for (const { event, referee } of pendingRewards) {
      if (!referee) continue;

      // Check if referee is still active (has logged in recently and has some activity)
      const refereeActiveCheck = await db.select({
        lastLogin: users.last_login,
        points: users.points,
        postCount: sql`(SELECT COUNT(*) FROM posts WHERE user_id = ${referee.id})`
      })
      .from(users)
      .where(eq(users.id, referee.id))
      .limit(1);

      if (refereeActiveCheck.length > 0) {
        const refereeActivity = refereeActiveCheck[0];
        const lastLogin = refereeActivity.lastLogin ? new Date(refereeActivity.lastLogin) : null;
        const isRecentlyActive = lastLogin && (now.getTime() - lastLogin.getTime()) < (3 * 24 * 60 * 60 * 1000); // Active within 3 days
        const hasMinimalActivity = Number(refereeActivity.postCount) > 0 || Number(refereeActivity.points) > 35; // Posted or engaged

        if (isRecentlyActive && hasMinimalActivity) {
          // Credit the referrer
          await db.update(users)
            .set({
              points: sql`COALESCE(${users.points}, 0) + ${event.reward_amount}`,
              updated_at: new Date()
            })
            .where(eq(users.id, event.referrer_id));

          // Mark reward as claimed
          await db.update(referral_events)
            .set({
              is_reward_claimed: true,
              metadata: sql`jsonb_set(COALESCE(${referral_events.metadata}, '{}'::jsonb), '{validatedAt}', to_jsonb(now()::text)) || jsonb_build_object('validationPassed', true, 'refereeActive', true)`
            })
            .where(eq(referral_events.id, event.id));

          processedCount++;
          creditedAmount += Number(event.reward_amount);
        } else {
          // Mark as validation failed
          await db.update(referral_events)
            .set({
              metadata: sql`jsonb_set(COALESCE(${referral_events.metadata}, '{}'::jsonb), '{validatedAt}', to_jsonb(now()::text)) || jsonb_build_object('validationPassed', false, 'reason', 'referee_inactive')`
            })
            .where(eq(referral_events.id, event.id));
        }
      }
    }

    logger.info('Processed validated referral rewards', {
      totalPending: pendingRewards.length,
      processed: processedCount,
      creditedAmount
    });

    res.json({
      success: true,
      totalPending: pendingRewards.length,
      processed: processedCount,
      creditedAmount,
      message: `Processed ${processedCount} validated referral rewards totaling ${creditedAmount} SP`
    });
  } catch (error) {
    logger.error('Error processing validated referral rewards:', error);
    res.status(500).json({ error: 'Failed to process validated rewards' });
  }
});

// Claim referral rewards
router.post('/claim-rewards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get unclaimed rewards
    const unclaimedRewards = await db.select().from(referral_events)
      .where(and(
        eq(referral_events.referrer_id, userId),
        eq(referral_events.is_reward_claimed, false),
        sql`${referral_events.reward_amount} > 0`
      ));

    if (unclaimedRewards.length === 0) {
      return res.json({
        success: false,
        amount: 0,
        message: 'No rewards available to claim'
      });
    }

    const totalAmount = unclaimedRewards.reduce((sum, event) => 
      sum + Number(event.reward_amount), 0
    );

    // Mark rewards as claimed
    await db.update(referral_events)
      .set({ 
        is_reward_claimed: true,
        metadata: sql`jsonb_set(COALESCE(${referral_events.metadata}, '{}'::jsonb), '{claimedAt}', to_jsonb(now()::text))`
      })
      .where(and(
        eq(referral_events.referrer_id, userId),
        eq(referral_events.is_reward_claimed, false)
      ));

    // TODO: Integrate with wallet/payment system to actually credit the user
    // For now, we just mark as claimed

    logger.info('Referral rewards claimed', { userId, amount: totalAmount, rewardsCount: unclaimedRewards.length });
    
    res.json({
      success: true,
      amount: totalAmount,
      message: `Successfully claimed ${totalAmount} USD in referral rewards`
    });
  } catch (error) {
    logger.error('Error claiming referral rewards:', error);
    res.status(500).json({ error: 'Failed to claim referral rewards' });
  }
});

export default router;

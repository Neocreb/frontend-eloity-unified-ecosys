import express from 'express';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { 
  reward_sharing_transactions, 
  referral_links, 
  referral_events 
} from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';

const router = express.Router();

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql_client = neon(connectionString);
const db = drizzle(sql_client);

// Process automatic reward sharing
router.post('/process-sharing', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      rewardAmount,
      sourceActivity,
      activityId,
      sharingPercentage = 0.5
    } = req.body;

    if (!rewardAmount || !sourceActivity) {
      return res.status(400).json({ error: 'Reward amount and source activity are required' });
    }

    // Get user's active referrals (people they referred)
    const userReferrals = await db.select({
      refereeId: referral_events.referee_id,
      referralLinkId: referral_events.referral_link_id
    })
    .from(referral_events)
    .innerJoin(referral_links, eq(referral_events.referral_link_id, referral_links.id))
    .where(and(
      eq(referral_events.referrer_id, userId),
      eq(referral_events.event_type, 'signup'),
      eq(referral_events.is_reward_claimed, true), // Only validated referrals
      eq(referral_links.automatic_sharing_enabled, true),
      eq(referral_links.is_active, true)
    ));

    if (userReferrals.length === 0) {
      return res.json({
        success: true,
        sharedAmount: 0,
        recipients: 0,
        message: 'No eligible referrals for automatic sharing'
      });
    }

    // Calculate sharing amounts
    const totalSharingAmount = Math.round((rewardAmount * sharingPercentage / 100) * 100) / 100;
    const amountPerReferral = Math.round((totalSharingAmount / userReferrals.length) * 100) / 100;

    if (totalSharingAmount < 0.01) {
      return res.json({
        success: true,
        sharedAmount: 0,
        recipients: 0,
        message: 'Sharing amount too small to process'
      });
    }

    // Process sharing transactions
    const sharingTransactions = [];
    const recipientUpdates = [];

    for (const referral of userReferrals) {
      // Create sharing transaction record
      const transaction = {
        sharer_id: userId,
        recipient_id: referral.refereeId,
        original_reward_amount: rewardAmount,
        shared_amount: amountPerReferral,
        sharing_percentage: sharingPercentage,
        transaction_type: 'automatic_referral_share',
        source_activity: sourceActivity,
        activity_id: activityId,
        status: 'completed',
        metadata: {
          timestamp: new Date().toISOString(),
          sharingSystem: 'automatic-0.5-percent',
          totalRecipients: userReferrals.length,
          originalActivity: sourceActivity
        }
      };

      sharingTransactions.push(transaction);

      // Update recipient's points
      recipientUpdates.push(
        db.update(users)
          .set({
            points: sql`COALESCE(${users.points}, 0) + ${amountPerReferral}`,
            updated_at: new Date()
          })
          .where(eq(users.id, referral.refereeId))
      );
    }

    // Execute all transactions
    await Promise.all([
      // Insert sharing transaction records
      db.insert(reward_sharing_transactions).values(sharingTransactions),
      // Update recipient points
      ...recipientUpdates
    ]);

    logger.info('Automatic reward sharing processed', {
      sharerId: userId,
      originalAmount: rewardAmount,
      sharedAmount: totalSharingAmount,
      recipients: userReferrals.length,
      amountPerReferral,
      sourceActivity
    });

    res.json({
      success: true,
      sharedAmount: totalSharingAmount,
      recipients: userReferrals.length,
      amountPerReferral,
      message: `Shared ${totalSharingAmount} Eloits with ${userReferrals.length} referrals`
    });

  } catch (error) {
    logger.error('Error processing reward sharing:', error);
    res.status(500).json({ error: 'Failed to process reward sharing' });
  }
});

// Get user's sharing statistics
router.get('/sharing-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { period = 'all' } = req.query;

    // Calculate date filter based on period
    let dateFilter = null;
    if (period === 'month') {
      dateFilter = sql`${reward_sharing_transactions.created_at} >= date_trunc('month', CURRENT_DATE)`;
    } else if (period === 'week') {
      dateFilter = sql`${reward_sharing_transactions.created_at} >= date_trunc('week', CURRENT_DATE)`;
    }

    // Get sharing stats (what user has shared)
    const sharingStats = await db.select({
      totalShared: sql`COALESCE(SUM(${reward_sharing_transactions.shared_amount}), 0)`,
      sharingTransactionsCount: sql`COUNT(*)`
    })
    .from(reward_sharing_transactions)
    .where(and(
      eq(reward_sharing_transactions.sharer_id, userId),
      dateFilter
    ));

    // Get receiving stats (what user has received)
    const receivingStats = await db.select({
      totalReceived: sql`COALESCE(SUM(${reward_sharing_transactions.shared_amount}), 0)`,
      receivingTransactionsCount: sql`COUNT(*)`
    })
    .from(reward_sharing_transactions)
    .where(and(
      eq(reward_sharing_transactions.recipient_id, userId),
      dateFilter
    ));

    // Get this month stats
    const thisMonthShared = await db.select({
      amount: sql`COALESCE(SUM(${reward_sharing_transactions.shared_amount}), 0)`
    })
    .from(reward_sharing_transactions)
    .where(and(
      eq(reward_sharing_transactions.sharer_id, userId),
      sql`${reward_sharing_transactions.created_at} >= date_trunc('month', CURRENT_DATE)`
    ));

    const thisMonthReceived = await db.select({
      amount: sql`COALESCE(SUM(${reward_sharing_transactions.shared_amount}), 0)`
    })
    .from(reward_sharing_transactions)
    .where(and(
      eq(reward_sharing_transactions.recipient_id, userId),
      sql`${reward_sharing_transactions.created_at} >= date_trunc('month', CURRENT_DATE)`
    ));

    const stats = {
      totalShared: Number(sharingStats[0]?.totalShared || 0),
      totalReceived: Number(receivingStats[0]?.totalReceived || 0),
      sharingTransactionsCount: Number(sharingStats[0]?.sharingTransactionsCount || 0),
      receivingTransactionsCount: Number(receivingStats[0]?.receivingTransactionsCount || 0),
      thisMonthShared: Number(thisMonthShared[0]?.amount || 0),
      thisMonthReceived: Number(thisMonthReceived[0]?.amount || 0)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching sharing stats:', error);
    res.status(500).json({ error: 'Failed to fetch sharing stats' });
  }
});

// Get sharing transaction history
router.get('/sharing-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { 
      page = 1, 
      limit = 20, 
      type = 'all' 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build filter based on type
    let userFilter;
    if (type === 'shared') {
      userFilter = eq(reward_sharing_transactions.sharer_id, userId);
    } else if (type === 'received') {
      userFilter = eq(reward_sharing_transactions.recipient_id, userId);
    } else {
      userFilter = sql`(${reward_sharing_transactions.sharer_id} = ${userId} OR ${reward_sharing_transactions.recipient_id} = ${userId})`;
    }

    // Get transactions with user details
    const transactions = await db.select({
      id: reward_sharing_transactions.id,
      sharer_id: reward_sharing_transactions.sharer_id,
      recipient_id: reward_sharing_transactions.recipient_id,
      original_reward_amount: reward_sharing_transactions.original_reward_amount,
      shared_amount: reward_sharing_transactions.shared_amount,
      sharing_percentage: reward_sharing_transactions.sharing_percentage,
      transaction_type: reward_sharing_transactions.transaction_type,
      source_activity: reward_sharing_transactions.source_activity,
      activity_id: reward_sharing_transactions.activity_id,
      status: reward_sharing_transactions.status,
      metadata: reward_sharing_transactions.metadata,
      created_at: reward_sharing_transactions.created_at,
      sharer_username: sql`sharer.username`,
      recipient_username: sql`recipient.username`
    })
    .from(reward_sharing_transactions)
    .leftJoin(users.as('sharer'), eq(reward_sharing_transactions.sharer_id, sql`sharer.id`))
    .leftJoin(users.as('recipient'), eq(reward_sharing_transactions.recipient_id, sql`recipient.id`))
    .where(userFilter)
    .orderBy(desc(reward_sharing_transactions.created_at))
    .limit(Number(limit))
    .offset(offset);

    // Get total count
    const totalResult = await db.select({ count: count() })
      .from(reward_sharing_transactions)
      .where(userFilter);

    const total = totalResult[0]?.count || 0;
    const hasMore = offset + transactions.length < total;

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          sharer_id: t.sharer_id,
          recipient_id: t.recipient_id,
          original_reward_amount: Number(t.original_reward_amount),
          shared_amount: Number(t.shared_amount),
          sharing_percentage: Number(t.sharing_percentage),
          transaction_type: t.transaction_type,
          source_activity: t.source_activity,
          activity_id: t.activity_id,
          status: t.status,
          metadata: t.metadata,
          created_at: t.created_at,
          sharer_username: t.sharer_username,
          recipient_username: t.recipient_username,
          is_shared_by_me: t.sharer_id === userId,
          is_received_by_me: t.recipient_id === userId
        })),
        total,
        hasMore,
        page: Number(page),
        limit: Number(limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching sharing history:', error);
    res.status(500).json({ error: 'Failed to fetch sharing history' });
  }
});

// Get user's sharing settings
router.get('/sharing-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has active referral links with sharing enabled
    const referralLinks = await db.select({
      automatic_sharing_enabled: referral_links.automatic_sharing_enabled,
      is_active: referral_links.is_active
    })
    .from(referral_links)
    .where(eq(referral_links.referrer_id, userId));

    // Count eligible referrals
    const eligibleReferrals = await db.select({ count: count() })
      .from(referral_events)
      .innerJoin(referral_links, eq(referral_events.referral_link_id, referral_links.id))
      .where(and(
        eq(referral_events.referrer_id, userId),
        eq(referral_events.event_type, 'signup'),
        eq(referral_events.is_reward_claimed, true),
        eq(referral_links.automatic_sharing_enabled, true),
        eq(referral_links.is_active, true)
      ));

    const settings = {
      automaticSharingEnabled: referralLinks.some(link => link.automatic_sharing_enabled && link.is_active),
      sharingPercentage: 0.5, // Fixed at 0.5%
      eligibleReferrals: eligibleReferrals[0]?.count || 0
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Error fetching sharing settings:', error);
    res.status(500).json({ error: 'Failed to fetch sharing settings' });
  }
});

export default router;

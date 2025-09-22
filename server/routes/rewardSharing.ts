import express from 'express';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { 
  reward_sharing_transactions, 
  referral_links, 
  referral_events 
} from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';
import { db } from '../../server/enhanced-index.js'; // Use shared database connection

const router = express.Router();

// Process automatic reward sharing
router.post('/process-sharing', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
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
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
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
      shared: {
        total: Number(sharingStats[0]?.totalShared || 0),
        transactions: Number(sharingStats[0]?.sharingTransactionsCount || 0),
        thisMonth: Number(thisMonthShared[0]?.amount || 0)
      },
      received: {
        total: Number(receivingStats[0]?.totalReceived || 0),
        transactions: Number(receivingStats[0]?.receivingTransactionsCount || 0),
        thisMonth: Number(thisMonthReceived[0]?.amount || 0)
      }
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
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { page = 1, limit = 20, type = 'all' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = db.select({
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
      updated_at: reward_sharing_transactions.updated_at
    })
    .from(reward_sharing_transactions)
    .orderBy(desc(reward_sharing_transactions.created_at))
    .limit(parseInt(limit as string))
    .offset(offset);

    // Apply type filter
    if (type === 'sent') {
      query = query.where(eq(reward_sharing_transactions.sharer_id, userId));
    } else if (type === 'received') {
      query = query.where(eq(reward_sharing_transactions.recipient_id, userId));
    } else {
      query = query.where(
        or(
          eq(reward_sharing_transactions.sharer_id, userId),
          eq(reward_sharing_transactions.recipient_id, userId)
        )
      );
    }

    const transactions = await query;

    // Get total count for pagination
    let countQuery = db.select({ count: count() })
      .from(reward_sharing_transactions);

    if (type === 'sent') {
      countQuery = countQuery.where(eq(reward_sharing_transactions.sharer_id, userId));
    } else if (type === 'received') {
      countQuery = countQuery.where(eq(reward_sharing_transactions.recipient_id, userId));
    } else {
      countQuery = countQuery.where(
        or(
          eq(reward_sharing_transactions.sharer_id, userId),
          eq(reward_sharing_transactions.recipient_id, userId)
        )
      );
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Enrich with user information
    const userIds = [
      ...new Set([
        ...transactions.map(t => t.sharer_id),
        ...transactions.map(t => t.recipient_id)
      ])
    ];

    const usersResult = await db.select({
      id: users.id,
      username: users.username,
      full_name: users.full_name,
      avatar_url: users.avatar_url
    })
    .from(users)
    .where(sql`${users.id} in ${userIds}`);

    const usersMap = usersResult.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, any>);

    const enrichedTransactions = transactions.map(transaction => ({
      ...transaction,
      sharer: usersMap[transaction.sharer_id] || { id: transaction.sharer_id, username: 'Unknown' },
      recipient: usersMap[transaction.recipient_id] || { id: transaction.recipient_id, username: 'Unknown' }
    }));

    res.json({
      success: true,
      data: enrichedTransactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    logger.error('Error fetching sharing transactions:', error);
    res.status(500).json({ error: 'Failed to fetch sharing transactions' });
  }
});

export default router;
import express from 'express';
import { eq, and, desc, sql, count, asc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { 
  pioneer_badges, 
  user_activity_sessions 
} from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';
import { db } from '../../server/enhanced-index.js'; // Use shared database connection

const router = express.Router();

// Constants
const MAX_PIONEER_BADGES = 500;
const MIN_ELIGIBILITY_SCORE = 75; // Minimum score to be eligible for pioneer badge

// Track user activity session
router.post('/track-session', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      sessionStart,
      sessionEnd,
      activitiesCount,
      qualityInteractions,
      deviceInfo
    } = req.body;

    if (!sessionStart || !activitiesCount) {
      return res.status(400).json({ error: 'Session start and activities count are required' });
    }

    const startTime = new Date(sessionStart);
    const endTime = sessionEnd ? new Date(sessionEnd) : new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // Calculate engagement score
    const engagementScore = calculateSessionScore(durationMinutes, activitiesCount, qualityInteractions || 0);

    // Create session record
    const sessionRecord = await db.insert(user_activity_sessions).values({
      user_id: userId,
      session_start: startTime,
      session_end: sessionEnd ? endTime : null,
      total_time_minutes: durationMinutes,
      activities_count: activitiesCount,
      quality_interactions: qualityInteractions || 0,
      device_info: deviceInfo || {},
      engagement_score: engagementScore
    }).returning();

    logger.info('User activity session tracked', {
      userId,
      sessionId: sessionRecord[0].id,
      durationMinutes,
      activitiesCount,
      qualityInteractions,
      engagementScore
    });

    res.json({
      success: true,
      sessionId: sessionRecord[0].id,
      engagementScore,
      durationMinutes,
      message: 'Session tracked successfully'
    });

  } catch (error) {
    logger.error('Error tracking session:', error);
    res.status(500).json({ error: 'Failed to track session' });
  }
});

// Check user's eligibility for pioneer badge
router.get('/eligibility', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already has a pioneer badge
    const existingBadge = await db.select().from(pioneer_badges)
      .where(eq(pioneer_badges.user_id, userId))
      .limit(1);

    if (existingBadge.length > 0) {
      return res.json({
        success: true,
        data: {
          isEligible: false,
          currentScore: Number(existingBadge[0].eligibility_score),
          requiredScore: MIN_ELIGIBILITY_SCORE,
          remainingSlots: 0,
          currentRank: existingBadge[0].badge_number,
          hasBadge: true,
          improvements: []
        }
      });
    }

    // Check remaining slots
    const awardedBadges = await db.select({ count: count() })
      .from(pioneer_badges);

    const remainingSlots = MAX_PIONEER_BADGES - (awardedBadges[0]?.count || 0);

    if (remainingSlots <= 0) {
      return res.json({
        success: true,
        data: {
          isEligible: false,
          currentScore: 0,
          requiredScore: MIN_ELIGIBILITY_SCORE,
          remainingSlots: 0,
          currentRank: 0,
          improvements: [{ 
            category: 'availability', 
            description: 'All 500 Pioneer Badges have been awarded', 
            weight: 100,
            currentValue: 500,
            targetValue: 500
          }]
        }
      });
    }

    // Get user data
    const user = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate eligibility score and metrics
    const eligibilityData = await calculateEligibilityScore(userId, user[0]);

    res.json({
      success: true,
      data: {
        isEligible: eligibilityData.score >= MIN_ELIGIBILITY_SCORE && remainingSlots > 0,
        currentScore: eligibilityData.score,
        requiredScore: MIN_ELIGIBILITY_SCORE,
        remainingSlots,
        currentRank: 0,
        improvements: eligibilityData.improvements
      }
    });

  } catch (error) {
    logger.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Get user's pioneer badge
router.get('/badge', authenticateToken, async (req, res) => {
  try {
    // Use req.userId instead of req.user?.id
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const badge = await db.select().from(pioneer_badges)
      .where(eq(pioneer_badges.user_id, userId))
      .limit(1);

    if (!badge.length) {
      return res.status(404).json({ error: 'No pioneer badge found' });
    }

    res.json({
      success: true,
      data: {
        id: badge[0].id,
        user_id: badge[0].user_id,
        badge_number: badge[0].badge_number,
        earned_at: badge[0].earned_at,
        eligibility_score: Number(badge[0].eligibility_score),
        activity_metrics: badge[0].activity_metrics,
        verification_data: badge[0].verification_data,
        is_verified: badge[0].is_verified,
        created_at: badge[0].created_at
      }
    });

  } catch (error) {
    logger.error('Error fetching pioneer badge:', error);
    res.status(500).json({ error: 'Failed to fetch pioneer badge' });
  }
});

// Claim pioneer badge
router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already has a badge
    const existingBadge = await db.select().from(pioneer_badges)
      .where(eq(pioneer_badges.user_id, userId))
      .limit(1);

    if (existingBadge.length > 0) {
      return res.status(400).json({ 
        error: 'User already has a pioneer badge',
        badge: existingBadge[0]
      });
    }

    // Check remaining slots
    const awardedBadges = await db.select({ count: count() })
      .from(pioneer_badges);

    const remainingSlots = MAX_PIONEER_BADGES - (awardedBadges[0]?.count || 0);

    if (remainingSlots <= 0) {
      return res.status(400).json({ 
        error: 'All 500 Pioneer Badges have been awarded'
      });
    }

    // Get user data and check eligibility
    const user = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const eligibilityData = await calculateEligibilityScore(userId, user[0]);

    if (eligibilityData.score < MIN_ELIGIBILITY_SCORE) {
      return res.status(400).json({ 
        error: 'User does not meet eligibility requirements',
        currentScore: eligibilityData.score,
        requiredScore: MIN_ELIGIBILITY_SCORE,
        improvements: eligibilityData.improvements
      });
    }

    // Determine badge number (next available)
    const nextBadgeNumber = (awardedBadges[0]?.count || 0) + 1;

    // Create pioneer badge
    const newBadge = await db.insert(pioneer_badges).values({
      user_id: userId,
      badge_number: nextBadgeNumber,
      eligibility_score: eligibilityData.score,
      activity_metrics: eligibilityData.activityMetrics,
      verification_data: eligibilityData.verificationData,
      is_verified: true
    }).returning();

    logger.info('Pioneer badge awarded', {
      userId,
      badgeNumber: nextBadgeNumber,
      eligibilityScore: eligibilityData.score,
      remainingSlots: remainingSlots - 1
    });

    res.json({
      success: true,
      badge: {
        id: newBadge[0].id,
        user_id: newBadge[0].user_id,
        badge_number: newBadge[0].badge_number,
        earned_at: newBadge[0].earned_at,
        eligibility_score: Number(newBadge[0].eligibility_score),
        activity_metrics: newBadge[0].activity_metrics,
        verification_data: newBadge[0].verification_data,
        is_verified: newBadge[0].is_verified,
        created_at: newBadge[0].created_at
      },
      badgeNumber: nextBadgeNumber,
      message: `Congratulations! You've earned Pioneer Badge #${nextBadgeNumber}!`
    });

  } catch (error) {
    logger.error('Error claiming pioneer badge:', error);
    res.status(500).json({ error: 'Failed to claim pioneer badge' });
  }
});

// Get pioneer badge leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const badges = await db.select({
      id: pioneer_badges.id,
      user_id: pioneer_badges.user_id,
      badge_number: pioneer_badges.badge_number,
      earned_at: pioneer_badges.earned_at,
      eligibility_score: pioneer_badges.eligibility_score,
      activity_metrics: pioneer_badges.activity_metrics,
      verification_data: pioneer_badges.verification_data,
      is_verified: pioneer_badges.is_verified,
      created_at: pioneer_badges.created_at,
      username: users.username,
      avatar_url: users.avatar_url,
      full_name: users.full_name
    })
    .from(pioneer_badges)
    .innerJoin(users, eq(pioneer_badges.user_id, users.id))
    .orderBy(asc(pioneer_badges.badge_number))
    .limit(Number(limit));

    const total = await db.select({ count: count() })
      .from(pioneer_badges);

    res.json({
      success: true,
      data: {
        badges: badges.map(badge => ({
          id: badge.id,
          user_id: badge.user_id,
          badge_number: badge.badge_number,
          earned_at: badge.earned_at,
          eligibility_score: Number(badge.eligibility_score),
          activity_metrics: badge.activity_metrics,
          verification_data: badge.verification_data,
          is_verified: badge.is_verified,
          created_at: badge.created_at,
          username: badge.username,
          avatar_url: badge.avatar_url,
          full_name: badge.full_name
        })),
        total: total[0]?.count || 0
      }
    });

  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get available slots
router.get('/slots', async (req, res) => {
  try {
    const awardedBadges = await db.select({ count: count() })
      .from(pioneer_badges);

    const awardedCount = awardedBadges[0]?.count || 0;
    const remainingSlots = MAX_PIONEER_BADGES - awardedCount;

    res.json({
      success: true,
      data: {
        totalSlots: MAX_PIONEER_BADGES,
        awardedSlots: awardedCount,
        remainingSlots: Math.max(0, remainingSlots),
        nextBadgeNumber: awardedCount + 1
      }
    });

  } catch (error) {
    logger.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Get activity summary
router.get('/activity-summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const summary = await db.select({
      totalSessions: sql`COUNT(*)`,
      totalTimeMinutes: sql`COALESCE(SUM(${user_activity_sessions.total_time_minutes}), 0)`,
      activitiesCount: sql`COALESCE(SUM(${user_activity_sessions.activities_count}), 0)`,
      qualityInteractions: sql`COALESCE(SUM(${user_activity_sessions.quality_interactions}), 0)`,
      daysActive: sql`COUNT(DISTINCT DATE(${user_activity_sessions.created_at}))`,
      averageEngagementScore: sql`COALESCE(AVG(${user_activity_sessions.engagement_score}), 0)`
    })
    .from(user_activity_sessions)
    .where(eq(user_activity_sessions.user_id, userId));

    res.json({
      success: true,
      data: {
        totalSessions: Number(summary[0]?.totalSessions || 0),
        totalTimeMinutes: Number(summary[0]?.totalTimeMinutes || 0),
        activitiesCount: Number(summary[0]?.activitiesCount || 0),
        qualityInteractions: Number(summary[0]?.qualityInteractions || 0),
        daysActive: Number(summary[0]?.daysActive || 0),
        averageEngagementScore: Number(summary[0]?.averageEngagementScore || 0)
      }
    });

  } catch (error) {
    logger.error('Error fetching activity summary:', error);
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

// Helper functions
function calculateSessionScore(durationMinutes: number, activitiesCount: number, qualityInteractions: number): number {
  const durationScore = Math.min(durationMinutes / 2, 30);
  const activityScore = Math.min(activitiesCount * 0.5, 25);
  const qualityScore = Math.min(qualityInteractions * 3, 45);
  return Math.round((durationScore + activityScore + qualityScore) * 100) / 100;
}

async function calculateEligibilityScore(userId: string, user: any) {
  // Get user activity sessions
  const sessions = await db.select({
    totalSessions: sql`COUNT(*)`,
    totalTimeMinutes: sql`COALESCE(SUM(${user_activity_sessions.total_time_minutes}), 0)`,
    activitiesCount: sql`COALESCE(SUM(${user_activity_sessions.activities_count}), 0)`,
    qualityInteractions: sql`COALESCE(SUM(${user_activity_sessions.quality_interactions}), 0)`,
    daysActive: sql`COUNT(DISTINCT DATE(${user_activity_sessions.created_at}))`,
    averageEngagement: sql`COALESCE(AVG(${user_activity_sessions.engagement_score}), 0)`
  })
  .from(user_activity_sessions)
  .where(eq(user_activity_sessions.user_id, userId));

  const sessionData = sessions[0];
  const accountAgeDays = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
  
  const totalSessions = Number(sessionData?.totalSessions || 0);
  const totalTimeMinutes = Number(sessionData?.totalTimeMinutes || 0);
  const activitiesCount = Number(sessionData?.activitiesCount || 0);
  const qualityInteractions = Number(sessionData?.qualityInteractions || 0);
  const daysActive = Number(sessionData?.daysActive || 0);
  const averageEngagement = Number(sessionData?.averageEngagement || 0);

  let score = 0;
  const improvements = [];

  // Account age (20 points max)
  if (accountAgeDays >= 7) {
    score += 20;
  } else {
    improvements.push({
      category: 'Account Age',
      description: 'Account must be at least 7 days old',
      weight: 20,
      currentValue: accountAgeDays,
      targetValue: 7
    });
  }

  // Session count (20 points max)
  if (totalSessions >= 10) {
    score += 20;
  } else {
    improvements.push({
      category: 'Active Sessions',
      description: 'Complete at least 10 active sessions',
      weight: 20,
      currentValue: totalSessions,
      targetValue: 10
    });
  }

  // Time spent (20 points max)
  const averageSessionMinutes = totalSessions > 0 ? totalTimeMinutes / totalSessions : 0;
  if (averageSessionMinutes >= 5) {
    score += 20;
  } else {
    improvements.push({
      category: 'Session Quality',
      description: 'Average session length should be at least 5 minutes',
      weight: 20,
      currentValue: Math.round(averageSessionMinutes * 100) / 100,
      targetValue: 5
    });
  }

  // Content creation (20 points max)
  const contentCreated = user.posts_count || 0;
  if (contentCreated >= 3) {
    score += 20;
  } else {
    improvements.push({
      category: 'Content Creation',
      description: 'Create at least 3 posts or pieces of content',
      weight: 20,
      currentValue: contentCreated,
      targetValue: 3
    });
  }

  // Community participation (20 points max)
  if (qualityInteractions >= 10) {
    score += 20;
  } else {
    improvements.push({
      category: 'Community Engagement',
      description: 'Have at least 10 quality interactions (comments, likes, shares)',
      weight: 20,
      currentValue: qualityInteractions,
      targetValue: 10
    });
  }

  return {
    score: Math.round(score),
    improvements,
    activityMetrics: {
      total_sessions: totalSessions,
      total_time_minutes: totalTimeMinutes,
      activities_count: activitiesCount,
      quality_interactions: qualityInteractions,
      days_active: daysActive,
      engagement_score: averageEngagement,
      content_created: contentCreated,
      community_participation: qualityInteractions
    },
    verificationData: {
      account_age_days: accountAgeDays,
      verified_activities: ['session_tracking', 'content_creation', 'community_engagement'],
      anti_abuse_score: Math.min(100, accountAgeDays * 2 + totalSessions * 5),
      device_consistency: 100 // Simplified for now
    }
  };
}

export default router;

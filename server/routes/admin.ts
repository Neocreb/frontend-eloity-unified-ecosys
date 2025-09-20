import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { 
  users, 
  posts, 
  user_sessions
} from '../../shared/schema.js';
import {
  products
} from '../../shared/enhanced-schema.js';
import { 
  eq, 
  desc, 
  count, 
  and, 
  gte, 
  or,
  like 
} from 'drizzle-orm';
import { logger } from '../utils/logger.js';

// Initialize database connection
const sql_client = neon(process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock');
const db = drizzle(sql_client);

const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    await authenticateToken(req, res, async () => {
      // Check if user has admin role
      const user = await db.select()
        .from(users)
        .where(eq(users.id, req.userId))
        .limit(1);

      if (!user.length || user[0].role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      req.adminUser = user[0];
      next();
    });
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Admin access denied' });
  }
};

// =============================================================================
// DASHBOARD ENDPOINTS
// =============================================================================

// Get comprehensive dashboard data
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get basic stats that exist in current schema
    const [totalUsersResult, totalPostsResult, totalProductsResult] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(products)
    ]);

    // Get active users (users who have been active in the last 7 days)
    const activeUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.last_active, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

    // Mock data for tables that don't exist yet
    const mockData = {
      totalJobs: 89,
      totalTrades: 234,
      pendingModeration: 12,
      revenueMonth: 48500,
      activeBoosts: 27,
      premiumSubscribers: {
        silver: 45,
        gold: 23,
        pro: 8,
      },
    };

    // Mock recent activity
    const recentActivity = [
      {
        id: 'activity-1',
        admin_name: req.adminUser.full_name || 'Admin',
        action: 'user_verification',
        description: 'Verified user account',
        created_at: new Date().toISOString(),
      },
      {
        id: 'activity-2',
        admin_name: req.adminUser.full_name || 'Admin',
        action: 'content_moderation',
        description: 'Reviewed and approved content',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    // Get active admins
    const activeAdmins = [
      {
        id: req.adminUser.id,
        name: req.adminUser.full_name || 'Admin',
        email: req.adminUser.email,
        roles: ['super_admin'],
      }
    ];

    // Mock system health metrics
    const systemHealth = {
      cpu: Math.floor(Math.random() * 30) + 40,
      memory: Math.floor(Math.random() * 40) + 50,
      storage: Math.floor(Math.random() * 20) + 70,
      apiLatency: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 0.05,
    };

    const dashboardData = {
      success: true,
      dashboard: {
        stats: {
          totalUsers: totalUsersResult[0].count || 0,
          activeUsers: activeUsersResult[0].count || 0,
          totalProducts: totalProductsResult[0].count || 0,
          totalJobs: mockData.totalJobs,
          totalTrades: mockData.totalTrades,
          pendingModeration: mockData.pendingModeration,
          revenueMonth: mockData.revenueMonth,
          activeBoosts: mockData.activeBoosts,
          premiumSubscribers: mockData.premiumSubscribers,
        },
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          adminName: activity.admin_name,
          action: activity.action,
          description: activity.description,
          createdAt: activity.created_at,
        })),
        activeAdmins,
        systemHealth,
      }
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

// =============================================================================
// USER MANAGEMENT ENDPOINTS
// =============================================================================

// Get users with filters
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search,
      verified
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: users.id,
      username: users.username,
      fullName: users.full_name,
      email: users.email,
      role: users.role,
      isVerified: users.is_verified,
      points: users.points,
      level: users.level,
      isOnline: users.is_online,
      lastActiveAt: users.last_active,
      createdAt: users.created_at,
    })
    .from(users);

    // Apply filters
    const conditions = [];
    if (role) conditions.push(eq(users.role, role as string));
    if (verified !== undefined) conditions.push(eq(users.is_verified, verified === 'true'));
    if (search) {
      conditions.push(
        or(
          like(users.full_name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.username, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const usersData = await query
      .orderBy(desc(users.created_at))
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    let countQuery = db.select({ count: count() }).from(users);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;

    res.json({
      success: true,
      data: usersData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResult[0].count,
        totalPages: Math.ceil(totalResult[0].count / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// =============================================================================
// MOCK ENDPOINTS FOR FEATURES NOT YET IMPLEMENTED
// =============================================================================

// KYC Management
router.get('/kyc/verifications', authenticateAdmin, async (req, res) => {
  const mockVerifications = [
    {
      id: 'kyc-001',
      userId: 'user-123',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      level: 1,
      status: 'pending',
      verificationScore: 0.85,
      riskLevel: 'low',
      submittedAt: new Date().toISOString(),
    }
  ];
  
  res.json({ success: true, data: mockVerifications, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } });
});

router.put('/kyc/verifications/:id', authenticateAdmin, async (req, res) => {
  res.json({ success: true, message: 'KYC verification updated successfully' });
});

// Financial Management
router.get('/financial/overview', authenticateAdmin, async (req, res) => {
  const mockData = {
    metrics: { totalRevenue: 125000, totalTransactions: 1250, averageTransaction: 100, successRate: 98.5 },
    revenueChart: [{ date: '2024-01-01', revenue: 5000 }],
    transactionsByStatus: [{ status: 'completed', count: 1230, amount: 123000 }]
  };
  
  res.json({ success: true, data: mockData });
});

router.get('/financial/transactions', authenticateAdmin, async (req, res) => {
  const mockTransactions = [{
    id: 'txn-001',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    type: 'marketplace_sale',
    description: 'Product purchase',
    createdAt: new Date().toISOString(),
  }];
  
  res.json({ success: true, data: mockTransactions, pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
});

// Chat Moderation
router.get('/chat/flagged-messages', authenticateAdmin, async (req, res) => {
  const mockMessages = [{
    id: 'msg-001',
    content: 'Flagged message content',
    senderId: 'user-123',
    flaggedReason: 'inappropriate_content',
    aiConfidence: 0.85,
    moderationStatus: 'pending',
    createdAt: new Date().toISOString(),
    sender: { name: 'John Doe', email: 'john@example.com' }
  }];
  
  res.json({ success: true, data: mockMessages, pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
});

router.put('/chat/messages/:id/moderate', authenticateAdmin, async (req, res) => {
  res.json({ success: true, message: 'Message moderated successfully' });
});

// Boost Management
router.get('/boosts/campaigns', authenticateAdmin, async (req, res) => {
  const mockCampaigns = [{
    id: 'boost-001',
    title: 'Product Promotion Campaign',
    type: 'product_boost',
    status: 'active',
    budget: 500.00,
    spent: 250.75,
    impressions: 15000,
    clicks: 450,
    conversions: 23,
    createdAt: new Date().toISOString(),
    creator: { name: 'John Merchant', email: 'merchant@example.com' }
  }];
  
  res.json({ success: true, data: mockCampaigns, pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
});

router.put('/boosts/campaigns/:id', authenticateAdmin, async (req, res) => {
  res.json({ success: true, message: 'Boost campaign updated successfully' });
});

// System Health
router.get('/system/metrics', authenticateAdmin, async (req, res) => {
  const mockMetrics = {
    systemMetrics: {
      cpu: 45,
      memory: 62,
      disk: 78,
      network: 150,
      apiLatency: 120,
      errorRate: 0.02,
      activeConnections: 75,
      requestsPerMinute: 750,
    },
    services: [
      { name: 'Database', status: 'healthy', uptime: '99.9%' },
      { name: 'API Server', status: 'healthy', uptime: '99.8%' },
    ],
    timestamp: new Date().toISOString(),
  };
  
  res.json({ success: true, data: mockMetrics });
});

export default router;
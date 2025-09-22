import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
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
import { db } from '../../server/enhanced-index.js'; // Use shared database connection

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
        created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
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

    // Apply pagination
    query = query
      .orderBy(desc(users.created_at))
      .limit(Number(limit))
      .offset(offset);

    const usersResult = await query;

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(users);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const total = countResult[0].count;

    res.json({
      success: true,
      data: usersResult,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users' 
    });
  }
});

// Get user details
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.select({
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
      updatedAt: users.updated_at,
      bio: users.bio,
      location: users.location,
      website: users.website,
      avatarUrl: users.avatar_url,
      bannerUrl: users.banner_url,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

    if (!userResult.length) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: userResult[0],
    });
  } catch (error) {
    logger.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user details' 
    });
  }
});

// Update user
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isVerified } = req.body;

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.is_verified = isVerified;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No update data provided' 
      });
    }

    updateData.updated_at = new Date();

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: result[0],
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userResult.length) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Delete user
    await db.delete(users)
      .where(eq(users.id, id));

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete user' 
    });
  }
});

export default router;
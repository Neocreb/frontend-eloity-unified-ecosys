import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../server/enhanced-index.js';
import { profiles, followers } from '../../shared/enhanced-schema.js';
import { desc, eq } from 'drizzle-orm';

const router = express.Router();

// GET /api/explore/users?limit=10
router.get('/users', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    // Try to extract userId from Bearer token if present (optional)
    let userId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        if (decoded && typeof decoded.userId === 'string') userId = decoded.userId;
      }
    } catch (e) {
      // ignore token errors and continue as unauthenticated
    }

    // Fetch a larger set and filter client-side to avoid complex query construction here
    const fetchLimit = Math.max(limit * 3, 20);
    const profilesResult = await db.select().from(profiles).orderBy(desc(profiles.user_id)).limit(fetchLimit).execute();

    let followingIds: string[] = [];
    if (userId) {
      const followingRows = await db.select().from(followers).where(followers.follower_id.eq(userId)).execute();
      followingIds = followingRows.map((r: any) => r.following_id);
    }

    const candidates = (profilesResult || []).filter((p: any) => p.user_id && p.user_id !== userId && !followingIds.includes(p.user_id));
    const selected = candidates.slice(0, limit);

    const users = selected.map((profile: any) => ({
      id: profile.user_id,
      username: profile.username || 'unknown',
      full_name: profile.full_name || 'Unknown User',
      avatar_url: profile.avatar_url || '',
      bio: profile.bio || '',
      is_verified: !!profile.is_verified,
      followers_count: 0
    }));

    res.json({ users });
  } catch (error) {
    console.error('Error in /api/explore/users:', error);
    res.status(500).json({ error: 'Failed to fetch suggested users' });
  }
});

export default router;

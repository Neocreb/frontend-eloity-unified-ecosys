import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../server/enhanced-index.js';
import { profiles, followers } from '../../shared/enhanced-schema.js';
import { posts, users } from '../../shared/schema.js';
import { products } from '../../shared/enhanced-schema.js';
import { freelance_projects as jobs } from '../../shared/freelance-schema.js';
import { crypto_prices as crypto } from '../../shared/crypto-schema.js';
import { rewardRules as rewards, referrals } from '../../shared/activity-economy-schema.js';
import { desc, eq, like, or, and } from 'drizzle-orm';

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
      const followingRows = await db.select().from(followers).where(eq(followers.follower_id, userId)).execute();
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

// GET /api/explore/search?q=query&type=type
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string || 'all';
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results: any[] = [];

    // Search users
    if (type === 'all' || type === 'users') {
      const userResults = await db.select().from(profiles)
        .where(or(
          like(profiles.full_name, `%${query}%`),
          like(profiles.username, `%${query}%`),
          like(profiles.bio, `%${query}%`)
        ))
        .limit(limit)
        .execute();

      userResults.forEach(user => {
        results.push({
          id: user.user_id,
          type: 'user',
          title: user.full_name || user.username,
          description: user.bio || '',
          image: user.avatar_url || '',
          author: { name: user.full_name || user.username, verified: !!user.is_verified },
          stats: { views: user.profile_views || 0 }
        });
      });
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const postResults = await db.select({
        post: posts,
        user: users
      })
      .from(posts)
      .leftJoin(users, eq(posts.user_id, users.id))
      .where(like(posts.content, `%${query}%`))
      .limit(limit)
      .execute();

      postResults.forEach(result => {
        const { post, user } = result;
        results.push({
          id: post.id,
          type: 'post',
          title: post.content.substring(0, 50) + '...',
          description: post.content,
          timestamp: post.created_at,
          author: { 
            name: user?.full_name || user?.username || 'User', 
            verified: user?.is_verified || false 
          },
          stats: { views: post.views_count || 0, likes: post.likes_count || 0, comments: post.comments_count || 0 }
        });
      });
    }

    // Search products
    if (type === 'all' || type === 'products') {
      const productResults = await db.select({
        product: products,
        user: users
      })
      .from(products)
      .leftJoin(users, eq(products.seller_id, users.id))
      .where(or(
        like(products.title, `%${query}%`),
        like(products.description, `%${query}%`)
      ))
      .limit(limit)
      .execute();

      productResults.forEach(result => {
        const { product, user } = result;
        results.push({
          id: product.id,
          type: 'product',
          title: product.title,
          description: product.description,
          image: product.images?.[0] || '',
          price: parseFloat(product.price?.toString() || '0'),
          category: product.category || '',
          author: { 
            name: user?.full_name || user?.username || 'Seller', 
            verified: user?.is_verified || false 
          },
          stats: { views: product.views_count || 0, likes: 0 }
        });
      });
    }

    // Search jobs (freelance projects)
    if (type === 'all' || type === 'jobs') {
      const jobResults = await db.select({
        job: jobs,
        user: users
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.client_id, users.id))
      .where(or(
        like(jobs.title, `%${query}%`),
        like(jobs.description, `%${query}%`),
        like(jobs.skills_required, `%${query}%`)
      ))
      .limit(limit)
      .execute();

      jobResults.forEach(result => {
        const { job, user } = result;
        results.push({
          id: job.id,
          type: 'job',
          title: job.title,
          description: job.description,
          category: job.category || '',
          price: job.budget_max ? parseFloat(job.budget_max?.toString() || '0') : undefined,
          author: { 
            name: user?.full_name || user?.username || 'Client', 
            verified: user?.is_verified || false 
          },
          stats: { views: job.views_count || 0, applications: job.applications_count || 0 }
        });
      });
    }

    // Search crypto currencies
    if (type === 'all' || type === 'crypto') {
      const cryptoResults = await db.select().from(crypto)
        .where(or(
          like(crypto.name, `%${query}%`),
          like(crypto.symbol, `%${query}%`)
        ))
        .limit(limit)
        .execute();

      cryptoResults.forEach(currency => {
        results.push({
          id: currency.id,
          type: 'crypto',
          title: `${currency.name} (${currency.symbol})`,
          description: `Current price: $${currency.price_usd}`,
          price: parseFloat(currency.price_usd?.toString() || '0'),
          category: 'Cryptocurrency',
          stats: { 
            change24h: currency.price_change_24h ? parseFloat(currency.price_change_24h?.toString() || '0') : 0,
            volume24h: currency.volume_24h ? parseFloat(currency.volume_24h?.toString() || '0') : 0
          }
        });
      });
    }

    // Search reward rules
    if (type === 'all' || type === 'rewards') {
      const rewardResults = await db.select().from(rewards)
        .where(or(
          like(rewards.actionType, `%${query}%`),
          like(rewards.displayName, `%${query}%`),
          like(rewards.description, `%${query}%`)
        ))
        .limit(limit)
        .execute();

      rewardResults.forEach(rule => {
        results.push({
          id: rule.id,
          type: 'reward',
          title: rule.displayName,
          description: rule.description || `Earn ${rule.baseEloits} ELOITS for ${rule.actionType}`,
          category: 'Rewards',
          stats: { baseEloits: parseFloat(rule.baseEloits?.toString() || '0') }
        });
      });
    }

    // Search referrals
    if (type === 'all' || type === 'referrals') {
      const referralResults = await db.select({
        referral: referrals,
        user: users
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .where(or(
        like(users.full_name, `%${query}%`),
        like(users.username, `%${query}%`)
      ))
      .limit(limit)
      .execute();

      referralResults.forEach(result => {
        const { referral, user } = result;
        results.push({
          id: referral.id,
          type: 'referral',
          title: `Referral from ${user?.full_name || user?.username || 'User'}`,
          description: `Referral code: ${referral.referralCode}`,
          category: 'Referrals',
          stats: { rewardEarned: parseFloat(referral.rewardEarned?.toString() || '0') }
        });
      });
    }

    res.json({
      results,
      totalCount: results.length,
      currentPage: 1,
      totalPages: 1,
      suggestions: [],
      relatedSearches: [],
      facets: {
        categories: [],
        priceRanges: [],
        ratings: [],
        locations: []
      }
    });
  } catch (error) {
    console.error('Error in /api/explore/search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

export default router;

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { db } from '../../server/enhanced-index.js';
import { users, followers, posts as schemaPosts } from '../../shared/schema.js';
import { profiles, marketplace_profiles, freelance_profiles, products as schemaProducts } from '../../shared/enhanced-schema.js';
import { crypto_profiles } from '../../shared/crypto-schema.js';
import { eq, and, or, desc, asc, like, sql, count } from 'drizzle-orm';

const router = express.Router();

// Get user profile by username or ID
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const isUserId = identifier.startsWith('user_') || identifier.length > 20;

    // Query the database for the user profile
    let userQuery;
    if (isUserId) {
      userQuery = db.select().from(profiles).where(eq(profiles.user_id, identifier as string));
    } else {
      userQuery = db.select().from(profiles).where(eq(profiles.username, identifier as string));
    }

    const userResult = await userQuery.execute();
    const userData = userResult[0];

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get related profiles
    const marketplaceResult = await db.select().from(marketplace_profiles).where(eq(marketplace_profiles.user_id, userData.user_id as string)).execute();
    const freelanceResult = await db.select().from(freelance_profiles).where(eq(freelance_profiles.user_id, userData.user_id as string)).execute();
    const cryptoResult = await db.select().from(crypto_profiles).where(eq(crypto_profiles.user_id, userData.user_id as string)).execute();

    // Get follower counts
    const followersCountResult = await db.select({ count: count() }).from(followers).where(eq(followers.following_id, userData.user_id as string)).execute();
    const followingCountResult = await db.select({ count: count() }).from(followers).where(eq(followers.follower_id, userData.user_id as string)).execute();

    const profile = {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      displayName: userData.full_name || userData.username,
      bio: userData.bio,
      avatar: userData.avatar_url,
      cover_image: userData.banner_url,
      location: userData.location,
      website: userData.website,
      verified: userData.is_verified || false,
      privacy_settings: {
        profile_visibility: userData.profile_visibility || 'public',
        show_email: userData.show_email || false,
        show_phone: userData.show_phone || false
      },
      stats: {
        followers_count: followersCountResult[0]?.count || 0,
        following_count: followingCountResult[0]?.count || 0,
        posts_count: userData.posts_count || 0,
        likes_received: userData.likes_received || 0
      },
      social_profiles: {
        facebook: null,
        twitter: null,
        instagram: null,
        linkedin: null
      },
      marketplace_profile: marketplaceResult[0] || null,
      freelance_profile: freelanceResult[0] || null,
      crypto_profile: cryptoResult[0] || null,
      activity: {
        last_seen: userData.last_active || new Date().toISOString(),
        is_online: userData.is_online || false,
        total_activity_points: userData.points || 0
      },
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    logger.info('Profile fetched', { identifier, profileId: profile.id });
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;

    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Query the database for the user profile
    const userResult = await db.select().from(profiles).where(eq(profiles.user_id, userId)).execute();
    const userData = userResult[0];

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get related profiles
    const marketplaceResult = await db.select().from(marketplace_profiles).where(eq(marketplace_profiles.user_id, userId)).execute();
    const freelanceResult = await db.select().from(freelance_profiles).where(eq(freelance_profiles.user_id, userId)).execute();
    const cryptoResult = await db.select().from(crypto_profiles).where(eq(crypto_profiles.user_id, userId)).execute();

    // Get follower counts
    const followersCountResult = await db.select({ count: count() }).from(followers).where(eq(followers.following_id, userId)).execute();
    const followingCountResult = await db.select({ count: count() }).from(followers).where(eq(followers.follower_id, userId)).execute();

    const profile = {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      displayName: userData.full_name || userData.username,
      bio: userData.bio,
      avatar: userData.avatar_url,
      cover_image: userData.banner_url,
      location: userData.location,
      website: userData.website,
      verified: userData.is_verified || false,
      privacy_settings: {
        profile_visibility: userData.profile_visibility || 'public',
        show_email: userData.show_email || false,
        show_phone: userData.show_phone || false
      },
      stats: {
        followers_count: followersCountResult[0]?.count || 0,
        following_count: followingCountResult[0]?.count || 0,
        posts_count: userData.posts_count || 0,
        likes_received: userData.likes_received || 0
      },
      social_profiles: {
        facebook: null,
        twitter: null,
        instagram: null,
        linkedin: null
      },
      marketplace_profile: marketplaceResult[0] || null,
      freelance_profile: freelanceResult[0] || null,
      crypto_profile: cryptoResult[0] || null,
      activity: {
        last_seen: userData.last_active || new Date().toISOString(),
        is_online: userData.is_online || false,
        total_activity_points: userData.points || 0
      },
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    logger.info('Current user profile fetched', { userId });
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching current user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    
    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      displayName,
      bio,
      location,
      website,
      privacy_settings,
      social_profiles
    } = req.body;

    // Update profile in database
    const updateData = {
      full_name: displayName,
      bio,
      location,
      website,
      profile_visibility: privacy_settings?.profile_visibility,
      show_email: privacy_settings?.show_email,
      show_phone: privacy_settings?.show_phone,
      updated_at: new Date()
    };

    const result = await db.update(profiles)
      .set(updateData)
      .where(eq(profiles.user_id, userId))
      .returning()
      .execute();

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfile = {
      id: result[0].user_id,
      displayName: result[0].full_name,
      bio: result[0].bio,
      location: result[0].location,
      website: result[0].website,
      privacy_settings: {
        profile_visibility: result[0].profile_visibility,
        show_email: result[0].show_email,
        show_phone: result[0].show_phone
      },
      updated_at: result[0].updated_at
    };

    logger.info('Profile updated', { userId });
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload profile avatar
router.post('/me/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    
    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, you would handle file upload to S3 or similar
    // For now, we'll just update the avatar URL in the database
    const avatarUrl = `/api/uploads/avatars/${userId}_${Date.now()}.jpg`;

    // Update avatar URL in database
    const result = await db.update(profiles)
      .set({ avatar_url: avatarUrl, updated_at: new Date() })
      .where(eq(profiles.user_id, userId))
      .returning()
      .execute();

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('Avatar uploaded', { userId, avatarUrl });
    res.json({ avatar_url: avatarUrl });
  } catch (error) {
    logger.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload cover image
router.post('/me/cover', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    
    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, you would handle file upload to S3 or similar
    const coverUrl = `/api/uploads/covers/${userId}_${Date.now()}.jpg`;

    // Update cover URL in database
    const result = await db.update(profiles)
      .set({ banner_url: coverUrl, updated_at: new Date() })
      .where(eq(profiles.user_id, userId))
      .returning()
      .execute();

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('Cover image uploaded', { userId, coverUrl });
    res.json({ cover_url: coverUrl });
  } catch (error) {
    logger.error('Error uploading cover image:', error);
    res.status(500).json({ error: 'Failed to upload cover image' });
  }
});

// Get user's posts
router.get('/:identifier/posts', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    // First get the user ID
    const isUserId = identifier.startsWith('user_') || identifier.length > 20;
    let userId;
    
    if (isUserId) {
      userId = identifier;
    } else {
      const userResult = await db.select().from(profiles).where(eq(profiles.username, identifier)).execute();
      if (userResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      userId = userResult[0].user_id;
    }

    // Get user's posts from database
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const postsResult = await db.select().from(schemaPosts)
      .where(eq(schemaPosts.user_id, userId))
      .orderBy(desc(schemaPosts.created_at))
      .limit(parseInt(limit as string))
      .offset(offset)
      .execute();

    // Get user profile for author information
    const userResult = await db.select().from(profiles).where(eq(profiles.user_id, userId)).execute();
    const userData = userResult[0];

    const posts = {
      data: postsResult.map(post => ({
        id: post.id,
        author: {
          id: userData.user_id,
          username: userData.username,
          displayName: userData.full_name || userData.username,
          avatar: userData.avatar_url
        },
        content: post.content,
        type: post.type,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        created_at: post.created_at
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: postsResult.length,
        totalPages: Math.ceil(postsResult.length / parseInt(limit as string))
      }
    };

    logger.info('User posts fetched', { identifier, count: posts.data.length });
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get user's marketplace products
router.get('/:identifier/products', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 10, category = 'all' } = req.query;

    // First get the user ID
    const isUserId = identifier.startsWith('user_') || identifier.length > 20;
    let userId;
    
    if (isUserId) {
      userId = identifier;
    } else {
      const userResult = await db.select().from(profiles).where(eq(profiles.username, identifier)).execute();
      if (userResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      userId = userResult[0].user_id;
    }

    // Get user's products from database
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let productsQuery = db.select().from(schemaProducts)
      .where(eq(schemaProducts.seller_id, userId))
      .orderBy(desc(schemaProducts.created_at))
      .limit(parseInt(limit as string))
      .offset(offset);

    if (category !== 'all') {
      productsQuery = productsQuery.where(eq(schemaProducts.category, category.toString()));
    }

    const productsResult = await productsQuery.execute();

    // Get user profile for seller information
    const userResult = await db.select().from(profiles).where(eq(profiles.user_id, userId)).execute();
    const userData = userResult[0];

    const products = {
      data: productsResult.map(product => ({
        id: product.id,
        seller: {
          id: userData.user_id,
          username: userData.username,
          displayName: userData.full_name || userData.username,
          avatar: userData.avatar_url
        },
        title: product.title,
        price: product.price,
        currency: product.currency,
        category: product.category,
        images: product.images ? JSON.parse(product.images) : ['/placeholder.svg'],
        rating: product.rating || 0,
        sales_count: product.sales_count || 0,
        created_at: product.created_at
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: productsResult.length,
        totalPages: Math.ceil(productsResult.length / parseInt(limit as string))
      }
    };

    logger.info('User products fetched', { identifier, count: products.data.length });
    res.json(products);
  } catch (error) {
    logger.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Failed to fetch user products' });
  }
});

// Get user's freelance services
router.get('/:identifier/services', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 10, category = 'all' } = req.query;

    // First get the user ID
    const isUserId = identifier.startsWith('user_') || identifier.length > 20;
    let userId;
    
    if (isUserId) {
      userId = identifier;
    } else {
      const userResult = await db.select().from(profiles).where(eq(profiles.username, identifier)).execute();
      if (userResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      userId = userResult[0].user_id;
    }

    // Get user's services from database
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // Get user profile for freelancer information
    const userResult = await db.select().from(profiles).where(eq(profiles.user_id, userId)).execute();
    const userData = userResult[0];
    
    // Get freelance profile to access services_offered
    const freelanceResult = await db.select().from(freelance_profiles).where(eq(freelance_profiles.user_id, userId)).execute();
    const freelanceData = freelanceResult[0];
    
    // Parse services from services_offered field
    let servicesData = [];
    if (freelanceData && freelanceData.services_offered) {
      try {
        servicesData = JSON.parse(freelanceData.services_offered as string);
      } catch (e) {
        logger.error('Error parsing services_offered:', e);
        servicesData = [];
      }
    }
    
    // Apply pagination to services data
    const paginatedServices = servicesData.slice(offset, offset + parseInt(limit as string));
    
    const services = {
      data: paginatedServices.map((service: any, index: number) => ({
        id: service.id || `service_${index}`,
        freelancer: {
          id: userData.user_id,
          username: userData.username,
          displayName: userData.full_name || userData.username,
          avatar: userData.avatar_url
        },
        title: service.title || service.name || 'Unnamed Service',
        description: service.description || '',
        hourly_rate: service.hourly_rate || service.rate || 0,
        category: service.category || 'General',
        skills: service.skills || [],
        rating: service.rating || 0,
        completed_projects: service.completed_projects || 0,
        created_at: service.created_at || new Date().toISOString()
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: servicesData.length,
        totalPages: Math.ceil(servicesData.length / parseInt(limit as string))
      }
    };

    logger.info('User services fetched', { identifier, count: services.data.length });
    res.json(services);
  } catch (error) {
    logger.error('Error fetching user services:', error);
    res.status(500).json({ error: 'Failed to fetch user services' });
  }
});

// Search profiles
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 10, type = 'all' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Search profiles in database
    const searchResult = await db.select().from(profiles)
      .where(or(
        like(profiles.username, `%${q}%`),
        like(profiles.full_name, `%${q}%`),
        like(profiles.bio, `%${q}%`)
      ))
      .limit(parseInt(limit as string))
      .offset(offset)
      .execute();

    const profilesData = searchResult.map(profile => ({
      id: profile.user_id,
      username: profile.username,
      displayName: profile.full_name || profile.username,
      bio: profile.bio,
      avatar: profile.avatar_url,
      verified: profile.is_verified || false,
      stats: {
        followers_count: profile.followers_count || 0,
        following_count: profile.following_count || 0,
        posts_count: profile.posts_count || 0
      }
    }));

    const searchResults = {
      data: profilesData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: profilesData.length,
        totalPages: Math.ceil(profilesData.length / parseInt(limit as string))
      }
    };

    logger.info('Profiles searched', { query: q, count: searchResults.data.length });
    res.json(searchResults);
  } catch (error) {
    logger.error('Error searching profiles:', error);
    res.status(500).json({ error: 'Failed to search profiles' });
  }
});

export default router;
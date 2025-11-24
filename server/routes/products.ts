import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireTier2, triggerKYCIfNeeded } from '../middleware/tierAccessControl.js';
import { logger } from '../utils/logger.js';
import { db } from '../../server/enhanced-index.js';
import { profiles, products } from '../../shared/enhanced-schema.js';
import { eq, and, or, desc, asc, like, sql, count } from 'drizzle-orm';

const router = express.Router();

// Get all products (with filtering, pagination, search)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      subcategory,
      minPrice, 
      maxPrice, 
      condition, 
      search, 
      sort = 'recent',
      sellerId 
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build the query
    let productsQuery = db.select().from(products);
    let countQuery = db.select({ count: count() }).from(products);

    // Apply filters
    if (category && category !== 'all') {
      productsQuery = productsQuery.where(eq(products.category, category as string));
      countQuery = countQuery.where(eq(products.category, category as string));
    }

    if (subcategory && subcategory !== 'all') {
      productsQuery = productsQuery.where(eq(products.subcategory, subcategory as string));
      countQuery = countQuery.where(eq(products.subcategory, subcategory as string));
    }

    if (minPrice) {
      productsQuery = productsQuery.where(sql`${products.price} >= ${minPrice}`);
      countQuery = countQuery.where(sql`${products.price} >= ${minPrice}`);
    }

    if (maxPrice) {
      productsQuery = productsQuery.where(sql`${products.price} <= ${maxPrice}`);
      countQuery = countQuery.where(sql`${products.price} <= ${maxPrice}`);
    }

    if (condition && condition !== 'all') {
      productsQuery = productsQuery.where(eq(products.condition, condition as string));
      countQuery = countQuery.where(eq(products.condition, condition as string));
    }

    if (search) {
      productsQuery = productsQuery.where(or(
        like(products.title, `%${search}%`),
        like(products.description, `%${search}%`),
        like(products.tags, `%${search}%`)
      ));
      countQuery = countQuery.where(or(
        like(products.title, `%${search}%`),
        like(products.description, `%${search}%`),
        like(products.tags, `%${search}%`)
      ));
    }

    if (sellerId) {
      productsQuery = productsQuery.where(eq(products.seller_id, sellerId as string));
      countQuery = countQuery.where(eq(products.seller_id, sellerId as string));
    }

    // Apply sorting
    switch (sort) {
      case 'price_low':
        productsQuery = productsQuery.orderBy(asc(products.price));
        break;
      case 'price_high':
        productsQuery = productsQuery.orderBy(desc(products.price));
        break;
      case 'rating':
        productsQuery = productsQuery.orderBy(desc(products.rating));
        break;
      case 'popular':
        productsQuery = productsQuery.orderBy(desc(products.sales_count));
        break;
      case 'recent':
      default:
        productsQuery = productsQuery.orderBy(desc(products.created_at));
        break;
    }

    // Apply pagination
    productsQuery = productsQuery.limit(parseInt(limit as string)).offset(offset);

    // Execute queries
    const productsResult = await productsQuery.execute();
    const countResult = await countQuery.execute();
    const total = countResult[0]?.count || 0;

    // Get seller information for each product
    const sellerIds = [...new Set(productsResult.map(p => p.seller_id))];
    const sellersResult = await db.select().from(profiles).where(sql`${profiles.user_id} in ${sellerIds}`).execute();
    const sellersMap = sellersResult.reduce((acc, seller) => {
      acc[seller.user_id] = seller;
      return acc;
    }, {});

    const productsData = productsResult.map(product => ({
      id: product.id,
      seller: {
        id: product.seller_id,
        username: sellersMap[product.seller_id]?.username || 'Unknown',
        displayName: sellersMap[product.seller_id]?.full_name || sellersMap[product.seller_id]?.username || 'Unknown',
        avatar: sellersMap[product.seller_id]?.avatar_url || '/placeholder.svg',
        rating: sellersMap[product.seller_id]?.rating || 0,
        verified: sellersMap[product.seller_id]?.is_verified || false
      },
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      condition: product.condition,
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      images: product.images ? JSON.parse(product.images) : ['/placeholder.svg'],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      tags: product.tags ? JSON.parse(product.tags) : [],
      weight: product.weight,
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : {},
      shipping_info: product.shipping_info ? JSON.parse(product.shipping_info) : {},
      return_policy: product.return_policy,
      warranty: product.warranty,
      is_featured: product.is_featured,
      is_active: product.is_active,
      is_digital: product.is_digital,
      views_count: product.views_count,
      favorites_count: product.favorites_count,
      sales_count: product.sales_count,
      rating: product.rating,
      reviews_count: product.reviews_count,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));

    const result = {
      data: productsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      },
      filters: {
        categories: ['Electronics', 'Fashion', 'Home', 'Sports'],
        priceRange: { min: 0, max: 1000 },
        conditions: ['new', 'used', 'refurbished']
      }
    };

    logger.info('Products fetched', { 
      page, 
      limit, 
      category, 
      search, 
      count: productsData.length 
    });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get product from database
    const productResult = await db.select().from(products).where(eq(products.id, id)).execute();
    const productData = productResult[0];

    if (!productData) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get seller information
    const sellerResult = await db.select().from(profiles).where(eq(profiles.user_id, productData.seller_id)).execute();
    const sellerData = sellerResult[0];

    const product = {
      id: productData.id,
      seller: {
        id: productData.seller_id,
        username: sellerData?.username || 'Unknown',
        displayName: sellerData?.full_name || sellerData?.username || 'Unknown',
        avatar: sellerData?.avatar_url || '/placeholder.svg',
        rating: sellerData?.rating || 0,
        verified: sellerData?.is_verified || false,
        total_sales: sellerData?.total_sales || 0,
        member_since: sellerData?.created_at || new Date().toISOString()
      },
      title: productData.title,
      description: productData.description,
      price: productData.price,
      currency: productData.currency,
      category: productData.category,
      subcategory: productData.subcategory,
      brand: productData.brand,
      condition: productData.condition,
      sku: productData.sku,
      stock_quantity: productData.stock_quantity,
      images: productData.images ? JSON.parse(productData.images) : ['/placeholder.svg'],
      specifications: productData.specifications ? JSON.parse(productData.specifications) : {},
      tags: productData.tags ? JSON.parse(productData.tags) : [],
      weight: productData.weight,
      dimensions: productData.dimensions ? JSON.parse(productData.dimensions) : {},
      shipping_info: productData.shipping_info ? JSON.parse(productData.shipping_info) : {},
      return_policy: productData.return_policy,
      warranty: productData.warranty,
      is_featured: productData.is_featured,
      is_active: productData.is_active,
      is_digital: productData.is_digital,
      views_count: productData.views_count,
      favorites_count: productData.favorites_count,
      sales_count: productData.sales_count,
      rating: productData.rating,
      reviews_count: productData.reviews_count,
      created_at: productData.created_at,
      updated_at: productData.updated_at
    };

    logger.info('Product fetched', { productId: id });
    res.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
// Requires Tier 2 verification for selling
router.post('/', requireTier2(), triggerKYCIfNeeded('marketplace_sell'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      currency = 'USD',
      category,
      subcategory,
      brand,
      condition,
      sku,
      stock_quantity,
      images = [],
      specifications = {},
      tags = [],
      weight,
      dimensions = {},
      shipping_info = {},
      return_policy,
      warranty,
      is_featured = false,
      is_digital = false
    } = req.body;

    const userId = req.userId;

    // Create product in database
    const productData = {
      seller_id: userId,
      title,
      description,
      price,
      currency,
      category,
      subcategory,
      brand,
      condition,
      sku,
      stock_quantity,
      images: JSON.stringify(images),
      specifications: JSON.stringify(specifications),
      tags: JSON.stringify(tags),
      weight,
      dimensions: JSON.stringify(dimensions),
      shipping_info: JSON.stringify(shipping_info),
      return_policy,
      warranty,
      is_featured,
      is_digital,
      is_active: true,
      views_count: 0,
      favorites_count: 0,
      sales_count: 0,
      rating: 0,
      reviews_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.insert(products).values(productData).returning().execute();

    logger.info('Product created', { productId: result[0].id, userId });
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
// Requires Tier 2 verification
router.put('/:id', requireTier2(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId as string;

    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if product belongs to user
    const productResult = await db.select().from(products).where(and(eq(products.id, id), eq(products.seller_id, userId))).execute();
    
    if (productResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const {
      title,
      description,
      price,
      currency,
      category,
      subcategory,
      brand,
      condition,
      sku,
      stock_quantity,
      images,
      specifications,
      tags,
      weight,
      dimensions,
      shipping_info,
      return_policy,
      warranty,
      is_featured,
      is_active,
      is_digital
    } = req.body;

    // Update product in database
    const updateData = {
      title,
      description,
      price,
      currency,
      category,
      subcategory,
      brand,
      condition,
      sku,
      stock_quantity,
      ...(images && { images: JSON.stringify(images) }),
      ...(specifications && { specifications: JSON.stringify(specifications) }),
      ...(tags && { tags: JSON.stringify(tags) }),
      weight,
      ...(dimensions && { dimensions: JSON.stringify(dimensions) }),
      ...(shipping_info && { shipping_info: JSON.stringify(shipping_info) }),
      return_policy,
      warranty,
      is_featured,
      is_active,
      is_digital,
      updated_at: new Date()
    };

    const result = await db.update(products).set(updateData).where(eq(products.id, id)).returning().execute();

    logger.info('Product updated', { productId: id, userId });
    res.json(result[0]);
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId as string;

    // Type guard
    if (typeof userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if product belongs to user
    const productResult = await db.select().from(products).where(and(eq(products.id, id), eq(products.seller_id, userId))).execute();
    
    if (productResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    // Delete product from database
    await db.delete(products).where(eq(products.id, id)).execute();

    logger.info('Product deleted', { productId: id, userId });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get products by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get products from database
    const productsResult = await db.select().from(products)
      .where(eq(products.seller_id, sellerId))
      .orderBy(desc(products.created_at))
      .limit(parseInt(limit as string))
      .offset(offset)
      .execute();

    // Get seller information
    const sellerResult = await db.select().from(profiles).where(eq(profiles.user_id, sellerId)).execute();
    const sellerData = sellerResult[0];

    const productsData = productsResult.map(product => ({
      id: product.id,
      seller: {
        id: sellerId,
        username: sellerData?.username || 'Unknown',
        displayName: sellerData?.full_name || sellerData?.username || 'Unknown',
        avatar: sellerData?.avatar_url || '/placeholder.svg',
        rating: sellerData?.rating || 0,
        verified: sellerData?.is_verified || false
      },
      title: product.title,
      price: product.price,
      currency: product.currency,
      category: product.category,
      images: product.images ? JSON.parse(product.images) : ['/placeholder.svg'],
      rating: product.rating,
      sales_count: product.sales_count,
      created_at: product.created_at
    }));

    const countResult = await db.select({ count: count() }).from(products).where(eq(products.seller_id, sellerId)).execute();
    const total = countResult[0]?.count || 0;

    const result = {
      data: productsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    };

    logger.info('Seller products fetched', { sellerId, count: productsData.length });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
});

export default router;

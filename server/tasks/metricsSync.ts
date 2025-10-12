import { eq } from 'drizzle-orm';
import { content_analytics, posts, products } from '../../shared/enhanced-schema.js';

export default function startMetricsSync(db: any, intervalMs = 5 * 60 * 1000) {
  const aggregate = async () => {
    try {
      console.log('metricsSync: aggregating content metrics...');

      // Aggregate posts
      try {
        const postRows: any[] = await db.select().from(posts).orderBy(posts.created_at).execute();
        for (const p of postRows) {
          const title = (p.content || '').slice(0, 120) || `Post ${p.id}`;
          const analytics = { likes: p.likes_count || 0, comments: p.comments_count || 0, shares: p.shares_count || 0 };
          const engagement = p.views_count ? (( (p.likes_count||0) + (p.comments_count||0) + (p.shares_count||0)) / Math.max(1, p.views_count) * 100).toFixed(1) : '0';
          const row = {
            id: undefined,
            source_type: 'post',
            source_id: p.id,
            title,
            type: 'Post',
            platform: 'Feed & Social',
            publish_date: p.created_at || new Date().toISOString(),
            views: p.views_count || 0,
            engagement: `${engagement}%`,
            revenue: 0,
            analytics: JSON.stringify(analytics),
            thumbnail: ''
          };

          // delete + insert (simple upsert)
          await db.delete(content_analytics).where(eq(content_analytics.source_type, 'post'), eq(content_analytics.source_id, p.id)).execute();
          await db.insert(content_analytics).values(row).execute();
        }
      } catch (e) {
        console.warn('metricsSync: failed to aggregate posts', e.message || e);
      }

      // Aggregate products
      try {
        const prodRows: any[] = await db.select().from(products).orderBy(products.created_at).execute();
        for (const pr of prodRows) {
          const title = pr.title || `Product ${pr.id}`;
          const analytics = { sales_count: pr.sales_count || 0, favorites: pr.favorites_count || 0 };
          const revenue = (pr.total_sales || 0) * (parseFloat(String(pr.price || 0)) || 0);
          const row = {
            id: undefined,
            source_type: 'product',
            source_id: pr.id,
            title,
            type: 'Product',
            platform: 'Marketplace',
            publish_date: pr.created_at || new Date().toISOString(),
            views: pr.views_count || 0,
            engagement: `${analytics.favorites || 0}`,
            revenue: revenue || 0,
            analytics: JSON.stringify(analytics),
            thumbnail: ''
          };
          await db.delete(content_analytics).where(eq(content_analytics.source_type, 'product'), eq(content_analytics.source_id, pr.id)).execute();
          await db.insert(content_analytics).values(row).execute();
        }
      } catch (e) {
        console.warn('metricsSync: failed to aggregate products', e.message || e);
      }

      console.log('metricsSync: aggregation complete');
    } catch (e) {
      console.error('metricsSync: unexpected error', e);
    }
  };

  // Run once immediately
  aggregate().catch((e) => console.error('metricsSync initial run failed', e));

  // Schedule recurring
  const id = setInterval(() => aggregate().catch(e => console.error('metricsSync error', e)), intervalMs);

  return () => clearInterval(id);
}

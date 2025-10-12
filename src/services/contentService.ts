import { supabase } from '@/integrations/supabase/client';

export type FetchContentParams = {
  types?: string[];
  range?: string; // '7d' | '30d' | '90d' | '1y' | 'all'
  sort?: string; // 'recent' | 'views' | 'engagement' | 'revenue'
  search?: string;
  page?: number;
  pageSize?: number;
  cursor?: string | null; // ISO date string for cursor-based pagination
};

// Helper to map range to cutoff date
const rangeToDate = (range?: string) => {
  if (!range || range === 'all') return null;
  const now = new Date();
  const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const days = map[range];
  if (!days) return null;
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

export const fetchContentPageSupabase = async (params: FetchContentParams) => {
  const {
    types = [],
    range = '30d',
    sort = 'recent',
    search = '',
    page = 1,
    pageSize = 10,
    cursor = null
  } = params || {};

  // Prefer simple offset pagination when no cursor supplied to allow total count
  try {
    const cutoff = rangeToDate(range);

    const query = supabase.from('content_analytics').select('*', { count: 'exact' });

    if (types && types.length > 0) {
      // supabase 'in' expects array of strings
      query.in('type', types.map(t => t));
    }

    if (search && search.trim()) {
      // ILIKE for case-insensitive search
      query.or(`title.ilike.%${search}% , description.ilike.%${search}%`);
    }

    if (cutoff) {
      // publish_date column could be named publish_date or publishDate; try publish_date first
      query.gte('publish_date', cutoff);
    }

    // Sorting
    switch (sort) {
      case 'views':
        query.order('views', { ascending: false });
        break;
      case 'engagement':
        query.order('engagement', { ascending: false });
        break;
      case 'revenue':
        query.order('revenue', { ascending: false });
        break;
      default:
        // recent
        // try publish_date then created_at
        query.order('publish_date', { ascending: false });
        break;
    }

    // Cursor-based (if provided) use publish_date < cursor ordering descending
    if (cursor) {
      // descending order, so use lt
      query.lt('publish_date', cursor);
      query.limit(pageSize);
      const { data, error } = await query;
      if (error) throw error;
      const nextCursor = data && data.length > 0 ? data[data.length - 1].publish_date || null : null;
      return { data: data || [], total: -1, nextCursor };
    }

    // Offset pagination via range
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const { data, error, count } = await query.range(start, end);
    if (error) throw error;
    return { data: data || [], total: count ?? -1, nextCursor: null };
  } catch (err) {
    console.error('fetchContentPageSupabase error', err);
    throw err;
  }
};

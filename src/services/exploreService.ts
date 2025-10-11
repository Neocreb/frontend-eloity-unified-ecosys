import { supabase } from "@/integrations/supabase/client";

export interface TrendingHashtag {
  id: string;
  name: string;
  usage_count: number;
  trending_score: number;
}

export interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  is_verified: boolean;
  followers_count: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  member_count: number;
  avatar_url: string | null;
  cover_url: string | null;
  privacy: string;
}

export interface Page {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  follower_count: number;
  avatar_url: string | null;
  cover_url: string | null;
  is_verified: boolean;
}

export const exploreService = {
  async getTrendingHashtags(limit: number = 10): Promise<TrendingHashtag[]> {
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getSuggestedUsers(limit: number = 5): Promise<SuggestedUser[]> {
    const userRes = await supabase.auth.getUser();
    const user = userRes?.data?.user ?? null;

    // Get users the current user is not following
    let query = supabase
      .from('profiles')
      .select('*')
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (user) {
      // Exclude users already followed
      const followersRes = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);
      const following = followersRes?.data ?? null;

      if (following && following.length > 0) {
        const followingIds = (following.map((f: any) => f.following_id) as string[]).filter(Boolean);
        // PostgREST expects a parenthesized list; string/UUID values must be quoted
        const formatted = followingIds.map((id) => `'${id}'`).join(',');
        query = query.not('user_id', 'in', `(${formatted})`);
      }

      // Exclude current user
      query = query.neq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((profile: any) => ({
      id: profile.user_id,
      username: profile.username || 'unknown',
      full_name: profile.full_name || 'Unknown User',
      avatar_url: profile.avatar_url || '',
      bio: profile.bio || '',
      is_verified: profile.is_verified || false,
      followers_count: 0
    }));
  },

  async getSuggestedGroups(limit: number = 5): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('privacy', 'public')
      .order('member_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getSuggestedPages(limit: number = 5): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('privacy', 'public')
      .order('follower_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async searchExplore(query: string): Promise<{
    hashtags: TrendingHashtag[];
    users: SuggestedUser[];
    groups: Group[];
    pages: Page[];
  }> {
    const searchTerm = `%${query}%`;

    const [hashtagsResult, usersResult, groupsResult, pagesResult] = await Promise.all([
      supabase
        .from('hashtags')
        .select('*')
        .ilike('name', searchTerm)
        .limit(5),
      
      supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(5),
      
      supabase
        .from('groups')
        .select('*')
        .eq('privacy', 'public')
        .ilike('name', searchTerm)
        .limit(5),
      
      supabase
        .from('pages')
        .select('*')
        .eq('privacy', 'public')
        .ilike('name', searchTerm)
        .limit(5)
    ]);

    return {
      hashtags: hashtagsResult.data || [],
      users: (usersResult.data || []).map(profile => ({
        id: profile.user_id,
        username: profile.username || 'unknown',
        full_name: profile.full_name || 'Unknown User',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        is_verified: profile.is_verified || false,
        followers_count: 0
      })),
      groups: groupsResult.data || [],
      pages: pagesResult.data || []
    };
  }
};

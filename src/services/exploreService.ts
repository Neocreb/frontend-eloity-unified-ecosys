import { supabase } from "@/integrations/supabase/client";

export interface TrendingTopic {
  id: string;
  tag: string;
  usage_count: number;
  trending_score: number;
  category: string;
  language: string;
  last_used: string;
  created_at: string;
}

export interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  followers_count: number;
  bio: string;
  location: string;
  is_online: boolean;
  last_active: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  cover: string;
  privacy: string;
  member_count: number;
  post_count: number;
  category: string;
  location: string;
  website: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  name: string;
  username: string;
  description: string;
  avatar: string;
  cover: string;
  category: string;
  sub_category: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  follower_count: number;
  post_count: number;
  rating: number;
  review_count: number;
  verified: boolean;
  claimed: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

class ExploreService {
  // Get trending topics from hashtags table
  async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending topics:', error);
        return [];
      }

      return data as TrendingTopic[];
    } catch (error) {
      console.error('Error in getTrendingTopics:', error);
      return [];
    }
  }

  // Get suggested users
  async getSuggestedUsers(limit: number = 10): Promise<SuggestedUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          is_verified,
          followers_count,
          bio,
          location,
          is_online,
          last_active
        `)
        .order('followers_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching suggested users:', error);
        return [];
      }

      return data as SuggestedUser[];
    } catch (error) {
      console.error('Error in getSuggestedUsers:', error);
      return [];
    }
  }

  // Get groups
  async getGroups(limit: number = 10): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('member_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching groups:', error);
        return [];
      }

      return data as Group[];
    } catch (error) {
      console.error('Error in getGroups:', error);
      return [];
    }
  }

  // Get pages
  async getPages(limit: number = 10): Promise<Page[]> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('follower_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching pages:', error);
        return [];
      }

      return data as Page[];
    } catch (error) {
      console.error('Error in getPages:', error);
      return [];
    }
  }

  // Search all explore content
  async searchExploreContent(query: string, limit: number = 10): Promise<{
    topics: TrendingTopic[];
    users: SuggestedUser[];
    groups: Group[];
    pages: Page[];
  }> {
    try {
      // Search hashtags
      const { data: topics, error: topicsError } = await supabase
        .from('hashtags')
        .select('*')
        .ilike('tag', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(limit);

      // Search users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          is_verified,
          followers_count,
          bio,
          location,
          is_online,
          last_active
        `)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('followers_count', { ascending: false })
        .limit(limit);

      // Search groups
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('member_count', { ascending: false })
        .limit(limit);

      // Search pages
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('follower_count', { ascending: false })
        .limit(limit);

      return {
        topics: topicsError ? [] : (topics as TrendingTopic[]),
        users: usersError ? [] : (users as SuggestedUser[]),
        groups: groupsError ? [] : (groups as Group[]),
        pages: pagesError ? [] : (pages as Page[])
      };
    } catch (error) {
      console.error('Error in searchExploreContent:', error);
      return {
        topics: [],
        users: [],
        groups: [],
        pages: []
      };
    }
  }
}

export const exploreService = new ExploreService();
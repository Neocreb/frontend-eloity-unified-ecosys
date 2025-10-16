import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface Page {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  follower_count: number;
  is_verified: boolean;
  privacy: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface PageFollower {
  id: string;
  page_id: string;
  user_id: string;
  created_at: string;
}

export interface CreatePageData {
  name: string;
  description?: string;
  category?: string;
  avatar_url?: string;
  cover_url?: string;
  privacy?: 'public' | 'private';
}

export interface UpdatePageData {
  name?: string;
  description?: string;
  category?: string;
  avatar_url?: string;
  cover_url?: string;
  privacy?: 'public' | 'private';
}

class PagesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Get all public pages with optional search
  async getPages(search?: string, category?: string): Promise<Page[]> {
    try {
      let query = this.supabase
        .from('pages')
        .select('*')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  // Get a specific page by ID
  async getPageById(pageId: string): Promise<Page | null> {
    try {
      const { data, error } = await this.supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching page:', error);
      throw error;
    }
  }

  // Get pages created by a specific user
  async getUserPages(userId: string): Promise<Page[]> {
    try {
      const { data, error } = await this.supabase
        .from('pages')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user pages:', error);
      throw error;
    }
  }

  // Create a new page
  async createPage(pageData: CreatePageData, userId: string): Promise<Page> {
    try {
      const newPage = {
        ...pageData,
        creator_id: userId,
        follower_count: 0,
        is_verified: false,
      };

      const { data, error } = await this.supabase
        .from('pages')
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  // Update a page
  async updatePage(pageId: string, pageData: UpdatePageData, userId: string): Promise<Page> {
    try {
      // Check if user is the creator
      const page = await this.getPageById(pageId);
      if (!page || page.creator_id !== userId) {
        throw new Error('Unauthorized: Only page creators can update pages');
      }

      const { data, error } = await this.supabase
        .from('pages')
        .update(pageData)
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  // Delete a page
  async deletePage(pageId: string, userId: string): Promise<void> {
    try {
      // Check if user is the creator
      const page = await this.getPageById(pageId);
      if (!page || page.creator_id !== userId) {
        throw new Error('Unauthorized: Only page creators can delete pages');
      }

      const { error } = await this.supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  // Follow a page
  async followPage(pageId: string, userId: string): Promise<PageFollower> {
    try {
      // Check if already following
      const isFollowing = await this.isFollowingPage(pageId, userId);
      if (isFollowing) {
        throw new Error('Already following this page');
      }

      // Insert follower record
      const { data: followerData, error: followerError } = await this.supabase
        .from('page_followers')
        .insert({
          page_id: pageId,
          user_id: userId,
        })
        .select()
        .single();

      if (followerError) throw followerError;

      // Update follower count
      const { error: updateError } = await this.supabase
        .from('pages')
        .update({ follower_count: this.supabase.rpc('increment_page_followers', { page_id: pageId }) })
        .eq('id', pageId);

      if (updateError) throw updateError;

      return followerData;
    } catch (error) {
      console.error('Error following page:', error);
      throw error;
    }
  }

  // Unfollow a page
  async unfollowPage(pageId: string, userId: string): Promise<void> {
    try {
      // Check if following
      const isFollowing = await this.isFollowingPage(pageId, userId);
      if (!isFollowing) {
        throw new Error('Not following this page');
      }

      // Delete follower record
      const { error: deleteError } = await this.supabase
        .from('page_followers')
        .delete()
        .eq('page_id', pageId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Update follower count
      const { error: updateError } = await this.supabase
        .from('pages')
        .update({ follower_count: this.supabase.rpc('decrement_page_followers', { page_id: pageId }) })
        .eq('id', pageId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error unfollowing page:', error);
      throw error;
    }
  }

  // Check if user is following a page
  async isFollowingPage(pageId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('page_followers')
        .select('id')
        .eq('page_id', pageId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking page follow status:', error);
      throw error;
    }
  }

  // Get page followers
  async getPageFollowers(pageId: string): Promise<PageFollower[]> {
    try {
      const { data, error } = await this.supabase
        .from('page_followers')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching page followers:', error);
      throw error;
    }
  }

  // Get pages followed by user
  async getUserFollowedPages(userId: string): Promise<Page[]> {
    try {
      const { data, error } = await this.supabase
        .from('pages')
        .select('pages.*')
        .join('page_followers', 'pages.id', 'page_followers.page_id')
        .eq('page_followers.user_id', userId)
        .order('page_followers.created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user followed pages:', error);
      throw error;
    }
  }
}

export const pagesService = new PagesService();
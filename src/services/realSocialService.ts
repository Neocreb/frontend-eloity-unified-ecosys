import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'text';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  location?: string;
  softpoints: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  isLiked: boolean;
  parentId?: string;
  replies?: Comment[];
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: number;
  location?: string;
  website?: string;
  joinedDate: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

class RealSocialService {
  // Posts
  async getFeed(userId?: string, filters?: { 
    type?: 'all' | 'following' | 'trending';
    limit?: number;
    offset?: number;
  }): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified,
          follower_count
        ),
        likes:post_likes(count),
        comments:post_comments(count),
        user_like:post_likes!inner(user_id)
      `)
      .eq('visibility', 'public');

    if (userId && filters?.type === 'following') {
      // Get posts from followed users
      const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      const followingIds = following?.map(f => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in('user_id', followingIds);
      }
    }

    if (filters?.type === 'trending') {
      query = query.order('likes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query
      .limit(filters?.limit || 20)
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 20) - 1);

    if (error) throw error;

    return data?.map(post => this.mapDatabaseToPost(post, userId)) || [];
  }

  async getPost(id: string, userId?: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified,
          follower_count
        ),
        likes:post_likes(count),
        comments:post_comments(count),
        user_like:post_likes!left(user_id)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapDatabaseToPost(data, userId);
  }

  async createPost(post: {
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: 'image' | 'video' | 'text';
    visibility?: 'public' | 'friends' | 'private';
    tags?: string[];
    location?: string;
  }): Promise<Post> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const postData = {
      user_id: userId,
      content: post.content,
      image_url: post.imageUrl,
      video_url: post.videoUrl,
      media_type: post.mediaType || 'text',
      visibility: post.visibility || 'public',
      tags: post.tags || [],
      location: post.location,
      likes: 0,
      comments: 0,
      shares: 0,
      softpoints: 0
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified,
          follower_count
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToPost(data, userId);
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const updateData: any = {};
    
    if (updates.content) updateData.content = updates.content;
    if (updates.imageUrl) updateData.image_url = updates.imageUrl;
    if (updates.videoUrl) updateData.video_url = updates.videoUrl;
    if (updates.mediaType) updateData.media_type = updates.mediaType;
    if (updates.visibility) updateData.visibility = updates.visibility;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.location) updateData.location = updates.location;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified,
          follower_count
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToPost(data);
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Likes
  async likePost(postId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });

    if (!error) {
      // Increment likes count
      await supabase.rpc('increment_post_likes', { post_id: postId });
    }
  }

  async unlikePost(postId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (!error) {
      // Decrement likes count
      await supabase.rpc('decrement_post_likes', { post_id: postId });
    }
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        ),
        likes:comment_likes(count)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const comments = data?.map(this.mapDatabaseToComment) || [];

    // Get replies for each comment
    for (const comment of comments) {
      const { data: replies } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles!user_id (
            id,
            full_name,
            username,
            avatar_url,
            verified
          ),
          likes:comment_likes(count)
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      comment.replies = replies?.map(this.mapDatabaseToComment) || [];
    }

    return comments;
  }

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const commentData = {
      post_id: postId,
      user_id: userId,
      content,
      parent_id: parentId,
      likes: 0
    };

    const { data, error } = await supabase
      .from('post_comments')
      .insert(commentData)
      .select(`
        *,
        author:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          verified
        )
      `)
      .single();

    if (error) throw error;

    // Increment comments count on post
    await supabase.rpc('increment_post_comments', { post_id: postId });

    return this.mapDatabaseToComment(data);
  }

  // Follows
  async followUser(targetUserId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('followers')
      .insert({ 
        follower_id: userId, 
        following_id: targetUserId 
      });

    if (!error) {
      // Update follower counts
      await Promise.all([
        supabase.rpc('increment_follower_count', { user_id: targetUserId }),
        supabase.rpc('increment_following_count', { user_id: userId })
      ]);
    }
  }

  async unfollowUser(targetUserId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', targetUserId);

    if (!error) {
      // Update follower counts
      await Promise.all([
        supabase.rpc('decrement_follower_count', { user_id: targetUserId }),
        supabase.rpc('decrement_following_count', { user_id: userId })
      ]);
    }
  }

  // User profiles
  async getUserProfile(userId: string, currentUserId?: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        followers:followers!following_id(count),
        following:followers!follower_id(count),
        posts:posts(count)
      `)
      .eq('id', userId)
      .single();

    if (error) return null;

    let isFollowing = false;
    let isFollowedBy = false;

    if (currentUserId && currentUserId !== userId) {
      const { data: followData } = await supabase
        .from('followers')
        .select('*')
        .or(`and(follower_id.eq.${currentUserId},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${currentUserId})`);

      isFollowing = followData?.some(f => f.follower_id === currentUserId && f.following_id === userId) || false;
      isFollowedBy = followData?.some(f => f.follower_id === userId && f.following_id === currentUserId) || false;
    }

    return {
      id: data.id,
      name: data.full_name || data.username || 'Unknown',
      username: data.username || data.id,
      bio: data.bio || '',
      avatar: data.avatar_url || '',
      coverImage: data.cover_image_url,
      verified: data.verified || false,
      followers: data.followers?.[0]?.count || 0,
      following: data.following?.[0]?.count || 0,
      posts: data.posts?.[0]?.count || 0,
      location: data.location,
      website: data.website,
      joinedDate: data.created_at,
      isFollowing,
      isFollowedBy
    };
  }

  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        followers:followers!following_id(count),
        following:followers!follower_id(count),
        posts:posts(count)
      `)
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return data?.map(user => ({
      id: user.id,
      name: user.full_name || user.username || 'Unknown',
      username: user.username || user.id,
      bio: user.bio || '',
      avatar: user.avatar_url || '',
      coverImage: user.cover_image_url,
      verified: user.verified || false,
      followers: user.followers?.[0]?.count || 0,
      following: user.following?.[0]?.count || 0,
      posts: user.posts?.[0]?.count || 0,
      location: user.location,
      website: user.website,
      joinedDate: user.created_at,
      isFollowing: false,
      isFollowedBy: false
    })) || [];
  }

  // Helper mapping functions
  private mapDatabaseToPost(data: any, userId?: string): Post {
    return {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      imageUrl: data.image_url,
      videoUrl: data.video_url,
      mediaType: data.media_type || 'text',
      likes: data.likes || 0,
      comments: data.comments || 0,
      shares: data.shares || 0,
      isLiked: data.user_like?.some((like: any) => like.user_id === userId) || false,
      isBookmarked: false, // TODO: Implement bookmarks
      isPinned: data.is_pinned || false,
      visibility: data.visibility || 'public',
      tags: data.tags || [],
      location: data.location,
      softpoints: data.softpoints || 0,
      author: {
        id: data.author.id,
        name: data.author.full_name || data.author.username || 'Unknown',
        username: data.author.username || data.author.id,
        avatar: data.author.avatar_url || '',
        verified: data.author.verified || false,
        followers: data.author.follower_count || 0
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDatabaseToComment(data: any): Comment {
    return {
      id: data.id,
      postId: data.post_id,
      userId: data.user_id,
      content: data.content,
      likes: data.likes || 0,
      isLiked: false, // TODO: Implement comment likes for current user
      parentId: data.parent_id,
      author: {
        id: data.author.id,
        name: data.author.full_name || data.author.username || 'Unknown',
        username: data.author.username || data.author.id,
        avatar: data.author.avatar_url || '',
        verified: data.author.verified || false
      },
      createdAt: data.created_at,
      replies: []
    };
  }
}

export const realSocialService = new RealSocialService();
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define types based on the database schema
type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
type SocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];

export interface GroupWithDetails extends Group {
  members: GroupMember[];
  posts: SocialPost[];
  events: Event[];
}

export interface GroupPost extends SocialPost {
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
}

export interface GroupMemberWithProfile {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
}

export interface GroupEvent extends Event {
  creator: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  attendee_count: number;
  is_attending?: boolean;
}

class GroupService {
  // Get group by ID with all details
  static async getGroupById(groupId: string, userId?: string): Promise<GroupWithDetails | null> {
    try {
      const { data: group, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (error) {
        console.error("Error fetching group:", error);
        return null;
      }

      // Fetch members
      const members = await this.getGroupMembers(groupId);
      
      // Fetch posts
      const posts = await this.getGroupPosts(groupId, userId);
      
      // Fetch events
      const events = await this.getGroupEvents(groupId, userId);

      return {
        ...group,
        members,
        posts,
        events
      };
    } catch (error) {
      console.error("Error in getGroupById:", error);
      return null;
    }
  }

  // Get group members
  static async getGroupMembers(groupId: string, limit: number = 20): Promise<GroupMemberWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          id,
          user_id,
          role,
          joined_at,
          users (
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq("group_id", groupId)
        .limit(limit);

      if (error) {
        console.error("Error fetching group members:", error);
        return [];
      }

      return data.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        user: {
          id: member.users?.id || "",
          username: member.users?.username || "",
          full_name: member.users?.full_name || "",
          avatar_url: member.users?.avatar_url || "",
          is_verified: member.users?.is_verified || false
        }
      }));
    } catch (error) {
      console.error("Error in getGroupMembers:", error);
      return [];
    }
  }

  // Get group posts
  static async getGroupPosts(groupId: string, userId?: string, limit: number = 20): Promise<GroupPost[]> {
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select(`
          id,
          user_id,
          content,
          type,
          media_urls,
          like_count,
          comment_count,
          created_at,
          updated_at,
          users (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching group posts:", error);
        return [];
      }

      // Check if user has liked each post
      const postIds = data.map(post => post.id);
      let likedPostIds: string[] = [];
      
      if (userId && postIds.length > 0) {
        const { data: likes, error: likesError } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds);

        if (!likesError) {
          likedPostIds = likes.map(like => like.post_id);
        }
      }

      return data.map(post => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content || "",
        type: post.type,
        media_urls: post.media_urls as string[] || [],
        like_count: post.like_count,
        comment_count: post.comment_count,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.users?.id || "",
          username: post.users?.username || "",
          full_name: post.users?.full_name || "",
          avatar_url: post.users?.avatar_url || ""
        },
        is_liked: likedPostIds.includes(post.id)
      }));
    } catch (error) {
      console.error("Error in getGroupPosts:", error);
      return [];
    }
  }

  // Get group events
  static async getGroupEvents(groupId: string, userId?: string, limit: number = 10): Promise<GroupEvent[]> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          attendee_count,
          creator_id,
          created_at,
          updated_at,
          users (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching group events:", error);
        return [];
      }

      // Check if user is attending each event
      const eventIds = data.map(event => event.id);
      let attendingEventIds: string[] = [];
      
      if (userId && eventIds.length > 0) {
        const { data: rsvps, error: rsvpsError } = await supabase
          .from("event_rsvps")
          .select("event_id")
          .eq("user_id", userId)
          .eq("status", "attending")
          .in("event_id", eventIds);

        if (!rsvpsError) {
          attendingEventIds = rsvps.map(rsvp => rsvp.event_id);
        }
      }

      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        attendee_count: event.attendee_count,
        creator_id: event.creator_id,
        created_at: event.created_at,
        updated_at: event.updated_at,
        creator: {
          id: event.users?.id || "",
          username: event.users?.username || "",
          full_name: event.users?.full_name || "",
          avatar_url: event.users?.avatar_url || ""
        },
        is_attending: attendingEventIds.includes(event.id)
      }));
    } catch (error) {
      console.error("Error in getGroupEvents:", error);
      return [];
    }
  }

  // Join a group
  static async joinGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: userId,
          role: "member",
          joined_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error joining group:", error);
        return false;
      }

      // Update member count
      await supabase
        .from("groups")
        .update({ member_count: supabase.rpc('groups.member_count + 1') })
        .eq("id", groupId);

      return true;
    } catch (error) {
      console.error("Error in joinGroup:", error);
      return false;
    }
  }

  // Leave a group
  static async leaveGroup(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error leaving group:", error);
        return false;
      }

      // Update member count
      await supabase
        .from("groups")
        .update({ member_count: supabase.rpc('groups.member_count - 1') })
        .eq("id", groupId);

      return true;
    } catch (error) {
      console.error("Error in leaveGroup:", error);
      return false;
    }
  }

  // Check if user is a member of the group
  static async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking group membership:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isGroupMember:", error);
      return false;
    }
  }

  // Create a group post
  static async createGroupPost(groupId: string, userId: string, content: string, mediaUrls?: string[]): Promise<GroupPost | null> {
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .insert({
          group_id: groupId,
          user_id: userId,
          content: content,
          media_urls: mediaUrls || [],
          type: "text",
          visibility: "public",
          like_count: 0,
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          id,
          user_id,
          content,
          type,
          media_urls,
          like_count,
          comment_count,
          created_at,
          updated_at,
          users (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error("Error creating group post:", error);
        return null;
      }

      // Update post count for the group
      await supabase
        .from("groups")
        .update({ post_count: supabase.rpc('groups.post_count + 1') })
        .eq("id", groupId);

      return {
        id: data.id,
        user_id: data.user_id,
        content: data.content || "",
        type: data.type,
        media_urls: data.media_urls as string[] || [],
        like_count: data.like_count,
        comment_count: data.comment_count,
        created_at: data.created_at,
        updated_at: data.updated_at,
        author: {
          id: data.users?.id || "",
          username: data.users?.username || "",
          full_name: data.users?.full_name || "",
          avatar_url: data.users?.avatar_url || ""
        }
      };
    } catch (error) {
      console.error("Error in createGroupPost:", error);
      return null;
    }
  }

  // Like a group post
  static async likeGroupPost(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking post like:", checkError);
        return false;
      }

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) {
          console.error("Error unliking post:", deleteError);
          return false;
        }

        // Decrement like count
        await supabase
          .from("social_posts")
          .update({ like_count: supabase.rpc('social_posts.like_count - 1') })
          .eq("id", postId);

        return false; // Indicates unliked
      } else {
        // Like
        const { error: insertError } = await supabase
          .from("post_likes")
          .insert({
            post_id: postId,
            user_id: userId,
            reaction_type: "like",
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error liking post:", insertError);
          return false;
        }

        // Increment like count
        await supabase
          .from("social_posts")
          .update({ like_count: supabase.rpc('social_posts.like_count + 1') })
          .eq("id", postId);

        return true; // Indicates liked
      }
    } catch (error) {
      console.error("Error in likeGroupPost:", error);
      return false;
    }
  }
}

export default GroupService;
export type FeedItemType =
  | "post"
  | "product"
  | "job"
  | "freelancer_skill"
  | "community_event"
  | "trending_topic"
  | "recommended_user"
  | "sponsored_post"
  | "ad"
  | "story_recap"
  | "live_event"
  | "meme"
  | "gif";

export interface UnifiedFeedItem {
  id: string;
  type: FeedItemType;
  timestamp: Date;
  priority: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    badges: string[];
  };
  content: {
    text?: string;
    media?: Array<{
      type: "image" | "video" | "gif";
      url: string;
      thumbnail?: string;
      alt?: string;
    }>;
    location?: string;
    feeling?: string;
    link?: {
      url: string;
      title?: string;
      description?: string;
      image?: string;
    };
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    likedByUser?: boolean;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  replies_count?: number;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

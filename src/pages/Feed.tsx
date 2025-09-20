import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/feed/PostCard";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import EnhancedCreatePostCard from "@/components/feed/EnhancedCreatePostCard";
import FeedSidebar from "@/components/feed/FeedSidebar";
import { FeedNativeAdCard } from "@/components/ads/FeedNativeAdCard";
import { SponsoredPostCard } from "@/components/ads/SponsoredPostCard";
import { adSettings } from "../../config/adSettings";
import { useFeed } from "@/hooks/use-feed";
import FeedSkeleton from "@/components/feed/FeedSkeleton";

// Define the Post type to match what PostCard expects
export type Post = {
  id: string;
  content: string;
  timestamp?: string; // Optional for backward compatibility
  createdAt: string; // Added required field
  likes: number;
  comments: number;
  shares: number;
  author: {
    name: string;
    username: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  image?: string; // Optional field for posts with images
  liked?: boolean; // Optional field to track if post is liked by current user
};

// Convert Supabase post format to legacy Post format for compatibility
const convertToLegacyPost = (supabasePost: any): Post => ({
  id: supabasePost.id,
  content: supabasePost.content,
  timestamp: supabasePost.createdAt,
  createdAt: supabasePost.createdAt,
  likes: supabasePost.likes,
  comments: supabasePost.comments,
  shares: supabasePost.shares,
  author: {
    name: supabasePost.author.name,
    username: supabasePost.author.username,
    handle: `@${supabasePost.author.username}`,
    avatar: supabasePost.author.avatar,
    verified: supabasePost.author.verified,
  },
  image: supabasePost.image,
  liked: false, // Default value
});

const Feed = () => {
  const [feedWithAds, setFeedWithAds] = useState<(Post | { id: string; type: 'native_ad' | 'sponsored_post' })[]>([]);
  
  // Use real feed data from Supabase
  const { posts: supabasePosts, isLoading, hasMore, loadMorePosts, handleCreatePost } = useFeed();

  // Create feed with ads using real posts from Supabase
  useEffect(() => {
    if (supabasePosts.length === 0) return;
    
    const createFeedWithAds = () => {
      const feedItems = [];
      let nativeAdCounter = 0;
      let sponsoredAdCounter = 0;
      
      // Convert Supabase posts to legacy format
      const legacyPosts = supabasePosts.map(convertToLegacyPost);

      for (let i = 0; i < legacyPosts.length; i++) {
        feedItems.push(legacyPosts[i]);

        // Insert native ad every 6th post
        if ((i + 1) % adSettings.feedAdFrequency === 0 && adSettings.enableAds) {
          nativeAdCounter++;
          feedItems.push({
            id: `native-ad-${nativeAdCounter}`,
            type: 'native_ad' as const
          });
        }

        // Insert sponsored post every 8th post
        if ((i + 1) % adSettings.feedSponsoredFrequency === 0 && adSettings.enableAds) {
          sponsoredAdCounter++;
          feedItems.push({
            id: `sponsored-post-${sponsoredAdCounter}`,
            type: 'sponsored_post' as const
          });
        }
      }

      return feedItems;
    };

    setFeedWithAds(createFeedWithAds());
  }, [supabasePosts]);

  const renderFeedItem = (item: Post | { id: string; type: 'native_ad' | 'sponsored_post' }, isEnhanced = false) => {
    if ('type' in item) {
      if (item.type === 'native_ad') {
        return (
          <FeedNativeAdCard
            key={item.id}
            onClick={() => {
              console.log('Native ad clicked');
              // Handle ad click
            }}
          />
        );
      } else if (item.type === 'sponsored_post') {
        return (
          <SponsoredPostCard
            key={item.id}
            title="Discover Eloity Premium"
            content="Unlock exclusive features, priority support, and enhanced creator tools. Join thousands of creators already earning more with Eloity Premium!"
            ctaText="Upgrade Now"
            onClick={() => {
              console.log('Sponsored post clicked');
              // Handle sponsored post click
            }}
          />
        );
      }
    }

    // Regular post
    const post = item as Post;
    return isEnhanced ? (
      <EnhancedPostCard key={post.id} post={post} />
    ) : (
      <PostCard key={post.id} post={post} />
    );
  };

  // Show loading skeleton while fetching real data
  if (isLoading && supabasePosts.length === 0) {
    return (
      <div className="max-w-none xl:max-w-7xl 2xl:max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 hidden md:block">
            <FeedSidebar />
          </div>
          <div className="col-span-1 md:col-span-3">
            <div className="space-y-4">
              <EnhancedCreatePostCard />
              <FeedSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-none xl:max-w-7xl 2xl:max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 hidden md:block">
          <FeedSidebar />
        </div>
        <div className="col-span-1 md:col-span-3">
          <Tabs defaultValue="following" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            <TabsContent value="following" className="space-y-4 mt-4">
              <EnhancedCreatePostCard />
              {feedWithAds.map((item) => renderFeedItem(item, false))}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button 
                    onClick={loadMorePosts}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="discover" className="space-y-4 mt-4">
              <EnhancedCreatePostCard />
              {feedWithAds.map((item) => renderFeedItem(item, true))}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button 
                    onClick={loadMorePosts}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Feed;

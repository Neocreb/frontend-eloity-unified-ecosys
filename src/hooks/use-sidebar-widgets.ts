import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SavedContentService from "@/services/savedContentService";
import { useLiveContentContextSafe } from "@/contexts/LiveContentContext";
import { exploreService } from "@/services/exploreService";

export type QuickLinkItem = {
  name: string;
  icon: any; // lucide icon component
  route: string;
  count?: number | null;
};

// Centralized Quick Links builder with dynamic counts and routes
export function useQuickLinksStats(): QuickLinkItem[] {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Marketplace wishlist per-user key (mirrors use-marketplace.ts)
  const wishlistRaw = user ? localStorage.getItem(`marketplace_wishlist_${user.id}`) : null;
  const wishlistCount = wishlistRaw ? (JSON.parse(wishlistRaw) as any[]).length : 0;

  // Saved posts from SavedContentService
  const savedCount = SavedContentService.getSavedPosts().length;

  // Groups/Pages from real database (using exploreService)
  const { data: groupsData } = useQuery({
    queryKey: ["sidebar-groups"],
    queryFn: () => exploreService.getSuggestedGroups(10),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: pagesData } = useQuery({
    queryKey: ["sidebar-pages"],
    queryFn: () => exploreService.getSuggestedPages(10),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const groupsCount = groupsData?.length || 0;
  const pagesCount = pagesData?.length || 0;

  // Friends count from real database (using exploreService)
  const { data: usersData } = useQuery({
    queryKey: ["sidebar-users"],
    queryFn: () => exploreService.getSuggestedUsers(50),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const friendsCount = usersData?.length || 0;

  // Memories are not modeled yet; expose as 0 while keeping key for future
  const memoriesCount = Number(localStorage.getItem("eloity_memories_count") || 0);

  const links: QuickLinkItem[] = [
    { name: "Connections", icon: Users, route: "/app/friends", count: friendsCount },
    { name: "Groups", icon: Users, route: "/app/feed?tab=groups", count: groupsCount },
    { name: "Pages", icon: Building, route: "/app/feed?tab=pages", count: pagesCount },
    { name: "Marketplace", icon: Building, route: "/app/marketplace", count: wishlistCount || null },
    { name: "Memories", icon: Building, route: "/app/memories", count: memoriesCount || null },
    { name: "Saved", icon: Bookmark, route: "/app/feed?tab=saved", count: savedCount },
  ];

  // Attach navigation handlers via Link on the consumer; this is just data
  return links;
}

// Trending Topics powered by React Query with graceful fallback
export function useTrendingTopicsData() {
  return useQuery({
    queryKey: ["trending-topics"],
    queryFn: async () => {
      try {
        const data = await exploreService.getTrendingHashtags(10);
        return data;
      } catch (error) {
        console.error("Failed to load trending topics:", error);
        return [];
      }
    },
    staleTime: 60_000,
  });
}

// People You May Know (suggested users)
export function useSuggestedUsersData(max: number = 6) {
  return useQuery({
    queryKey: ["suggested-users", max],
    queryFn: async () => {
      try {
        const data = await exploreService.getSuggestedUsers(max);
        return data.slice(0, max);
      } catch (error) {
        console.error("Failed to load suggested users:", error);
        return [];
      }
    },
    staleTime: 60_000,
  });
}

// Live Now streams sourced from context (already real-time capable)
export function useLiveNowData() {
  const liveCtx = useLiveContentContextSafe();
  const liveStreams = liveCtx?.liveStreams || [];
  return useMemo(() => ({ liveStreams }), [liveStreams]);
}
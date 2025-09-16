import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Building, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trendingTopics as mockTrendingTopics, suggestedUsers as mockSuggestedUsers, groups as mockGroups, pages as mockPages } from "@/data/mockExploreData";
import { mockUsers } from "@/data/mockUsers";
import SavedContentService from "@/services/savedContentService";
import { useLiveContentContextSafe } from "@/contexts/LiveContentContext";

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

  // Groups/Pages from mock datasets (can be swapped to API later)
  const groupsCount = mockGroups.length;
  const pagesCount = mockPages.length;

  // Friends count placeholder using mockUsers length; ready for API swap
  const friendsCount = Object.keys(mockUsers).length;

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
        const res = await fetch("/api/trending/topics");
        if (!res.ok) throw new Error("Failed to load trending topics");
        const data = await res.json();
        return Array.isArray(data) ? data : mockTrendingTopics;
      } catch {
        return mockTrendingTopics;
      }
    },
    staleTime: 60_000,
    initialData: mockTrendingTopics,
  });
}

// People You May Know (suggested users)
export function useSuggestedUsersData(max: number = 6) {
  return useQuery({
    queryKey: ["suggested-users", max],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/suggested?limit=${max}`);
        if (!res.ok) throw new Error("Failed to load suggested users");
        const data = await res.json();
        return Array.isArray(data) ? data.slice(0, max) : mockSuggestedUsers.slice(0, max);
      } catch {
        return mockSuggestedUsers.slice(0, max);
      }
    },
    staleTime: 60_000,
    initialData: mockSuggestedUsers.slice(0, max),
  });
}

// Live Now streams sourced from context (already real-time capable)
export function useLiveNowData() {
  const liveCtx = useLiveContentContextSafe();
  const liveStreams = liveCtx?.liveStreams || [];
  return useMemo(() => ({ liveStreams }), [liveStreams]);
}

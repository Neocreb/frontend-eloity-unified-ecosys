import { useMemo, useState } from "react";

export const useExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");

  const topics: { name: string; category: string }[] = [];
  const users: { name: string; username: string; bio?: string }[] = [];
  const hashtags: { tag: string }[] = [];
  const groupsList: { name: string; category: string }[] = [];
  const pagesList: { name: string; category: string }[] = [];

  const query = searchQuery.toLowerCase();

  const filteredTopics = useMemo(
    () => topics.filter(t => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query)),
    [topics, query]
  );

  const filteredUsers = useMemo(
    () => users.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query) || (u.bio || "").toLowerCase().includes(query)),
    [users, query]
  );

  const filteredHashtags = useMemo(
    () => hashtags.filter(h => h.tag.toLowerCase().includes(query)),
    [hashtags, query]
  );

  const filteredGroups = useMemo(
    () => groupsList.filter(g => g.name.toLowerCase().includes(query) || g.category.toLowerCase().includes(query)),
    [groupsList, query]
  );

  const filteredPages = useMemo(
    () => pagesList.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)),
    [pagesList, query]
  );

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredTopics,
    filteredUsers,
    filteredHashtags,
    filteredGroups,
    filteredPages,
  };
};

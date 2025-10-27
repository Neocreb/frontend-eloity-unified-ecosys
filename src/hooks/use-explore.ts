import { useState, useEffect } from "react";
import { globalSearchService } from "@/services/globalSearchService";

export const useExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredHashtags, setFilteredHashtags] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [filteredPages, setFilteredPages] = useState<any[]>([]);

  // Search for real data when searchQuery changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        try {
          // Search for different types of content
          const searchResponse = await globalSearchService.search({
            query: searchQuery,
            type: "all",
            page: 1,
            limit: 20
          });

          // Categorize results by type
          const topics: any[] = [];
          const users: any[] = [];
          const hashtags: any[] = [];
          const groups: any[] = [];
          const pages: any[] = [];

          searchResponse.results.forEach((result: any) => {
            switch (result.type) {
              case "post":
              case "video":
                topics.push({
                  id: result.id,
                  title: result.title,
                  category: result.category,
                  posts: result.stats?.views || 0
                });
                break;
              case "user":
                users.push({
                  id: result.id,
                  name: result.title,
                  username: result.author?.name ? `@${result.author.name.toLowerCase().replace(/\s+/g, '')}` : '',
                  followers: result.stats?.views || 0
                });
                break;
              case "product":
              case "service":
                hashtags.push({
                  id: result.id,
                  tag: `#${result.title.toLowerCase().replace(/\s+/g, '')}`,
                  count: result.stats?.views || 0
                });
                break;
              case "group":
                groups.push({
                  id: result.id,
                  name: result.title,
                  members: result.stats?.views || 0,
                  category: result.category
                });
                break;
              case "page":
                pages.push({
                  id: result.id,
                  name: result.title,
                  followers: result.stats?.views || 0,
                  category: result.category
                });
                break;
              default:
                // Default to topics for other types
                topics.push({
                  id: result.id,
                  title: result.title,
                  category: result.category || 'General',
                  posts: result.stats?.views || 0
                });
            }
          });

          setFilteredTopics(topics);
          setFilteredUsers(users);
          setFilteredHashtags(hashtags);
          setFilteredGroups(groups);
          setFilteredPages(pages);
        } catch (error) {
          console.error("Search failed:", error);
          // Fallback to empty arrays
          setFilteredTopics([]);
          setFilteredUsers([]);
          setFilteredHashtags([]);
          setFilteredGroups([]);
          setFilteredPages([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset to empty arrays when search is cleared
        setFilteredTopics([]);
        setFilteredUsers([]);
        setFilteredHashtags([]);
        setFilteredGroups([]);
        setFilteredPages([]);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Simulate data refresh
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    isLoading,
    filteredTopics,
    filteredUsers,
    filteredHashtags,
    filteredGroups,
    filteredPages,
    refreshData
  };
};

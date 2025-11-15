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
          
          // Validate search response
          if (!searchResponse) {
            console.warn('Search API returned null response');
            throw new Error('Invalid search response');
          }

          // Categorize results by type
          const topics: any[] = [];
          const users: any[] = [];
          const hashtags: any[] = [];
          const groups: any[] = [];
          const pages: any[] = [];

          // Validate results array
          const results = Array.isArray(searchResponse.results) ? searchResponse.results : [];
          
          results.forEach((result: any) => {
            // Validate each result
            if (!result || !result.type) {
              console.warn('Skipping invalid search result:', result);
              return;
            }
            
            switch (result.type) {
              case "post":
              case "video":
                topics.push({
                  id: result.id || `topic-${Date.now()}-${Math.random()}`,
                  title: result.title || 'Untitled',
                  category: result.category || 'General',
                  posts: result.stats?.views || 0
                });
                break;
              case "user":
                users.push({
                  id: result.id || `user-${Date.now()}-${Math.random()}`,
                  name: result.title || 'Unknown User',
                  username: result.description?.startsWith('@') ? result.description.substring(1) : result.author?.name ? result.author.name.toLowerCase().replace(/\s+/g, '') : result.title.toLowerCase().replace(/\s+/g, ''),
                  full_name: result.title || 'Unknown User',
                  avatar_url: result.image || '/placeholder.svg',
                  bio: result.description?.startsWith('@') ? '' : result.description || 'No bio available',
                  is_verified: result.author?.verified || false,
                  followers: result.stats?.views || 0, // Using views as a proxy for followers count
                  reputation: result.stats?.views || 0,
                  profile: {
                    username: result.description?.startsWith('@') ? result.description.substring(1) : result.author?.name ? result.author.name.toLowerCase().replace(/\s+/g, '') : result.title.toLowerCase().replace(/\s+/g, ''),
                    full_name: result.title || 'Unknown User',
                    avatar_url: result.image || '/placeholder.svg',
                    is_verified: result.author?.verified || false,
                    reputation: result.stats?.views || 0
                  }
                });
                break;
              case "product":
              case "service":
                hashtags.push({
                  id: result.id || `hashtag-${Date.now()}-${Math.random()}`,
                  tag: `#${(result.title || 'untitled').toLowerCase().replace(/\s+/g, '')}`,
                  count: result.stats?.views || 0
                });
                break;
              case "group":
                groups.push({
                  id: result.id || `group-${Date.now()}-${Math.random()}`,
                  name: result.title || 'Unnamed Group',
                  members: result.stats?.views || 0,
                  category: result.category || 'General'
                });
                break;
              case "page":
                pages.push({
                  id: result.id || `page-${Date.now()}-${Math.random()}`,
                  name: result.title || 'Unnamed Page',
                  followers: result.stats?.views || 0,
                  category: result.category || 'General'
                });
                break;
              default:
                // Default to topics for other types
                topics.push({
                  id: result.id || `topic-${Date.now()}-${Math.random()}`,
                  title: result.title || 'Untitled',
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
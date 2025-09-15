
import { useState } from "react";
import { 
  trendingTopics, 
  suggestedUsers, 
  popularHashtags, 
  groups, 
  pages 
} from "@/data/mockExploreData";

export const useExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  
  const filteredTopics = trendingTopics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUsers = suggestedUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredHashtags = popularHashtags.filter(hashtag => 
    hashtag.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPages = pages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    filteredPages
  };
};

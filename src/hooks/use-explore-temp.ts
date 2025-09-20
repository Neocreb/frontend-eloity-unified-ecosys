// Temporary working version for live preview
export const useExplore = () => {
  return {
    searchQuery: "",
    setSearchQuery: () => {},
    activeTab: "trending",
    setActiveTab: () => {},
    isLoading: false,
    filteredTopics: [],
    filteredUsers: [],
    filteredHashtags: [],
    filteredGroups: [],
    filteredPages: [],
    refreshData: () => {}
  };
};
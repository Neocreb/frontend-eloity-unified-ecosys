import { globalSearchService } from "./globalSearchService";

export class SearchService {
  static async getRecentSearches(): Promise<string[]> {
    try {
      // For now, we'll return an empty array as a placeholder
      // In a real implementation, this would fetch recent searches from user data
      return [];
    } catch (error) {
      console.error("Error fetching recent searches:", error);
      return [];
    }
  }

  static async getTrendingSearches(): Promise<string[]> {
    try {
      return await globalSearchService.getTrendingTopics();
    } catch (error) {
      console.error("Error fetching trending searches:", error);
      return [];
    }
  }

  static async getSearchSuggestions(query: string): Promise<Array<{id: string, text: string, type: string}>> {
    try {
      const suggestions = await globalSearchService.getSuggestions(query);
      // Transform the suggestions to match the expected format
      return suggestions.map((text, index) => ({
        id: `suggestion-${index}`,
        text,
        type: "trending"
      }));
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      return [];
    }
  }

  static async saveRecentSearch(query: string): Promise<void> {
    try {
      // In a real implementation, this would save the search to user data
      console.log("Saved recent search:", query);
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  }
}

export const searchService = new SearchService();
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  aiPersonalAssistantService,
  type AIInsight,
  type ContentSuggestion,
  type TradingInsight,
  type PerformanceAnalysis,
  type SchedulingOptimization,
  type AIPersonalAssistant,
} from "@/services/aiPersonalAssistantService";
import { enhancedAIService } from "@/services/enhancedAIService";

export interface UseAIAssistantReturn {
  // Data
  assistant: AIPersonalAssistant | null;
  insights: AIInsight[];
  contentSuggestions: ContentSuggestion[];
  tradingInsights: TradingInsight[];
  performance: PerformanceAnalysis | null;
  scheduling: SchedulingOptimization | null;
  dashboardSummary: any;

  // Loading states
  isLoading: boolean;
  isLoadingInsights: boolean;
  isLoadingContent: boolean;
  isLoadingTrading: boolean;
  isLoadingPerformance: boolean;

  // Actions
  initializeAssistant: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  refreshContentSuggestions: () => Promise<void>;
  refreshTradingInsights: () => Promise<void>;
  refreshPerformance: () => Promise<void>;
  refreshScheduling: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Interactions
  acceptSuggestion: (suggestionId: string, type: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string, type: string) => Promise<void>;
  trackInteraction: (type: string, data: any) => Promise<void>;

  // Configuration
  updateAssistantPreferences: (
    preferences: Partial<AIPersonalAssistant["preferences"]>,
  ) => Promise<boolean>;

  // Chat
  chatMessages: any[];
  isTyping: boolean;
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;

  // Utilities
  getInsightsByType: (type: string) => AIInsight[];
  getInsightsByPriority: (priority: string) => AIInsight[];
  getTopPerformingContent: () => ContentSuggestion[];
  getUrgentInsights: () => AIInsight[];

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useAIAssistant = (): UseAIAssistantReturn => {
  const { user } = useAuth();

  // Data state
  const [assistant, setAssistant] = useState<AIPersonalAssistant | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<
    ContentSuggestion[]
  >([]);
  const [tradingInsights, setTradingInsights] = useState<TradingInsight[]>([]);
  const [performance, setPerformance] = useState<PerformanceAnalysis | null>(
    null,
  );
  const [scheduling, setScheduling] = useState<SchedulingOptimization | null>(
    null,
  );
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingTrading, setIsLoadingTrading] = useState(false);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Initialize assistant on mount
  useEffect(() => {
    if (user?.id) {
      initializeAssistant();
    }
  }, [user?.id]);

  const initializeAssistant = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Initialize assistant
      const assistantData =
        await aiPersonalAssistantService.initializeAssistant(user.id);
      setAssistant(assistantData);

      // Initialize chat with welcome message
      setChatMessages([
        {
          id: "welcome",
          type: "assistant",
          content: `Hey ${user.username || user.email || "there"}! 👋 I'm ${assistantData.name}, your personal Eloity assistant.\n\nI'm here to help you succeed on the platform - whether you want to create amazing content, trade crypto, sell products, or earn through freelancing. Just ask me anything and I'll guide you step by step!\n\nWhat would you like to explore first?`,
          timestamp: new Date(),
        },
      ]);

      // Load initial data
      await refreshAll();
    } catch (err) {
      setError("Failed to initialize AI assistant");
      console.error("Error initializing AI assistant:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refreshInsights = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingInsights(true);
    try {
      const data = await aiPersonalAssistantService.getAIInsights(user.id);
      setInsights(data);
    } catch (err) {
      setError("Failed to load AI insights");
      console.error("Error loading insights:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [user?.id]);

  const refreshContentSuggestions = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingContent(true);
    try {
      const data = await aiPersonalAssistantService.generateContentSuggestions(
        user.id,
      );
      setContentSuggestions(data);
    } catch (err) {
      setError("Failed to load content suggestions");
      console.error("Error loading content suggestions:", err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [user?.id]);

  const refreshTradingInsights = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingTrading(true);
    try {
      const data = await aiPersonalAssistantService.generateTradingInsights(
        user.id,
      );
      setTradingInsights(data);
    } catch (err) {
      setError("Failed to load trading insights");
      console.error("Error loading trading insights:", err);
    } finally {
      setIsLoadingTrading(false);
    }
  }, [user?.id]);

  const refreshPerformance = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingPerformance(true);
    try {
      const data = await aiPersonalAssistantService.generatePerformanceAnalysis(
        user.id,
      );
      setPerformance(data);
    } catch (err) {
      setError("Failed to load performance analysis");
      console.error("Error loading performance:", err);
    } finally {
      setIsLoadingPerformance(false);
    }
  }, [user?.id]);

  const refreshScheduling = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data =
        await aiPersonalAssistantService.generateSchedulingOptimization(
          user.id,
        );
      setScheduling(data);
    } catch (err) {
      setError("Failed to load scheduling optimization");
      console.error("Error loading scheduling:", err);
    }
  }, [user?.id]);

  const refreshAll = useCallback(async () => {
    if (!user?.id) return;

    await Promise.all([
      refreshInsights(),
      refreshContentSuggestions(),
      refreshTradingInsights(),
      refreshPerformance(),
      refreshScheduling(),
    ]);

    // Load dashboard summary
    try {
      const summary = await aiPersonalAssistantService.getDashboardSummary(
        user.id,
      );
      setDashboardSummary(summary);
    } catch (err) {
      console.error("Error loading dashboard summary:", err);
    }
  }, [
    user?.id,
    refreshInsights,
    refreshContentSuggestions,
    refreshTradingInsights,
    refreshPerformance,
    refreshScheduling,
  ]);

  const acceptSuggestion = useCallback(
    async (suggestionId: string, type: string) => {
      if (!user?.id) return;

      try {
        await trackInteraction("accept_suggestion", { suggestionId, type });

        // Remove suggestion from list if it's a content suggestion
        if (type === "content") {
          setContentSuggestions((prev) =>
            prev.filter((s) => s.id !== suggestionId),
          );
        }
      } catch (err) {
        setError("Failed to accept suggestion");
        console.error("Error accepting suggestion:", err);
      }
    },
    [user?.id],
  );

  const dismissSuggestion = useCallback(
    async (suggestionId: string, type: string) => {
      if (!user?.id) return;

      try {
        await trackInteraction("dismiss_suggestion", { suggestionId, type });

        // Remove suggestion from appropriate list
        if (type === "content") {
          setContentSuggestions((prev) =>
            prev.filter((s) => s.id !== suggestionId),
          );
        } else if (type === "insight") {
          setInsights((prev) => prev.filter((i) => i.id !== suggestionId));
        }
      } catch (err) {
        setError("Failed to dismiss suggestion");
        console.error("Error dismissing suggestion:", err);
      }
    },
    [user?.id],
  );

  const trackInteraction = useCallback(
    async (type: string, data: any) => {
      if (!user?.id) return;

      try {
        await aiPersonalAssistantService.trackInteraction(user.id, type, data);
      } catch (err) {
        console.error("Error tracking interaction:", err);
      }
    },
    [user?.id],
  );

  const updateAssistantPreferences = useCallback(
    async (preferences: Partial<AIPersonalAssistant["preferences"]>) => {
      if (!user?.id) return false;

      try {
        const success =
          await aiPersonalAssistantService.updateAssistantPreferences(
            user.id,
            preferences,
          );
        if (success) {
          setAssistant((prev) =>
            prev
              ? {
                  ...prev,
                  preferences: { ...prev.preferences, ...preferences },
                }
              : null,
          );
        }
        return success;
      } catch (err) {
        setError("Failed to update assistant preferences");
        console.error("Error updating preferences:", err);
        return false;
      }
    },
    [user?.id],
  );

  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!user?.id || !message.trim() || isTyping) return;

      const userMessage = {
        id: `msg-${Date.now()}`,
        type: "user",
        content: message,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMessage]);

      // Add to conversation context
      setConversationContext((prev) => [...prev.slice(-4), message]); // Keep last 5 messages for context

      // Track chat interaction
      await trackInteraction("chat", { message });

      // Show typing indicator
      setIsTyping(true);

      // Simulate realistic response time based on message complexity
      const responseDelay = Math.min(500 + message.length * 10, 2000);

      // Use enhanced AI service for more intelligent responses
      setTimeout(() => {
        // Generate response with conversation context
        const contextualInput =
          conversationContext.length > 0
            ? `Previous context: ${conversationContext.slice(-2).join(". ")}. Current: ${message}`
            : message;

        const smartResponse = enhancedAIService.generateSmartResponse(
          contextualInput,
          user,
        );
        const aiResponse = {
          id: `ai-${Date.now()}`,
          type: "assistant",
          content: smartResponse.message,
          timestamp: new Date(),
          suggestedActions: smartResponse.suggestedActions,
          relatedTopics: smartResponse.relatedTopics,
          followUpQuestions: smartResponse.followUpQuestions,
        };
        setChatMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
      }, responseDelay);
    },
    [user?.id, trackInteraction, isTyping, conversationContext],
  );

  const clearChat = useCallback(() => {
    setChatMessages([]);
    setConversationContext([]);
    setIsTyping(false);
  }, []);

  // Utility functions
  const getInsightsByType = useCallback(
    (type: string) => {
      return insights.filter((insight) => insight.type === type);
    },
    [insights],
  );

  const getInsightsByPriority = useCallback(
    (priority: string) => {
      return insights.filter((insight) => insight.priority === priority);
    },
    [insights],
  );

  const getTopPerformingContent = useCallback(() => {
    return contentSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }, [contentSuggestions]);

  const getUrgentInsights = useCallback(() => {
    return insights.filter(
      (insight) => insight.priority === "urgent" || insight.priority === "high",
    );
  }, [insights]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    assistant,
    insights,
    contentSuggestions,
    tradingInsights,
    performance,
    scheduling,
    dashboardSummary,

    // Loading states
    isLoading,
    isLoadingInsights,
    isLoadingContent,
    isLoadingTrading,
    isLoadingPerformance,

    // Actions
    initializeAssistant,
    refreshInsights,
    refreshContentSuggestions,
    refreshTradingInsights,
    refreshPerformance,
    refreshScheduling,
    refreshAll,

    // Interactions
    acceptSuggestion,
    dismissSuggestion,
    trackInteraction,

    // Configuration
    updateAssistantPreferences,

    // Chat
    chatMessages,
    isTyping,
    sendChatMessage,
    clearChat,

    // Utilities
    getInsightsByType,
    getInsightsByPriority,
    getTopPerformingContent,
    getUrgentInsights,

    // Error handling
    error,
    clearError,
  };
};

export default useAIAssistant;

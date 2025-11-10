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
import { enhancedAIService, type SmartResponse } from "@/services/enhancedAIService";
import { supabase } from "@/integrations/supabase/client";

// Define the return interface
interface UseAIAssistantReturn {
  assistant: AIPersonalAssistant | null;
  insights: AIInsight[];
  contentSuggestions: ContentSuggestion[];
  tradingInsights: TradingInsight[];
  performanceAnalysis: PerformanceAnalysis | null;
  schedulingOptimizations: SchedulingOptimization[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  initializeAssistant: (preferences?: Partial<AIPersonalAssistant>) => Promise<void>;
  fetchInsights: () => Promise<void>;
  generateContent: (prompt: string) => Promise<SmartResponse | null>;
  analyzePerformance: () => Promise<PerformanceAnalysis | null>;
  suggestOptimizations: () => Promise<SchedulingOptimization | null>;
  getRealTimeInsights: () => Promise<AIInsight[]>;
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
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [schedulingOptimizations, setSchedulingOptimizations] = useState<SchedulingOptimization[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real insights from the service
  const fetchInsights = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Get personalized insights from the service
      const userInsights = await aiPersonalAssistantService.getPersonalizedInsights(user.id);
      setInsights(userInsights);

      // Get content suggestions
      const suggestions = await aiPersonalAssistantService.generateContentSuggestions(user.id);
      setContentSuggestions(suggestions);

      // Get trading insights
      const tradeInsights = await aiPersonalAssistantService.generateTradingInsights(user.id);
      setTradingInsights(tradeInsights);

      // Get performance analysis
      const perfAnalysis = await aiPersonalAssistantService.generatePerformanceAnalysis(user.id);
      setPerformanceAnalysis(perfAnalysis);

      // Get scheduling optimizations
      const schedOptimizations = await aiPersonalAssistantService.generateSchedulingOptimization(user.id);
      setSchedulingOptimizations([schedOptimizations]);
    } catch (err) {
      console.error("Error fetching AI insights:", err);
      setError("Failed to load AI insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initialize assistant
  const initializeAssistant = useCallback(async (preferences?: Partial<AIPersonalAssistant>) => {
    if (!user?.id) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Initialize the assistant with real data
      const initializedAssistant = await aiPersonalAssistantService.initializeAssistant(
        user.id,
        preferences
      );
      
      setAssistant(initializedAssistant);
      
      // Fetch initial insights after initialization
      await fetchInsights();
    } catch (err) {
      console.error("Error initializing AI assistant:", err);
      setError("Failed to initialize AI assistant. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, fetchInsights]);

  // Effect to initialize assistant when user is available
  useEffect(() => {
    if (user?.id && !assistant) {
      initializeAssistant();
    }
  }, [user?.id, assistant, initializeAssistant]);

  // Effect to fetch insights when assistant is available
  useEffect(() => {
    if (assistant && user?.id) {
      fetchInsights();
    }
  }, [assistant, user?.id, fetchInsights]);

  // Generate content using the assistant
  const generateContent = useCallback(async (prompt: string) => {
    if (!user?.id) return null;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Use the enhanced AI service for content generation
      const content = await enhancedAIService.generateSmartResponse(prompt, {
        id: user.id,
        email: user.email || undefined,
      });
      
      return content;
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Failed to generate content. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id]);

  // Analyze performance using the assistant
  const analyzePerformance = useCallback(async () => {
    if (!user?.id) return null;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Get performance analysis from the service
      const performance = await aiPersonalAssistantService.generatePerformanceAnalysis(user.id);
      setPerformanceAnalysis(performance);
      
      return performance;
    } catch (err) {
      console.error("Error analyzing performance:", err);
      setError("Failed to analyze performance. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id]);

  // Suggest optimizations using the assistant
  const suggestOptimizations = useCallback(async () => {
    if (!user?.id) return null;

    try {
      setIsProcessing(true);
      setError(null);
      
      // Get scheduling optimization from the service
      const optimizations = await aiPersonalAssistantService.generateSchedulingOptimization(user.id);
      setSchedulingOptimizations([optimizations]);
      
      return optimizations;
    } catch (err) {
      console.error("Error suggesting optimizations:", err);
      setError("Failed to suggest optimizations. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id]);

  // Get real-time insights using the assistant
  const getRealTimeInsights = useCallback(async () => {
    if (!user?.id) return [];

    try {
      setIsProcessing(true);
      setError(null);
      
      // Get AI insights from the service
      const realTimeInsights = await aiPersonalAssistantService.getAIInsights(user.id);
      setInsights(realTimeInsights);
      
      return realTimeInsights;
    } catch (err) {
      console.error("Error getting real-time insights:", err);
      setError("Failed to get real-time insights. Please try again.");
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id]);

  return {
    assistant,
    insights,
    contentSuggestions,
    tradingInsights,
    performanceAnalysis,
    schedulingOptimizations,
    isLoading,
    isProcessing,
    error,
    initializeAssistant,
    fetchInsights,
    generateContent,
    analyzePerformance,
    suggestOptimizations,
    getRealTimeInsights,
  };
};
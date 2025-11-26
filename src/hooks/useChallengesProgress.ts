import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  target_value: number;
  status: string;
  completion_date: string | null;
  reward_claimed: boolean;
  claim_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target_value: number;
  points_reward: number;
  icon?: string;
  difficulty?: string;
}

export interface ChallengeWithProgress extends Challenge {
  userProgress?: ChallengeProgress;
}

interface UseChallengesProgressReturn {
  challenges: ChallengeWithProgress[];
  isLoading: boolean;
  error: Error | null;
  updateProgress: (challengeId: string, newProgress: number) => Promise<boolean>;
  claimReward: (challengeId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useChallengesProgress = (): UseChallengesProgressReturn => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch challenges and user progress
  const fetchChallenges = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all challenges (from a hypothetical challenges table)
      // Since we don't have a challenges table in the schema, we'll use mock challenges
      const mockChallenges: Challenge[] = [
        {
          id: "daily-post",
          title: "Daily Post",
          description: "Create a post every day to build your streak",
          type: "daily",
          target_value: 1,
          points_reward: 10,
          difficulty: "easy",
        },
        {
          id: "weekly-engagement",
          title: "Weekly Engagement",
          description: "Get 100+ engagements on your content this week",
          type: "content",
          target_value: 100,
          points_reward: 50,
          difficulty: "medium",
        },
        {
          id: "referral-friend",
          title: "Invite a Friend",
          description: "Refer a friend who completes signup",
          type: "referral",
          target_value: 1,
          points_reward: 25,
          difficulty: "easy",
        },
        {
          id: "challenge-champion",
          title: "Challenge Champion",
          description: "Win 5 challenges",
          type: "challenge",
          target_value: 5,
          points_reward: 75,
          difficulty: "hard",
        },
        {
          id: "generous-tipper",
          title: "Generous Tipper",
          description: "Send tips 10 times",
          type: "engagement",
          target_value: 10,
          points_reward: 40,
          difficulty: "medium",
        },
        {
          id: "marketplace-master",
          title: "Marketplace Master",
          description: "Make 3 marketplace sales",
          type: "marketplace",
          target_value: 3,
          points_reward: 60,
          difficulty: "medium",
        },
      ];

      // Fetch user progress for each challenge
      const { data: userProgress, error: progressError } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id);

      if (progressError && progressError.code !== "PGRST116") {
        console.error("Error fetching user progress:", progressError);
        throw progressError;
      }

      // Combine challenges with user progress
      const combinedChallenges: ChallengeWithProgress[] = mockChallenges.map((challenge) => {
        const userChallengeProgress = userProgress?.find(
          (p) => p.challenge_id === challenge.id
        );

        return {
          ...challenge,
          userProgress: userChallengeProgress,
        };
      });

      setChallenges(combinedChallenges);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch challenges"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchChallenges();

    // Subscribe to real-time updates
    const subscription = supabase
      .from(`user_challenges:user_id=eq.${user.id}`)
      .on("INSERT", (payload) => {
        // Add new challenge progress
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === payload.new.challenge_id
              ? { ...c, userProgress: payload.new }
              : c
          )
        );
      })
      .on("UPDATE", (payload) => {
        // Update challenge progress
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === payload.new.challenge_id
              ? { ...c, userProgress: payload.new }
              : c
          )
        );
      })
      .subscribe((status, err) => {
        if (err) {
          console.error("Subscription error:", err);
        }
      });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.id, fetchChallenges]);

  // Update progress
  const updateProgress = useCallback(
    async (challengeId: string, newProgress: number): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        // Get or create challenge progress record
        const { data: existing, error: fetchError } = await supabase
          .from("user_challenges")
          .select("*")
          .eq("user_id", user.id)
          .eq("challenge_id", challengeId)
          .single();

        let success = false;

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("user_challenges")
            .update({
              progress: newProgress,
              status: newProgress >= existing.target_value ? "completed" : "active",
              completion_date: newProgress >= existing.target_value ? new Date().toISOString() : null,
            })
            .eq("id", existing.id);

          success = !updateError;

          if (updateError) {
            console.error("Error updating progress:", updateError);
          }
        } else {
          // Create new record
          const challenge = challenges.find((c) => c.id === challengeId);
          if (!challenge) return false;

          const { error: insertError } = await supabase
            .from("user_challenges")
            .insert([
              {
                user_id: user.id,
                challenge_id: challengeId,
                progress: newProgress,
                target_value: challenge.target_value,
                status: newProgress >= challenge.target_value ? "completed" : "active",
                completion_date: newProgress >= challenge.target_value ? new Date().toISOString() : null,
              },
            ]);

          success = !insertError;

          if (insertError) {
            console.error("Error creating progress:", insertError);
          }
        }

        if (success) {
          // Refresh challenges data
          await fetchChallenges();
        }

        return success;
      } catch (err) {
        console.error("Exception updating progress:", err);
        return false;
      }
    },
    [user?.id, challenges, fetchChallenges]
  );

  // Claim reward
  const claimReward = useCallback(
    async (challengeId: string): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        const { data, error } = await supabase
          .from("user_challenges")
          .update({
            reward_claimed: true,
            claim_date: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("challenge_id", challengeId)
          .select()
          .single();

        if (error) {
          console.error("Error claiming reward:", error);
          return false;
        }

        if (data) {
          // Update local state
          setChallenges((prev) =>
            prev.map((c) =>
              c.id === challengeId
                ? { ...c, userProgress: { ...c.userProgress, ...data } as ChallengeProgress }
                : c
            )
          );
        }

        return !error;
      } catch (err) {
        console.error("Exception claiming reward:", err);
        return false;
      }
    },
    [user?.id]
  );

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchChallenges();
  }, [fetchChallenges]);

  return {
    challenges,
    isLoading,
    error,
    updateProgress,
    claimReward,
    refresh,
  };
};

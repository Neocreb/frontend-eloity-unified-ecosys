import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on the actual database schema
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target_value: number;
  points_reward: number;
  is_daily: boolean;
  active_date: string;
  created_at: string;
}

export interface UserChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  reward_claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeWithProgress extends Challenge {
  progress: number;
  is_completed: boolean;
  reward_claimed: boolean;
}

export const rewardsChallengesService = {
  // Fetch all active challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching challenges:', err);
      return [];
    }
  },

  // Fetch user's progress for challenges
  async getUserChallengeProgress(userId: string): Promise<UserChallengeProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user challenge progress:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching user challenge progress:', err);
      return [];
    }
  },

  // Get challenges with user progress
  async getChallengesWithProgress(userId: string): Promise<ChallengeWithProgress[]> {
    try {
      // Fetch all challenges
      const challenges = await this.getActiveChallenges();
      
      // Fetch user's progress
      const progressRecords = await this.getUserChallengeProgress(userId);
      
      // Combine challenges with progress
      const challengesWithProgress = challenges.map(challenge => {
        const progressRecord = progressRecords.find(p => p.challenge_id === challenge.id);
        
        return {
          ...challenge,
          progress: progressRecord?.progress || 0,
          is_completed: progressRecord?.is_completed || false,
          reward_claimed: progressRecord?.reward_claimed || false
        };
      });
      
      return challengesWithProgress;
    } catch (err) {
      console.error('Error fetching challenges with progress:', err);
      return [];
    }
  },

  // Update user progress for a challenge
  async updateUserChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
    isCompleted: boolean = false
  ): Promise<UserChallengeProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: userId,
          challenge_id: challengeId,
          progress: progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,challenge_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user challenge progress:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error updating user challenge progress:', err);
      return null;
    }
  },

  // Claim reward for completed challenge
  async claimChallengeReward(
    userId: string,
    challengeId: string
  ): Promise<UserChallengeProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .update({
          reward_claimed: true,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .select()
        .single();

      if (error) {
        console.error('Error claiming challenge reward:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error claiming challenge reward:', err);
      return null;
    }
  }
};
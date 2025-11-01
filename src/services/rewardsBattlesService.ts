import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on the actual database schema
interface Profile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
}

export interface Battle {
  id: string;
  live_stream_id: string;
  challenger_id: string;
  opponent_id: string | null;
  battle_type: string;
  time_remaining: number | null;
  challenger_score: number;
  opponent_score: number;
  winner_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LiveBattle {
  id: string;
  creator1_id: string;
  creator2_id: string | null;
  title: string;
  description: string | null;
  duration: number;
  battle_type: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  winner_id: string | null;
  creator1_score: number;
  creator2_score: number;
  total_gifts: number;
  total_viewers: number;
  peak_viewers: number;
  total_bets: number;
  bet_pool: number;
  stream_url: string | null;
  replay_url: string | null;
  highlight_url: string | null;
  thumbnail_url: string | null;
  allow_betting: boolean;
  is_public: boolean;
  is_recorded: boolean;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface BattleVote {
  id: string;
  battle_id: string;
  user_id: string;
  creator_id: string;
  amount: number;
  odds: number;
  potential_winning: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  win_rate: number;
  total_votes: number;
  is_leading: boolean;
  current_score: number;
  followers: string;
}

export const rewardsBattlesService = {
  // Fetch all active battles
  async getActiveBattles(): Promise<LiveBattle[]> {
    try {
      const { data, error } = await supabase
        .from('live_battles')
        .select('*')
        .in('status', ['active', 'pending', 'live'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching battles:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching battles:', err);
      return [];
    }
  },

  // Fetch user's battle votes
  async getUserBattleVotes(userId: string): Promise<BattleVote[]> {
    try {
      const { data, error } = await supabase
        .from('battle_votes')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user battle votes:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching user battle votes:', err);
      return [];
    }
  },

  // Get battles with user votes
  async getBattlesWithVotes(userId: string): Promise<Array<{
    battle: LiveBattle;
    userVotes: BattleVote[];
  }>> {
    try {
      // Fetch all active battles
      const battles = await this.getActiveBattles();
      
      // Fetch user's votes
      const votes = await this.getUserBattleVotes(userId);
      
      // Combine battles with user votes
      const battlesWithVotes = battles.map(battle => {
        const userVotes = votes.filter(vote => vote.battle_id === battle.id);
        
        return {
          battle,
          userVotes
        };
      });
      
      return battlesWithVotes;
    } catch (err) {
      console.error('Error fetching battles with votes:', err);
      return [];
    }
  },

  // Place a vote on a battle
  async placeBattleVote(
    userId: string,
    battleId: string,
    creatorId: string,
    amount: number,
    odds: number,
    potentialWinning: number
  ): Promise<BattleVote | null> {
    try {
      const { data, error } = await supabase
        .from('battle_votes')
        .insert({
          battle_id: battleId,
          user_id: userId,
          creator_id: creatorId,
          amount: amount,
          odds: odds,
          potential_winning: potentialWinning,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error placing battle vote:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error placing battle vote:', err);
      return null;
    }
  },

  // Fetch creator profiles for battles
  async getCreatorProfiles(userIds: string[]): Promise<Creator[]> {
    try {
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url, is_verified')
        .in('user_id', userIds);

      if (error) {
        console.error('Error fetching creator profiles:', error);
        return [];
      }

      // Mock some additional data since it's not in the profiles table
      const creators: Creator[] = (data || []).map((profile: Profile) => ({
        id: profile.user_id,
        username: profile.username || 'Unknown',
        full_name: profile.full_name || 'Unknown User',
        avatar_url: profile.avatar_url || '',
        is_verified: profile.is_verified || false,
        tier: 'rising_star', // Mock data
        win_rate: 0, // Mock data
        total_votes: 0, // Mock data
        is_leading: false, // Mock data
        current_score: 0, // Mock data
        followers: '0K' // Mock data
      }));

      return creators;
    } catch (err) {
      console.error('Error fetching creator profiles:', err);
      return [];
    }
  }
};
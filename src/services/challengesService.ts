import { supabase } from "@/integrations/supabase/client";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  original_post_id: string;
  created_by: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'ended' | 'archived';
  is_sponsored: boolean;
  is_featured: boolean;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  participation_reward: number;
  total_submissions: number;
  total_views: number;
  total_likes: number;
  banner_url?: string;
  rules: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Added for frontend compatibility
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  post_id: string;
  user_id: string;
  score: number;
  ranking: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: 'submitted' | 'qualified' | 'winner' | 'disqualified';
  reward_earned: number;
  submitted_at: string;
  // Added for frontend compatibility
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
}

export interface CreateChallengeData {
  title: string;
  description: string;
  hashtag: string;
  original_post_id: string;
  start_date: string;
  end_date: string;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  participation_reward: number;
  banner_url?: string;
  rules: string;
  tags: string[];
  is_sponsored: boolean;
  is_featured: boolean;
}

export interface ChallengeFilters {
  status?: string;
  featured?: boolean;
  sponsored?: boolean;
  sortBy?: 'recent' | 'popularity' | 'prize' | 'ending';
  limit?: number;
  offset?: number;
  search?: string;
}

class ChallengesService {
  async getChallenges(filters: ChallengeFilters = {}): Promise<{
    data: Challenge[];
    pagination: { limit: number; offset: number; total: number };
  }> {
    try {
      let query: any = supabase
        .from("duet_challenges")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      
      if (filters.featured !== undefined) {
        query = query.eq("is_featured", filters.featured);
      }
      
      if (filters.sponsored !== undefined) {
        query = query.eq("is_sponsored", filters.sponsored);
      }
      
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'recent':
          query = query.order("created_at", { ascending: false });
          break;
        case 'popularity':
          query = query.order("total_views", { ascending: false });
          break;
        case 'prize':
          query = query.order("first_prize", { ascending: false });
          break;
        case 'ending':
          query = query.order("end_date", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching challenges:', error);
        throw new Error('Failed to fetch challenges');
      }

      // Fetch creator profiles
      const creatorIds: string[] = [];
      data.forEach((challenge: any) => {
        if (!creatorIds.includes(challenge.created_by)) {
          creatorIds.push(challenge.created_by);
        }
      });
      
      let profiles: any[] | null = null;
      let profilesError: any = null;
      
      if (creatorIds.length > 0) {
        const result: any = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url, is_verified")
          .in("user_id", creatorIds);
        profiles = result.data;
        profilesError = result.error;
      }

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map to frontend-compatible format
      const challenges = data.map((challenge: any) => {
        const creatorProfile = profiles?.find((p: any) => p.user_id === challenge.created_by) || {
          user_id: challenge.created_by,
          username: "",
          full_name: "",
          avatar_url: "",
          is_verified: false
        };

        return {
          ...challenge,
          createdBy: {
            id: creatorProfile.user_id,
            username: creatorProfile.username || "",
            displayName: creatorProfile.full_name || "",
            avatar: creatorProfile.avatar_url || "",
            verified: creatorProfile.is_verified || false
          }
        } as Challenge;
      });

      return {
        data: challenges,
        pagination: {
          limit,
          offset,
          total: count || 0
        }
      };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw new Error('Failed to fetch challenges');
    }
  }

  async getChallengeById(id: string): Promise<Challenge & { submissions: ChallengeSubmission[] }> {
    try {
      // Fetch challenge
      const { data: challenge, error } = await supabase
        .from("duet_challenges")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error('Error fetching challenge:', error);
        throw new Error('Failed to fetch challenge');
      }

      // Fetch creator profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, is_verified")
        .eq("user_id", challenge.created_by)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const creatorProfile = profile || {
        user_id: challenge.created_by,
        username: "",
        full_name: "",
        avatar_url: "",
        is_verified: false
      };

      // Fetch submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("challenge_submissions")
        .select("*")
        .eq("challenge_id", id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw new Error('Failed to fetch challenge submissions');
      }

      // Fetch user profiles for submissions
      const userIds: string[] = [];
      submissions.forEach((sub: any) => {
        if (!userIds.includes(sub.user_id)) {
          userIds.push(sub.user_id);
        }
      });
      
      let userProfiles: any[] | null = null;
      let userProfilesError: any = null;
      
      if (userIds.length > 0) {
        const result: any = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url, is_verified")
          .in("user_id", userIds);
        userProfiles = result.data;
        userProfilesError = result.error;
      }

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
      }

      // Map submissions to frontend-compatible format
      const mappedSubmissions = submissions.map((submission: any) => {
        const userProfile = userProfiles?.find((p: any) => p.user_id === submission.user_id) || {
          user_id: submission.user_id,
          username: "",
          full_name: "",
          avatar_url: "",
          is_verified: false
        };

        return {
          ...submission,
          user: {
            id: userProfile.user_id,
            username: userProfile.username || "",
            displayName: userProfile.full_name || "",
            avatar: userProfile.avatar_url || "",
            verified: userProfile.is_verified || false
          }
        } as ChallengeSubmission;
      });

      return {
        ...challenge,
        createdBy: {
          id: creatorProfile.user_id,
          username: creatorProfile.username || "",
          displayName: creatorProfile.full_name || "",
          avatar: creatorProfile.avatar_url || "",
          verified: creatorProfile.is_verified || false
        },
        submissions: mappedSubmissions
      } as Challenge & { submissions: ChallengeSubmission[] };
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw new Error('Failed to fetch challenge');
    }
  }

  async createChallenge(challengeData: CreateChallengeData): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from("duet_challenges")
        .insert(challengeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge:', error);
        throw new Error(error.message || 'Failed to create challenge');
      }

      // Fetch creator profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, is_verified")
        .eq("user_id", data.created_by)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const creatorProfile = profile || {
        user_id: data.created_by,
        username: "",
        full_name: "",
        avatar_url: "",
        is_verified: false
      };

      return {
        ...data,
        createdBy: {
          id: creatorProfile.user_id,
          username: creatorProfile.username || "",
          displayName: creatorProfile.full_name || "",
          avatar: creatorProfile.avatar_url || "",
          verified: creatorProfile.is_verified || false
        }
      } as Challenge;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      throw new Error(error.message || 'Failed to create challenge');
    }
  }

  async submitToChallenge(challengeId: string, postId: string, userId: string): Promise<ChallengeSubmission> {
    try {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .insert({
          challenge_id: challengeId,
          post_id: postId,
          user_id: userId,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting to challenge:', error);
        throw new Error(error.message || 'Failed to submit to challenge');
      }

      // Update challenge submission count
      await supabase
        .from("duet_challenges")
        .update({ total_submissions: supabase.rpc('total_submissions + 1') })
        .eq("id", challengeId);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, is_verified")
        .eq("user_id", data.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const userProfile = profile || {
        user_id: data.user_id,
        username: "",
        full_name: "",
        avatar_url: "",
        is_verified: false
      };

      return {
        ...data,
        user: {
          id: userProfile.user_id,
          username: userProfile.username || "",
          displayName: userProfile.full_name || "",
          avatar: userProfile.avatar_url || "",
          verified: userProfile.is_verified || false
        }
      } as ChallengeSubmission;
    } catch (error: any) {
      console.error('Error submitting to challenge:', error);
      throw new Error(error.message || 'Failed to submit to challenge');
    }
  }

  async getChallengeLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeSubmission[]> {
    try {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select("*")
        .eq("challenge_id", challengeId)
        .order("score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw new Error('Failed to fetch leaderboard');
      }

      // Fetch user profiles
      const userIds: string[] = [];
      data.forEach((sub: any) => {
        if (!userIds.includes(sub.user_id)) {
          userIds.push(sub.user_id);
        }
      });
      
      let profiles: any[] | null = null;
      let profilesError: any = null;
      
      if (userIds.length > 0) {
        const result: any = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url, is_verified")
          .in("user_id", userIds);
        profiles = result.data;
        profilesError = result.error;
      }

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map to frontend-compatible format
      return data.map((submission: any) => {
        const userProfile = profiles?.find((p: any) => p.user_id === submission.user_id) || {
          user_id: submission.user_id,
          username: "",
          full_name: "",
          avatar_url: "",
          is_verified: false
        };

        return {
          ...submission,
          user: {
            id: userProfile.user_id,
            username: userProfile.username || "",
            displayName: userProfile.full_name || "",
            avatar: userProfile.avatar_url || "",
            verified: userProfile.is_verified || false
          }
        } as ChallengeSubmission;
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }

  async getUserChallenges(userId: string): Promise<Array<{
    submission: ChallengeSubmission;
    challenge: Partial<Challenge>;
  }>> {
    try {
      // Fetch user submissions
      const { data: submissions, error } = await supabase
        .from("challenge_submissions")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error('Error fetching user challenges:', error);
        throw new Error('Failed to fetch user challenges');
      }

      // Fetch associated challenges
      const challengeIds: string[] = [];
      submissions.forEach((sub: any) => {
        if (!challengeIds.includes(sub.challenge_id)) {
          challengeIds.push(sub.challenge_id);
        }
      });
      
      let challenges: any[] | null = null;
      let challengesError: any = null;
      
      if (challengeIds.length > 0) {
        const result: any = await supabase
          .from("duet_challenges")
          .select("*")
          .in("id", challengeIds);
        challenges = result.data;
        challengesError = result.error;
      }

      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
        throw new Error('Failed to fetch challenges');
      }

      // Fetch creator profiles for challenges
      const creatorIds: string[] = [];
      if (challenges) {
        challenges.forEach((ch: any) => {
          if (!creatorIds.includes(ch.created_by)) {
            creatorIds.push(ch.created_by);
          }
        });
      }
      
      let profiles: any[] | null = null;
      let profilesError: any = null;
      
      if (creatorIds.length > 0) {
        const result: any = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url, is_verified")
          .in("user_id", creatorIds);
        profiles = result.data;
        profilesError = result.error;
      }

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map challenges to frontend-compatible format
      const mappedChallenges: Record<string, Challenge> = {};
      if (challenges) {
        challenges.forEach((challenge: any) => {
          const creatorProfile = profiles?.find((p: any) => p.user_id === challenge.created_by) || {
            user_id: challenge.created_by,
            username: "",
            full_name: "",
            avatar_url: "",
            is_verified: false
          };

          mappedChallenges[challenge.id] = {
            ...challenge,
            createdBy: {
              id: creatorProfile.user_id,
              username: creatorProfile.username || "",
              displayName: creatorProfile.full_name || "",
              avatar: creatorProfile.avatar_url || "",
              verified: creatorProfile.is_verified || false
            }
          } as Challenge;
        });
      }

      // Map submissions to frontend-compatible format
      const userIds: string[] = [];
      submissions.forEach((sub: any) => {
        if (!userIds.includes(sub.user_id)) {
          userIds.push(sub.user_id);
        }
      });
      
      let userProfiles: any[] | null = null;
      let userProfilesError: any = null;
      
      if (userIds.length > 0) {
        const result: any = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url, is_verified")
          .in("user_id", userIds);
        userProfiles = result.data;
        userProfilesError = result.error;
      }

      if (userProfilesError) {
        console.error('Error fetching user profiles:', userProfilesError);
      }

      const mappedSubmissions = submissions.map((submission: any) => {
        const userProfile = userProfiles?.find((p: any) => p.user_id === submission.user_id) || {
          user_id: submission.user_id,
          username: "",
          full_name: "",
          avatar_url: "",
          is_verified: false
        };

        return {
          ...submission,
          user: {
            id: userProfile.user_id,
            username: userProfile.username || "",
            displayName: userProfile.full_name || "",
            avatar: userProfile.avatar_url || "",
            verified: userProfile.is_verified || false
          }
        } as ChallengeSubmission;
      });

      // Combine submissions and challenges
      return mappedSubmissions.map((submission: any) => ({
        submission,
        challenge: mappedChallenges[submission.challenge_id] || {}
      }));
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw new Error('Failed to fetch user challenges');
    }
  }

  async updateChallenge(id: string, updates: Partial<CreateChallengeData>): Promise<Challenge> {
    try {
      const { data, error } = await supabase
        .from("duet_challenges")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('Error updating challenge:', error);
        throw new Error(error.message || 'Failed to update challenge');
      }

      // Fetch creator profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, is_verified")
        .eq("user_id", data.created_by)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const creatorProfile = profile || {
        user_id: data.created_by,
        username: "",
        full_name: "",
        avatar_url: "",
        is_verified: false
      };

      return {
        ...data,
        createdBy: {
          id: creatorProfile.user_id,
          username: creatorProfile.username || "",
          displayName: creatorProfile.full_name || "",
          avatar: creatorProfile.avatar_url || "",
          verified: creatorProfile.is_verified || false
        }
      } as Challenge;
    } catch (error: any) {
      console.error('Error updating challenge:', error);
      throw new Error(error.message || 'Failed to update challenge');
    }
  }

  async deleteChallenge(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("duet_challenges")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('Error deleting challenge:', error);
        throw new Error(error.message || 'Failed to delete challenge');
      }
    } catch (error: any) {
      console.error('Error deleting challenge:', error);
      throw new Error(error.message || 'Failed to delete challenge');
    }
  }

  // Utility methods
  getTimeRemaining(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  }

  getTotalPrizePool(challenge: Challenge): number {
    return challenge.first_prize + challenge.second_prize + challenge.third_prize;
  }

  getEstimatedTotalCost(challenge: Challenge, estimatedParticipants: number = 50): number {
    return this.getTotalPrizePool(challenge) + (challenge.participation_reward * estimatedParticipants);
  }

  isActive(challenge: Challenge): boolean {
    const now = new Date();
    return challenge.status === 'active' && 
           now >= new Date(challenge.start_date) && 
           now <= new Date(challenge.end_date);
  }

  canSubmit(challenge: Challenge): boolean {
    return this.isActive(challenge);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'green';
      case 'ended':
        return 'gray';
      case 'draft':
        return 'yellow';
      case 'archived':
        return 'red';
      default:
        return 'gray';
    }
  }

  // Challenge validation
  validateChallengeData(data: CreateChallengeData): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (!data.description?.trim()) {
      errors.push('Description is required');
    }

    if (!data.hashtag?.trim()) {
      errors.push('Hashtag is required');
    } else if (!/^[a-zA-Z0-9]+$/.test(data.hashtag)) {
      errors.push('Hashtag can only contain letters and numbers');
    }

    if (!data.original_post_id?.trim()) {
      errors.push('Original post ID is required');
    }

    if (!data.start_date || !data.end_date) {
      errors.push('Start and end dates are required');
    } else {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const now = new Date();

      if (start <= now) {
        errors.push('Start date must be in the future');
      }

      if (end <= start) {
        errors.push('End date must be after start date');
      }

      const duration = end.getTime() - start.getTime();
      const minDuration = 24 * 60 * 60 * 1000; // 1 day
      const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (duration < minDuration) {
        errors.push('Challenge must run for at least 1 day');
      }

      if (duration > maxDuration) {
        errors.push('Challenge cannot run for more than 30 days');
      }
    }

    if (data.first_prize <= 0 || data.second_prize <= 0 || data.third_prize <= 0) {
      errors.push('All prizes must be greater than 0');
    }

    if (data.first_prize <= data.second_prize || data.second_prize <= data.third_prize) {
      errors.push('First prize must be greater than second, and second greater than third');
    }

    if (data.participation_reward < 0) {
      errors.push('Participation reward cannot be negative');
    }

    if (!data.rules?.trim()) {
      errors.push('Rules are required');
    }

    return errors;
  }

  // Generate challenge suggestions
  generateHashtagSuggestion(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/\s/g, '');
  }

  generatePrizeSuggestions(totalBudget: number): {
    firstPrize: number;
    secondPrize: number;
    thirdPrize: number;
    participationReward: number;
  } {
    // Allocate 60% to winners, 40% to participation rewards (estimated 50 participants)
    const winnersBudget = Math.floor(totalBudget * 0.6);
    const participationBudget = Math.floor(totalBudget * 0.4);
    
    return {
      firstPrize: Math.floor(winnersBudget * 0.5),
      secondPrize: Math.floor(winnersBudget * 0.3),
      thirdPrize: Math.floor(winnersBudget * 0.2),
      participationReward: Math.floor(participationBudget / 50) // Estimated 50 participants
    };
  }
}

export const challengesService = new ChallengesService();
export default challengesService;
// @ts-nocheck
import { api } from '../lib/api';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  originalPostId: string;
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'ended' | 'archived';
  isSponsored: boolean;
  isFeatured: boolean;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  participationReward: number;
  totalSubmissions: number;
  totalViews: number;
  totalLikes: number;
  bannerUrl?: string;
  rules: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  postId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  score: number;
  ranking: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: 'submitted' | 'qualified' | 'winner' | 'disqualified';
  rewardEarned: number;
  submittedAt: Date;
}

export interface CreateChallengeData {
  title: string;
  description: string;
  hashtag: string;
  originalPostId: string;
  startDate: string;
  endDate: string;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  participationReward: number;
  bannerUrl?: string;
  rules: string;
  tags: string[];
  isSponsored: boolean;
  isFeatured: boolean;
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
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/challenges?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw new Error('Failed to fetch challenges');
    }
  }

  async getChallengeById(id: string): Promise<Challenge & { submissions: ChallengeSubmission[] }> {
    try {
      const response = await api.get(`/challenges/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw new Error('Failed to fetch challenge');
    }
  }

  async createChallenge(challengeData: CreateChallengeData): Promise<Challenge> {
    try {
      const response = await api.post('/challenges', challengeData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      throw new Error(error.response?.data?.error || 'Failed to create challenge');
    }
  }

  async submitToChallenge(challengeId: string, postId: string): Promise<ChallengeSubmission> {
    try {
      const response = await api.post(`/challenges/${challengeId}/submit`, { postId });
      return response.data.data;
    } catch (error: any) {
      console.error('Error submitting to challenge:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit to challenge');
    }
  }

  async getChallengeLeaderboard(challengeId: string, limit: number = 50): Promise<ChallengeSubmission[]> {
    try {
      const response = await api.get(`/challenges/${challengeId}/leaderboard?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  }

  async getUserChallenges(): Promise<Array<{
    submission: ChallengeSubmission;
    challenge: Partial<Challenge>;
  }>> {
    try {
      const response = await api.get('/user/challenges');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw new Error('Failed to fetch user challenges');
    }
  }

  async updateChallenge(id: string, updates: Partial<CreateChallengeData>): Promise<Challenge> {
    try {
      const response = await api.put(`/challenges/${id}`, updates);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating challenge:', error);
      throw new Error(error.response?.data?.error || 'Failed to update challenge');
    }
  }

  async deleteChallenge(id: string): Promise<void> {
    try {
      await api.delete(`/challenges/${id}`);
    } catch (error: any) {
      console.error('Error deleting challenge:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete challenge');
    }
  }

  // Utility methods
  getTimeRemaining(endDate: Date): string {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  }

  getTotalPrizePool(challenge: Challenge): number {
    return challenge.firstPrize + challenge.secondPrize + challenge.thirdPrize;
  }

  getEstimatedTotalCost(challenge: Challenge, estimatedParticipants: number = 50): number {
    return this.getTotalPrizePool(challenge) + (challenge.participationReward * estimatedParticipants);
  }

  isActive(challenge: Challenge): boolean {
    const now = new Date();
    return challenge.status === 'active' && 
           now >= new Date(challenge.startDate) && 
           now <= new Date(challenge.endDate);
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

    if (!data.originalPostId?.trim()) {
      errors.push('Original post ID is required');
    }

    if (!data.startDate || !data.endDate) {
      errors.push('Start and end dates are required');
    } else {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
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

    if (data.firstPrize <= 0 || data.secondPrize <= 0 || data.thirdPrize <= 0) {
      errors.push('All prizes must be greater than 0');
    }

    if (data.firstPrize <= data.secondPrize || data.secondPrize <= data.thirdPrize) {
      errors.push('First prize must be greater than second, and second greater than third');
    }

    if (data.participationReward < 0) {
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

import { supabase } from "@/integrations/supabase/client";
import type { 
  GroupContribution, 
  GroupContributor, 
  GroupVote, 
  GroupVoteResponse,
  ContributionPayout,
  CreateGroupContributionRequest,
  CreateGroupVoteRequest,
  ContributeToGroupRequest,
  GroupContributionWithDetails,
  GroupVoteWithDetails
} from "@/types/group-contributions";
import { NotificationService } from "./notificationService";
import { walletService } from "./walletService";
import { Database } from "@/integrations/supabase/types";

export class GroupContributionService {
  // Create a new group contribution
  static async createContribution(request: CreateGroupContributionRequest, userId: string): Promise<GroupContribution | null> {
    try {
      // Calculate end date based on duration
      let endDate: string | null = null;
      if (request.duration_value && request.duration_unit) {
        const now = new Date();
        switch (request.duration_unit) {
          case 'days':
            now.setDate(now.getDate() + request.duration_value);
            break;
          case 'weeks':
            now.setDate(now.getDate() + (request.duration_value * 7));
            break;
          case 'months':
            now.setMonth(now.getMonth() + request.duration_value);
            break;
        }
        endDate = now.toISOString();
      }

      const { data, error } = await supabase
        .from('group_contributions')
        .insert({
          group_id: request.group_id,
          title: request.title,
          description: request.description,
          type: request.type,
          target_amount: request.target_amount,
          currency: request.currency || 'ELOITY',
          end_date: endDate,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to group members
      await NotificationService.sendGroupNotification(
        request.group_id,
        "New Group Contribution",
        `A new contribution "${request.title}" has been started in the group.`,
        "info",
        data.id
      );

      return data;
    } catch (error) {
      console.error('Error creating group contribution:', error);
      return null;
    }
  }

  // Get all contributions for a group
  static async getGroupContributions(groupId: string): Promise<GroupContributionWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('group_contributions')
        .select(`
          *,
          groups (name),
          profiles (full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((contribution: any) => ({
        ...contribution,
        group_name: contribution.groups?.name || 'Unknown Group',
        created_by_name: contribution.profiles?.full_name || 'Unknown User',
        created_by_avatar: contribution.profiles?.avatar_url || ''
      }));
    } catch (error) {
      console.error('Error fetching group contributions:', error);
      return [];
    }
  }

  // Get a specific contribution with details
  static async getContributionById(contributionId: string): Promise<GroupContributionWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('group_contributions')
        .select(`
          *,
          groups (name),
          profiles (full_name, avatar_url),
          group_contributors (*, profiles:profile/user_id (full_name, avatar_url))
        `)
        .eq('id', contributionId)
        .single();

      if (error) throw error;

      // Process contributors to include user details
      const contributorsWithUsers = data.group_contributors?.map((contributor: any) => ({
        ...contributor,
        user: contributor.profiles || null
      })) || [];

      return {
        ...data,
        group_name: data.groups?.name || 'Unknown Group',
        created_by_name: data.profiles?.full_name || 'Unknown User',
        created_by_avatar: data.profiles?.avatar_url || '',
        contributors: contributorsWithUsers
      };
    } catch (error) {
      console.error('Error fetching contribution:', error);
      return null;
    }
  }

  // Contribute to a group contribution
  static async contributeToGroup(request: ContributeToGroupRequest, userId: string): Promise<GroupContributor | null> {
    try {
      const { data, error } = await supabase
        .from('group_contributors')
        .insert({
          contribution_id: request.contribution_id,
          user_id: userId,
          amount: request.amount,
          currency: request.currency || 'ELOITY'
        })
        .select()
        .single();

      if (error) throw error;

      // If payment method is wallet, transfer funds after recording the contribution
      let walletTxId: string | null = null;
      
      if (request.payment_method === 'wallet') {
        // Get contribution details to identify the recipient
        const contribution = await this.getContributionById(request.contribution_id);
        if (!contribution) {
          throw new Error('Contribution not found');
        }
        
        // Transfer funds from contributor to contribution creator
        const transferResult = await walletService.sendMoney({
          recipientId: contribution.created_by,
          amount: request.amount.toString(),
          currency: request.currency || 'ELOITY',
          description: `Contribution to "${contribution.title}"`
        });
        
        if (!transferResult.success) {
          throw new Error('Wallet transfer failed');
        }
        
        walletTxId = transferResult.transactionId;
        
        // Update the contribution record with the wallet transaction ID
        const { error: updateError } = await supabase
          .from('group_contributors')
          .update({ wallet_tx_id: walletTxId })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Failed to update contribution with wallet transaction ID:', updateError);
          // Don't throw here as the transfer was successful, we just couldn't record the ID
        }
      }

      // Get contribution details for notification
      const contribution = await this.getContributionById(request.contribution_id);
      if (contribution) {
        // Send notification to contribution creator
        if (contribution.created_by !== userId) {
          await NotificationService.sendUserNotification(
            contribution.created_by,
            "New Contribution",
            `${contribution.created_by_name} contributed ${request.amount} ${request.currency || 'ELOITY'} to your contribution "${contribution.title}".`,
            "success",
            contribution.id
          );
        }

        // Send notification to contributor
        await NotificationService.sendUserNotification(
          userId,
          "Contribution Successful",
          `You've successfully contributed ${request.amount} ${request.currency || 'ELOITY'} to "${contribution.title}".`,
          "success",
          contribution.id
        );
      }

      return data;
    } catch (error) {
      console.error('Error contributing to group:', error);
      return null;
    }
  }

  // Get user's contributions to a specific contribution
  static async getUserContributions(contributionId: string, userId: string): Promise<GroupContributor[]> {
    try {
      const { data, error } = await supabase
        .from('group_contributors')
        .select('*')
        .eq('contribution_id', contributionId)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user contributions:', error);
      return [];
    }
  }

  // Create a new group vote
  static async createVote(request: CreateGroupVoteRequest, userId: string): Promise<GroupVote | null> {
    try {
      // Calculate end date based on duration
      let endDate: string | null = null;
      if (request.duration_value && request.duration_unit) {
        const now = new Date();
        switch (request.duration_unit) {
          case 'hours':
            now.setHours(now.getHours() + request.duration_value);
            break;
          case 'days':
            now.setDate(now.getDate() + request.duration_value);
            break;
          case 'weeks':
            now.setDate(now.getDate() + (request.duration_value * 7));
            break;
        }
        endDate = now.toISOString();
      }

      const { data, error } = await supabase
        .from('group_votes')
        .insert({
          group_id: request.group_id,
          topic: request.topic,
          description: request.description,
          options: request.options,
          end_date: endDate,
          required_percentage: request.required_percentage || 60,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to group members
      await NotificationService.sendGroupNotification(
        request.group_id,
        "New Group Vote",
        `A new vote "${request.topic}" has been started in the group.`,
        "info",
        data.id
      );

      return data;
    } catch (error) {
      console.error('Error creating group vote:', error);
      return null;
    }
  }

  // Get all votes for a group
  static async getGroupVotes(groupId: string): Promise<GroupVoteWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('group_votes')
        .select(`
          *,
          groups (name),
          profiles (full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get vote responses for each vote
      const votesWithDetails = await Promise.all(data.map(async (vote: any) => {
        const responses = await this.getVoteResponses(vote.id);
        const voteCounts = this.calculateVoteCounts(vote.options, responses);
        
        return {
          ...vote,
          responses,
          group_name: vote.groups?.name || 'Unknown Group',
          created_by_name: vote.profiles?.full_name || 'Unknown User',
          created_by_avatar: vote.profiles?.avatar_url || '',
          vote_counts: voteCounts,
          user_vote: null // This would be populated when checking individual user votes
        };
      }));

      return votesWithDetails;
    } catch (error) {
      console.error('Error fetching group votes:', error);
      return [];
    }
  }

  // Get responses for a specific vote
  static async getVoteResponses(voteId: string): Promise<GroupVoteResponse[]> {
    try {
      const { data, error } = await supabase
        .from('group_vote_responses')
        .select('*')
        .eq('vote_id', voteId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vote responses:', error);
      return [];
    }
  }

  // Calculate vote counts for each option
  static calculateVoteCounts(options: string[], responses: GroupVoteResponse[]): Record<string, number> {
    const counts: Record<string, number> = {};
    options.forEach(option => {
      counts[option] = 0;
    });

    responses.forEach(response => {
      if (counts[response.choice] !== undefined) {
        counts[response.choice]++;
      }
    });

    return counts;
  }

  // Submit a vote response
  static async submitVoteResponse(voteId: string, userId: string, choice: string): Promise<GroupVoteResponse | null> {
    try {
      // Check if user has already voted
      const existingResponse = await this.getUserVoteResponse(voteId, userId);
      if (existingResponse) {
        // Update existing vote
        const { data, error } = await supabase
          .from('group_vote_responses')
          .update({ choice, timestamp: new Date().toISOString() })
          .eq('id', existingResponse.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from('group_vote_responses')
          .insert({
            vote_id: voteId,
            user_id: userId,
            choice
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error submitting vote response:', error);
      return null;
    }
  }

  // Get user's vote response for a specific vote
  static async getUserVoteResponse(voteId: string, userId: string): Promise<GroupVoteResponse | null> {
    try {
      const { data, error } = await supabase
        .from('group_vote_responses')
        .select('*')
        .eq('vote_id', voteId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user vote response:', error);
      return null;
    }
  }

  // Get vote results with user's vote
  static async getVoteWithUserResponse(voteId: string, userId: string): Promise<GroupVoteWithDetails | null> {
    try {
      const { data: vote, error: voteError } = await supabase
        .from('group_votes')
        .select(`
          *,
          groups (name),
          profiles (full_name, avatar_url)
        `)
        .eq('id', voteId)
        .single();

      if (voteError) throw voteError;

      const responses = await this.getVoteResponses(voteId);
      const voteCounts = this.calculateVoteCounts(vote.options, responses);
      const userVote = await this.getUserVoteResponse(voteId, userId);

      return {
        ...vote,
        responses,
        group_name: vote.groups?.name || 'Unknown Group',
        created_by_name: vote.profiles?.full_name || 'Unknown User',
        created_by_avatar: vote.profiles?.avatar_url || '',
        vote_counts: voteCounts,
        user_vote: userVote?.choice || null
      };
    } catch (error) {
      console.error('Error fetching vote with user response:', error);
      return null;
    }
  }

  // Get payout information for a contribution
  static async getContributionPayout(contributionId: string): Promise<ContributionPayout | null> {
    try {
      const { data, error } = await supabase
        .from('contribution_payouts')
        .select('*')
        .eq('contribution_id', contributionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching contribution payout:', error);
      return null;
    }
  }

  // Manually trigger payout for a contribution (admin only)
  static async triggerPayout(contributionId: string): Promise<boolean> {
    try {
      // Get the contribution details
      const contribution = await this.getContributionById(contributionId);
      if (!contribution) {
        throw new Error('Contribution not found');
      }

      // Check if contribution has ended
      if (!this.isContributionEnded(contribution) && contribution.status === 'active') {
        throw new Error('Contribution is still active');
      }

      // Check if payout already exists
      const existingPayout = await this.getContributionPayout(contributionId);
      if (existingPayout) {
        throw new Error('Payout already exists for this contribution');
      }

      // Compute fees
      const total = Number(contribution.total_contributed || 0);
      const platformFeePercent = Number(contribution.platform_fee || 2.5);
      const platformFee = (total * platformFeePercent) / 100;
      const net = total - platformFee;

      // Create payout record
      const { error: insertError } = await supabase
        .from('contribution_payouts')
        .insert({
          contribution_id: contributionId,
          total_amount: total,
          platform_fee: platformFee,
          net_amount: net,
          status: 'processing'
        });

      if (insertError) throw insertError;

      // Update contribution status
      const { error: updateError } = await supabase
        .from('group_contributions')
        .update({ status: 'payout_pending', updated_at: new Date().toISOString() })
        .eq('id', contributionId);

      if (updateError) throw updateError;

      // Send notification to group members
      await NotificationService.sendGroupNotification(
        contribution.group_id,
        "Contribution Payout Processing",
        `The contribution "${contribution.title}" has been closed and payout is being processed.`,
        "info",
        contributionId
      );

      return true;
    } catch (error) {
      console.error('Error triggering payout:', error);
      return false;
    }
  }

  // Check if a vote has ended
  static isVoteEnded(vote: GroupVote): boolean {
    if (!vote.end_date) return false;
    return new Date(vote.end_date) < new Date();
  }

  // Check if a contribution has ended
  static isContributionEnded(contribution: GroupContribution): boolean {
    if (!contribution.end_date) return false;
    return new Date(contribution.end_date) < new Date();
  }

  // Calculate if a vote has passed based on required percentage
  static hasVotePassed(vote: GroupVote, voteCounts: Record<string, number>): boolean {
    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return false;

    // Find the option with the most votes
    const maxVotes = Math.max(...Object.values(voteCounts));
    const winningOption = Object.keys(voteCounts).find(option => voteCounts[option] === maxVotes);
    
    if (!winningOption) return false;

    // Check if it meets the required percentage
    const percentage = (maxVotes / totalVotes) * 100;
    return percentage >= vote.required_percentage;
  }
}
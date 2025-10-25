export interface GroupContribution {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  type: 'fixed' | 'custom';
  target_amount: number | null;
  total_contributed: number;
  currency: string;
  duration: string | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'payout_pending';
  escrow_wallet_id: string | null;
  platform_fee: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupContributor {
  id: string;
  contribution_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_ref: string | null;
  wallet_tx_id: string | null;
  contributed_at: string;
  refunded: boolean;
  refunded_at: string | null;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ContributionPayout {
  id: string;
  contribution_id: string;
  total_amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface GroupVote {
  id: string;
  group_id: string;
  topic: string;
  description: string | null;
  options: string[];
  start_date: string;
  end_date: string | null;
  required_percentage: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupVoteResponse {
  id: string;
  vote_id: string;
  user_id: string;
  choice: string;
  timestamp: string;
}

export interface GroupContributionWithDetails extends GroupContribution {
  contributors: GroupContributor[];
  group_name: string;
  created_by_name: string;
  created_by_avatar: string;
}

export interface GroupVoteWithDetails extends GroupVote {
  responses: GroupVoteResponse[];
  group_name: string;
  created_by_name: string;
  created_by_avatar: string;
  vote_counts: Record<string, number>;
  user_vote: string | null;
}

export interface CreateGroupContributionRequest {
  group_id: string;
  title: string;
  description?: string;
  type: 'fixed' | 'custom';
  target_amount?: number;
  currency?: string;
  duration_value?: number;
  duration_unit?: 'days' | 'weeks' | 'months';
}

export interface CreateGroupVoteRequest {
  group_id: string;
  topic: string;
  description?: string;
  options: string[];
  duration_value?: number;
  duration_unit?: 'hours' | 'days' | 'weeks';
  required_percentage?: number;
}

export interface ContributeToGroupRequest {
  contribution_id: string;
  amount: number;
  currency?: string;
  payment_method?: 'wallet' | 'flutterwave' | 'bybit';
}
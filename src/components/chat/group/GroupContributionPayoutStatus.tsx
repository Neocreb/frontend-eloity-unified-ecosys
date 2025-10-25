import React, { useEffect, useState } from 'react';
import { GroupContributionService } from '@/services/groupContributionService';
import type { ContributionPayout } from '@/types/group-contributions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

interface GroupContributionPayoutStatusProps {
  contributionId: string;
}

const GroupContributionPayoutStatus: React.FC<GroupContributionPayoutStatusProps> = ({ 
  contributionId 
}) => {
  const [payout, setPayout] = useState<ContributionPayout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const payoutData = await GroupContributionService.getContributionPayout(contributionId);
        setPayout(payoutData);
      } catch (error) {
        console.error('Error fetching payout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayout();
  }, [contributionId]);

  if (loading) {
    return <div className="text-center py-4">Loading payout information...</div>;
  }

  if (!payout) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Payout Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-medium">{formatCurrency(payout.total_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Platform Fee</p>
            <p className="font-medium">{formatCurrency(payout.platform_fee)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Amount</p>
            <p className="font-medium">{formatCurrency(payout.net_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div>{getStatusBadge(payout.status)}</div>
          </div>
        </div>
        
        {payout.processed_at && (
          <div>
            <p className="text-sm text-muted-foreground">Processed At</p>
            <p className="font-medium">{new Date(payout.processed_at).toLocaleString()}</p>
          </div>
        )}
        
        {payout.metadata?.error && (
          <div className="bg-destructive/10 p-3 rounded-md">
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-sm">{payout.metadata.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupContributionPayoutStatus;
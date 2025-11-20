import React, { useState, useEffect } from 'react';
import { Coins, Wallet, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GroupContributionService } from '@/services/groupContributionService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { GroupContributionWithDetails } from '@/types/group-contributions';

export const ContributeToGroup: React.FC = () => {
  const { contributionId } = useParams<{ contributionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [contribution, setContribution] = useState<GroupContributionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'flutterwave' | 'bybit'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load contribution details
  useEffect(() => {
    const loadContribution = async () => {
      if (!contributionId) {
        toast({
          title: 'Error',
          description: 'Contribution ID is required',
          variant: 'destructive',
        });
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const data = await GroupContributionService.getContributionById(contributionId);
        if (data) {
          setContribution(data);
          setCurrency(data.currency);
        } else {
          throw new Error('Contribution not found');
        }
      } catch (error) {
        console.error('Failed to load contribution:', error);
        toast({
          title: 'Error',
          description: 'Failed to load contribution details',
          variant: 'destructive',
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadContribution();
  }, [contributionId]);

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === 'ELOITY') {
      return `${amount.toFixed(2)} ELOITY`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to contribute',
        variant: 'destructive',
      });
      return;
    }

    if (!contribution) {
      toast({
        title: 'Error',
        description: 'Contribution data is missing',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid contribution amount',
        variant: 'destructive',
      });
      return;
    }

    // Check if amount exceeds target for fixed contributions
    if (contribution.type === 'fixed' && contribution.target_amount) {
      const remaining = contribution.target_amount - contribution.total_contributed;
      if (amount > remaining) {
        toast({
          title: 'Amount Too High',
          description: `You can only contribute up to ${formatCurrency(remaining, currency)}`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await GroupContributionService.contributeToGroup(
        {
          contribution_id: contribution.id,
          amount,
          currency,
          payment_method: paymentMethod,
        },
        user.id
      );

      if (result) {
        toast({
          title: 'Contribution Successful',
          description: `You've successfully contributed ${formatCurrency(amount, currency)}!`,
        });

        navigate(-1);
      } else {
        throw new Error('Failed to process contribution');
      }
    } catch (error) {
      console.error('Error contributing:', error);
      toast({
        title: 'Error',
        description: 'Failed to process contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b p-4 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading contribution details...</p>
        </div>
      </div>
    );
  }

  if (!contribution) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b p-4 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Contribution not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Contribute
            </h1>
            <p className="text-xs text-muted-foreground">{contribution.title}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value) || undefined)}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                  className="flex-1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELOITY">ELOITY</SelectItem>
                    <SelectItem value="NGN">Naira (₦)</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: 'wallet' | 'flutterwave' | 'bybit') =>
                  setPaymentMethod(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Eloity Wallet
                    </div>
                  </SelectItem>
                  <SelectItem value="flutterwave">Flutterwave</SelectItem>
                  <SelectItem value="bybit">Bybit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Contribution Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-medium">
                    {formatCurrency(contribution.total_contributed, contribution.currency)}
                  </span>
                </div>
                {contribution.target_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">
                      {formatCurrency(contribution.target_amount, contribution.currency)}
                    </span>
                  </div>
                )}
                {contribution.type === 'fixed' && contribution.target_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        contribution.target_amount - contribution.total_contributed,
                        contribution.currency
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Contribute'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContributeToGroup;

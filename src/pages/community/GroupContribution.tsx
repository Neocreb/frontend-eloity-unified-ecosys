import React, { useState } from 'react';
import { Coins, Calendar, Hash, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GroupContributionService } from '@/services/groupContributionService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

export const GroupContribution: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'fixed' | 'custom'>('fixed');
  const [targetAmount, setTargetAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('ELOITY');
  const [durationValue, setDurationValue] = useState<number>(7);
  const [durationUnit, setDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupId) {
      toast({
        title: 'Error',
        description: 'Group ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to start a contribution',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your contribution',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'fixed' && (!targetAmount || targetAmount <= 0)) {
      toast({
        title: 'Target Amount Required',
        description: 'Please enter a valid target amount for fixed contributions',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await GroupContributionService.createContribution(
        {
          group_id: groupId,
          title,
          description,
          type,
          target_amount: targetAmount,
          currency,
          duration_value: durationValue,
          duration_unit: durationUnit,
        },
        user.id
      );

      if (result) {
        toast({
          title: 'Contribution Created',
          description: 'Your group contribution has been successfully created!',
        });

        navigate(-1);
      } else {
        throw new Error('Failed to create contribution');
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Start Contribution
            </h1>
            <p className="text-xs text-muted-foreground">Create a new group contribution</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-md mx-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Birthday Gift, Investment Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this contribution..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Contribution Type</Label>
              <Select value={type} onValueChange={(value: 'fixed' | 'custom') => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount (same for all members)</SelectItem>
                  <SelectItem value="custom">Custom Amount (each member contributes what they can)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'fixed' && (
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="targetAmount"
                    type="number"
                    value={targetAmount || ''}
                    onChange={(e) => setTargetAmount(Number(e.target.value) || undefined)}
                    placeholder="Enter target amount"
                    min="1"
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
            )}

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <Input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value) || 1)}
                    min="1"
                    className="flex-1"
                  />
                </div>
                <Select value={durationUnit} onValueChange={(value: 'days' | 'weeks' | 'months') => setDurationUnit(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
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
                {isSubmitting ? 'Creating...' : 'Create Contribution'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupContribution;

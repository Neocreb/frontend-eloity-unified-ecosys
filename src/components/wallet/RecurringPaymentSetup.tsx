import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRecurringPayments } from '@/hooks/useRecurringPayments';
import { RecurringPaymentSetup as IRecurringPaymentSetup } from '@/services/recurringPaymentService';

interface RecurringPaymentSetupProps {
  serviceId: string;
  serviceLabel: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

export const RecurringPaymentSetup: React.FC<RecurringPaymentSetupProps> = ({
  serviceId,
  serviceLabel,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { create, isLoading } = useRecurringPayments();

  const [formData, setFormData] = useState<IRecurringPaymentSetup>({
    serviceId,
    description: `Recurring ${serviceLabel}`,
    amount: 0,
    currency: 'USD',
    frequency: 'monthly',
    isAutoRenew: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState<string>('1');

  const handleInputChange = (field: keyof IRecurringPaymentSetup, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const setup: IRecurringPaymentSetup = {
        ...formData,
        dayOfMonth: formData.frequency === 'monthly' ? parseInt(dayOfMonth) : undefined,
      };

      const result = await create(setup);

      if (result) {
        toast({
          title: 'Success',
          description: `Recurring ${serviceLabel} payment set up successfully`,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to set up recurring payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set Up Auto-Pay</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Monthly electricity bill"
              className="mt-1"
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                placeholder="0.00"
                className="flex-1"
              />
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day of Month (for monthly/quarterly/annually) */}
          {['monthly', 'quarterly', 'annually'].includes(formData.frequency) && (
            <div>
              <Label htmlFor="dayOfMonth">Day of Month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auto-Renew */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="autoRenew"
              checked={formData.isAutoRenew}
              onChange={(e) => handleInputChange('isAutoRenew', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="autoRenew" className="cursor-pointer">
              Auto-renew payment
            </Label>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>First Payment:</strong> Your first payment will be processed on the date you specify. Subsequent payments will follow the selected frequency.
            </p>
          </div>

          {/* Error */}
          {/* TODO: Display error message if any */}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || isLoading}
              className="flex-1"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Up Auto-Pay
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RecurringPaymentSetup;

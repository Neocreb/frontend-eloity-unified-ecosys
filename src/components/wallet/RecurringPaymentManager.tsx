import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecurringPayments } from '@/hooks/useRecurringPayments';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Repeat, Pause, Play, Trash2, Calendar, DollarSign, Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const RecurringPaymentManager: React.FC = () => {
  const { toast } = useToast();
  const { payments, isLoading, pause, resume, cancel, refresh } = useRecurringPayments();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePause = async (id: string) => {
    try {
      setActionLoading(true);
      const success = await pause(id);
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment paused',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (id: string) => {
    try {
      setActionLoading(true);
      const success = await resume(id);
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment resumed',
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      setActionLoading(true);
      const success = await cancel(id);
      if (success) {
        toast({
          title: 'Success',
          description: 'Payment cancelled',
        });
        setShowCancelDialog(false);
        setSelectedPaymentId(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recurring Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Repeat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recurring payments</p>
            <p className="text-sm text-gray-500 mt-1">Set up auto-pay for your favorite services</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              {/* Icon */}
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Repeat className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{payment.description}</h3>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {payment.amount.toFixed(2)} {payment.currency}
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    {getFrequencyLabel(payment.frequency)}
                  </div>
                </div>

                {payment.nextPaymentDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Calendar className="h-3 w-3" />
                    Next: {format(new Date(payment.nextPaymentDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2">
                {payment.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePause(payment.id)}
                    disabled={actionLoading}
                    className="h-8 px-2"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : payment.status === 'paused' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResume(payment.id)}
                    disabled={actionLoading}
                    className="h-8 px-2"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Recurring Payment?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to cancel the recurring payment for <strong>{payment.description}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter>
                      <Button variant="outline">Keep</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancel(payment.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Payment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            Payments will be automatically processed on the scheduled dates. You can pause or cancel anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecurringPaymentManager;

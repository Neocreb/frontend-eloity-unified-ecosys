import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  recurringPaymentService, 
  RecurringPayment, 
  RecurringPaymentSetup,
  RecurringPaymentHistory 
} from '@/services/recurringPaymentService';

interface UseRecurringPaymentsReturn {
  payments: RecurringPayment[];
  activePayments: RecurringPayment[];
  isLoading: boolean;
  error: string | null;
  create: (setup: RecurringPaymentSetup) => Promise<RecurringPayment | null>;
  update: (id: string, updates: Partial<RecurringPaymentSetup>) => Promise<boolean>;
  pause: (id: string) => Promise<boolean>;
  resume: (id: string) => Promise<boolean>;
  cancel: (id: string) => Promise<boolean>;
  getHistory: (recurringPaymentId: string) => Promise<RecurringPaymentHistory[]>;
  refresh: () => Promise<void>;
}

export const useRecurringPayments = (): UseRecurringPaymentsReturn => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [activePayments, setActivePayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadPayments();
    }
  }, [user?.id]);

  const loadPayments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const [allPayments, active] = await Promise.all([
        recurringPaymentService.getRecurringPayments(user.id),
        recurringPaymentService.getActiveRecurringPayments(user.id),
      ]);
      setPayments(allPayments);
      setActivePayments(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      console.error('Error loading payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const create = useCallback(async (setup: RecurringPaymentSetup): Promise<RecurringPayment | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      const result = await recurringPaymentService.createRecurringPayment(user.id, setup);
      if (result) {
        await loadPayments();
        return result;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return null;
    }
  }, [user?.id, loadPayments]);

  const update = useCallback(async (id: string, updates: Partial<RecurringPaymentSetup>): Promise<boolean> => {
    try {
      setError(null);
      const result = await recurringPaymentService.updateRecurringPayment(id, updates);
      if (result) {
        await loadPayments();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      return false;
    }
  }, [loadPayments]);

  const pause = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await recurringPaymentService.pauseRecurringPayment(id);
      if (result) {
        await loadPayments();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause payment');
      return false;
    }
  }, [loadPayments]);

  const resume = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await recurringPaymentService.resumeRecurringPayment(id);
      if (result) {
        await loadPayments();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume payment');
      return false;
    }
  }, [loadPayments]);

  const cancel = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await recurringPaymentService.cancelRecurringPayment(id);
      if (result) {
        await loadPayments();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payment');
      return false;
    }
  }, [loadPayments]);

  const getHistory = useCallback(async (recurringPaymentId: string): Promise<RecurringPaymentHistory[]> => {
    try {
      setError(null);
      return await recurringPaymentService.getRecurringPaymentHistory(recurringPaymentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
      return [];
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPayments();
  }, [loadPayments]);

  return {
    payments,
    activePayments,
    isLoading,
    error,
    create,
    update,
    pause,
    resume,
    cancel,
    getHistory,
    refresh,
  };
};

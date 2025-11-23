// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface RecurringPayment {
  id: string;
  userId: string;
  serviceId: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'paused' | 'cancelled';
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextPaymentDate: string;
  lastPaymentDate?: string;
  maxPayments?: number;
  paymentsRemaining?: number;
  isAutoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringPaymentSetup {
  serviceId: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  dayOfMonth?: number;
  dayOfWeek?: number;
  maxPayments?: number;
  isAutoRenew: boolean;
}

export interface RecurringPaymentHistory {
  id: string;
  recurringPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentDate: string;
  failureReason?: string;
  createdAt: string;
}

class RecurringPaymentService {
  /**
   * Get all recurring payments for a user
   */
  async getRecurringPayments(userId: string): Promise<RecurringPayment[]> {
    try {
      const { data, error } = await supabase
        .from("recurring_payments")
        .select("*")
        .eq("user_id", userId)
        .order("next_payment_date", { ascending: true });

      if (error) throw error;
      return data?.map(this.mapFromDatabase) || [];
    } catch (error) {
      console.error("Error fetching recurring payments:", error);
      return [];
    }
  }

  /**
   * Get active recurring payments only
   */
  async getActiveRecurringPayments(userId: string): Promise<RecurringPayment[]> {
    try {
      const { data, error } = await supabase
        .from("recurring_payments")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("next_payment_date", { ascending: true });

      if (error) throw error;
      return data?.map(this.mapFromDatabase) || [];
    } catch (error) {
      console.error("Error fetching active recurring payments:", error);
      return [];
    }
  }

  /**
   * Get a single recurring payment by ID
   */
  async getRecurringPayment(id: string): Promise<RecurringPayment | null> {
    try {
      const { data, error } = await supabase
        .from("recurring_payments")
        .select("*")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      console.error("Error fetching recurring payment:", error);
      return null;
    }
  }

  /**
   * Create a new recurring payment
   */
  async createRecurringPayment(
    userId: string,
    setup: RecurringPaymentSetup
  ): Promise<RecurringPayment | null> {
    try {
      const nextPaymentDate = this.calculateNextPaymentDate(setup.frequency, setup.dayOfMonth, setup.dayOfWeek);

      const { data, error } = await supabase
        .from("recurring_payments")
        .insert({
          user_id: userId,
          service_id: setup.serviceId,
          description: setup.description,
          amount: setup.amount,
          currency: setup.currency,
          frequency: setup.frequency,
          day_of_month: setup.dayOfMonth,
          day_of_week: setup.dayOfWeek,
          status: 'active',
          next_payment_date: nextPaymentDate,
          max_payments: setup.maxPayments,
          is_auto_renew: setup.isAutoRenew,
        })
        .select()
        .single();

      if (error) throw error;
      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      console.error("Error creating recurring payment:", error);
      return null;
    }
  }

  /**
   * Update a recurring payment
   */
  async updateRecurringPayment(
    id: string,
    updates: Partial<RecurringPaymentSetup>
  ): Promise<RecurringPayment | null> {
    try {
      const updateData: any = {};
      
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
      if (updates.dayOfMonth !== undefined) updateData.day_of_month = updates.dayOfMonth;
      if (updates.dayOfWeek !== undefined) updateData.day_of_week = updates.dayOfWeek;
      if (updates.maxPayments !== undefined) updateData.max_payments = updates.maxPayments;
      if (updates.isAutoRenew !== undefined) updateData.is_auto_renew = updates.isAutoRenew;

      const { data, error } = await supabase
        .from("recurring_payments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.mapFromDatabase(data) : null;
    } catch (error) {
      console.error("Error updating recurring payment:", error);
      return null;
    }
  }

  /**
   * Pause a recurring payment
   */
  async pauseRecurringPayment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("recurring_payments")
        .update({ status: 'paused' })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error pausing recurring payment:", error);
      return false;
    }
  }

  /**
   * Resume a recurring payment
   */
  async resumeRecurringPayment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("recurring_payments")
        .update({ status: 'active' })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error resuming recurring payment:", error);
      return false;
    }
  }

  /**
   * Cancel a recurring payment
   */
  async cancelRecurringPayment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("recurring_payments")
        .update({ status: 'cancelled' })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error cancelling recurring payment:", error);
      return false;
    }
  }

  /**
   * Get history of a recurring payment
   */
  async getRecurringPaymentHistory(recurringPaymentId: string): Promise<RecurringPaymentHistory[]> {
    try {
      const { data, error } = await supabase
        .from("recurring_payment_history")
        .select("*")
        .eq("recurring_payment_id", recurringPaymentId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data?.map(h => ({
        id: h.id,
        recurringPaymentId: h.recurring_payment_id,
        amount: h.amount,
        currency: h.currency,
        status: h.status,
        paymentDate: h.payment_date,
        failureReason: h.failure_reason,
        createdAt: h.created_at,
      })) || [];
    } catch (error) {
      console.error("Error fetching payment history:", error);
      return [];
    }
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPaymentDate(
    frequency: string,
    dayOfMonth?: number,
    dayOfWeek?: number
  ): string {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
      case 'annually':
        next.setFullYear(next.getFullYear() + 1);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
    }

    return next.toISOString();
  }

  /**
   * Map database response to interface
   */
  private mapFromDatabase(data: any): RecurringPayment {
    return {
      id: data.id,
      userId: data.user_id,
      serviceId: data.service_id,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      frequency: data.frequency,
      status: data.status,
      dayOfMonth: data.day_of_month,
      dayOfWeek: data.day_of_week,
      nextPaymentDate: data.next_payment_date,
      lastPaymentDate: data.last_payment_date,
      maxPayments: data.max_payments,
      paymentsRemaining: data.payments_remaining,
      isAutoRenew: data.is_auto_renew,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const recurringPaymentService = new RecurringPaymentService();

import { fetchWithAuth } from '@/lib/api';

export interface PremiumPlan {
  id: string;
  name: string;
  tier: 'creator' | 'professional' | 'enterprise';
  priceMonthly: number;
  priceYearly: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  badges: string[];
  limits: {
    maxProducts?: number;
    maxJobs?: number;
    maxFreelanceServices?: number;
    maxCryptoTrades?: number;
    storageGB?: number;
    monthlyBandwidthGB?: number;
  };
  support: 'email' | 'priority' | 'vip';
  discount?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: PremiumPlan;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  badges: string[];
}

export interface SubscriptionCheckout {
  id: string;
  planId: string;
  priceId: string;
  url: string;
  expiresAt: string;
}

// Premium plans configuration
export const PREMIUM_PLANS: Record<string, PremiumPlan> = {
  creator: {
    id: 'plan_creator',
    name: 'Creator Plan',
    tier: 'creator',
    priceMonthly: 4.99,
    priceYearly: 49.99,
    billingCycle: 'monthly',
    description: 'Perfect for content creators and influencers',
    features: [
      'Ad-free experience for your profile',
      'Custom profile theme',
      'Priority in creator fund',
      'Creator monetization tools',
      'Advanced analytics',
      'Early access to new features'
    ],
    badges: ['freelance_badge'],
    limits: {
      maxProducts: 10,
      maxJobs: 5,
      maxFreelanceServices: 3,
      maxCryptoTrades: 50,
      storageGB: 50,
      monthlyBandwidthGB: 100
    },
    support: 'email',
    discount: 16 // 2 months free annually
  },
  professional: {
    id: 'plan_professional',
    name: 'Professional Plan',
    tier: 'professional',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    billingCycle: 'monthly',
    description: 'For serious sellers and service providers',
    features: [
      'Ad-free experience',
      'Unlimited products & services',
      'All Creator features',
      'E-commerce badge',
      'Advanced seller tools',
      'Dedicated seller support',
      'Custom store branding',
      'Marketing credits ($50/month)',
      'Priority customer support'
    ],
    badges: ['ecommerce_badge'],
    limits: {
      maxProducts: 999,
      maxJobs: 999,
      maxFreelanceServices: 999,
      maxCryptoTrades: 500,
      storageGB: 500,
      monthlyBandwidthGB: 1000
    },
    support: 'priority',
    discount: 16 // 2 months free annually
  },
  enterprise: {
    id: 'plan_enterprise',
    name: 'Enterprise Plan',
    tier: 'enterprise',
    priceMonthly: 19.99,
    priceYearly: 199.99,
    billingCycle: 'monthly',
    description: 'For high-volume traders and businesses',
    features: [
      'Everything in Professional',
      'Crypto verified badge',
      'Unlimited trading volume',
      'Advanced trading tools',
      'API access',
      'Bulk import/export',
      'Custom integrations',
      'VIP support 24/7',
      'Priority withdrawals',
      'Exclusive trading signals',
      'Monthly business review call',
      '$200/month marketing credits'
    ],
    badges: ['crypto_badge'],
    limits: {
      maxProducts: 9999,
      maxJobs: 9999,
      maxFreelanceServices: 9999,
      maxCryptoTrades: 5000,
      storageGB: 2000,
      monthlyBandwidthGB: 5000
    },
    support: 'vip',
    discount: 16 // 2 months free annually
  }
};

// Bundle discounts for purchasing multiple badges
export const BUNDLE_DISCOUNTS = {
  twoPlans: 0.1, // 10% off for 2 plans
  allThreePlans: 0.2 // 20% off for all 3 plans
};

export class PremiumSubscriptionService {
  private static apiBase = '/api';

  /**
   * Get all available premium plans
   */
  static async getPlans(): Promise<PremiumPlan[]> {
    try {
      return Object.values(PREMIUM_PLANS);
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Get a specific premium plan
   */
  static async getPlan(planId: string): Promise<PremiumPlan | null> {
    try {
      return PREMIUM_PLANS[planId] || null;
    } catch (error) {
      console.error('Error fetching plan:', error);
      return null;
    }
  }

  /**
   * Get current user's subscription status
   */
  static async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/subscriptions/current`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Initiate subscription checkout
   */
  static async initiateCheckout(
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<SubscriptionCheckout | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/subscriptions/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate checkout');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(reason?: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  /**
   * Update subscription plan
   */
  static async updateSubscription(
    planId: string,
    billingCycle?: 'monthly' | 'yearly'
  ): Promise<UserSubscription | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/subscriptions/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return null;
    }
  }

  /**
   * Get subscription invoices
   */
  static async getInvoices(): Promise<any[]> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/subscriptions/invoices`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  /**
   * Validate if user can access premium feature
   */
  static async checkFeatureAccess(featureName: string): Promise<boolean> {
    try {
      const subscription = await this.getCurrentSubscription();
      
      if (!subscription || subscription.status !== 'active') {
        return false;
      }

      // Check if plan includes this feature
      const plan = PREMIUM_PLANS[subscription.planId];
      if (!plan) return false;

      // Feature name should match badge or other plan features
      return plan.badges.includes(featureName) || plan.features.some(f => f.includes(featureName));
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Calculate discounted price for bundle
   */
  static calculateBundlePrice(selectedPlans: string[]): number {
    let totalPrice = 0;
    const yearlyCost = selectedPlans.reduce((sum, planId) => {
      const plan = PREMIUM_PLANS[planId];
      return sum + (plan?.priceYearly || 0);
    }, 0);

    let discount = 0;
    if (selectedPlans.length === 2) {
      discount = BUNDLE_DISCOUNTS.twoPlans;
    } else if (selectedPlans.length === 3) {
      discount = BUNDLE_DISCOUNTS.allThreePlans;
    }

    totalPrice = yearlyCost * (1 - discount);
    return parseFloat(totalPrice.toFixed(2));
  }

  /**
   * Get bundle recommendation
   */
  static getBundleRecommendation(userRole: 'creator' | 'seller' | 'trader' | 'all') {
    const recommendations: Record<string, string[]> = {
      creator: ['plan_creator'],
      seller: ['plan_professional'],
      trader: ['plan_enterprise'],
      all: ['plan_creator', 'plan_professional', 'plan_enterprise']
    };

    return recommendations[userRole] || [];
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    });
    return formatter.format(price);
  }

  /**
   * Calculate savings when paying yearly
   */
  static calculateYearlySavings(plan: PremiumPlan): string {
    const monthlyCost = plan.priceMonthly * 12;
    const yearlyCost = plan.priceYearly;
    const savings = monthlyCost - yearlyCost;
    const percentage = ((savings / monthlyCost) * 100).toFixed(0);
    return `Save ${percentage}% (${this.formatPrice(savings)}) when paying yearly`;
  }
}

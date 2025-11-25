import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../utils/db.js';
import { profiles } from '../../shared/enhanced-schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

// Stripe integration would go here in production
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const router = express.Router();

// Mock premium plans (in production, these would be synced with Stripe)
const PREMIUM_PLANS = {
  plan_creator: {
    name: 'Creator Plan',
    priceMonthly: 4.99,
    priceYearly: 49.99,
    stripePriceIdMonthly: 'price_creator_monthly',
    stripePriceIdYearly: 'price_creator_yearly'
  },
  plan_professional: {
    name: 'Professional Plan',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    stripePriceIdMonthly: 'price_professional_monthly',
    stripePriceIdYearly: 'price_professional_yearly'
  },
  plan_enterprise: {
    name: 'Enterprise Plan',
    priceMonthly: 19.99,
    priceYearly: 199.99,
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly'
  }
};

/**
 * GET /api/subscriptions/current
 * Get current user's subscription
 */
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = userProfile[0];

    // Check if user has premium subscription
    if (!profile.is_premium || profile.subscription_status !== 'active') {
      return res.status(404).json({ error: 'No active subscription' });
    }

    res.json({
      success: true,
      data: {
        id: `sub_${userId}`,
        userId,
        planId: profile.premium_tier,
        plan: PREMIUM_PLANS[profile.premium_tier as keyof typeof PREMIUM_PLANS],
        status: profile.subscription_status,
        startDate: profile.subscription_created_at,
        endDate: profile.subscription_expires_at,
        autoRenew: profile.subscription_auto_renew,
        badges: profile.badges || []
      }
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * POST /api/subscriptions/checkout
 * Initiate Stripe checkout session
 */
router.post('/checkout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { planId, billingCycle = 'monthly' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const plan = PREMIUM_PLANS[planId as keyof typeof PREMIUM_PLANS];
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // In production, create Stripe checkout session
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price: billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly,
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${process.env.APP_URL}/settings/subscription?success=true`,
    //   cancel_url: `${process.env.APP_URL}/settings/subscription?cancelled=true`,
    //   customer_email: userProfile.email,
    //   metadata: {
    //     userId,
    //     planId,
    //   }
    // });

    // For now, return mock checkout session
    const mockSessionId = `cs_${Date.now()}`;
    const mockCheckoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`;

    res.json({
      success: true,
      data: {
        id: mockSessionId,
        planId,
        priceId: billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly,
        url: mockCheckoutUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Cancel user's subscription
 */
router.post('/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, cancel Stripe subscription
    // Find user's stripe subscription and cancel it

    // Update user profile
    await db
      .update(profiles)
      .set({
        is_premium: false,
        premium_tier: 'free',
        subscription_status: 'cancelled',
        subscription_expires_at: new Date()
      })
      .where(eq(profiles.user_id, userId));

    logger.info(`Subscription cancelled for user ${userId}`, { reason });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/subscriptions/update
 * Upgrade or downgrade subscription
 */
router.post('/update', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { planId, billingCycle } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const plan = PREMIUM_PLANS[planId as keyof typeof PREMIUM_PLANS];
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // In production, update Stripe subscription
    // const subscription = await stripe.subscriptions.update(stripeSubId, {
    //   items: [{
    //     id: subscriptionItem.id,
    //     price: newPriceId,
    //   }],
    // });

    // Update user profile
    await db
      .update(profiles)
      .set({
        premium_tier: planId,
        subscription_status: 'active'
      })
      .where(eq(profiles.user_id, userId));

    logger.info(`Subscription updated for user ${userId} to plan ${planId}`);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        planId,
        plan: PREMIUM_PLANS[planId as keyof typeof PREMIUM_PLANS]
      }
    });
  } catch (error) {
    logger.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

/**
 * GET /api/subscriptions/invoices
 * Get user's subscription invoices
 */
router.get('/invoices', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, fetch from Stripe
    // const invoices = await stripe.invoices.list({
    //   customer: stripeCustomerId,
    //   limit: 10
    // });

    // For now, return empty list
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhook events (payment success, failed, etc)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    // In production, verify Stripe signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    // Handle different event types
    // switch (event.type) {
    //   case 'customer.subscription.updated':
    //   case 'invoice.paid':
    //   case 'invoice.payment_failed':
    //     // Update user subscription status
    //     break;
    // }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

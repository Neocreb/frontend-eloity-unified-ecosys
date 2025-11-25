import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Zap, Star, Crown, ArrowRight } from 'lucide-react';
import { PremiumSubscriptionService, PREMIUM_PLANS, type PremiumPlan, type UserSubscription } from '@/services/premiumSubscriptionService';
import { useToast } from '@/hooks/use-toast';

interface PremiumSubscriptionManagerProps {
  onSubscriptionUpdate?: (subscription: UserSubscription) => void;
}

export default function PremiumSubscriptionManager({
  onSubscriptionUpdate
}: PremiumSubscriptionManagerProps) {
  const { toast } = useToast();
  const [plans] = useState(Object.values(PREMIUM_PLANS));
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const subscription = await PremiumSubscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    setIsCheckingOut(true);
    try {
      const checkout = await PremiumSubscriptionService.initiateCheckout(planId, billingCycle);
      
      if (checkout?.url) {
        // Redirect to Stripe checkout
        window.location.href = checkout.url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initiate checkout',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process checkout',
        variant: 'destructive'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    try {
      const success = await PremiumSubscriptionService.cancelSubscription('User requested cancellation');
      
      if (success) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been cancelled'
        });
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive'
      });
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'creator':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'professional':
        return <Star className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading subscription information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Info */}
      {currentSubscription && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="ml-2">
            <div>
              <p className="font-semibold text-green-900">
                You're on the <strong>{currentSubscription.plan.name}</strong>
              </p>
              <p className="text-sm text-green-800 mt-1">
                {currentSubscription.status === 'active'
                  ? `Your subscription will renew on ${new Date(currentSubscription.endDate).toLocaleDateString()}`
                  : `Status: ${currentSubscription.status}`}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingCycle('yearly')}
              className={billingCycle === 'yearly' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Yearly Billing
              <Badge className="ml-2 bg-green-100 text-green-800">Save 16%</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const savings = PremiumSubscriptionService.calculateYearlySavings(plan);

          return (
            <Card
              key={plan.id}
              className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl text-xs font-semibold">
                  Current Plan
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.tier)}
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">{billingCycle === 'monthly' ? '/month' : '/year'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600">{savings}</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.features.length > 5 && (
                    <p className="text-sm text-gray-500 ml-6">
                      +{plan.features.length - 5} more features
                    </p>
                  )}
                </div>

                {/* Badges */}
                {plan.badges.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Badges:</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.badges.map((badge) => (
                        <Badge key={badge} variant="secondary">
                          {badge.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support Level */}
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Support: <strong className="capitalize">{plan.support}</strong>
                  </p>
                </div>

                {/* CTA */}
                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Choose Plan'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bundle Discount Info */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Bundle Discounts Available
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>• Get 10% off when you purchase 2 plans together</p>
          <p>• Get 20% off when you purchase all 3 plans</p>
          <p>Contact our sales team to learn more about custom bundles</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">Can I change my plan?</p>
            <p className="text-gray-600">Yes, you can upgrade or downgrade at any time. Changes take effect at your next billing cycle.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">What payment methods do you accept?</p>
            <p className="text-gray-600">We accept all major credit cards through Stripe. Additional methods coming soon.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Is there a free trial?</p>
            <p className="text-gray-600">Contact our support team to discuss trial options for your use case.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

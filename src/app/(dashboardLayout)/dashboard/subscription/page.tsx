'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { planService, Plan } from '@/services/plan.service';
import { subscriptionService, Subscription } from '@/services/subscription.service';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<Record<string, number>>({});
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionsData] = await Promise.all([
        planService.getAllPlans(),
        subscriptionService.getUserSubscriptions(),
      ]);
      setPlans(plansData);
      setSubscriptions(subscriptionsData);
      
      // Initialize selected months to 1 for each plan
      const initialMonths: Record<string, number> = {};
      plansData.forEach(plan => {
        initialMonths[plan._id] = 1;
      });
      setSelectedMonths(initialMonths);
    } catch {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const getActiveSubscription = (planId: string) => {
    return subscriptions.find(
      sub => 
        sub.planId._id === planId && 
        sub.status === 'ACTIVE' &&
        new Date(sub.endDate) > new Date()
    );
  };

  const hasAnyActiveSubscription = () => {
    return subscriptions.some(
      sub => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date()
    );
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribingPlanId(planId);
      const months = selectedMonths[planId] || 1;
      
      const response = await subscriptionService.createSubscription({
        planId,
        totalMonth: months,
      });

      // Redirect to payment gateway
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Payment URL not received');
      }
    } catch (error: unknown) {
      // Handle API error response
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(error.message as string);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create subscription');
      }
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateTotal = (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    const months = selectedMonths[planId] || 1;
    return plan ? plan.price * months : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the perfect plan for your learning journey
        </p>
      </div>

      {/* Current Subscription Status */}
      {hasAnyActiveSubscription() && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriptions
                .filter(sub => sub.status === 'ACTIVE' && new Date(sub.endDate) > new Date())
                .map(sub => (
                  <div key={sub._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sub.planId.name} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        Valid until {formatDate(sub.endDate)}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Active
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const activeSubscription = getActiveSubscription(plan._id);
          const isActive = !!activeSubscription;
          const isSubscribing = subscribingPlanId === plan._id;

          return (
            <Card
              key={plan._id}
              className={`relative ${
                isActive ? 'border-green-500 shadow-lg' : ''
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600">Current Plan</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Benefits */}
                <div className="space-y-3">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Duration Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select
                    value={selectedMonths[plan._id]?.toString()}
                    onValueChange={(value) =>
                      setSelectedMonths(prev => ({
                        ...prev,
                        [plan._id]: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 6, 12].map((months) => (
                        <SelectItem key={months} value={months.toString()}>
                          {months} {months === 1 ? 'month' : 'months'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-lg font-bold">
                    ${calculateTotal(plan._id).toFixed(2)}
                  </span>
                </div>

                {/* Active Subscription Info */}
                {isActive && activeSubscription && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Valid until {formatDate(activeSubscription.endDate)}
                        </p>
                        <p className="text-green-700 dark:text-green-300 mt-1">
                          You can extend your subscription
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscribe/Extend Button */}
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan._id)}
                  disabled={isSubscribing}
                  variant={isActive ? 'outline' : 'default'}
                >
                  {isSubscribing ? (
                    'Processing...'
                  ) : isActive ? (
                    'Extend Subscription'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Subscriptions */}
      {subscriptions.some(sub => sub.paymentStatus === 'PENDING') && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriptions
                .filter(sub => sub.paymentStatus === 'PENDING')
                .map(sub => (
                  <div key={sub._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sub.planId.name} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.totalMonth} {sub.totalMonth === 1 ? 'month' : 'months'} - $
                        {sub.totalCost}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                      Pending
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

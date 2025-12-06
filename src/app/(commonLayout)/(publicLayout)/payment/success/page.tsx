'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get('transactionId');
  const message = searchParams.get('message');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');

  useEffect(() => {
    // Simulate checking payment status
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-2xl border-green-500/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            {message || 'Your payment has been processed successfully'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
            <h3 className="font-semibold text-lg">Payment Details</h3>
            
            {transactionId && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
            )}

            {amount && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-lg">${amount} BDT</span>
              </div>
            )}

            {status && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
              Thank you for your subscription! Your account has been upgraded and you now have access to all premium features.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard/subscription')}
            >
              <Home className="mr-2 h-4 w-4" />
              View Subscription
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

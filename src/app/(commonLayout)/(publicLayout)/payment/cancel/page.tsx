'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const transactionId = searchParams.get('transactionId');
  const message = searchParams.get('message');
  const amount = searchParams.get('amount');
  const status = searchParams.get('status');

  useEffect(() => {
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
      <Card className="w-full max-w-2xl border-yellow-500/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <AlertCircle className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-yellow-600">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-lg">
            {message || 'You have cancelled the payment process'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          {(transactionId || amount || status) && (
            <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
              <h3 className="font-semibold text-lg">Transaction Details</h3>
              
              {transactionId && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono font-medium">{transactionId}</span>
                </div>
              )}

              {amount && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">${amount} BDT</span>
                </div>
              )}

              {status && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Message */}
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Payment Not Completed
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              You have cancelled the payment transaction. No amount has been charged from your account. 
              You can try again whenever you&apos;re ready to subscribe.
            </p>
          </div>

          {/* Benefits Reminder */}
          <div className="rounded-lg bg-muted/50 border p-4">
            <h4 className="font-semibold mb-3">Why Subscribe?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Access to exclusive premium content and challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Unlock special badges, avatars, and rewards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Priority support and early access to new features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Ad-free learning experience</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={() => router.push('/dashboard/subscription')}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              View Plans
            </Button>
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>

          {/* Support Info */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Have questions? Contact us at{' '}
            <a href="mailto:support@eduverse.com" className="text-primary hover:underline">
              support@eduverse.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

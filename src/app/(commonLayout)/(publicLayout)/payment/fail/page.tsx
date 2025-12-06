'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentFailPage() {
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
      <Card className="w-full max-w-2xl border-red-500/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-lg">
            {message || 'Unfortunately, your payment could not be processed'}
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
                  <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/20 px-3 py-1 text-sm font-medium text-red-800 dark:text-red-300">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
              What happened?
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              Your payment was not successful. This could be due to insufficient funds, 
              incorrect card details, or a network issue. No amount has been deducted from your account.
            </p>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg bg-muted/50 border p-4">
            <h4 className="font-semibold mb-2">What can you do?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Check your card details and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ensure you have sufficient balance in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Try using a different payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Contact your bank if the issue persists</span>
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
              Try Again
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
            Need help? Contact our support team at{' '}
            <a href="mailto:support@eduverse.com" className="text-primary hover:underline">
              support@eduverse.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

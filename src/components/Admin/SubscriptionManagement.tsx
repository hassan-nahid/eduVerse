'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Crown,
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  subscriptionService,
  Subscription,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '@/services/subscription.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [limit] = useState(10);

  const fetchSubscriptions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: limit.toString(),
        sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
      };

      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      if (paymentStatusFilter !== 'ALL') {
        params.paymentStatus = paymentStatusFilter;
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await subscriptionService.adminGetAllSubscriptions(params);
      setSubscriptions(response.data);
      setTotalPages(response.meta?.totalPage || 1);
      setTotalSubscriptions(response.meta?.total || 0);

      if (isRefresh) {
        toast.success('Subscriptions list refreshed');
      }
    } catch (error: unknown) {
      console.error('Failed to fetch subscriptions:', error);

      let errorMessage = 'Failed to fetch subscriptions';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchTerm,
    paymentStatusFilter,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setPaymentStatusFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  const getPaymentStatusBadge = (status: SubscriptionPaymentStatus) => {
    const statusConfig = {
      [SubscriptionPaymentStatus.COMPLETE]: {
        class: 'bg-green-500/10 text-green-600 border-green-500/20',
        label: 'Complete',
      },
      [SubscriptionPaymentStatus.PENDING]: {
        class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        label: 'Pending',
      },
      [SubscriptionPaymentStatus.CANCELLED]: {
        class: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        label: 'Cancelled',
      },
      [SubscriptionPaymentStatus.FAILED]: {
        class: 'bg-red-500/10 text-red-600 border-red-500/20',
        label: 'Failed',
      },
    };

    const config = statusConfig[status] || statusConfig[SubscriptionPaymentStatus.PENDING];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const statusConfig = {
      [SubscriptionStatus.ACTIVE]: {
        class: 'bg-green-500/10 text-green-600 border-green-500/20',
        label: 'Active',
      },
      [SubscriptionStatus.EXPIRED]: {
        class: 'bg-red-500/10 text-red-600 border-red-500/20',
        label: 'Expired',
      },
      [SubscriptionStatus.UNPAID]: {
        class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        label: 'Unpaid',
      },
    };

    const config = statusConfig[status] || statusConfig[SubscriptionStatus.UNPAID];

    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Subscription Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all user subscriptions and payments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSubscriptions(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by user name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Payment Status Filter */}
            <Select
              value={paymentStatusFilter}
              onValueChange={setPaymentStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Payment Status</SelectItem>
                <SelectItem value={SubscriptionPaymentStatus.COMPLETE}>
                  Complete
                </SelectItem>
                <SelectItem value={SubscriptionPaymentStatus.PENDING}>
                  Pending
                </SelectItem>
                <SelectItem value={SubscriptionPaymentStatus.FAILED}>
                  Failed
                </SelectItem>
                <SelectItem value={SubscriptionPaymentStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={SubscriptionStatus.EXPIRED}>Expired</SelectItem>
                <SelectItem value={SubscriptionStatus.UNPAID}>Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex gap-2">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="endDate-desc">End Date (Latest)</SelectItem>
                <SelectItem value="endDate-asc">End Date (Earliest)</SelectItem>
                <SelectItem value="totalCost-desc">Highest Cost</SelectItem>
                <SelectItem value="totalCost-asc">Lowest Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden md:table-cell">Duration</TableHead>
                  <TableHead className="hidden lg:table-cell">Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Payment Status
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Transaction ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32 mt-1" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No subscriptions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={subscription.userId.avatar} />
                            <AvatarFallback>
                              {subscription.userId.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {subscription.userId.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {subscription.userId.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">
                            {subscription.planId.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{subscription.totalMonth} months</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <div className="text-muted-foreground">
                            {formatDate(subscription.startDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            to {formatDate(subscription.endDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">
                            {subscription.totalCost}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getPaymentStatusBadge(subscription.paymentStatus)}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono">
                            {subscription.payment.transactionId}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && subscriptions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to{' '}
                {Math.min(currentPage * limit, totalSubscriptions)} of{' '}
                {totalSubscriptions} subscriptions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

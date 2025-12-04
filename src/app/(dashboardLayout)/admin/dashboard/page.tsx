'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, FileText, Trophy, Gift, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminStats, AdminStats } from '@/services/admin.service';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAdminStats();
      setStats(data);

      if (isRefresh) {
        toast.success('Stats refreshed successfully');
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch admin stats';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      console.error('Failed to fetch admin stats:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const statsCards = stats
    ? [
        {
          title: 'Total Users',
          value: stats.overview.users.total.toLocaleString(),
          change: stats.overview.users.growthRate,
          icon: Users,
          color: 'text-blue-500',
        },
        {
          title: 'Total Posts',
          value: stats.overview.posts.total.toLocaleString(),
          change: `${stats.overview.posts.thisMonth} this month`,
          icon: FileText,
          color: 'text-green-500',
        },
        {
          title: 'Active Challenges',
          value: stats.overview.challenges.active.toLocaleString(),
          change: `${stats.overview.challenges.total} total`,
          icon: Trophy,
          color: 'text-yellow-500',
        },
        {
          title: 'Total Rewards',
          value: stats.overview.rewards.total.toLocaleString(),
          change: `${stats.overview.rewards.premium} premium`,
          icon: Gift,
          color: 'text-purple-500',
        },
        {
          title: 'Premium Users',
          value: stats.overview.users.premium.toLocaleString(),
          change: `${stats.overview.users.verified} verified`,
          icon: TrendingUp,
          color: 'text-orange-500',
        },
        {
          title: 'Revenue',
          value: `৳${stats.overview.revenue.total.toLocaleString()}`,
          change: stats.overview.revenue.growthRate,
          icon: DollarSign,
          color: 'text-emerald-500',
        },
      ]
    : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    <span className="text-green-600 font-medium">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            ) : stats?.recentActivities.users.length ? (
              <div className="space-y-4">
                {stats.recentActivities.users.map((user) => (
                  <div key={user._id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        {user.name}
                        {user.verifyBadge && <span className="text-blue-500">✓</span>}
                        {user.isPremium && <span className="text-yellow-500">★</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">@{user.userName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent users</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            ) : stats?.recentActivities.posts.length ? (
              <div className="space-y-4">
                {stats.recentActivities.posts.map((post) => (
                  <div key={post._id} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {post.userId?.avatar ? (
                        <Image
                          src={post.userId.avatar}
                          alt={post.userId.name || 'User'}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{post.postTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        By @{post.userId?.userName || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent posts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
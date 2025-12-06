"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  TrendingUp,
  FileText,
  Award,
  Trophy,
  Crown,
  MessageSquare,
  Heart,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  BadgeCheck,
} from "lucide-react";

interface UserStats {
  userProfile: {
    name: string;
    userName?: string;
    email: string;
    avatar?: string;
    isPremium?: boolean;
    premiumExpiryDate?: string;
    verifyBadge?: boolean;
    points: number;
    scores: number;
    memberSince: string;
  };
  statistics: {
    posts: {
      total: number;
      thisMonth: number;
      totalReactions: number;
      totalComments: number;
    };
    quizzes: {
      attempted: number;
    };
    subscriptions: {
      total: number;
      totalSpent: number;
      currentPlan?: {
        name: string;
        price: number;
        endDate: string;
      };
    };
    challenges: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
}

const UserDashboard = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<UserStats>("/user/my-stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here&apos;s your overview
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {stats.userProfile.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>
      </div>

      {/* User Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{stats.userProfile.points}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Scores</p>
                <p className="text-2xl font-bold">{stats.userProfile.scores}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stats.userProfile.isPremium ? (
                <Crown className="h-5 w-5 text-yellow-500" />
              ) : (
                <Badge variant="outline">Free</Badge>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Membership</p>
                <p className="text-lg font-semibold">
                  {stats.userProfile.isPremium ? "Premium" : "Free"}
                </p>
                {stats.userProfile.isPremium && stats.userProfile.premiumExpiryDate && (
                  <p className="text-xs text-muted-foreground">
                    Expires: {formatDate(stats.userProfile.premiumExpiryDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stats.userProfile.verifyBadge && (
                <Badge className="bg-blue-500">Verified <BadgeCheck/> </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statistics.posts.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.statistics.posts.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        {/* Quiz Attempts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statistics.quizzes.attempted}</div>
            <p className="text-xs text-muted-foreground">Total quizzes attempted</p>
          </CardContent>
        </Card>

        {/* Total Reactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statistics.posts.totalReactions}</div>
            <p className="text-xs text-muted-foreground">On your posts</p>
          </CardContent>
        </Card>

        {/* Total Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statistics.posts.totalComments}</div>
            <p className="text-xs text-muted-foreground">On your posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges and Subscriptions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Challenge Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Challenge Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Challenges</span>
              <span className="font-bold">{stats.statistics.challenges.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Approved</span>
              </div>
              <Badge className="bg-green-500">{stats.statistics.challenges.approved}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending</span>
              </div>
              <Badge className="bg-yellow-500">{stats.statistics.challenges.pending}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Rejected</span>
              </div>
              <Badge className="bg-red-500">{stats.statistics.challenges.rejected}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Subscriptions</span>
              <span className="font-bold">{stats.statistics.subscriptions.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="font-bold text-green-600">
                ${stats.statistics.subscriptions.totalSpent.toFixed(2)}
              </span>
            </div>
            {stats.statistics.subscriptions.currentPlan && (
              <>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Current Plan</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{stats.statistics.subscriptions.currentPlan.name}</span>
                    <Badge className="bg-blue-500">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ends: {formatDate(stats.statistics.subscriptions.currentPlan.endDate)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
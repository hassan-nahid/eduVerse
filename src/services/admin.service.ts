import { apiClient } from '@/lib/api-client';

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  userName: string;
  avatar?: string;
  createdAt: string;
  isPremium: boolean;
  verifyBadge: boolean;
}

interface RecentPost {
  _id: string;
  postTitle: string;
  postBody: string;
  createdAt: string;
  loveReactions: number;
  comments: number;
  userId: {
    name: string;
    userName: string;
    avatar?: string;
  } | null;
}

interface RecentSubscription {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  totalCost: number;
  userId: {
    name: string;
    email: string;
    userName: string;
  };
  planId: {
    name: string;
    price: number;
  };
}

export interface AdminStats {
  overview: {
    users: {
      total: number;
      premium: number;
      verified: number;
      active: number;
      newThisMonth: number;
      growthRate: string;
    };
    posts: {
      total: number;
      thisMonth: number;
    };
    subscriptions: {
      total: number;
      active: number;
      completed: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      average: number;
      growthRate: string;
    };
    plans: {
      total: number;
      mostPopular: {
        _id: string;
        count: number;
        plan: {
          name: string;
          price: number;
        };
      } | null;
    };
    quizzes: {
      total: number;
      thisMonth: number;
    };
    challenges: {
      total: number;
      active: number;
    };
    rewards: {
      total: number;
      premium: number;
    };
    verifications: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  recentActivities: {
    users: RecentUser[];
    posts: RecentPost[];
    subscriptions: RecentSubscription[];
  };
}

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>('/admin/stats');
  return response.data;
};

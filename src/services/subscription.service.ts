import { apiClient } from '@/lib/api-client';

export enum SubscriptionPaymentStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  UNPAID = 'UNPAID',
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  benefits?: string[];
}

export interface Payment {
  _id: string;
  status: string;
  transactionId: string;
  amount: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userName?: string;
  avatar?: string;
}

export interface Subscription {
  _id: string;
  planId: Plan;
  userId: User;
  payment: Payment;
  startDate: string;
  endDate: string;
  totalMonth: number;
  totalCost: number;
  paymentStatus: SubscriptionPaymentStatus;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGetSubscriptionsResponse {
  data: Subscription[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
}

export interface CreateSubscriptionPayload {
  planId: string;
  totalMonth: number;
}

export interface CreateSubscriptionResponse {
  paymentUrl: string;
  subscription: Subscription;
}

export const subscriptionService = {
  async adminGetAllSubscriptions(
    params: Record<string, string>
  ): Promise<AdminGetSubscriptionsResponse> {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get<Subscription[]>(
      `/subscription/admin/all?${queryString}`
    );
    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getUserSubscriptions(): Promise<Subscription[]> {
    const response = await apiClient.get('/subscription/my-subscriptions');
    return response.data as Subscription[];
  },

  async createSubscription(payload: CreateSubscriptionPayload): Promise<CreateSubscriptionResponse> {
    const response = await apiClient.post<CreateSubscriptionResponse>('/subscription', payload);
    return response.data;
  },
};

import { apiClient } from '@/lib/api-client';

export enum RewardType {
  BADGE = 'BADGE',
  AVATAR = 'AVATAR',
  BANNER = 'BANNER',
  UNLOCKED_TITLES = 'UNLOCKED_TITLES',
}

export interface Reward {
  _id: string;
  type: RewardType;
  name: string;
  description?: string;
  image?: string;
  pointPrice: number;
  isPremiumOnly: boolean;
  isActive: boolean;
  isClaimed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardPayload {
  type: RewardType;
  name: string;
  description?: string;
  pointPrice: number;
  isPremiumOnly: boolean;
}

export interface UpdateRewardPayload {
  type?: RewardType;
  name?: string;
  description?: string;
  pointPrice?: number;
  isPremiumOnly?: boolean;
  isActive?: boolean;
}

export interface RewardQueryParams {
  searchTerm?: string;
  type?: RewardType;
  isPremiumOnly?: boolean;
  isActive?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
}

export interface RewardAdminResponse {
  data: Reward[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export const rewardService = {
  // User methods
  async getAllRewards(): Promise<Reward[]> {
    const response = await apiClient.get('/reward');
    return response.data as Reward[];
  },

  async getRewardById(id: string): Promise<Reward> {
    const response = await apiClient.get(`/reward/${id}`);
    return response.data as Reward;
  },

  async getMyRewards(): Promise<Reward[]> {
    const response = await apiClient.get('/reward/my-rewards');
    return response.data as Reward[];
  },

  async claimReward(id: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/reward/${id}/claim`);
    return response.data as { message: string };
  },

  // Admin methods
  async adminGetAllRewards(params?: RewardQueryParams): Promise<RewardAdminResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isPremiumOnly !== undefined) queryParams.append('isPremiumOnly', params.isPremiumOnly.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.fields) queryParams.append('fields', params.fields);
    
    const queryString = queryParams.toString();
    const url = `/reward/admin/all${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return {
      data: response.data as Reward[],
      meta: {
        page: response.meta?.page ?? 1,
        limit: response.meta?.limit ?? 10,
        total: response.meta?.total ?? 0,
        totalPage: response.meta?.totalPage ?? 0
      }
    };
  },

  async adminCreateReward(formData: FormData): Promise<Reward> {
    const response = await apiClient.post('/reward', formData);
    return response.data as Reward;
  },

  async adminUpdateReward(id: string, formData: FormData): Promise<Reward> {
    const response = await apiClient.patch(`/reward/${id}`, formData);
    return response.data as Reward;
  },

  async adminDeleteReward(id: string): Promise<void> {
    await apiClient.delete(`/reward/${id}`);
  },
};

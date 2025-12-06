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

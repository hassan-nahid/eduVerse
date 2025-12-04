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

export const rewardService = {
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
};

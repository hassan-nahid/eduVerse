import { apiClient } from '@/lib/api-client';

export interface ChallengeParticipant {
  userId: {
    _id: string;
    name: string;
    userName: string;
    avatar?: string;
  };
  postId?: {
    _id: string;
    postTitle?: string;
    postImage?: string;
    postBody?: string;
  };
  scoresEarned: number;
  pointsEarned: number;
  completedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  challengeImage?: string;
  pointsReward: number;
  scoresReward: number;
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  isPremiumOnly: boolean;
  createdAt: string;
  updatedAt: string;
}

export const challengeService = {
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await apiClient.get('/challenge');
    return response.data as Challenge[];
  },

  async getChallengeById(id: string): Promise<Challenge> {
    const response = await apiClient.get(`/challenge/${id}`);
    return response.data as Challenge;
  },

  async getMyChallenges(): Promise<Challenge[]> {
    const response = await apiClient.get('/challenge/my-challenges');
    return response.data as Challenge[];
  },
};

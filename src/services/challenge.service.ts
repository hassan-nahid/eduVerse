import { apiClient } from '@/lib/api-client';

export enum ChallengeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum ParticipantStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ChallengeParticipant {
  userId: {
    _id: string;
    name: string;
    userName: string;
    avatar?: string;
    verifyBadge?: boolean;
    email?: string;
    isPremium?: boolean;
  };
  postId?: {
    _id: string;
    postTitle?: string;
    postImage?: string;
    postBody?: string;
    createdAt?: string;
    status?: string;
    loveReactions?: unknown[];
    comments?: unknown[];
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
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  participantStats?: {
    totalParticipants: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface CreateChallengeData {
  title: string;
  description: string;
  challengeImage?: string;
  pointsReward: number;
  scoresReward: number;
  startDate: string;
  endDate: string;
  isPremiumOnly: boolean;
}

export interface UpdateChallengeData extends Partial<CreateChallengeData> {
  status?: ChallengeStatus;
}

export interface AdminGetChallengesResponse {
  data: Challenge[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
}

export const challengeService = {
  // Get all challenges with filters (admin)
  async adminGetAllChallenges(params: Record<string, string>): Promise<AdminGetChallengesResponse> {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get<Challenge[]>(`/challenge/admin/all?${queryString}`);
    return {
      data: response.data,
      meta: response.meta,
    };
  },

  async getAllChallenges(): Promise<Challenge[]> {
    const response = await apiClient.get<Challenge[]>('/challenge');
    return response.data as Challenge[];
  },

  async getChallengeById(id: string): Promise<Challenge> {
    const response = await apiClient.get<{data: Challenge}>(`/challenge/${id}`);
    return response.data.data || response.data as any;
  },

  async getMyChallenges(): Promise<Challenge[]> {
    const response = await apiClient.get<Challenge[]>('/challenge/my-challenges');
    return response.data as Challenge[];
  },

  // Create challenge (admin)
  async createChallenge(data: CreateChallengeData): Promise<Challenge> {
    const response = await apiClient.post<Challenge>('/challenge', data);
    return response.data;
  },

  // Update challenge (admin)
  async updateChallenge(id: string, data: UpdateChallengeData): Promise<Challenge> {
    const response = await apiClient.patch<Challenge>(`/challenge/${id}`, data);
    return response.data;
  },

  // Delete challenge (admin)
  async deleteChallenge(id: string): Promise<void> {
    await apiClient.delete(`/challenge/${id}`);
  },

  // Update participant status (admin)
  async updateParticipantStatus(
    challengeId: string,
    userId: string,
    status: ParticipantStatus
  ): Promise<Challenge> {
    const response = await apiClient.patch<Challenge>(
      `/challenge/${challengeId}/participant`,
      { userId, status }
    );
    return response.data;
  },
};

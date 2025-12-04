import { apiClient } from '@/lib/api-client';

export interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  points: number;
}

export interface QuizParticipant {
  userId: {
    _id: string;
    name: string;
    userName: string;
    avatar?: string;
    email?: string;
    isPremium: boolean;
    verifyBadge: boolean;
  };
  score: number;
  earnedPoints: number;
  completedAt: string;
  percentage?: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  totalScore: number;
  rewardPoints: number;
  participants: QuizParticipant[];
  status: 'DRAFT' | 'PUBLISHED' | 'PRIVATE';
  isPremiumOnly: boolean;
  createdAt: string;
  updatedAt: string;
  participantCount?: number;
  averageScore?: number;
}

export interface SubmitQuizPayload {
  answers: number[];
}

export interface CreateQuizData {
  title: string;
  description?: string;
  questions: Question[];
  rewardPoints: number;
  status: 'DRAFT' | 'PUBLISHED' | 'PRIVATE';
  isPremiumOnly: boolean;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  questions?: Question[];
  rewardPoints?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'PRIVATE';
  isPremiumOnly?: boolean;
}

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PRIVATE = 'PRIVATE',
}

export const quizService = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await apiClient.get('/quiz');
    return response.data as Quiz[];
  },

  async getQuizById(id: string): Promise<Quiz> {
    const response = await apiClient.get(`/quiz/${id}`);
    return response.data as Quiz;
  },

  async getMyQuizResults(): Promise<Quiz[]> {
    const response = await apiClient.get('/quiz/my-results');
    return response.data as Quiz[];
  },

  async submitQuiz(id: string, answers: number[]): Promise<{ score: number; earnedPoints: number }> {
    const response = await apiClient.post(`/quiz/${id}/submit`, { answers });
    return response.data as { score: number; earnedPoints: number };
  },

  // Admin methods
  async adminGetAllQuizzes(params?: {
    searchTerm?: string;
    status?: string;
    isPremiumOnly?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Quiz[]; meta: { total: number; page: number; limit: number; totalPage: number } }> {
    const queryParams = new URLSearchParams();
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isPremiumOnly) queryParams.append('isPremiumOnly', params.isPremiumOnly);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/quiz/admin/all?${queryParams.toString()}`);
    return response as { data: Quiz[]; meta: { total: number; page: number; limit: number; totalPage: number } };
  },

  async createQuiz(data: CreateQuizData): Promise<Quiz> {
    const response = await apiClient.post('/quiz', data);
    return response.data as Quiz;
  },

  async updateQuiz(id: string, data: UpdateQuizData): Promise<Quiz> {
    const response = await apiClient.patch(`/quiz/${id}`, data);
    return response.data as Quiz;
  },

  async deleteQuiz(id: string): Promise<void> {
    await apiClient.delete(`/quiz/${id}`);
  },
};

import { apiClient } from '@/lib/api-client';

export interface Question {
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  points: number;
}

export interface QuizParticipant {
  userId: string;
  score: number;
  earnedPoints: number;
  completedAt: string;
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
}

export interface SubmitQuizPayload {
  answers: number[];
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
};

import { apiClient } from '@/lib/api-client';

export enum PlanName {
  BASIC = 'Basic',
  PREMIUM = 'Premium',
}

export interface Plan {
  _id: string;
  name: PlanName;
  price: number;
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const planService = {
  async getAllPlans(): Promise<Plan[]> {
    const response = await apiClient.get('/plan');
    return response.data as Plan[];
  },

  async getPlanById(id: string): Promise<Plan> {
    const response = await apiClient.get(`/plan/${id}`);
    return response.data as Plan;
  },
};

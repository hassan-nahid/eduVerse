import { apiClient } from '@/lib/api-client';

export interface Plan {
  _id: string;
  name: string;
  price: number;
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  price: number;
  benefits: string[];
  isActive?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  price?: number;
  benefits?: string[];
  isActive?: boolean;
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

  async createPlan(payload: CreatePlanPayload): Promise<Plan> {
    const response = await apiClient.post('/plan', payload);
    return response.data as Plan;
  },

  async updatePlan(id: string, payload: UpdatePlanPayload): Promise<Plan> {
    const response = await apiClient.patch(`/plan/${id}`, payload);
    return response.data as Plan;
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/plan/${id}`);
  },
};


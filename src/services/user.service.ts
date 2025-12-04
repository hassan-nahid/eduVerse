import { apiClient, ApiResponse } from '@/lib/api-client';

export interface User {
  _id: string;
  name: string;
  userName?: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatar?: string;
  banner?: string;
  badges?: string[];
  bio?: string;
  country?: string;
  city?: string;
  scores: number;
  points: number;
  role: 'ADMIN' | 'USER';
  isVerified: boolean;
  isActive: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isDeleted: boolean;
  verifyBadge?: boolean;
  isPremium?: boolean;
  premiumExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllUsersResponse {
  data: User[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
}

export const getAllUsers = async (
  params: Record<string, string>
): Promise<GetAllUsersResponse> => {
  const queryString = new URLSearchParams(params).toString();
  const response = await apiClient.get<User[]>(`/user/all-users?${queryString}`);
  
  return {
    data: response.data,
    meta: response.meta,
  };
};

export const updateUserStatus = async (
  userId: string,
  data: { isActive: string }
): Promise<ApiResponse<User>> => {
  return apiClient.patch<User>(`/user/${userId}`, data);
};

export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  return apiClient.delete<null>(`/user/${userId}`);
};

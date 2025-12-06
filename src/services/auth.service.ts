/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient, ApiResponse } from '@/lib/api-client';

// Type Definitions
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string; // ISO string format
}

export interface ClaimedReward {
  _id: string;
  type: 'BADGE' | 'AVATAR' | 'BANNER' | 'UNLOCKED_TITLES';
  name: string;
  description?: string;
  image?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  userName?: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  // Can be direct URLs or reward IDs from claimed rewards
  avatar?: string;
  banner?: string;
  badges?: string[];
  unlockedTitles?: string[];
  bio?: string;
  country?: string;
  city?: string;
  scores: number;
  points: number;
  role: 'ADMIN' | 'USER';
  isVerified: boolean;
  isActive: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isPremium?: boolean;
  premiumExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
  verifyBadge?: boolean;
  // Claimed rewards from reward system
  claimedRewards?: ClaimedReward[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>('/user/register', data);
  }

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/logout');
  }

  /**
   * Refresh access token using refresh token from cookies
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return apiClient.post<{ accessToken: string }>('/auth/refresh-token');
  }

  /**
   * Change password (requires authentication)
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/change-password', { oldPassword, newPassword });
  }

  /**
   * Forgot password - sends reset email
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/auth/reset-password', { id, newPassword });
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<ApiResponse<AuthUser>> {
    return apiClient.get<AuthUser>('/user/me');
  }

  /**
   * Update user profile (bio, gender, dateOfBirth, country, city)
   */
  async updateProfile(userId: string, data: Partial<AuthUser>): Promise<ApiResponse<AuthUser>> {
    return apiClient.patch<AuthUser>(`/user/${userId}`, data);
  }

  /**
   * Select banner from claimed rewards (stores reward ID in banner field)
   */
  async selectBanner(userId: string, rewardId: string): Promise<ApiResponse<AuthUser>> {
    return apiClient.patch<AuthUser>(`/user/${userId}`, { banner: rewardId });
  }

  /**
   * Select avatar from claimed rewards (stores reward ID in avatar field)
   */
  async selectAvatar(userId: string, rewardId: string): Promise<ApiResponse<AuthUser>> {
    return apiClient.patch<AuthUser>(`/user/${userId}`, { avatar: rewardId });
  }

  /**
   * Select title from claimed rewards (stores reward ID in unlockedTitles field)
   */
  async selectTitle(userId: string, rewardId: string): Promise<ApiResponse<AuthUser>> {
    return apiClient.patch<AuthUser>(`/user/${userId}`, { unlockedTitles: [rewardId] });
  }

  /**
   * Select badges from claimed rewards (stores reward IDs in badges field, max 10)
   */
  async selectBadges(userId: string, rewardIds: string[]): Promise<ApiResponse<AuthUser>> {
    return apiClient.patch<AuthUser>(`/user/${userId}`, { badges: rewardIds });
  }
}

export const authService = new AuthService();

/**
 * OTP Service
 * Handles email verification OTP operations
 */

import { apiClient, ApiResponse } from '@/lib/api-client';

interface SendOTPData {
  email: string;
  name: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

class OTPService {
  /**
   * Send OTP to email for verification
   */
  async sendOTP(data: SendOTPData): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/otp/send', data);
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(data: VerifyOTPData): Promise<ApiResponse<null>> {
    return apiClient.post<null>('/otp/verify', data);
  }
}

export const otpService = new OTPService();

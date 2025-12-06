/**
 * API Client Configuration
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
}

interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errorSources?: Array<{
    path: string;
    message: string;
  }>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = options.body instanceof FormData;
    const defaultHeaders: HeadersInit = isFormData 
      ? {} 
      : { 'Content-Type': 'application/json' };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for cookies (tokens)
    };

    try {
      const response = await fetch(url, config);
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails, create error response
        throw {
          success: false,
          statusCode: response.status,
          message: `Server returned ${response.status}: ${response.statusText}`,
        } as ApiError;
      }

      if (!response.ok) {
        // Backend error response - throw it with proper structure
        throw {
          success: false,
          statusCode: response.status,
          message: data.message || `Request failed with status ${response.status}`,
          errorSources: data.errorSources || [],
        } as ApiError;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      // If it's already an ApiError with statusCode, re-throw it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }

      // Network error (fetch failed completely)
      throw {
        success: false,
        statusCode: 0,
        message: error instanceof Error ? error.message : 'Network request failed',
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, ApiError };

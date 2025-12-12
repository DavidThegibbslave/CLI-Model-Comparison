import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// Import token management functions from AuthContext
// Note: We import specific functions to avoid circular dependencies
let getAccessTokenFn: (() => string | null) | null = null;
let setAccessTokenFn: ((token: string | null) => void) | null = null;

/**
 * Register token management functions
 * Called once from AuthContext to provide token access
 */
export const registerTokenFunctions = (
  getToken: () => string | null,
  setToken: (token: string | null) => void
) => {
  getAccessTokenFn = getToken;
  setAccessTokenFn = setToken;
};

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token from memory
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFn ? getAccessTokenFn() : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors
// Note: Token refresh is now handled by AuthContext, not here
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // For 401 errors, the AuthContext will handle token refresh
    // If we get here with a 401, it means refresh failed or no refresh token exists
    if (error.response?.status === 401) {
      // Clear any stored tokens
      if (setAccessTokenFn) {
        setAccessTokenFn(null);
      }
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');

      // Redirect to login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API Service Interface
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export class ApiService {
  // GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  static async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  static async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  static async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  static async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private static handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response?.data?.error) {
        // API returned structured error
        throw axiosError.response.data.error;
      }

      if (axiosError.response) {
        // Server responded with error status
        throw {
          code: `HTTP_${axiosError.response.status}`,
          message: axiosError.message || 'An error occurred',
          timestamp: new Date().toISOString(),
          path: axiosError.config?.url || '',
        };
      }

      if (axiosError.request) {
        // Request made but no response
        throw {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
          timestamp: new Date().toISOString(),
          path: axiosError.config?.url || '',
        };
      }
    }

    // Unknown error
    throw {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: '',
    };
  }
}

export default apiClient;

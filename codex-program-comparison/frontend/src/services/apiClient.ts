import axios from 'axios';
import { clearTokens, getAccessToken } from './auth';

type MaybePromise<T> = T | Promise<T>;

const defaultApiBase = (() => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const host = window.location.hostname || 'localhost';
  return `${protocol}://${host}:5000`;
})();

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultApiBase;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

let refreshHandler: (() => MaybePromise<string | null>) | null = null;

export function registerAuthRefresh(handler: () => MaybePromise<string | null>) {
  refreshHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = (error.config || {}) as {
      _retry?: boolean;
      skipAuthRefresh?: boolean;
      headers?: Record<string, string>;
    };

    if (status === 401 && refreshHandler && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshHandler();
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError: any) {
        clearTokens();
        const message = refreshError?.response?.data?.error?.message || refreshError?.message || 'Session expired';
        return Promise.reject(new Error(message));
      }
    }

    if (status === 401) {
      clearTokens();
    }
    const message = error.response?.data?.error?.message || error.message;
    return Promise.reject({ ...error, message });
  },
);

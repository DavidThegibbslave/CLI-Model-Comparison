import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './apiClient';

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  tokenType?: string;
  userId: string;
  email: string;
  roles?: string[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export async function loginRequest(payload: LoginRequest) {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

export async function registerRequest(payload: RegisterRequest) {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function refreshRequest(payload: RefreshRequest) {
  const config: AxiosRequestConfig & { skipAuthRefresh?: boolean } = { skipAuthRefresh: true };
  const { data } = await apiClient.post<AuthResponse>('/api/auth/refresh', payload, config);
  return data;
}

export async function logoutRequest(refreshToken: string) {
  const config: AxiosRequestConfig & { skipAuthRefresh?: boolean } = { skipAuthRefresh: true };
  await apiClient.post('/api/auth/logout', { refreshToken }, config);
}

export type MeResponse = {
  userId: string;
  email: string;
  roles?: string[];
};

export async function meRequest() {
  const { data } = await apiClient.get<MeResponse>('/api/auth/me');
  return data;
}

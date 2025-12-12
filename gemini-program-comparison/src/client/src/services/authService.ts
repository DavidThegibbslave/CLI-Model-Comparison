import api from '@/lib/axios';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  email: string;
}

export const authService = {
  login: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  }
};

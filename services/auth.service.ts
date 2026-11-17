import { api } from '@/lib/api';
import type { AuthResponse, User } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'customer' | 'farmer';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: (body: RegisterPayload) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
  login: (body: LoginPayload) => api<AuthResponse>('/auth/login', { method: 'POST', body }),
  logout: () => api<null>('/auth/logout', { method: 'POST' }),
  me: () => api<{ user: User }>('/auth/me'),
};

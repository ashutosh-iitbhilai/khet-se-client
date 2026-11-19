import { api } from '@/lib/api';
import type { AuthResponse, User } from '@/types';

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'customer' | 'farmer' | 'delivery';
}

export interface LoginPayload {
  /** Mobile number (any common format) or email. */
  identifier: string;
  password: string;
}

export const authService = {
  register: (body: RegisterPayload) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
  login: (body: LoginPayload) => api<AuthResponse>('/auth/login', { method: 'POST', body }),
  logout: () => api<null>('/auth/logout', { method: 'POST' }),
  /** Ends every session of this account (all devices). */
  logoutAll: () => api<{ sessionsEnded: number }>('/auth/logout-all', { method: 'POST' }),
  me: () => api<{ user: User }>('/auth/me'),
  /** Which sign-in options are switched on for this deployment. */
  providers: () => api<{ google: boolean; passwordReset: boolean }>('/auth/providers'),
  forgotPassword: (identifier: string) => api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { identifier } }),
  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/auth/reset-password', { method: 'POST', body: { token, password } }),
};

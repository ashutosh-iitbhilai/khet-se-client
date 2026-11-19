'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { ApiError } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  /** true until the initial session check finishes */
  loading: boolean;
  login: (data: LoginPayload) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  /** Sign out on every device, this one included. */
  logoutAll: () => Promise<void>;
  /** Replace the cached user after a profile update. */
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then(({ user }) => !cancelled && setUser(user))
      .catch((err) => {
        // 401 simply means "not logged in"; anything else is logged for debugging.
        if (!(err instanceof ApiError && err.status === 401)) console.warn('Session check failed:', err);
        if (!cancelled) setUser(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (data: LoginPayload) => {
    const res = await authService.login(data);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authService.register(data);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, logoutAll, updateUser: setUser }),
    [user, loading, login, register, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Where each role lands after signing in. */
export function homeForRole(role: User['role']) {
  if (role === 'farmer') return '/farmer';
  if (role === 'admin') return '/admin';
  return '/';
}

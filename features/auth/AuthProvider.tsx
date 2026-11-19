'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service';
import { ApiError, onApiEvent } from '@/lib/api';
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
  /** Replace the cached user after a profile update (null after a password reset signs everyone out). */
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Whenever the signed-in person changes (login, logout, another account), drop every cached
  // response so nobody ever sees the previous account's orders, jobs or addresses.
  const lastUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (loading) return;
    const id = user?.id ?? null;
    if (lastUserId.current !== undefined && lastUserId.current !== id) queryClient.clear();
    lastUserId.current = id;
  }, [user?.id, loading, queryClient]);

  // The session expired or was ended elsewhere (logout on another device, suspension):
  // show the person as logged out instead of a page full of errors.
  useEffect(() => onApiEvent((e) => e.type === 'session-lost' && setUser(null)), []);

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
  if (role === 'delivery') return '/delivery';
  if (role === 'admin') return '/admin';
  return '/';
}

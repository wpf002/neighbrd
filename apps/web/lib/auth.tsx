'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken } from './api';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authed' | 'guest';
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, status: 'loading' });

  useEffect(() => {
    if (!getToken()) {
      setState({ user: null, status: 'guest' });
      return;
    }
    api
      .get<{ user: AuthUser }>('/api/auth/me')
      .then(({ user }) => setState({ user, status: 'authed' }))
      .catch(() => {
        setToken(null);
        setState({ user: null, status: 'guest' });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
      email,
      password,
    });
    setToken(token);
    setState({ user, status: 'authed' });
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>('/api/auth/signup', {
      email,
      password,
      name,
    });
    setToken(token);
    setState({ user, status: 'authed' });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setState({ user: null, status: 'guest' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

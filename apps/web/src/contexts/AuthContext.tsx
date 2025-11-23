'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/env';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
};

type RegisterData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/auth/me`, { credentials: 'include' });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const base = getApiBaseUrl();
        console.log('[Auth] Login attempt for:', email);
        console.log('[Auth] API base URL:', base);

        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        console.log('[Auth] Login response status:', res.status);
        console.log('[Auth] Login response ok:', res.ok);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('[Auth] Login error response:', errorText);

          try {
            const error = JSON.parse(errorText);
            throw new Error(error.message || 'Login failed');
          } catch (parseError) {
            throw new Error(errorText || 'Login failed');
          }
        }

        console.log('[Auth] Login successful, fetching user data...');

        // Fetch user data after successful login
        await checkAuth();

        console.log('[Auth] Redirecting to dashboard...');
        router.push('/dashboard');
      } catch (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }
    },
    [checkAuth, router],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      const base = getApiBaseUrl();
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  // Register function
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await res.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(error.message || 'Registration failed');
        }

        // Auto-login after registration
        await login(data.email, data.password);
      } catch (error) {
        console.error('[Auth] Register error:', error);
        throw error;
      }
    },
    [login],
  );

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

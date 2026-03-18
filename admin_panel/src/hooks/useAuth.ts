import { useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';
import { loginWithApi, userFromLoginData } from '@/api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await loginWithApi(email, password);
      if (!result.success) {
        setIsLoading(false);
        return { success: false, error: result.message || 'Invalid email or password' };
      }
      const data = result.data;
      if (!data?.token || !data._id) {
        setIsLoading(false);
        return { success: false, error: 'Invalid response from server' };
      }
      const appUser = userFromLoginData(data);
      if (!appUser) {
        setIsLoading(false);
        return { success: false, error: 'Invalid response from server' };
      }
      if (data.role !== 'admin') {
        setIsLoading(false);
        return { success: false, error: 'Access denied. Admin role required.' };
      }
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(appUser));
      setUser(appUser);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: (err as Error).message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  return { user, isAuthenticated, isLoading, login, logout };
}

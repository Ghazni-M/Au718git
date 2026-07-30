import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from "./api";

export type AdminRole = 'Admin' | 'Assistant admin' | null;

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin?: boolean;
  role?: AdminRole;
}

interface AuthContextType {
  user: SessionUser | null;
  isAdmin: boolean;
  role: AdminRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (data: any) => {
    if (data?.uid && data?.email) {
      const sessionUser: SessionUser = {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        isAdmin: !!data.isAdmin,
        role: data.role ?? null,
      };
      setUser(sessionUser);
      setIsAdmin(!!data.isAdmin);
      setRole(data.role ?? null);
    } else {
      setUser(null);
      setIsAdmin(false);
      setRole(null);
    }
  };

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/api/auth/me', {
        cache: 'no-store',
      });

      applySession(data);
    } catch (error: any) {
      // No active session or unauthorized - this is normal
      if (error.message?.toLowerCase().includes('401') || 
          error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('network error')) {
        console.debug('No active session');
      } else {
        console.error('Failed to restore session:', error);
      }
      applySession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    applySession(data);
    return data;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const data = await api('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    applySession(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue anyway - we want to clear local state
    } finally {
      applySession(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAdmin,
    role,
    loading,
    login,
    signup,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
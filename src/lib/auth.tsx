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

async function parseJsonSafely(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (data: any) => {
    if (data?.uid && data?.email) {
      setUser({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        isAdmin: !!data.isAdmin,
        role: data.role ?? null,
      });
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
      const res = await api('/api/auth/me', {

        cache: 'no-store',
      });

      if (res.ok) {
        const data = await parseJsonSafely(res);
        applySession(data);
      } else if (res.status === 401) {
        // Expected behavior - user not logged in
        applySession(null);
      } else {
        console.warn(`Auth restore failed with status: ${res.status}`);
        applySession(null);
      }
    } catch (error: any) {
      // Suppress common network errors in development
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.warn('Auth service temporarily unavailable');
      } else {
        console.error('Failed to restore session:', error);
      }
      applySession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonSafely(res);

    if (!res.ok) {
      throw new Error(data?.error || 'Login failed');
    }

    applySession(data);
    return data;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonSafely(res);

    if (!res.ok) {
      throw new Error(data?.error || 'Signup failed');
    }

    applySession(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
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
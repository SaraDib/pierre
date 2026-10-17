import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin, getMe, logoutAdmin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await getMe(token);
        if (isMounted) {
          const freshUser = response.user || response;
          setUser(freshUser);
          localStorage.setItem('admin_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        if (isMounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await loginAdmin(email, password);
    const authToken = data.token;
    const authUser = data.user;

    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(authUser));

    return { token: authToken, user: authUser };
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      await logoutAdmin(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

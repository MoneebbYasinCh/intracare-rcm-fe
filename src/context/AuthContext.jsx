import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = api.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.getMe()
      .then((userData) => {
        if (userData) {
          setUser(userData);
        } else {
          api.clearTokens();
        }
      })
      .catch(() => {
        api.clearTokens();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      api.clearTokens();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
      } else {
        setUser({ email: data.email || email });
      }
    } catch {
      setUser({ email: data.email || email });
    }
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skillmap_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      const userData: User = {
        id: res.data.id,
        email: res.data.email,
        full_name: res.data.full_name,
        role: res.data.role,
        onboarded: res.data.profile?.onboarded,
      };
      setUser(userData);
      localStorage.setItem('skillmap_user', JSON.stringify(userData));
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillmap_token');
      localStorage.removeItem('skillmap_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { access_token, user: userInfo } = res.data;
    localStorage.setItem('skillmap_token', access_token);
    localStorage.setItem('skillmap_user', JSON.stringify(userInfo));
    setToken(access_token);
    setUser(userInfo);
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    const { access_token, user: userInfo } = res.data;
    localStorage.setItem('skillmap_token', access_token);
    localStorage.setItem('skillmap_user', JSON.stringify(userInfo));
    setToken(access_token);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('skillmap_token');
    localStorage.removeItem('skillmap_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

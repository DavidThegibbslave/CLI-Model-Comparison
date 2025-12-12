import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (_data?: any) => Promise<void>;
  register: (_data?: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: 'guest',
    username: 'Guest',
    email: 'guest@example.com',
    role: 'Guest'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // No-op: demo mode without login
    setIsLoading(false);
  }, []);

  const login = async (_data?: any) => {
    setUser(prev => prev ?? {
      id: 'guest',
      username: 'Guest',
      email: 'guest@example.com',
      role: 'Guest'
    });
  };

  const register = async (data?: any) => {
    setUser({
      id: 'guest',
      username: data?.username || 'Guest',
      email: data?.email || 'guest@example.com',
      role: 'Guest'
    });
  };

  const logout = () => {
    setUser({
      id: 'guest',
      username: 'Guest',
      email: 'guest@example.com',
      role: 'Guest'
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

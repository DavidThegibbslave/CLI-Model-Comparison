import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, LoginResponse } from '@/types';
import { ApiService, registerTokenFunctions } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Store access token in memory (more secure than localStorage)
let accessTokenMemory: string | null = null;

// Token refresh timeout ID (using number type for browser compatibility)
let refreshTimeoutId: number | null = null;

/**
 * Get access token from memory
 */
export const getAccessToken = (): string | null => {
  return accessTokenMemory;
};

/**
 * Set access token in memory
 */
export const setAccessToken = (token: string | null): void => {
  accessTokenMemory = token;
};

/**
 * Get refresh token from storage (sessionStorage or localStorage based on "remember me")
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

/**
 * Set refresh token in storage
 */
const setRefreshToken = (token: string, rememberMe: boolean): void => {
  if (rememberMe) {
    localStorage.setItem('refreshToken', token);
    sessionStorage.removeItem('refreshToken');
  } else {
    sessionStorage.setItem('refreshToken', token);
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Remove refresh token from storage
 */
const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('refreshToken');
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false);

  // Register token management functions with API service on mount
  useEffect(() => {
    registerTokenFunctions(getAccessToken, setAccessToken);
  }, []);

  /**
   * Schedule automatic token refresh before expiry
   */
  const scheduleTokenRefresh = (expiresIn: number) => {
    // Clear existing timeout
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    // Refresh 1 minute before expiry (expiresIn is in seconds)
    const refreshTime = (expiresIn - 60) * 1000;

    if (refreshTime > 0) {
      refreshTimeoutId = setTimeout(async () => {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          // Don't logout on auto-refresh failure, user can continue with current session
        }
      }, refreshTime);
    }
  };

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshingRef.current) {
      return false;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const response = await ApiService.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken, expiresIn, user: userData } = response.data;

      // Store new tokens
      setAccessToken(accessToken);
      const isRemembered = localStorage.getItem('refreshToken') !== null;
      setRefreshToken(newRefreshToken, isRemembered);

      // Update user if provided
      if (userData) {
        setUser(userData);
      }

      // Schedule next refresh
      if (expiresIn) {
        scheduleTokenRefresh(expiresIn);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      setAccessToken(null);
      removeRefreshToken();
      setUser(null);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  /**
   * Initialize auth on mount - try to restore session
   */
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const success = await refreshAccessToken();
          if (!success) {
            // If refresh failed, try to fetch user with existing token
            await refreshUser();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          setAccessToken(null);
          removeRefreshToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }
    };
  }, []);

  /**
   * Login user
   */
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await ApiService.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, expiresIn, user: userData } = response.data;

      // Store tokens
      setAccessToken(accessToken);
      setRefreshToken(refreshToken, rememberMe);
      setUser(userData);

      // Schedule token refresh
      if (expiresIn) {
        scheduleTokenRefresh(expiresIn);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user and auto-login
   */
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      await ApiService.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });

      // After successful registration, automatically log in
      await login(email, password, false);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await ApiService.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear tokens and user state
      setAccessToken(null);
      removeRefreshToken();
      setUser(null);

      // Clear refresh timeout
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
      }
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async () => {
    try {
      const response = await ApiService.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

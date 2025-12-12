import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  type AuthResponse,
} from '../services/authApi';
import { clearTokens, getRefreshToken, isRefreshRemembered, setSessionTokens } from '../services/auth';
import { registerAuthRefresh } from '../services/apiClient';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  error: string | null;
  login: (payload: { email: string; password: string; remember?: boolean }) => Promise<{ ok: boolean; message?: string }>;
  register: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAccessToken: (silent?: boolean) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  function clearRefreshTimer() {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }

  function clearSession() {
    clearRefreshTimer();
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
    setError(null);
  }

  function scheduleRefresh(expiresAt?: string) {
    clearRefreshTimer();
    if (!expiresAt) return;

    const expiryMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiryMs)) return;
    const refreshIn = Math.max(expiryMs - Date.now() - 60000, 10000);

    refreshTimerRef.current = window.setTimeout(() => {
      void refreshAccessToken(true);
    }, refreshIn);
  }

  function applyAuthResponse(auth: AuthResponse, remember?: boolean) {
    setSessionTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      accessTokenExpiresAt: auth.accessTokenExpiresAt,
      remember,
    });

    setUser({
      id: auth.userId,
      email: auth.email,
      roles: auth.roles ?? [],
    });
    setStatus('authenticated');
    scheduleRefresh(auth.accessTokenExpiresAt);
  }

  async function refreshAccessToken(silent = false): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return null;
    }

    setIsRefreshing(true);
    try {
      const auth = await refreshRequest({ refreshToken });
      applyAuthResponse(auth, isRefreshRemembered());
      return auth.accessToken;
    } catch (err: any) {
      if (!silent) {
        setError(err?.message || 'Session expired. Please log in again.');
      }
      clearSession();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }

  async function login(payload: { email: string; password: string; remember?: boolean }) {
    setError(null);
    setStatus('loading');
    try {
      const auth = await loginRequest(payload);
      applyAuthResponse(auth, payload.remember);
      return { ok: true as const };
    } catch (err: any) {
      const message = err?.message || 'Invalid credentials';
      setError(message);
      setStatus('unauthenticated');
      return { ok: false as const, message };
    }
  }

  async function register(payload: { email: string; password: string }) {
    setError(null);
    try {
      await registerRequest(payload);
      setStatus('unauthenticated');
      return { ok: true as const };
    } catch (err: any) {
      const message = err?.message || 'Registration failed';
      setError(message);
      setStatus('unauthenticated');
      return { ok: false as const, message };
    }
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    clearSession();
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Swallow logout errors to avoid blocking user.
      }
    }
  }

  useEffect(() => {
    registerAuthRefresh(refreshAccessToken);
    const token = getRefreshToken();
    if (!token) {
      setStatus('unauthenticated');
      return () => clearRefreshTimer();
    }

    void refreshAccessToken(true);
    return () => clearRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isRefreshing,
      error,
      login,
      register,
      logout,
      refreshAccessToken,
    }),
    [user, status, isRefreshing, error, login, register, logout, refreshAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

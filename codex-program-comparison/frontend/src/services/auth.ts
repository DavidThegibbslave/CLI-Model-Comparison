const REFRESH_TOKEN_KEY = 'cm_refresh_token';
const REFRESH_REMEMBER_KEY = 'cm_refresh_remember';

let accessTokenMemory: string | null = null;
let accessTokenExpiresAt: string | null = null;

export function getAccessToken() {
  return accessTokenMemory;
}

export function getAccessTokenExpiry() {
  return accessTokenExpiresAt;
}

export function setAccessToken(accessToken: string | null, expiresAt?: string | null) {
  accessTokenMemory = accessToken;
  accessTokenExpiresAt = expiresAt ?? null;
}

export function setRefreshToken(refreshToken?: string, remember = false) {
  if (typeof window === 'undefined') return;
  if (!refreshToken) {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_REMEMBER_KEY);
    return;
  }

  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (remember) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_REMEMBER_KEY);
  }
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  const sessionValue = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (sessionValue) return sessionValue;

  const remembered = localStorage.getItem(REFRESH_REMEMBER_KEY);
  if (remembered === 'true') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

export function isRefreshRemembered() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(REFRESH_REMEMBER_KEY) === 'true';
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_REMEMBER_KEY);
  }
  accessTokenMemory = null;
  accessTokenExpiresAt = null;
}

export function setSessionTokens({
  accessToken,
  refreshToken,
  accessTokenExpiresAt,
  remember,
}: {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  remember?: boolean;
}) {
  setAccessToken(accessToken, accessTokenExpiresAt ?? null);
  setRefreshToken(refreshToken, remember ?? false);
}

import type { AuthTokens, User } from '../../lib/api/types';

export const ACCESS_TOKEN_KEY = 'twin.accessToken';
export const REFRESH_TOKEN_KEY = 'twin.refreshToken';
export const USER_KEY = 'twin.user';

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return window.localStorage;
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function getUser(): User | null {
  const storage = getStorage();
  const value = storage?.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as User;
  } catch {
    storage?.removeItem(USER_KEY);
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  const storage = getStorage();
  storage?.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    storage?.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function setUser(user: User | null | undefined): void {
  const storage = getStorage();
  if (!user) {
    storage?.removeItem(USER_KEY);
    return;
  }
  storage?.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  const storage = getStorage();
  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
  storage?.removeItem(USER_KEY);
}

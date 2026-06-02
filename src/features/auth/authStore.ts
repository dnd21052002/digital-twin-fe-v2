import { create } from 'zustand';

import type { AuthTokens, User } from '../../lib/api/types';
import { clearAuth, getAccessToken, getRefreshToken, getUser, setTokens, setUser } from './authStorage';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (tokens: AuthTokens, user?: User | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  user: getUser(),
  setSession: (tokens, user) => {
    setTokens(tokens);
    setUser(user);
    set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken ?? getRefreshToken(), user: user ?? null });
  },
  clearSession: () => {
    clearAuth();
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

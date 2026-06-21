import { create } from 'zustand';

import { silentRefresh, tokenStore } from '@/lib/api/client';
import { userApi } from '@/lib/api/auth';
import type { GoogleSignInPayload, LoginPayload, RegisterPayload, User } from '@/lib/api/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (payload: GoogleSignInPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  setUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
}

// Prevents concurrent bootstrap calls (e.g. fast refresh / double-invoke on mount).
let bootstrapInFlight = false;

async function fetchAndSetUser(
  accessToken: string,
  refreshToken: string,
  set: (partial: Partial<AuthState>) => void
) {
  tokenStore.setTokens(accessToken, refreshToken);
  const user = await userApi.getProfile();
  set({ user });
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  refreshProfile: async () => {
    const user = await userApi.getProfile();
    set({ user });
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const { user, accessToken, refreshToken } = await userApi.register(payload);
      tokenStore.setTokens(accessToken, refreshToken);
      set({ user });
      return user;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken } = await userApi.login(payload);
      await fetchAndSetUser(accessToken, refreshToken, set);
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async (payload) => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken } = await userApi.googleSignIn(payload);
      await fetchAndSetUser(accessToken, refreshToken, set);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await userApi.logout();
    } catch {
      /* always clear local state regardless */
    } finally {
      tokenStore.clear();
      set({ user: null });
    }
  },

  /** Runs once at app start: hydrates the refresh token from SecureStore, then
   * silently refreshes the access token and fetches the current user if a
   * session exists. Gate splash screen dismissal on this resolving. */
  bootstrap: async () => {
    if (bootstrapInFlight) return;
    bootstrapInFlight = true;
    try {
      await tokenStore.hydrate();
      if (!tokenStore.getRefresh()) {
        set({ isInitialized: true });
        return;
      }
      const ok = await silentRefresh();
      if (!ok) {
        set({ user: null, isInitialized: true });
        return;
      }
      const user = await userApi.getProfile();
      set({ user, isInitialized: true });
    } catch {
      if (!get().user) {
        tokenStore.clear();
        set({ user: null, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } finally {
      bootstrapInFlight = false;
    }
  },
}));

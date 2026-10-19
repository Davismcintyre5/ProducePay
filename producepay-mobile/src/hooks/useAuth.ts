import { create } from 'zustand';
import * as authApi from '../api/auth';
import * as secureStore from '../lib/secureStore';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  error: string | null;
  boot: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  error: null,

  boot: async () => {
    try {
      const hasSession = await secureStore.hasSession();
      if (!hasSession) {
        set({ status: 'anonymous', user: null });
        return;
      }

      const me = await authApi.me();
      await secureStore.saveUser(me);
      set({ status: 'authenticated', user: me, error: null });
    } catch {
      await secureStore.clearAll();
      set({ status: 'anonymous', user: null });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const { user, accessToken, refreshToken } = await authApi.login(email, password);
      if (!refreshToken) {
        throw new Error('Server did not return a refresh token');
      }
      await secureStore.saveTokens(accessToken, refreshToken);
      await secureStore.saveUser(user);
      set({ status: 'authenticated', user, error: null });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Login failed';
      set({ error: msg });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout();
    await secureStore.clearAll();
    set({ status: 'anonymous', user: null, error: null });
  }
}));
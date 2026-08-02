import { create } from 'zustand';
import { User, AuthResponse, LoginPayload, SignupPayload } from '@build-and-learn/shared-types';
import { request } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';

  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  clearError: () => void;

  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isLoading: false,
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login',

  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
  clearError: () => set({ error: null }),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('auth_token', res.token);
      set({
        token: res.token,
        user: res.user,
        isLoading: false,
        isAuthModalOpen: false,
        error: null
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return false;
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('auth_token', res.token);
      set({
        token: res.token,
        user: res.user,
        isLoading: false,
        isAuthModalOpen: false,
        error: null
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Signup failed' });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, user: null, isAuthModalOpen: false, error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await request<{ user: User }>('/auth/me');
      set({ user: res.user, token });
    } catch (err) {
      // Invalid token, log out
      localStorage.removeItem('auth_token');
      set({ token: null, user: null });
    }
  }
}));

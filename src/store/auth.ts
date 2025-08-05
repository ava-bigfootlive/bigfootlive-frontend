/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { authService } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      set({ user, loading: false, error: null });
    } catch (error) { void error;
      set({ 
        loading: false, 
        error: (error as Error).message || 'Failed to sign in' 
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await authService.signUp(email, password);
      set({ 
        loading: false, 
        error: null 
      });
    } catch (error) { void error;
      set({ 
        loading: false, 
        error: (error as Error).message || 'Failed to sign up' 
      });
      throw error;
    }
  },

  signOut: () => {
    authService.signOut();
    set({ user: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  }}));
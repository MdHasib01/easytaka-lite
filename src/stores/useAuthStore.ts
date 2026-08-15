import { create } from 'zustand';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  setPoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from local storage
  const savedToken = typeof window !== 'undefined' ? localStorage.getItem('esytaka_token') : null;
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('esytaka_user') : null;

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;

        localStorage.setItem('esytaka_token', token);
        localStorage.setItem('esytaka_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Login failed. Please try again.';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    demoLogin: async (role: UserRole) => {
      if (role === 'admin') {
        return get().login('admin@esytaka.com', 'admin123');
      } else {
        return get().login('smm@esytaka.com', 'smm123');
      }
    },

    register: async (name, email, password, role = 'smm') => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post('/auth/register', { name, email, password, role });
        const { token, user } = response.data;

        localStorage.setItem('esytaka_token', token);
        localStorage.setItem('esytaka_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Registration failed.';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('esytaka_token');
      localStorage.removeItem('esytaka_user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    fetchMe: async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data.user;
        localStorage.setItem('esytaka_user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      } catch (err) {
        get().logout();
      }
    },

    updateProfile: async (data) => {
      set({ isLoading: true });
      try {
        const response = await api.put('/auth/profile', data);
        const user = response.data.user;
        localStorage.setItem('esytaka_user', JSON.stringify(user));
        set({ user, isLoading: false });
        return true;
      } catch (err: any) {
        set({ isLoading: false, error: err.response?.data?.message || 'Update failed' });
        return false;
      }
    },

    setPoints: (points: number) => {
      const currentUser = get().user;
      if (currentUser) {
        const updated = { ...currentUser, rewardPoints: points };
        localStorage.setItem('esytaka_user', JSON.stringify(updated));
        set({ user: updated });
      }
    },
  };
});

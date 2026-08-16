import { create } from 'zustand';
import api from '../services/api';
import { SystemSettings } from '../types';

interface SettingsState {
  settings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<{ success: boolean; message: string }>;
  updateSmmDailyReward: (smmId: string, points: number) => Promise<{ success: boolean; message: string }>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/settings');
      set({ settings: res.data.settings, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch settings',
        isLoading: false,
      });
    }
  },

  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put('/settings', updates);
      set({ settings: res.data.settings, isLoading: false });
      return { success: true, message: res.data.message || 'Settings updated successfully!' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update settings';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  updateSmmDailyReward: async (smmId, points) => {
    try {
      const res = await api.put(`/auth/smms/${smmId}/daily-reward`, {
        dailyTaskCompletionReward: points,
      });
      return { success: true, message: res.data.message || 'SMM daily reward updated!' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update SMM daily reward',
      };
    }
  },
}));

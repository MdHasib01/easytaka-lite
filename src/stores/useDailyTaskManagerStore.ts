import { create } from 'zustand';
import api from '../services/api';
import { DailyTaskTemplate } from '../types';

interface DailyTaskStats {
  activeGlobalTasks: number;
  activeQuotaCampaigns: number;
  totalEligibleAccounts: number;
  activeSmmCount: number;
}

interface LoadBalancerPreviewResult {
  totalAccountsAvailable: number;
  smmCount: number;
  targetQuota: number;
  actualAllocated: number;
  canFulfillQuota: boolean;
  smmBreakdown: Array<{
    smmId: string;
    smmName: string;
    smmEmail: string;
    totalAccountsOwned: number;
    assignedCount: number;
    assignedAccounts: Array<{ id: string; name: string }>;
  }>;
}

interface DailyTaskManagerStore {
  dailyTasks: DailyTaskTemplate[];
  stats: DailyTaskStats | null;
  isLoading: boolean;
  error: string | null;

  fetchDailyTasks: (filters?: { mode?: string; status?: string; taskType?: string }) => Promise<void>;
  fetchDailyTaskStats: () => Promise<void>;
  createDailyTask: (data: Partial<DailyTaskTemplate>) => Promise<{ success: boolean; message: string; task?: DailyTaskTemplate }>;
  updateDailyTask: (id: string, updates: Partial<DailyTaskTemplate>) => Promise<{ success: boolean; message: string }>;
  deleteDailyTask: (id: string) => Promise<{ success: boolean; message: string }>;
  getLoadBalancerPreview: (quota: number) => Promise<LoadBalancerPreviewResult | null>;
}

export const useDailyTaskManagerStore = create<DailyTaskManagerStore>((set, get) => ({
  dailyTasks: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchDailyTasks: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.mode && filters.mode !== 'all') params.append('mode', filters.mode);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.taskType && filters.taskType !== 'all') params.append('taskType', filters.taskType);

      const res = await api.get(`/daily-tasks?${params.toString()}`);
      set({ dailyTasks: res.data.tasks || [], isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch daily tasks',
        isLoading: false,
      });
    }
  },

  fetchDailyTaskStats: async () => {
    try {
      const res = await api.get('/daily-tasks/stats');
      if (res.data.success) {
        set({ stats: res.data.stats });
      }
    } catch (err) {
      console.error('Fetch daily task stats error:', err);
    }
  },

  createDailyTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/daily-tasks', data);
      const newTask = res.data.task;
      set((state) => ({
        dailyTasks: [newTask, ...state.dailyTasks],
        isLoading: false,
      }));
      get().fetchDailyTaskStats();
      return { success: true, message: res.data.message, task: newTask };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create daily task';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  updateDailyTask: async (id, updates) => {
    try {
      const res = await api.put(`/daily-tasks/${id}`, updates);
      const updated = res.data.task;
      set((state) => ({
        dailyTasks: state.dailyTasks.map((t) => (t._id === id ? updated : t)),
      }));
      get().fetchDailyTaskStats();
      return { success: true, message: res.data.message || 'Daily task updated!' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update daily task',
      };
    }
  },

  deleteDailyTask: async (id) => {
    try {
      await api.delete(`/daily-tasks/${id}`);
      set((state) => ({
        dailyTasks: state.dailyTasks.filter((t) => t._id !== id),
      }));
      get().fetchDailyTaskStats();
      return { success: true, message: 'Daily task deleted successfully.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to delete daily task',
      };
    }
  },

  getLoadBalancerPreview: async (quota) => {
    try {
      const res = await api.get(`/daily-tasks/preview-load-balancer?quota=${quota}`);
      if (res.data.success) {
        return res.data.preview;
      }
      return null;
    } catch (err) {
      console.error('Load balancer preview error:', err);
      return null;
    }
  },
}));

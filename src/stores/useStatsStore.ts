import { create } from 'zustand';
import api from '../services/api';
import { AdminStats, SMMStats, LeaderboardUser, PointTransaction } from '../types';

interface StatsState {
  adminStats: AdminStats | null;
  smmStats: SMMStats | null;
  leaderboard: LeaderboardUser[];
  transactions: PointTransaction[];
  isLoading: boolean;
  error: string | null;

  fetchDashboardStats: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  adminStats: null,
  smmStats: null,
  leaderboard: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/stats/dashboard');
      const data = res.data;
      if (data.stats.totalSmms !== undefined) {
        set({ adminStats: data.stats, smmStats: null, isLoading: false });
      } else {
        set({ smmStats: data.stats, adminStats: null, transactions: data.recentTransactions || [], isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch dashboard stats', isLoading: false });
    }
  },

  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/stats/leaderboard');
      set({ leaderboard: res.data.leaderboard || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch leaderboard', isLoading: false });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/stats/transactions');
      set({ transactions: res.data.transactions || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch points history', isLoading: false });
    }
  },
}));

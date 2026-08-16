import { create } from 'zustand';
import api from '../services/api';
import { Withdrawal, WithdrawalEligibility, WithdrawalStats } from '../types';
import { useAuthStore } from './useAuthStore';

interface WithdrawalState {
  eligibility: WithdrawalEligibility | null;
  myWithdrawals: Withdrawal[];
  allWithdrawals: Withdrawal[];
  withdrawalStats: WithdrawalStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchEligibility: () => Promise<WithdrawalEligibility | null>;
  fetchMyWithdrawals: () => Promise<void>;
  createWithdrawal: (data: {
    points: number;
    accountNumber: string;
    accountType?: string;
    paymentMethod?: string;
  }) => Promise<{ success: boolean; message: string; withdrawal?: Withdrawal }>;
  fetchAllWithdrawals: (status?: string, search?: string) => Promise<void>;
  updateWithdrawalStatus: (
    id: string,
    action: 'approve' | 'pay' | 'reject',
    transactionId?: string,
    adminNote?: string
  ) => Promise<{ success: boolean; message: string }>;
  fetchWithdrawalStats: () => Promise<void>;
}

export const useWithdrawalStore = create<WithdrawalState>((set, get) => ({
  eligibility: null,
  myWithdrawals: [],
  allWithdrawals: [],
  withdrawalStats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchEligibility: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/withdrawals/eligibility');
      if (response.data.success) {
        set({ eligibility: response.data.eligibility, isLoading: false });
        return response.data.eligibility;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.error('Fetch withdrawal eligibility error:', err);
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch redemption eligibility.',
      });
      return null;
    }
  },

  fetchMyWithdrawals: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/withdrawals/my');
      if (response.data.success) {
        set({ myWithdrawals: response.data.withdrawals, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.error('Fetch my withdrawals error:', err);
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch your withdrawal history.',
      });
    }
  },

  createWithdrawal: async (data) => {
    try {
      set({ isSubmitting: true, error: null });
      const response = await api.post('/withdrawals', data);
      if (response.data.success) {
        const newWithdrawal = response.data.withdrawal;
        set((state) => ({
          myWithdrawals: [newWithdrawal, ...state.myWithdrawals],
          isSubmitting: false,
        }));

        // Refresh user auth store to update points balance in UI
        useAuthStore.getState().fetchMe();

        // Refresh eligibility and stats
        get().fetchEligibility();
        get().fetchWithdrawalStats();

        return {
          success: true,
          message: response.data.message || 'Withdrawal request submitted successfully!',
          withdrawal: newWithdrawal,
        };
      }
      set({ isSubmitting: false });
      return { success: false, message: response.data.message || 'Failed to submit withdrawal' };
    } catch (err: any) {
      console.error('Create withdrawal error:', err);
      const msg = err.response?.data?.message || 'Failed to create withdrawal request.';
      set({ isSubmitting: false, error: msg });
      return { success: false, message: msg };
    }
  },

  fetchAllWithdrawals: async (status, search) => {
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search && search.trim()) params.append('search', search.trim());

      const response = await api.get(`/withdrawals?${params.toString()}`);
      if (response.data.success) {
        set({ allWithdrawals: response.data.withdrawals, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.error('Fetch all withdrawals error:', err);
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch admin withdrawals list.',
      });
    }
  },

  updateWithdrawalStatus: async (id, action, transactionId, adminNote) => {
    try {
      const response = await api.patch(`/withdrawals/${id}/status`, {
        action,
        transactionId,
        adminNote,
      });

      if (response.data.success) {
        const updated = response.data.withdrawal;
        set((state) => ({
          allWithdrawals: state.allWithdrawals.map((w) => (w._id === id ? { ...w, ...updated } : w)),
        }));

        // Refresh admin stats
        get().fetchWithdrawalStats();
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Failed to update withdrawal status' };
    } catch (err: any) {
      console.error('Update withdrawal status error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update withdrawal status.',
      };
    }
  },

  fetchWithdrawalStats: async () => {
    try {
      const response = await api.get('/withdrawals/stats');
      if (response.data.success) {
        set({ withdrawalStats: response.data.stats });
      }
    } catch (err) {
      console.error('Fetch withdrawal stats error:', err);
    }
  },
}));

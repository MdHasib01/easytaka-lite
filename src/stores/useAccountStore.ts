import { create } from 'zustand';
import api from '../services/api';
import { FacebookAccount, AccountMilestoneProgress } from '../types';
import { useAuthStore } from './useAuthStore';

interface AccountState {
  accounts: FacebookAccount[];
  allAccounts: FacebookAccount[]; // Admin view
  selectedAccount: FacebookAccount | null;
  milestoneProgress: AccountMilestoneProgress | null;
  isLoading: boolean;
  error: string | null;

  fetchMyAccounts: () => Promise<void>;
  fetchMilestoneProgress: () => Promise<void>;
  fetchAllAccounts: (approvalStatus?: string) => Promise<void>;
  createAccount: (data: Partial<FacebookAccount>) => Promise<FacebookAccount | null>;
  updateAccount: (id: string, data: Partial<FacebookAccount>) => Promise<boolean>;
  assignAccount: (
    id: string,
    assignedTo: string
  ) => Promise<{ success: boolean; message: string; account?: FacebookAccount }>;
  verifyAccount: (
    id: string,
    action: 'approve' | 'reject',
    adminNote?: string,
    customPoints?: number,
    extraData?: Partial<FacebookAccount>
  ) => Promise<{ success: boolean; message: string; milestoneAwarded?: boolean; milestoneBonusAmount?: number }>;
  deleteAccount: (id: string) => Promise<boolean>;
  setSelectedAccount: (account: FacebookAccount | null) => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  allAccounts: [],
  selectedAccount: null,
  milestoneProgress: null,
  isLoading: false,
  error: null,

  fetchMyAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/accounts/my-accounts');
      const accounts = res.data.accounts || [];
      set({
        accounts,
        selectedAccount: get().selectedAccount || (accounts.length > 0 ? accounts[0] : null),
        isLoading: false,
      });
      // Also fetch milestone progress concurrently
      get().fetchMilestoneProgress();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch accounts', isLoading: false });
    }
  },

  fetchMilestoneProgress: async () => {
    try {
      const res = await api.get('/accounts/milestone-progress');
      if (res.data.success) {
        set({ milestoneProgress: res.data.milestoneProgress });
      }
    } catch (err) {
      console.error('Fetch milestone progress error:', err);
    }
  },

  fetchAllAccounts: async (approvalStatus) => {
    set({ isLoading: true, error: null });
    try {
      const url = approvalStatus && approvalStatus !== 'all'
        ? `/accounts/all?approvalStatus=${approvalStatus}`
        : '/accounts/all';
      const res = await api.get(url);
      set({ allAccounts: res.data.accounts || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch all accounts', isLoading: false });
    }
  },

  createAccount: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/accounts', data);
      const newAccount = res.data.account;
      set((state) => ({
        accounts: [newAccount, ...state.accounts],
        selectedAccount: state.selectedAccount || newAccount,
        isLoading: false,
      }));
      get().fetchMilestoneProgress();
      return newAccount;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add account', isLoading: false });
      return null;
    }
  },

  updateAccount: async (id, data) => {
    try {
      const res = await api.put(`/accounts/${id}`, data);
      const updated = res.data.account;
      set((state) => ({
        accounts: state.accounts.map((a) => (a._id === id ? updated : a)),
        allAccounts: state.allAccounts.map((a) => (a._id === id ? updated : a)),
        selectedAccount: state.selectedAccount?._id === id ? updated : state.selectedAccount,
      }));
      return true;
    } catch (err) {
      return false;
    }
  },

  assignAccount: async (id, assignedTo) => {
    try {
      const res = await api.put(`/accounts/${id}/assign`, { assignedTo });
      const updated = res.data.account;
      set((state) => ({
        accounts: state.accounts.map((a) => (a._id === id ? updated : a)),
        allAccounts: state.allAccounts.map((a) => (a._id === id ? updated : a)),
        selectedAccount: state.selectedAccount?._id === id ? updated : state.selectedAccount,
      }));
      return { success: true, message: res.data.message, account: updated };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign Facebook account';
      return { success: false, message: msg };
    }
  },

  verifyAccount: async (id, action, adminNote, customPoints, extraData) => {
    try {
      const res = await api.put(`/accounts/${id}/verify`, {
        action,
        adminNote,
        customPoints,
        ...(extraData || {}),
      });

      const updated = res.data.account;
      set((state) => ({
        allAccounts: state.allAccounts.map((a) => (a._id === id ? updated : a)),
      }));

      // Refresh SMM balance if logged in user is updated
      useAuthStore.getState().fetchMe();

      return {
        success: true,
        message: res.data.message,
        milestoneAwarded: res.data.milestoneAwarded,
        milestoneBonusAmount: res.data.milestoneBonusAmount,
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Account verification update failed';
      return { success: false, message: msg };
    }
  },

  deleteAccount: async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      set((state) => ({
        accounts: state.accounts.filter((a) => a._id !== id),
        allAccounts: state.allAccounts.filter((a) => a._id !== id),
        selectedAccount: state.selectedAccount?._id === id ? (state.accounts[0] || null) : state.selectedAccount,
      }));
      get().fetchMilestoneProgress();
      return true;
    } catch (err) {
      return false;
    }
  },

  setSelectedAccount: (account) => {
    set({ selectedAccount: account });
  },
}));

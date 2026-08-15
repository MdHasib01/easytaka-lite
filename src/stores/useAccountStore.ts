import { create } from 'zustand';
import api from '../services/api';
import { FacebookAccount } from '../types';

interface AccountState {
  accounts: FacebookAccount[];
  allAccounts: FacebookAccount[]; // Admin view
  selectedAccount: FacebookAccount | null;
  isLoading: boolean;
  error: string | null;

  fetchMyAccounts: () => Promise<void>;
  fetchAllAccounts: () => Promise<void>;
  createAccount: (data: Partial<FacebookAccount>) => Promise<FacebookAccount | null>;
  updateAccount: (id: string, data: Partial<FacebookAccount>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  setSelectedAccount: (account: FacebookAccount | null) => void;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  allAccounts: [],
  selectedAccount: null,
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
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch accounts', isLoading: false });
    }
  },

  fetchAllAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/accounts/all');
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

  deleteAccount: async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      set((state) => ({
        accounts: state.accounts.filter((a) => a._id !== id),
        allAccounts: state.allAccounts.filter((a) => a._id !== id),
        selectedAccount: state.selectedAccount?._id === id ? (state.accounts[0] || null) : state.selectedAccount,
      }));
      return true;
    } catch (err) {
      return false;
    }
  },

  setSelectedAccount: (account) => {
    set({ selectedAccount: account });
  },
}));

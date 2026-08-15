import { create } from 'zustand';
import api from '../services/api';
import { DailyRoutineCardData, RoutineItemState } from '../types';
import confetti from 'canvas-confetti';

interface DailyState {
  date: string;
  routines: DailyRoutineCardData[];
  overallProgress: number;
  totalAccounts: number;
  completedAccountsCount: number;
  isLoading: boolean;
  error: string | null;

  fetchTodayRoutines: (date?: string) => Promise<void>;
  updateRoutineProgress: (
    accountId: string,
    updates: Partial<RoutineItemState> & { notes?: string },
    date?: string
  ) => Promise<boolean>;
}

export const useDailyStore = create<DailyState>((set, get) => ({
  date: new Date().toISOString().split('T')[0],
  routines: [],
  overallProgress: 0,
  totalAccounts: 0,
  completedAccountsCount: 0,
  isLoading: false,
  error: null,

  fetchTodayRoutines: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const url = date ? `/daily/today?date=${date}` : '/daily/today';
      const res = await api.get(url);
      set({
        date: res.data.date,
        routines: res.data.routines || [],
        overallProgress: res.data.overallProgress || 0,
        totalAccounts: res.data.totalAccounts || 0,
        completedAccountsCount: res.data.completedAccountsCount || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load daily routines',
        isLoading: false,
      });
    }
  },

  updateRoutineProgress: async (accountId, updates, date) => {
    try {
      const targetDate = date || get().date;
      const res = await api.post('/daily/update', {
        accountId,
        date: targetDate,
        updates,
      });

      const updatedRoutine = res.data.routine;
      const newOverallProgress = res.data.overallProgress;

      // Check if newly reached 100%
      if (newOverallProgress === 100 && get().overallProgress < 100) {
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }

      set((state) => ({
        routines: state.routines.map((item) =>
          item.account.id === accountId
            ? { ...item, routine: updatedRoutine }
            : item
        ),
        overallProgress: newOverallProgress,
      }));

      return true;
    } catch (err) {
      return false;
    }
  },
}));

import { create } from 'zustand';
import api from '../services/api';
import { DailyRoutineCardData, RoutineItemState, DailyWorkSubmission, DailyTaskScoreRules } from '../types';
import confetti from 'canvas-confetti';
import { useAuthStore } from './useAuthStore';

interface DailyState {
  date: string;
  routines: DailyRoutineCardData[];
  overallProgress: number;
  totalAccounts: number;
  completedAccountsCount: number;
  dailyTaskCompletionReward: number;
  scoreRules: DailyTaskScoreRules | null;
  dailyRewardClaimedToday: boolean;
  submission: DailyWorkSubmission | null;
  justEarnedDailyReward: { awarded: boolean; amount: number; score?: number } | null;
  isLoading: boolean;
  error: string | null;

  // Admin states
  dailySubmissions: DailyWorkSubmission[];
  adminScoreRules: DailyTaskScoreRules | null;
  adminDefaultDailyReward: number;
  isSubmissionsLoading: boolean;

  fetchTodayRoutines: (date?: string) => Promise<void>;
  updateRoutineProgress: (
    accountId: string,
    updates: Partial<RoutineItemState> & { notes?: string },
    date?: string
  ) => Promise<{ success: boolean }>;
  submitDailyWork: (data: {
    date?: string;
    smmNotes?: string;
    proofUrl?: string;
    screenshotUrl?: string;
  }) => Promise<{ success: boolean; message: string; submission?: DailyWorkSubmission }>;
  fetchDailySubmissions: (filters?: { status?: string; date?: string; smmId?: string }) => Promise<void>;
  reviewDailySubmission: (
    id: string,
    data: {
      action: 'approve' | 'reject';
      reviewScore?: number;
      pointsAwarded?: number;
      adminFeedback?: string;
    }
  ) => Promise<{ success: boolean; message: string; submission?: DailyWorkSubmission }>;
  clearDailyRewardToast: () => void;
}

export const useDailyStore = create<DailyState>((set, get) => ({
  date: new Date().toISOString().split('T')[0],
  routines: [],
  overallProgress: 0,
  totalAccounts: 0,
  completedAccountsCount: 0,
  dailyTaskCompletionReward: 100,
  scoreRules: null,
  dailyRewardClaimedToday: false,
  submission: null,
  justEarnedDailyReward: null,
  isLoading: false,
  error: null,

  dailySubmissions: [],
  adminScoreRules: null,
  adminDefaultDailyReward: 100,
  isSubmissionsLoading: false,

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
        dailyTaskCompletionReward: res.data.dailyTaskCompletionReward ?? 100,
        scoreRules: res.data.scoreRules || null,
        dailyRewardClaimedToday: !!res.data.dailyRewardClaimedToday,
        submission: res.data.submission || null,
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

      set((state) => ({
        routines: state.routines.map((item) =>
          item.account.id === accountId ? { ...item, routine: updatedRoutine } : item
        ),
        overallProgress: newOverallProgress,
      }));

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  submitDailyWork: async (data) => {
    try {
      const targetDate = data.date || get().date;
      const res = await api.post('/daily/submit', {
        date: targetDate,
        smmNotes: data.smmNotes,
        proofUrl: data.proofUrl,
        screenshotUrl: data.screenshotUrl,
      });

      if (res.data.success) {
        set({ submission: res.data.submission });
        return {
          success: true,
          message: res.data.message || 'Daily routine submitted for Admin review!',
          submission: res.data.submission,
        };
      }
      return { success: false, message: res.data.message || 'Failed to submit daily routine' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to submit daily routine',
      };
    }
  },

  fetchDailySubmissions: async (filters = {}) => {
    set({ isSubmissionsLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      if (filters.smmId) params.append('smmId', filters.smmId);

      const res = await api.get(`/daily/submissions?${params.toString()}`);
      if (res.data.success) {
        set({
          dailySubmissions: res.data.submissions || [],
          adminScoreRules: res.data.scoreRules || null,
          adminDefaultDailyReward: res.data.defaultDailyCompletionReward || 100,
          isSubmissionsLoading: false,
        });
      }
    } catch (err: any) {
      console.error('Fetch daily submissions error:', err);
      set({ isSubmissionsLoading: false });
    }
  },

  reviewDailySubmission: async (id, data) => {
    try {
      const res = await api.post(`/daily/submissions/${id}/review`, data);
      if (res.data.success) {
        const updated = res.data.submission;
        set((state) => ({
          dailySubmissions: state.dailySubmissions.map((s) => (s._id === id ? updated : s)),
        }));
        return {
          success: true,
          message: res.data.message || 'Submission review saved!',
          submission: updated,
        };
      }
      return { success: false, message: res.data.message || 'Failed to review submission' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to review submission',
      };
    }
  },

  clearDailyRewardToast: () => {
    set({ justEarnedDailyReward: null });
  },
}));

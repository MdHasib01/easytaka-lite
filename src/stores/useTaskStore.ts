import { create } from 'zustand';
import api from '../services/api';
import { Task, TaskSubmission, SubmissionStatus } from '../types';
import { useAuthStore } from './useAuthStore';

interface TaskState {
  tasks: Task[];
  submissions: TaskSubmission[]; // Admin queue
  mySubmissions: TaskSubmission[]; // SMM history
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  fetchTasks: (status?: string, type?: string) => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;

  submitProof: (
    taskId: string,
    payload: {
      facebookAccountId?: string;
      profileUrl?: string;
      proofUrl?: string;
      screenshotUrl?: string;
      smmNotes?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;

  fetchSubmissions: (status?: string) => Promise<void>;
  fetchMySubmissions: () => Promise<void>;
  verifySubmission: (
    id: string,
    action: 'approve' | 'reject',
    adminNote?: string,
    bonusPoints?: number
  ) => Promise<{ success: boolean; message: string }>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  submissions: [],
  mySubmissions: [],
  selectedTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (status, type) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const res = await api.get(`/tasks?${params.toString()}`);
      set({ tasks: res.data.tasks || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchTaskById: async (id: string) => {
    try {
      const res = await api.get(`/tasks/${id}`);
      set({ selectedTask: res.data.task });
      return res.data.task;
    } catch (err) {
      return null;
    }
  },

  createTask: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/tasks', data);
      const newTask = res.data.task;
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false,
      }));
      return newTask;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create task', isLoading: false });
      return null;
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      const updated = res.data.task;
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? updated : t)),
      }));
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
      return true;
    } catch (err) {
      return false;
    }
  },

  submitProof: async (taskId, payload) => {
    set({ isLoading: true });
    try {
      const res = await api.post(`/tasks/${taskId}/submit`, payload);
      const submission = res.data.submission;

      // Update tasks list to reflect submission
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? { ...t, mySubmission: submission } : t)),
        mySubmissions: [submission, ...state.mySubmissions.filter((s) => s.taskId !== taskId)],
        isLoading: false,
      }));

      return { success: true, message: res.data.message || 'Proof submitted successfully!' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Submission failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  fetchSubmissions: async (status) => {
    set({ isLoading: true });
    try {
      const url = status && status !== 'all' ? `/tasks/submissions/all?status=${status}` : '/tasks/submissions/all';
      const res = await api.get(url);
      set({ submissions: res.data.submissions || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch submissions', isLoading: false });
    }
  },

  fetchMySubmissions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/tasks/submissions/my');
      set({ mySubmissions: res.data.submissions || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch my submissions', isLoading: false });
    }
  },

  verifySubmission: async (id, action, adminNote, bonusPoints) => {
    try {
      const res = await api.put(`/tasks/submissions/${id}/verify`, {
        action,
        adminNote,
        bonusPoints,
      });
      const updatedSubmission = res.data.submission;

      set((state) => ({
        submissions: state.submissions.map((s) => (s._id === id ? updatedSubmission : s)),
      }));

      // Refresh current user if SMM
      useAuthStore.getState().fetchMe();

      return { success: true, message: res.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification update failed';
      return { success: false, message: msg };
    }
  },
}));

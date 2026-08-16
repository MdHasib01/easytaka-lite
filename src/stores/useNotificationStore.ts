import { create } from 'zustand';
import api from '../services/api';
import { NotificationItem } from '../types';
import { initializeWebSocket, getSocket } from '../services/socket';
import confetti from 'canvas-confetti';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  liveToast: NotificationItem | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: NotificationItem) => void;
  clearLiveToast: () => void;
  initSocketListeners: (token: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  liveToast: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        set({
          notifications: res.data.notifications || [],
          unreadCount: res.data.unreadCount || 0,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Mark all notifications read error:', err);
    }
  },

  addNotification: (item: NotificationItem) => {
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      liveToast: item,
    }));

    // Trigger confetti for celebratory milestones & rewards
    if (['milestone_unlocked', 'daily_reward', 'account_approved', 'task_approved'].includes(item.type)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    // Auto-clear live toast after 5 seconds
    setTimeout(() => {
      if (get().liveToast?._id === item._id) {
        set({ liveToast: null });
      }
    }, 5000);
  },

  clearLiveToast: () => {
    set({ liveToast: null });
  },

  initSocketListeners: (token: string) => {
    const socket = initializeWebSocket(token);

    socket.off('notification:new'); // prevent duplicate listeners

    socket.on('notification:new', (data: { notification: NotificationItem }) => {
      console.log('⚡ [Live Notification Received via WebSocket]:', data.notification);
      if (data?.notification) {
        get().addNotification(data.notification);
      }
    });
  },
}));

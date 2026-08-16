import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LiveNotificationToast } from '../notifications/LiveNotificationToast';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { disconnectWebSocket } from '../../services/socket';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, isAuthenticated } = useAuthStore();
  const { fetchNotifications, initSocketListeners } = useNotificationStore();

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchNotifications();
      initSocketListeners(token);
    }

    return () => {
      // Disconnect socket on unmount
      disconnectWebSocket();
    };
  }, [token, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col relative">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating Live Real-Time Toast Alerts */}
      <LiveNotificationToast />
    </div>
  );
};

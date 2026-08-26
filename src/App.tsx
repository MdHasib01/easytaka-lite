import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SetupAccount } from './pages/SetupAccount';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { VerificationsPage } from './pages/VerificationsPage';
import { AccountsPage } from './pages/AccountsPage';
import { DailyRoutinesPage } from './pages/DailyRoutinesPage';
import { AdminDailyTasksPage } from './pages/AdminDailyTasksPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { WithdrawPage } from './pages/WithdrawPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { SmmManagementPage } from './pages/SmmManagementPage';
import { BrandsPage } from './pages/BrandsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-account" element={<SetupAccount />} />

        {/* Protected Dashboard & App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="daily-tasks" element={<AdminDailyTasksPage />} />
          <Route path="verifications" element={<VerificationsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="daily" element={<DailyRoutinesPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="smm-management" element={<SmmManagementPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

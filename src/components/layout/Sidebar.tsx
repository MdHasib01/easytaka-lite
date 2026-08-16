import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStatsStore } from '../../stores/useStatsStore';
import { useTaskStore } from '../../stores/useTaskStore';
import {
  LayoutDashboard,
  CheckSquare,
  ShieldCheck,
  Users,
  CalendarCheck,
  Trophy,
  UserCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { adminStats, smmStats } = useStatsStore();
  const { tasks, mySubmissions } = useTaskStore();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';
  const currentTab = new URLSearchParams(location.search).get('tab') || 'available';

  const pendingCount = mySubmissions.filter((s) => s.status === 'pending').length || smmStats?.pendingSubmissions || 0;
  const approvedCount = mySubmissions.filter((s) => s.status === 'approved').length || smmStats?.approvedSubmissions || 0;

  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
        {
          name: 'Tasks Hub',
          path: '/tasks',
          icon: CheckSquare,
          highlight: true,
        },
        {
          name: 'Daily Task Manager',
          path: '/daily-tasks',
          icon: CalendarCheck,
        },
        {
          name: 'Verification Portal',
          path: '/verifications',
          icon: ShieldCheck,
          badge: adminStats?.pendingVerifications ? `${adminStats.pendingVerifications}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        { name: 'All FB Accounts', path: '/accounts', icon: Users },
        { name: 'SMM Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'My Profile', path: '/profile', icon: UserCheck },
      ]
    : [
        { name: 'SMM Dashboard', path: '/', icon: LayoutDashboard },
        {
          name: 'Available Tasks',
          path: '/tasks?tab=available',
          basePath: '/tasks',
          tabId: 'available',
          icon: Sparkles,
          highlight: true,
        },
        {
          name: 'Under Review',
          path: '/tasks?tab=under_review',
          basePath: '/tasks',
          tabId: 'under_review',
          icon: Clock,
          badge: pendingCount > 0 ? `${pendingCount}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          name: 'Completed Tasks',
          path: '/tasks?tab=completed',
          basePath: '/tasks',
          tabId: 'completed',
          icon: CheckCircle2,
          badge: approvedCount > 0 ? `${approvedCount}` : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
        { name: 'Daily Fixed Routines', path: '/daily', icon: CalendarCheck },
        { name: 'My Facebook Accounts', path: '/accounts', icon: Users },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Profile & Points', path: '/profile', icon: UserCheck },
      ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={clsx(
          'fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col justify-between border-r border-slate-800/80 bg-[#090D16]/95 backdrop-blur-xl p-4 transition-transform duration-300 ease-in-out md:translate-x-0 flex',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="space-y-6">
          {/* Section Label */}
          <div className="px-3 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Management Console' : 'SMM Workspace'}
            </p>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              let isActive = false;
              if (item.tabId) {
                isActive = location.pathname === item.basePath && currentTab === item.tabId;
              } else if (item.path === '/') {
                isActive = location.pathname === '/';
              } else {
                isActive = location.pathname.startsWith(item.path);
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={clsx(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow-brand font-semibold'
                      : item.highlight
                      ? 'text-slate-200 hover:text-white hover:bg-slate-800/60 bg-slate-900/40 border border-slate-800/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-colors',
                        isActive
                          ? 'text-indigo-400'
                          : item.highlight
                          ? 'text-indigo-400 group-hover:text-indigo-300'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={clsx(
                        'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                        item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info Box */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-300">
            <span>EsyTaka Lite v1.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-400">
            {isAdmin ? 'Admin Management Console' : 'Complete available tasks to earn points'}
          </p>
        </div>
      </aside>
    </>
  );
};

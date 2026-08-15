import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStatsStore } from '../../stores/useStatsStore';
import {
  LayoutDashboard,
  CheckSquare,
  ShieldCheck,
  Users,
  CalendarCheck,
  Trophy,
  UserCheck,
  PlusCircle,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { adminStats } = useStatsStore();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
        {
          name: 'Verification Portal',
          path: '/verifications',
          icon: ShieldCheck,
          badge: adminStats?.pendingVerifications ? `${adminStats.pendingVerifications}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
        { name: 'All FB Accounts', path: '/accounts', icon: Users },
        { name: 'SMM Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'My Profile', path: '/profile', icon: UserCheck },
      ]
    : [
        { name: 'SMM Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Daily Fixed Tasks', path: '/daily', icon: CalendarCheck, highlight: true },
        { name: 'My Facebook Accounts', path: '/accounts', icon: Users },
        { name: 'Available Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'My Submissions', path: '/verifications', icon: Clock },
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
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={clsx(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
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
            {isAdmin ? 'Admin Approval Queue Online' : 'Complete daily routines to boost streak'}
          </p>
        </div>
      </aside>
    </>
  );
};

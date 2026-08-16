import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAccountStore } from '../../stores/useAccountStore';
import { useDailyStore } from '../../stores/useDailyStore';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { Button } from '../ui/Button';
import {
  Coins,
  Flame,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  CheckCircle2,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, demoLogin } = useAuthStore();
  const { accounts, selectedAccount, setSelectedAccount } = useAccountStore();
  const { overallProgress } = useDailyStore();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090D16]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-glow-fb flex items-center justify-center">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-lg">
                  ET
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors font-sans">
                  EsyTaka <span className="text-indigo-400 font-light">Lite</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  FB Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Facebook Task & Media Hub</p>
            </div>
          </Link>
        </div>

        {/* Center/Right Items */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* SMM: Active Account Selector */}
          {!isAdmin && accounts.length > 0 && (
            <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 px-2.5 gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Account:
              </span>
              <select
                value={selectedAccount?._id || ''}
                onChange={(e) => {
                  const found = accounts.find((a) => a._id === e.target.value);
                  if (found) setSelectedAccount(found);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id} className="bg-slate-900 text-slate-200">
                    {acc.accountName} ({acc.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SMM: Daily Progress Indicator */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Daily:</span>
                <span className="font-bold text-slate-200">{overallProgress}%</span>
              </div>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overallProgress >= 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {overallProgress >= 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
          )}

          {/* Reward Points Pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl px-3 py-1.5 text-amber-300 text-xs font-semibold shadow-sm">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
            <span>{user?.rewardPoints ?? 0}</span>
            <span className="text-[10px] text-amber-400/80 font-normal">pts</span>
          </div>

          {/* SMM Streak Pill */}
          {!isAdmin && (user?.streakDays || 0) > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-xl px-2.5 py-1.5 text-orange-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{user?.streakDays}d Streak</span>
            </div>
          )}

          {/* Live Notification Dropdown Bell */}
          <NotificationDropdown />

          {/* Quick Demo Role Switcher button */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => demoLogin(isAdmin ? 'smm' : 'admin')}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Quickly switch demo role to test Admin and SMM views"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Switch to {isAdmin ? 'SMM' : 'Admin'}
            </button>
          </div>

          {/* User Profile & Role Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                  }
                  alt={user?.name}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold ring-2 ring-[#090D16]">
                    A
                  </span>
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</div>
                <div className="text-[10px] font-medium text-slate-400 capitalize flex items-center gap-1">
                  {isAdmin ? (
                    <span className="text-indigo-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span>SMM Agent</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

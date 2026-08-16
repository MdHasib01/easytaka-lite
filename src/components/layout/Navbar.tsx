import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAccountStore } from '../../stores/useAccountStore';
import { useDailyStore } from '../../stores/useDailyStore';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Button } from '../ui/Button';
import {
  Coins,
  Flame,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Layers,
  CheckCircle2,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { accounts, selectedAccount, setSelectedAccount } = useAccountStore();
  const { overallProgress } = useDailyStore();

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 gap-2">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <img
              src="/assets/logo.png"
              alt="EsyTaka Lite"
              className="h-8 sm:h-9 w-auto object-contain flex-shrink-0 drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors font-sans whitespace-nowrap">
                  EsyTaka <span className="text-indigo-400 font-light">Lite</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hidden md:inline-block">
                  FB Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block truncate">Facebook Task & Media Hub</p>
            </div>
          </Link>
        </div>

        {/* Center/Right Items */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 flex-shrink-0">
          {/* SMM: Active Account Selector */}
          {!isAdmin && accounts.length > 0 && (
            <div className="hidden xl:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 px-2.5 gap-2 text-xs flex-shrink-0">
              <span className="text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> {t('common.account')}:
              </span>
              <select
                value={selectedAccount?._id || ''}
                onChange={(e) => {
                  const found = accounts.find((a) => a._id === e.target.value);
                  if (found) setSelectedAccount(found);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate"
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
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-2.5 py-1.5 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Daily:</span>
                <span className="font-bold text-slate-200">{overallProgress}%</span>
              </div>
              <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    overallProgress >= 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {overallProgress >= 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
          )}

          {/* Reward Points Pill (Links to Withdraw Points / Cashout) */}
          <Link
            to="/withdraw"
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15 transition-all rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-amber-300 text-xs font-semibold shadow-sm flex-shrink-0 group cursor-pointer"
            title="Click to Withdraw Points to bKash"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition-transform animate-bounce flex-shrink-0" style={{ animationDuration: '3s' }} />
            <span className="font-bold tabular-nums">{user?.rewardPoints ?? 0}</span>
            <span className="text-[10px] text-amber-400/80 font-normal hidden min-[400px]:inline">{t('common.pts')}</span>
            <span className="hidden xl:inline text-[9px] font-bold text-pink-400 bg-pink-500/20 px-1 py-0.2 rounded ml-0.5">৳ Cashout</span>
          </Link>

          {/* SMM Streak Pill */}
          {!isAdmin && (user?.streakDays || 0) > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-orange-400 text-xs font-semibold flex-shrink-0">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{user?.streakDays}{t('common.daysStreak')}</span>
            </div>
          )}

          {/* Language Switcher (EN / বাংলা) */}
          <LanguageSwitcher />

          {/* Live Notification Dropdown Bell */}
          <NotificationDropdown />

          {/* User Profile & Role Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2.5 border-l border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                  }
                  alt={user?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                {isAdmin && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold ring-2 ring-[#090D16]">
                    A
                  </span>
                )}
              </div>

              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight max-w-[90px] truncate">{user?.name}</div>
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
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

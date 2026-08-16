import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { NotificationItem, NotificationType } from '../../types';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trophy,
  Coins,
  ExternalLink,
  ShieldCheck,
  Users,
  FileText,
  Zap,
} from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'task_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'task_rejected':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'account_approved':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'account_rejected':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'milestone_unlocked':
        return <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />;
      case 'daily_reward':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'new_task':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'new_submission':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'new_account':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'new_smm_verification':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Zap className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return t('common.justNow');
    if (diffMin < 60) return `${diffMin} ${t('common.mAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('common.hAgo')}`;
    return `${diffDays} ${t('common.dAgo')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex-shrink-0"
        title={t('common.notifications')}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:top-0.5 sm:right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-rose-500 text-[8px] sm:text-[9px] font-black text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Mobile Backdrop to prevent background touches & close smoothly */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu - Solid background with accent gradient */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-full inset-x-2 sm:inset-x-auto sm:right-0 mt-1 sm:mt-2 w-auto sm:w-96 max-h-[calc(100dvh-5rem)] flex flex-col rounded-2xl bg-[#0B0F19] border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Top Accent Gradient Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0" />

          {/* Header */}
          <div className="p-3 sm:p-3.5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{t('common.notifications')}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/40 shadow-sm">
                  {unreadCount} {t('common.new')}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> {t('common.markAllRead')}
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 sm:px-3.5 py-2 border-b border-slate-800/80 flex items-center gap-2 bg-[#0B0F19] text-xs flex-shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/20 border border-indigo-400/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {t('common.allNotifications')} ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeFilter === 'unread'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/20 border border-indigo-400/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {t('common.unread')} ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 bg-[#0B0F19]">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-400 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-semibold text-slate-300">{t('common.noNotifications')}</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {activeFilter === 'unread'
                    ? t('common.noUnreadNotifications')
                    : t('common.activityRewardWillAppear')}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-800/50 ${
                    !notif.isRead ? 'bg-indigo-950/30' : 'bg-transparent'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5
                        className={`text-xs font-bold truncate ${
                          !notif.isRead ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-1.5 pt-0.5">
                      {notif.points ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/30">
                          <Coins className="w-3 h-3" /> +{notif.points} {t('common.pts')}
                        </span>
                      ) : (
                        <span />
                      )}

                      {notif.link && (
                        <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-0.5 hover:underline">
                          {t('common.viewDetails')} <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5 shadow-glow-brand" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

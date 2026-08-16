import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../stores/useNotificationStore';
import {
  CheckCircle2,
  AlertCircle,
  Trophy,
  Coins,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Users,
  FileText,
} from 'lucide-react';

export const LiveNotificationToast: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { liveToast, clearLiveToast, markAsRead } = useNotificationStore();

  if (!liveToast) return null;

  const handleClick = async () => {
    await markAsRead(liveToast._id);
    if (liveToast.link) {
      navigate(liveToast.link);
    }
    clearLiveToast();
  };

  const getIcon = () => {
    switch (liveToast.type) {
      case 'task_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'task_rejected':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'milestone_unlocked':
        return <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />;
      case 'daily_reward':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'account_approved':
        return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'new_task':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'new_submission':
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'new_account':
        return <Users className="w-5 h-5 text-blue-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed top-18 sm:top-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 sm:max-w-sm z-[70] pointer-events-none animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        onClick={handleClick}
        className="glass-panel pointer-events-auto p-4 rounded-2xl border border-indigo-500/40 bg-[#0B0F1A]/95 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-indigo-500/70 transition-all flex items-start gap-3 relative overflow-hidden group"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white leading-tight">{liveToast.title}</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          </div>

          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {liveToast.message}
          </p>

          <div className="flex items-center justify-between gap-2 mt-2">
            {liveToast.points ? (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/30">
                <Coins className="w-3 h-3" /> +{liveToast.points} {t('common.pts')} {t('common.ptsEarned')}
              </span>
            ) : (
              <span />
            )}

            {liveToast.link && (
              <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 group-hover:underline">
                {t('common.viewDetails')} <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearLiveToast();
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

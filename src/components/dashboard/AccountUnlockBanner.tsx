import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Lock, PlusCircle, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccountUnlockBannerProps {
  accountsCount: number;
  requiredCount?: number;
  onAddAccount: () => void;
}

export const AccountUnlockBanner: React.FC<AccountUnlockBannerProps> = ({
  accountsCount,
  requiredCount = 5,
  onAddAccount,
}) => {
  const isUnlocked = accountsCount >= requiredCount;
  const progressPercent = Math.min(100, Math.round((accountsCount / requiredCount) * 100));
  const remaining = Math.max(0, requiredCount - accountsCount);

  if (isUnlocked) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-indigo-950/40 shadow-2xl shadow-amber-950/20">
      {/* Background ambient glow circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Initial Setup Required
            </span>

            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Unlock Task Participation
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Create 5 Facebook Accounts to Unlock Tasks
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            As a fresh SMM, you must register at least <strong className="text-amber-300">5 Facebook accounts</strong> before daily task participation and proof submissions are unlocked. You have created <strong className="text-white">{accountsCount} of {requiredCount}</strong>. Add <strong className="text-amber-300">{remaining} more</strong> to unlock everything!
          </p>
        </div>

        {/* Right: Progress & Action */}
        <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Account Setup Progress</span>
            <span className="text-sm font-extrabold text-amber-300 tabular-nums">
              {accountsCount} / {requiredCount} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-500 shadow-glow-brand"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="pt-1 flex items-center gap-2">
            <Button
              variant="glow"
              size="sm"
              onClick={onAddAccount}
              className="w-full shadow-glow-brand"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add Facebook Account ({accountsCount}/{requiredCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

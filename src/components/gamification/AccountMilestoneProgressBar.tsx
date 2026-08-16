import React from 'react';
import { AccountMilestoneProgress } from '../../types';
import { Sparkles, Trophy, Gift, CheckCircle2, ShieldCheck, Flame, Star, Zap } from 'lucide-react';

interface AccountMilestoneProgressBarProps {
  milestoneProgress: AccountMilestoneProgress | null;
  className?: string;
}

export const AccountMilestoneProgressBar: React.FC<AccountMilestoneProgressBarProps> = ({
  milestoneProgress,
  className = '',
}) => {
  if (!milestoneProgress) return null;

  const {
    approvedAccounts,
    pendingAccounts,
    milestoneStep,
    currentProgressInStep,
    percentage,
    accountsNeededForNext,
    nextRewardPoints,
    accountCreationReward,
    totalMilestonesUnlocked,
    totalBonusPointsEarned,
  } = milestoneProgress;

  const currentLevel = totalMilestonesUnlocked + 1;
  const isMilestoneReached = currentProgressInStep === 0 && approvedAccounts > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl glass-panel p-6 border border-indigo-500/30 bg-gradient-to-r from-slate-900/95 via-indigo-950/40 to-slate-900/95 shadow-glow-brand ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-600/25 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Facebook Creator Quest
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Level {currentLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Earn <span className="text-amber-300 font-bold">+{accountCreationReward} PTS</span> per approved account &{' '}
                <span className="text-amber-300 font-bold">+{nextRewardPoints} PTS BONUS</span> every {milestoneStep} accounts!
              </p>
            </div>
          </div>

          {/* Bonus Counter Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 shadow-inner">
            <Gift className="w-4 h-4 text-pink-400 animate-bounce" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block leading-tight">
                Bonus Unlocked
              </span>
              <span className="text-xs font-black text-white">
                {totalMilestonesUnlocked}x ({totalBonusPointsEarned} pts)
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Steps Interactive Timeline */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Milestone Progress ({currentProgressInStep} / {milestoneStep} Approved)
            </span>
            <span className="font-extrabold text-amber-300 tabular-nums text-sm">
              {percentage}%
            </span>
          </div>

          {/* Gamified Segmented Progress Bar */}
          <div className="relative">
            {/* Base track */}
            <div className="h-4 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.max(4, percentage)}%` }}
              >
                {/* Glow dot on tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow-brand" />
              </div>
            </div>

            {/* Step markers */}
            <div className="flex justify-between items-center mt-2 px-1">
              {Array.from({ length: milestoneStep }).map((_, index) => {
                const stepNum = index + 1;
                const isStepCompleted = currentProgressInStep >= stepNum || (isMilestoneReached && stepNum === milestoneStep);
                const isCurrent = currentProgressInStep + 1 === stepNum;
                const isLast = stepNum === milestoneStep;

                return (
                  <div key={index} className="flex flex-col items-center gap-1 relative group">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                        isStepCompleted
                          ? isLast
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-glow-brand ring-2 ring-amber-400/40'
                            : 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                          : isCurrent
                          ? 'bg-slate-900 border-2 border-indigo-500 text-indigo-300 animate-pulse'
                          : 'bg-slate-900 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {isLast ? (
                        <Gift className={`w-3.5 h-3.5 ${isStepCompleted ? 'fill-slate-950' : 'text-pink-400'}`} />
                      ) : isStepCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isLast
                          ? 'text-amber-400 font-extrabold'
                          : isStepCompleted
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {isLast ? `+${nextRewardPoints} PTS` : `Acc ${stepNum}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Motivational Status Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 font-semibold text-[11px] border border-indigo-500/20">
              {approvedAccounts} Total Approved Profiles
            </span>
            {pendingAccounts > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-semibold text-[11px] border border-amber-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {pendingAccounts} Awaiting Review
              </span>
            )}
          </div>

          <div className="font-semibold text-slate-300 flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            {accountsNeededForNext === milestoneStep ? (
              <span className="text-emerald-400 font-bold">
                🎯 Quest Reset: Add {milestoneStep} more accounts for next +{nextRewardPoints} PTS!
              </span>
            ) : (
              <span>
                Add & verify <strong className="text-amber-300 font-black">{accountsNeededForNext} more</strong>{' '}
                {accountsNeededForNext === 1 ? 'account' : 'accounts'} to unlock{' '}
                <strong className="text-amber-300 font-black">+{nextRewardPoints} PTS Bonus</strong>!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

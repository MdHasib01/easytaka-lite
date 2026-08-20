import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import {
  Flame,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
  Coins,
  Award,
  Clock,
  AlertCircle,
  Star,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DailyWorkSubmission } from '../../types';

interface DailyProgressBannerProps {
  overallProgress: number;
  totalAccounts: number;
  completedAccountsCount: number;
  streakDays?: number;
  dailyTaskCompletionReward?: number;
  dailyRewardClaimedToday?: boolean;
  submission?: DailyWorkSubmission | null;
  onSubmitClick?: () => void;
}

export const DailyProgressBanner: React.FC<DailyProgressBannerProps> = ({
  overallProgress,
  totalAccounts,
  completedAccountsCount,
  streakDays = 0,
  dailyTaskCompletionReward = 100,
  dailyRewardClaimedToday = false,
  submission,
  onSubmitClick,
}) => {
  const isApproved = submission?.status === 'approved' || dailyRewardClaimedToday;
  const isPending = submission?.status === 'pending';
  const isRejected = submission?.status === 'rejected';

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 shadow-2xl">
      {/* Background ambient glow circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Daily Engagement Focus
            </span>

            {/* Status Pill */}
            {isApproved ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ⭐ {submission?.reviewScore ? `${submission.reviewScore}/5` : '5/5'} Approved (+{submission?.pointsAwarded || dailyTaskCompletionReward} PTS Credited)
              </span>
            ) : isPending ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Submitted — Awaiting Admin Review
              </span>
            ) : isRejected ? (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Revision Requested
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Earn up to +{dailyTaskCompletionReward} PTS (Admin Review)
              </span>
            )}

            {streakDays > 0 && (
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-pulse" />
                {streakDays} Days Streak
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isApproved
              ? '🎉 Outstanding! Daily Routine Evaluated & Rewarded!'
              : isPending
              ? '📋 Daily Routine Submitted for Review!'
              : isRejected
              ? '⚠️ Daily Routine Revision Needed'
              : overallProgress > 50
              ? '⚡ You are making great daily progress!'
              : '🚀 Ready to crush today’s Facebook tasks?'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isApproved
              ? `Your daily routine has been approved by the Admin team! ${submission?.adminFeedback ? `Feedback: "${submission.adminFeedback}"` : ''}`
              : isPending
              ? 'Your routine checklist across all profiles has been submitted to the Admin queue for review and scoring.'
              : isRejected
              ? `Admin feedback: "${submission?.adminFeedback || 'Please update and resubmit.'}"`
              : `Complete the routine checklist across all ${totalAccounts} Facebook profiles today and submit your day's work to receive your review score and reward points.`}
          </p>

          {/* Submission action button if not submitted or rejected */}
          {!isApproved && !isPending && onSubmitClick && totalAccounts > 0 && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="glow"
                onClick={onSubmitClick}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="shadow-glow-brand text-xs"
              >
                {isRejected ? 'Resubmit Daily Routine for Review' : "Submit Day's Routine for Admin Review"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Progress Card */}
        <div className="w-full lg:w-80 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Completion</span>
            <span className="text-base font-extrabold text-white tabular-nums">
              {overallProgress}%
            </span>
          </div>

          <ProgressBar progress={overallProgress} size="lg" showPercentage={false} />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              {completedAccountsCount} of {totalAccounts} Accounts Done
            </span>
            <Link
              to="/daily"
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-xs"
            >
              Open Checklist <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

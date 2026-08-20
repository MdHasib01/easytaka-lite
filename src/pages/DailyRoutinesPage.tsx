import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useDailyStore } from '../stores/useDailyStore';
import { useAccountStore } from '../stores/useAccountStore';
import { DailyChecklistCard } from '../components/daily/DailyChecklistCard';
import { DailyProgressBanner } from '../components/daily/DailyProgressBanner';
import { SubmitDailyWorkModal } from '../components/daily/SubmitDailyWorkModal';
import { Button } from '../components/ui/Button';
import {
  CalendarCheck,
  Calendar,
  Sparkles,
  Users,
  PlusCircle,
  Flame,
  CheckCircle2,
  BookOpen,
  Send,
  Clock,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmmGuidelineModal } from '../components/accounts/SmmGuidelineModal';

export const DailyRoutinesPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    date,
    routines,
    overallProgress,
    totalAccounts,
    completedAccountsCount,
    dailyTaskCompletionReward,
    scoreRules,
    ratingBreakpoints,
    dailyRewardClaimedToday,
    submission,
    fetchTodayRoutines,
    updateRoutineProgress,
    submitDailyWork,
  } = useDailyStore();
  const { accounts, fetchMyAccounts } = useAccountStore();

  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAccounts();
    fetchTodayRoutines(selectedDate);
  }, [selectedDate]);

  const handleRoutineUpdate = async (accountId: string, updates: any) => {
    await updateRoutineProgress(accountId, updates, selectedDate);
  };

  const handleSubmitDailyWork = async (data: {
    date: string;
    smmNotes?: string;
    proofUrl?: string;
    screenshotUrl?: string;
  }) => {
    const res = await submitDailyWork(data);
    if (res.success) {
      setActionSuccessMsg('Daily routine submitted successfully! Awaiting Admin review & scoring.');
      setTimeout(() => setActionSuccessMsg(null), 5000);
      fetchTodayRoutines(selectedDate);
    }
    return res;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isApproved = submission?.status === 'approved' || dailyRewardClaimedToday;
  const isPending = submission?.status === 'pending';
  const isRejected = submission?.status === 'rejected';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Fixed Routines & Progress
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {routines.length} Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Execute daily tasks across your accounts and submit your day's work for Admin review & points.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Submit Work Button */}
          {routines.length > 0 && !isApproved && (
            <Button
              variant={isPending ? 'secondary' : 'glow'}
              onClick={() => setSubmitModalOpen(true)}
              leftIcon={isPending ? <Clock className="w-4 h-4 text-amber-400" /> : <Send className="w-4 h-4" />}
              className={isPending ? 'border-amber-500/30 text-amber-300' : 'shadow-glow-brand'}
            >
              {isPending
                ? 'Update Submission'
                : isRejected
                ? 'Resubmit Work'
                : "Submit Day's Routine"}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setGuidelineModalOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-indigo-400" />}
          >
            SMM Guidelines
          </Button>

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 px-3">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            />
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold ml-2 underline"
              >
                Back to Today
              </button>
            )}
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-glow-success">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Progress & Submission Status Banner */}
      <DailyProgressBanner
        overallProgress={overallProgress}
        totalAccounts={totalAccounts}
        completedAccountsCount={completedAccountsCount}
        streakDays={user?.streakDays || 0}
        dailyTaskCompletionReward={dailyTaskCompletionReward}
        ratingBreakpoints={ratingBreakpoints}
        dailyRewardClaimedToday={dailyRewardClaimedToday}
        submission={submission}
        onSubmitClick={() => setSubmitModalOpen(true)}
      />

      {/* Submission Feedback Card (if evaluated or rejected) */}
      {submission && (isApproved || isRejected) && submission.adminFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            isApproved
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          }`}
        >
          {isApproved ? (
            <Star className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>Admin Evaluation:</span>
              {submission.reviewScore && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black">
                  ⭐ {submission.reviewScore}/5 ({submission.pointsAwarded} PTS)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "{submission.adminFeedback}"
            </p>
            {submission.reviewedBy && typeof submission.reviewedBy === 'object' && (
              <span className="text-[10px] text-slate-400 block pt-0.5">
                Reviewed by {(submission.reviewedBy as any).name || 'Admin'} on{' '}
                {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleString() : 'Recently'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Routines Grid per Account */}
      {routines.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Accounts Connected</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You need to add at least one Facebook account to generate your daily routine checklist.
          </p>
          <Link to="/accounts">
            <Button variant="glow" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Facebook Account
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {routines.map((cardData) => (
            <DailyChecklistCard
              key={cardData.account.id}
              cardData={cardData}
              onUpdate={handleRoutineUpdate}
            />
          ))}
        </div>
      )}

      {/* SMM Guidelines & Playbook Modal */}
      <SmmGuidelineModal
        isOpen={guidelineModalOpen}
        onClose={() => setGuidelineModalOpen(false)}
      />

      {/* Submit Daily Work Modal */}
      <SubmitDailyWorkModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        date={selectedDate}
        overallProgress={overallProgress}
        totalAccounts={totalAccounts}
        completedAccountsCount={completedAccountsCount}
        routines={routines}
        maxPoints={dailyTaskCompletionReward}
        scoreRules={scoreRules}
        onSubmit={handleSubmitDailyWork}
      />
    </div>
  );
};

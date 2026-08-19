import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useDailyStore } from '../stores/useDailyStore';
import { useAccountStore } from '../stores/useAccountStore';
import { DailyChecklistCard } from '../components/daily/DailyChecklistCard';
import { DailyProgressBanner } from '../components/daily/DailyProgressBanner';
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
    dailyRewardClaimedToday,
    fetchTodayRoutines,
    updateRoutineProgress,
  } = useDailyStore();
  const { accounts, fetchMyAccounts } = useAccountStore();

  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchMyAccounts();
    fetchTodayRoutines(selectedDate);
  }, [selectedDate]);

  const handleRoutineUpdate = async (accountId: string, updates: any) => {
    await updateRoutineProgress(accountId, updates, selectedDate);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

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
            Fixed daily must-do tasks (comments, community replies, story posts, feed warmup) for each Facebook account.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

      {/* Progress Banner */}
      <DailyProgressBanner
        overallProgress={overallProgress}
        totalAccounts={totalAccounts}
        completedAccountsCount={completedAccountsCount}
        streakDays={user?.streakDays || 0}
        dailyTaskCompletionReward={dailyTaskCompletionReward}
        dailyRewardClaimedToday={dailyRewardClaimedToday}
      />

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
    </div>
  );
};

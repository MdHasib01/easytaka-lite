import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useDailyStore } from '../stores/useDailyStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useStatsStore } from '../stores/useStatsStore';
import { DailyProgressBanner } from '../components/daily/DailyProgressBanner';
import { DailyChecklistCard } from '../components/daily/DailyChecklistCard';
import { TaskCard } from '../components/tasks/TaskCard';
import { VerificationCard } from '../components/tasks/VerificationCard';
import { SubmitProofModal } from '../components/tasks/SubmitProofModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { InviteSmmModal } from '../components/admin/InviteSmmModal';
import { Button } from '../components/ui/Button';
import { Task } from '../types';
import {
  Coins,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { routines, overallProgress, totalAccounts, completedAccountsCount, fetchTodayRoutines, updateRoutineProgress } =
    useDailyStore();
  const { tasks, submissions, fetchTasks, fetchSubmissions, submitProof, verifySubmission, createTask } =
    useTaskStore();
  const { accounts, fetchMyAccounts, fetchAllAccounts } = useAccountStore();
  const { adminStats, smmStats, fetchDashboardStats } = useStatsStore();

  const [selectedTaskForProof, setSelectedTaskForProof] = useState<Task | null>(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [inviteSmmModalOpen, setInviteSmmModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchDashboardStats();
    if (isAdmin) {
      fetchSubmissions('pending');
      fetchTasks('active');
      fetchAllAccounts();
    } else {
      fetchTodayRoutines();
      fetchMyAccounts();
      fetchTasks('active');
    }
  }, [isAdmin]);

  const handleRoutineUpdate = async (accountId: string, updates: any) => {
    await updateRoutineProgress(accountId, updates);
    fetchDashboardStats();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Admin Overview: Monitor SMM account health, review proofs, and assign media tasks.'
              : 'SMM Workspace: Execute routine checklists, submit task proofs, and earn reward points.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setInviteSmmModalOpen(true)}
                leftIcon={<UserPlus className="w-4 h-4 text-indigo-400" />}
              >
                Invite SMM
              </Button>
              <Button
                variant="glow"
                onClick={() => setCreateTaskModalOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create New Task
              </Button>
            </>
          ) : (
            <Link to="/accounts">
              <Button
                variant="secondary"
                leftIcon={<PlusCircle className="w-4 h-4 text-indigo-400" />}
              >
                Manage FB Profiles ({accounts.length})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* SMM: Daily Progress Banner */}
      {!isAdmin && (
        <DailyProgressBanner
          overallProgress={overallProgress}
          totalAccounts={totalAccounts}
          completedAccountsCount={completedAccountsCount}
          streakDays={user?.streakDays || 0}
        />
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/10 shadow-glow-brand">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Pending Verifications
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">
                {adminStats?.pendingVerifications ?? submissions.filter((s) => s.status === 'pending').length}
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">Awaiting your approval</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Tasks
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">
                {adminStats?.activeTasks ?? tasks.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Available for SMMs</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total FB Accounts
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">
                {adminStats?.totalAccounts ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Managed across all agents</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Points Distributed
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">
                {adminStats?.totalPointsAwarded ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total reward points paid</p>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-indigo-950/10 shadow-glow-brand">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Reward Points
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-300 mt-3">{user?.rewardPoints ?? 0} pts</div>
              <p className="text-[11px] text-indigo-300/80 mt-1">Available reward balance</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Managed FB Profiles
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">{accounts.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">Active social profiles</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Verification
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">
                {smmStats?.pendingSubmissions ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Under admin review</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Daily Streak
                </span>
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-3">{user?.streakDays ?? 0} Days</div>
              <p className="text-[11px] text-slate-400 mt-1">Complete daily for bonus</p>
            </div>
          </>
        )}
      </div>

      {/* Main Section Content */}
      {isAdmin ? (
        /* Admin Verification Portal Preview */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pending Proof Verifications</h3>
                <p className="text-xs text-slate-400">Review screenshots and links submitted by SMMs</p>
              </div>
            </div>

            <Link
              to="/verifications"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View All Submissions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {submissions.filter((s) => s.status === 'pending').length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">All Caught Up!</h4>
              <p className="text-xs text-slate-400">No pending task verifications in the queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions
                .filter((s) => s.status === 'pending')
                .slice(0, 3)
                .map((submission) => (
                  <VerificationCard
                    key={submission._id}
                    submission={submission}
                    onVerify={verifySubmission}
                  />
                ))}
            </div>
          )}

          {/* Active Tasks Grid */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Active Facebook Tasks ({tasks.length})</h3>
              <Link to="/tasks" className="text-xs text-indigo-400 font-semibold hover:underline">
                Manage All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.slice(0, 3).map((task) => (
                <TaskCard key={task._id} task={task} userRole="admin" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SMM Section: Today's Fixed Daily Routines & Available Tasks */
        <div className="space-y-8">
          {/* Today's Routines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Today's Fixed Daily Routines</h3>
                  <p className="text-xs text-slate-400">
                    Must-do checklist for each of your managed Facebook accounts
                  </p>
                </div>
              </div>

              <Link
                to="/daily"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                Full Routine Hub <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {routines.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-3">
                <Users className="w-10 h-10 text-indigo-400 mx-auto" />
                <h4 className="text-base font-bold text-white">No Facebook Accounts Added Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add your Facebook profiles to automatically generate your fixed daily routine checklists.
                </p>
                <Link to="/accounts">
                  <Button variant="glow" size="sm">
                    Add First Facebook Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routines.map((cardData) => (
                  <DailyChecklistCard
                    key={cardData.account.id}
                    cardData={cardData}
                    onUpdate={handleRoutineUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Assigned & Available Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Available Tasks to Earn Points</h3>
              <Link to="/tasks" className="text-xs text-indigo-400 font-semibold hover:underline">
                View All Tasks ({tasks.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  userRole="smm"
                  onSubmitProof={(t) => setSelectedTaskForProof(t)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SMM Submit Proof Modal */}
      <SubmitProofModal
        isOpen={!!selectedTaskForProof}
        onClose={() => setSelectedTaskForProof(null)}
        task={selectedTaskForProof}
        onSubmit={submitProof}
      />

      {/* Admin Create Task Modal */}
      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onSubmit={createTask}
      />

      {/* Admin Invite SMM Modal */}
      <InviteSmmModal
        isOpen={inviteSmmModalOpen}
        onClose={() => setInviteSmmModalOpen(false)}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { SubmitProofModal } from '../components/tasks/SubmitProofModal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Task, TaskSubmission } from '../types';
import {
  CheckSquare,
  PlusCircle,
  Search,
  Filter,
  Coins,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ZoomIn,
  MessageSquare,
  Flame,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    tasks,
    mySubmissions,
    fetchTasks,
    fetchMySubmissions,
    createTask,
    updateTask,
    deleteTask,
    submitProof,
    isLoading,
  } = useTaskStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'available';

  const [activeMainTab, setActiveMainTab] = useState<'available' | 'under_review' | 'completed' | 'rejected'>(
    (initialTab as any) || 'available'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [proofModalTask, setProofModalTask] = useState<Task | null>(null);
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    if (!isAdmin) {
      fetchMySubmissions();
    }
  }, [isAdmin]);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['available', 'under_review', 'completed', 'rejected'].includes(tabFromUrl)) {
      setActiveMainTab(tabFromUrl as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'available' | 'under_review' | 'completed' | 'rejected') => {
    setActiveMainTab(tab);
    setSearchParams({ tab });
  };

  // Compute groupings
  const pendingSubmissions = mySubmissions.filter((s) => s.status === 'pending');
  const approvedSubmissions = mySubmissions.filter((s) => s.status === 'approved');
  const rejectedSubmissions = mySubmissions.filter((s) => s.status === 'rejected');

  // Available tasks are tasks where SMM hasn't submitted yet or active tasks
  const availableTasks = tasks.filter((t) => {
    if (isAdmin) return true;
    return !t.mySubmission || t.mySubmission.status === 'rejected';
  });

  // Filter tasks based on category & search
  const filteredAvailableTasks = availableTasks.filter((task) => {
    if (categoryFilter !== 'all' && task.taskType !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRewardPointsAvailable = availableTasks.reduce((sum, t) => sum + (t.rewardPoints || 0), 0);
  const totalRewardPointsEarned = approvedSubmissions.reduce(
    (sum, s) => sum + (s.pointsAwarded || (s.taskId as Task)?.rewardPoints || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-glow-brand flex items-center justify-center">
              <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center text-indigo-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isAdmin ? t('tasks.title') : t('tasks.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {t('tasks.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Button
              variant="glow"
              onClick={() => {
                setEditingTask(null);
                setCreateModalOpen(true);
              }}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="shadow-glow-brand"
            >
              {t('tasks.createNewTask')}
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/20 rounded-2xl p-2 px-3.5 text-xs">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold leading-tight">
                  {t('tasks.totalPointsAvailable')}
                </span>
                <span className="text-sm font-black text-amber-300">
                  +{totalRewardPointsAvailable} {t('common.pts')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SMM Quick Overview Stat Cards */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleTabChange('available')}
            className={`glass-card rounded-2xl p-4 border cursor-pointer transition-all ${
              activeMainTab === 'available'
                ? 'border-indigo-500/60 bg-indigo-950/20 shadow-glow-brand'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {t('tasks.availableTasks')}
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{availableTasks.length}</div>
            <p className="text-[11px] text-indigo-300/80 mt-1">{t('tasks.readyToEarn')}</p>
          </div>

          <div
            onClick={() => handleTabChange('under_review')}
            className={`glass-card rounded-2xl p-4 border cursor-pointer transition-all ${
              activeMainTab === 'under_review'
                ? 'border-amber-500/60 bg-amber-950/20 shadow-glow-brand'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {t('tasks.underReview')}
              </span>
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{pendingSubmissions.length}</div>
            <p className="text-[11px] text-amber-300/80 mt-1">{t('tasks.awaitingReview')}</p>
          </div>

          <div
            onClick={() => handleTabChange('completed')}
            className={`glass-card rounded-2xl p-4 border cursor-pointer transition-all ${
              activeMainTab === 'completed'
                ? 'border-emerald-500/60 bg-emerald-950/20 shadow-glow-success'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {t('tasks.completedAndPaid')}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{approvedSubmissions.length}</div>
            <p className="text-[11px] text-emerald-300/80 mt-1">+{totalRewardPointsEarned} {t('tasks.pointsEarned')}</p>
          </div>

          <div
            onClick={() => handleTabChange('rejected')}
            className={`glass-card rounded-2xl p-4 border cursor-pointer transition-all ${
              activeMainTab === 'rejected'
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('tasks.needsRevision')}
              </span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{rejectedSubmissions.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">{t('tasks.requiresFix')}</p>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => handleTabChange('available')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'available'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('tasks.availableTasks')} ({availableTasks.length})</span>
        </button>

        {!isAdmin && (
          <>
            <button
              onClick={() => handleTabChange('under_review')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMainTab === 'under_review'
                  ? 'bg-amber-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('tasks.underReview')}</span>
              {pendingSubmissions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('completed')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeMainTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('tasks.completedAndPaid')} ({approvedSubmissions.length})</span>
            </button>

            {rejectedSubmissions.length > 0 && (
              <button
                onClick={() => handleTabChange('rejected')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeMainTab === 'rejected'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{t('tasks.needsRevision')} ({rejectedSubmissions.length})</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* TAB 1: AVAILABLE TASKS */}
      {activeMainTab === 'available' && (
        <div className="space-y-4">
          {/* Sub-Filters & Search Bar */}
          <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Category filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: t('common.all') },
                { id: 'create_account', label: t('taskTypes.create_account') || 'Create FB Account' },
                { id: 'comment_post', label: t('taskTypes.comment_group_post') },
                { id: 'community_reply', label: t('daily.communityReplies') },
                { id: 'story_post', label: t('taskTypes.story_post') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    categoryFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-glow-brand font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tasks.searchPlaceholder')}
                className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Task Grid */}
          {filteredAvailableTasks.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">{t('tasks.noTasksFound')}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No tasks matched your search query.'
                  : 'Check back soon for new broadcasted assignments from the Admin team.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailableTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  userRole={user?.role || 'smm'}
                  onSubmitProof={(t) => setProofModalTask(t)}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setCreateModalOpen(true);
                  }}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNDER REVIEW (SMM) */}
      {!isAdmin && activeMainTab === 'under_review' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-spin" />
            <span>
              These task proofs have been submitted and are currently in the Admin verification queue. Once approved, your points will be credited immediately.
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Tasks Currently Under Review</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an available task, perform the engagement on Facebook, and submit your proof!
              </p>
              <Button
                variant="glow"
                size="sm"
                onClick={() => handleTabChange('available')}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {t('tasks.availableTasks')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((sub) => {
                const task = sub.taskId as Task;
                return (
                  <div
                    key={sub._id}
                    className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/10 space-y-3 shadow-glow-brand"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base leading-snug">
                            {task?.title || 'Facebook Task'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 animate-spin" /> {t('common.underReview')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted on {new Date(sub.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>+{task?.rewardPoints || 50} {t('common.pts')} Pending</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="space-y-2">
                        {sub.profileUrl && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-slate-400 font-semibold">{t('tasks.proofLink')}:</span>
                            <a
                              href={sub.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{sub.profileUrl}</span>
                            </a>
                          </div>
                        )}

                        {sub.smmNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">
                              {t('tasks.myNotes')}:
                            </span>
                            <p className="text-[11px]">{sub.smmNotes}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        {sub.screenshotUrl ? (
                          <div
                            onClick={() => setSelectedLightboxImg(sub.screenshotUrl)}
                            className="relative group rounded-xl overflow-hidden border border-slate-700 h-28 cursor-pointer bg-slate-950"
                          >
                            <img
                              src={sub.screenshotUrl}
                              alt="Screenshot Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <ZoomIn className="w-4 h-4" /> {t('common.zoomScreenshot')}
                            </div>
                          </div>
                        ) : (
                          <div className="h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
                            No screenshot attached
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED & PAID (SMM) */}
      {!isAdmin && activeMainTab === 'completed' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Verified and approved task submissions. Points have been credited directly to your reward balance.
              </span>
            </div>
            <span className="font-extrabold text-emerald-300 whitespace-nowrap">
              +{totalRewardPointsEarned} {t('common.pts')} Total
            </span>
          </div>

          {approvedSubmissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Completed Tasks Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once your submitted proofs are verified by the Admin team, they will appear here with points credited.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedSubmissions.map((sub) => {
                const task = sub.taskId as Task;
                return (
                  <div
                    key={sub._id}
                    className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base leading-snug">
                            {task?.title || 'Facebook Task'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {t('common.completed')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Approved on {new Date(sub.verifiedAt || sub.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm">
                        <Coins className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+{sub.pointsAwarded || task?.rewardPoints} {t('common.pts')} Credited</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="space-y-2">
                        {sub.profileUrl && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-slate-400 font-semibold">{t('tasks.proofLink')}:</span>
                            <a
                              href={sub.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{sub.profileUrl}</span>
                            </a>
                          </div>
                        )}

                        {sub.adminNote && (
                          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            <span className="font-bold block text-[11px] mb-0.5">{t('tasks.adminFeedback')}:</span>
                            <p className="text-[11px]">{sub.adminNote}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        {sub.screenshotUrl ? (
                          <div
                            onClick={() => setSelectedLightboxImg(sub.screenshotUrl)}
                            className="relative group rounded-xl overflow-hidden border border-slate-700 h-24 cursor-pointer bg-slate-950"
                          >
                            <img
                              src={sub.screenshotUrl}
                              alt="Screenshot Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <ZoomIn className="w-4 h-4" /> {t('common.zoomScreenshot')}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REJECTED / NEEDS REVISION (SMM) */}
      {!isAdmin && activeMainTab === 'rejected' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              The following submissions were declined by Admin. Review the feedback note and resubmit with updated proof to claim your points.
            </span>
          </div>

          {rejectedSubmissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Rejected Submissions</h3>
              <p className="text-xs text-slate-400">All your submitted tasks are either approved or in review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejectedSubmissions.map((sub) => {
                const task = sub.taskId as Task;
                return (
                  <div
                    key={sub._id}
                    className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base leading-snug">
                            {task?.title || 'Facebook Task'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            {t('tasks.needsRevision')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Reviewed on {new Date(sub.verifiedAt || sub.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="glow"
                        onClick={() => setProofModalTask(task)}
                        className="text-xs"
                      >
                        {t('common.resubmitProof')}
                      </Button>
                    </div>

                    {/* Rejection Feedback Box */}
                    {sub.adminNote && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px]">{t('tasks.adminFeedback')}:</span>
                          <p className="text-[11px] mt-0.5">{sub.adminNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Proof Submission Modal */}
      <SubmitProofModal
        isOpen={!!proofModalTask}
        onClose={() => setProofModalTask(null)}
        task={proofModalTask}
        onSubmit={submitProof}
      />

      {/* Create / Edit Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        onSubmit={async (data) => {
          if (editingTask) {
            return updateTask(editingTask._id, data);
          } else {
            return createTask(data);
          }
        }}
      />

      {/* Lightbox for zooming screenshots */}
      <ImageLightbox
        isOpen={!!selectedLightboxImg}
        onClose={() => setSelectedLightboxImg(null)}
        imageUrl={selectedLightboxImg || ''}
      />
    </div>
  );
};

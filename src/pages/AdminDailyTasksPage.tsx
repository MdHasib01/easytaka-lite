import React, { useEffect, useState } from 'react';
import { useDailyTaskManagerStore } from '../stores/useDailyTaskManagerStore';
import { CreateDailyTaskModal } from '../components/admin/CreateDailyTaskModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DailyTaskTemplate } from '../types';
import {
  Sparkles,
  PlusCircle,
  Shuffle,
  Scale,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  Pause,
  Copy,
  Layers,
  Calendar,
  MessageSquare,
  ThumbsUp,
  FileText,
  Compass,
  Image,
  Zap,
} from 'lucide-react';

export const AdminDailyTasksPage: React.FC = () => {
  const {
    dailyTasks,
    stats,
    isLoading,
    fetchDailyTasks,
    fetchDailyTaskStats,
    updateDailyTask,
    deleteDailyTask,
  } = useDailyTaskManagerStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<DailyTaskTemplate | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyTasks();
    fetchDailyTaskStats();
  }, []);

  const handleToggleStatus = async (task: DailyTaskTemplate) => {
    const newStatus = task.status === 'active' ? 'paused' : 'active';
    const res = await updateDailyTask(task._id, { status: newStatus });
    if (res.success) {
      setActionSuccessMsg(`Task "${task.title}" is now ${newStatus}!`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this daily task?')) {
      const res = await deleteDailyTask(id);
      if (res.success) {
        setActionSuccessMsg('Daily task deleted.');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    }
  };

  const filteredTasks = dailyTasks.filter((t) => {
    if (activeTab === 'global_rotation') return t.mode === 'global_rotation';
    if (activeTab === 'targeted_quota') return t.mode === 'targeted_quota';
    if (activeTab === 'paused') return t.status === 'paused';
    if (activeTab === 'completed') return t.status === 'completed';
    return true;
  });

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'personal_profile_post':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'react_group_post':
        return <ThumbsUp className="w-4 h-4 text-pink-400" />;
      case 'comment_group_post':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'group_join':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'story_post':
        return <Image className="w-4 h-4 text-amber-400" />;
      case 'feed_scroll_warmup':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Task Manager
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure global alternating routines (e.g. 3 tasks/day per account) and targeted campaign tasks with fair SMM load balancing.
          </p>
        </div>

        <Button
          variant="glow"
          onClick={() => {
            setEditingTask(null);
            setCreateModalOpen(true);
          }}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="shadow-glow-brand"
        >
          Create Daily Task
        </Button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 bg-indigo-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Global Rotated Tasks
            </span>
            <Shuffle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.activeGlobalTasks ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Alternating schedule across accounts</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Targeted Quota Campaigns
            </span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.activeQuotaCampaigns ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Load-balanced across SMMs</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Facebook Profiles
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.totalEligibleAccounts ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Available for task execution</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              SMM Team Agents
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {stats?.activeSmmCount ?? 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Receiving load-balanced tasks</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Daily Tasks' },
          { id: 'global_rotation', label: 'Global Rotated Routines' },
          { id: 'targeted_quota', label: 'Targeted Quota Campaigns' },
          { id: 'paused', label: 'Paused' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
          <Shuffle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Daily Tasks Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create your first global alternating task or targeted load-balanced campaign.
          </p>
          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setCreateModalOpen(true);
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Daily Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isGlobal = task.mode === 'global_rotation';
            const isQuota = task.mode === 'targeted_quota';
            const isPaused = task.status === 'paused';
            const isCompleted = task.status === 'completed';

            const quotaProgress =
              task.targetExecutionsCount > 0
                ? Math.round((task.completedExecutionsCount / task.targetExecutionsCount) * 100)
                : 0;

            return (
              <div
                key={task._id}
                className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  isPaused
                    ? 'opacity-60 border-slate-800 bg-slate-900/30'
                    : isQuota
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {getTaskIcon(task.taskType)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base leading-tight">
                          {task.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-0.5">
                          {task.taskType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isGlobal && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                          {task.rotationSchedule === 'alternate_days'
                            ? `Batch ${task.rotationBatch || 1} (Alternate)`
                            : task.rotationSchedule?.replace('_', ' ')}
                        </span>
                      )}

                      {isQuota && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          QUOTA: {task.completedExecutionsCount}/{task.targetExecutionsCount}
                        </span>
                      )}

                      <Badge variant={task.status as any}>{task.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  {/* Description & Sample Caption */}
                  {task.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                  )}

                  {task.sampleCaption && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Sample Caption / Copy:
                      </span>
                      <p className="text-slate-300 font-mono text-[11px]">{task.sampleCaption}</p>
                    </div>
                  )}

                  {/* Target URL */}
                  {task.targetUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-400">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <a
                        href={task.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline truncate max-w-sm"
                      >
                        {task.targetUrl}
                      </a>
                    </div>
                  )}

                  {/* Quota Progress Bar */}
                  {isQuota && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Load-Balanced Execution Progress
                        </span>
                        <span className="text-xs font-bold text-amber-300">
                          {task.completedExecutionsCount} / {task.targetExecutionsCount} ({quotaProgress}%)
                        </span>
                      </div>
                      <ProgressBar progress={quotaProgress} size="sm" showPercentage={false} />
                      <span className="text-[10px] text-slate-500 block">
                        Assigned across {task.assignedAssignments?.length || 0} unique accounts
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">
                    Created: {new Date(task.createdAt || Date.now()).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        task.status === 'active'
                          ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/10'
                          : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                      }`}
                      title={task.status === 'active' ? 'Pause Task' : 'Activate Task'}
                    >
                      {task.status === 'active' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateDailyTaskModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useDailyTaskManagerStore } from '../../stores/useDailyTaskManagerStore';
import {
  DailyTaskType,
  DailyTaskMode,
  DailyTaskRotationSchedule,
  DailyTaskTemplate,
} from '../../types';
import {
  MessageSquare,
  ThumbsUp,
  FileText,
  Users,
  Compass,
  Image,
  Sparkles,
  Zap,
  Globe,
  Shuffle,
  ShieldCheck,
  Scale,
  ExternalLink,
  PlusCircle,
  Copy,
} from 'lucide-react';

interface CreateDailyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: DailyTaskTemplate | null;
}

const TASK_TYPE_OPTIONS: Array<{
  type: DailyTaskType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    type: 'personal_profile_post',
    label: 'Personal Profile Post',
    desc: 'Publish status update, industry news, or caption on profile timeline',
    icon: FileText,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'react_group_post',
    label: 'React to Group / Feed',
    desc: 'Like, Love, or Care on top discussions in target Facebook groups',
    icon: ThumbsUp,
    color: 'from-pink-500 to-rose-600',
  },
  {
    type: 'comment_group_post',
    label: 'Comment on Group Post',
    desc: 'Post thoughtful, supportive comments on targeted group posts',
    icon: MessageSquare,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    type: 'group_join',
    label: 'Join Facebook Group',
    desc: 'Find and request to join target niche Facebook communities',
    icon: Users,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    type: 'story_post',
    label: 'Daily Story / Reel',
    desc: 'Upload 24hr story or reel to maintain social visibility',
    icon: Image,
    color: 'from-amber-500 to-orange-600',
  },
  {
    type: 'feed_scroll_warmup',
    label: 'Feed Warmup Scroll',
    desc: 'Natural feed browsing and video watching to build account trust',
    icon: Compass,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'custom_engagement',
    label: 'Custom Engagement',
    desc: 'Custom instructions, polls, shares, or specific campaign flow',
    icon: Zap,
    color: 'from-violet-500 to-fuchsia-600',
  },
];

export const CreateDailyTaskModal: React.FC<CreateDailyTaskModalProps> = ({
  isOpen,
  onClose,
  initialTask,
}) => {
  const { createDailyTask, updateDailyTask, getLoadBalancerPreview, isLoading } =
    useDailyTaskManagerStore();

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<DailyTaskType>('personal_profile_post');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sampleCaption, setSampleCaption] = useState('');
  const [mode, setMode] = useState<DailyTaskMode>('global_rotation');
  const [rotationSchedule, setRotationSchedule] = useState<DailyTaskRotationSchedule>('alternate_days');
  const [rotationBatch, setRotationBatch] = useState<number>(1);
  const [targetExecutionsCount, setTargetExecutionsCount] = useState<number>(10);

  // Load balancer preview
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setTaskType(initialTask.taskType || 'personal_profile_post');
      setDescription(initialTask.description || '');
      setTargetUrl(initialTask.targetUrl || '');
      setInstructions(initialTask.instructions || '');
      setSampleCaption(initialTask.sampleCaption || '');
      setMode(initialTask.mode || 'global_rotation');
      setRotationSchedule(initialTask.rotationSchedule || 'alternate_days');
      setRotationBatch(initialTask.rotationBatch || 1);
      setTargetExecutionsCount(initialTask.targetExecutionsCount || 10);
    } else {
      setTitle('');
      setTaskType('personal_profile_post');
      setDescription('');
      setTargetUrl('');
      setInstructions('');
      setSampleCaption('');
      setMode('global_rotation');
      setRotationSchedule('alternate_days');
      setRotationBatch(1);
      setTargetExecutionsCount(10);
      setErrorMsg(null);
    }
  }, [initialTask, isOpen]);

  // Load Balancer preview query
  useEffect(() => {
    if (isOpen && mode === 'targeted_quota') {
      setIsPreviewLoading(true);
      const timer = setTimeout(async () => {
        const preview = await getLoadBalancerPreview(targetExecutionsCount);
        setPreviewData(preview);
        setIsPreviewLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, targetExecutionsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a task title.');
      return;
    }

    const payload: Partial<DailyTaskTemplate> = {
      title: title.trim(),
      taskType,
      description: description.trim(),
      targetUrl: targetUrl.trim(),
      instructions: instructions.trim(),
      sampleCaption: sampleCaption.trim(),
      mode,
      rotationSchedule,
      rotationBatch: Number(rotationBatch),
      targetExecutionsCount: Number(targetExecutionsCount),
    };

    let res;
    if (initialTask) {
      res = await updateDailyTask(initialTask._id, payload);
    } else {
      res = await createDailyTask(payload);
    }

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Daily Task' : 'Create New Daily Task'}
      subtitle="Configure global rotating routines or assign targeted campaign engagement with fair SMM load balancing."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* 1. TASK TYPE SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Select Task Action Type:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {TASK_TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = taskType === opt.type;
              return (
                <div
                  key={opt.type}
                  onClick={() => setTaskType(opt.type)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-glow-brand ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${opt.color} flex items-center justify-center text-white shadow-sm`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-glow-brand" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs leading-snug">{opt.label}</h5>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. MODE SWITCH: GLOBAL ROTATION VS TARGETED QUOTA */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            2. Task Mode & Distribution Strategy:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode A: Global Rotated */}
            <div
              onClick={() => setMode('global_rotation')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                mode === 'global_rotation'
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-glow-brand ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Global Rotating Daily Routine
                  </span>
                </div>
                {mode === 'global_rotation' && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/30">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Applies globally to all Facebook profiles, with tasks intelligently partitioned and scheduled on <strong>alternate days</strong> (e.g. 3 tasks on Day 1, 3 tasks on Day 2) to maintain natural, diverse activity patterns.
              </p>
            </div>

            {/* Mode B: Targeted Quota Campaign */}
            <div
              onClick={() => setMode('targeted_quota')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                mode === 'targeted_quota'
                  ? 'bg-amber-950/30 border-amber-500 shadow-glow-brand ring-1 ring-amber-500/40'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Targeted Quota (Fair Load-Balancer)
                  </span>
                </div>
                {mode === 'targeted_quota' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Need a specific volume (e.g. <strong>10 comments</strong> on a specific group post)? Automatically distributes quota accounts across all SMM agents evenly without overloading anyone.
              </p>
            </div>
          </div>
        </div>

        {/* 3. MODE SPECIFIC CONFIGURATION */}
        {mode === 'global_rotation' ? (
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Rotation Schedule Frequency:
              </label>
              <select
                value={rotationSchedule}
                onChange={(e) => setRotationSchedule(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              >
                <option value="alternate_days">Alternate Days (Recommended: 3 Tasks/Day per Account)</option>
                <option value="every_day">Every Single Day (All Accounts)</option>
                <option value="odd_days">Odd Calendar Days (1st, 3rd, 5th...)</option>
                <option value="even_days">Even Calendar Days (2nd, 4th, 6th...)</option>
                <option value="weekday_only">Weekdays Only (Mon - Fri)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Accounts are deterministically balanced so half do Batch A today and Batch B tomorrow.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Rotation Group / Batch:
              </label>
              <select
                value={rotationBatch}
                onChange={(e) => setRotationBatch(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              >
                <option value={1}>Batch A (Scheduled for Day 1 Group)</option>
                <option value={2}>Batch B (Scheduled for Day 2 Group)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pair tasks into Batch 1 & Batch 2 to ensure equal 3-task distribution.
              </span>
            </div>
          </div>
        ) : (
          /* Targeted Quota Load Balancer Box */
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Target Quota Execution Volume
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  How many Facebook accounts should be assigned to execute this task?
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={targetExecutionsCount}
                  onChange={(e) => setTargetExecutionsCount(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-xl glass-input text-sm font-black text-amber-300 text-center"
                />
                <span className="text-xs font-bold text-slate-400">Accounts</span>
              </div>
            </div>

            {/* Live Load Balancer Distribution Preview */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Load Balancer Distribution Preview
                </span>
                {isPreviewLoading ? (
                  <span className="text-[10px] text-slate-400 animate-pulse">Calculating balance...</span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400">
                    {previewData?.actualAllocated || targetExecutionsCount} Accounts Balanced Across {previewData?.smmCount || 0} SMM Agents
                  </span>
                )}
              </div>

              {previewData?.smmBreakdown && previewData.smmBreakdown.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {previewData.smmBreakdown.map((smm: any) => (
                    <div
                      key={smm.smmId}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-300 truncate max-w-[120px]">
                        {smm.smmName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {smm.assignedCount} / {smm.totalAccountsOwned} accs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TASK DETAILS */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Personal Profile: Share Tech News on Timeline"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Target Link / Facebook URL (Optional):
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://facebook.com/groups/... or https://facebook.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Task Instructions / Guidelines:
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Explain what the SMM agent should do (e.g. Leave a 2-sentence supportive comment, avoid spam words, react with Love)."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Sample Caption / Talking Points (Optional):
              </label>
              <textarea
                rows={3}
                value={sampleCaption}
                onChange={(e) => setSampleCaption(e.target.value)}
                placeholder="Provide a ready-to-use template caption or comments that the SMM can easily customize."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isLoading}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            {initialTask ? 'Update Daily Task' : 'Create Daily Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task, TaskType } from '../../types';
import { Coins, Link as LinkIcon, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<any>;
  initialTask?: Task | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [taskType, setTaskType] = useState<TaskType>(initialTask?.taskType || 'create_account');
  const [category, setCategory] = useState(initialTask?.category || 'Account Creation');
  const [rewardPoints, setRewardPoints] = useState(initialTask?.rewardPoints || 50);
  const [targetUrl, setTargetUrl] = useState(initialTask?.targetUrl || '');
  const [instructions, setInstructions] = useState(initialTask?.instructions || '');
  const [screenshotRequired, setScreenshotRequired] = useState(
    initialTask?.screenshotRequired !== undefined ? initialTask.screenshotRequired : true
  );
  const [profileLinkRequired, setProfileLinkRequired] = useState(
    initialTask?.profileLinkRequired !== undefined ? initialTask.profileLinkRequired : true
  );
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? initialTask.deadline.split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Partial<Task> = {
      title,
      description,
      taskType,
      category,
      rewardPoints: Number(rewardPoints),
      targetUrl,
      instructions,
      screenshotRequired,
      profileLinkRequired,
      deadline: deadline ? deadline : null,
      isBroadcast: true,
    };

    const res = await onSubmit(payload);
    setIsSubmitting(false);

    if (res) {
      onClose();
    } else {
      setError('Failed to save task.');
    }
  };

  const taskPresets = [
    { type: 'create_account', label: 'Create FB Account', points: 100, cat: 'Account Creation' },
    { type: 'comment_post', label: 'Comment on Post', points: 40, cat: 'Viral Commenting' },
    { type: 'community_reply', label: 'Community Reply', points: 50, cat: 'Community Engagement' },
    { type: 'group_join', label: 'Join FB Groups', points: 30, cat: 'Group Growth' },
    { type: 'story_post', label: 'Post Story / Reel', points: 60, cat: 'Story Marketing' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Assignment Task' : 'Create New Facebook Task'}
      subtitle="Assign tasks to social media managers with reward points and verification rules."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Presets */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Quick Task Templates
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {taskPresets.map((preset) => (
              <button
                key={preset.type}
                type="button"
                onClick={() => {
                  setTaskType(preset.type as TaskType);
                  setCategory(preset.cat);
                  setRewardPoints(preset.points);
                  if (preset.type === 'create_account') {
                    setTitle('Create Verified Facebook Profile');
                    setDescription('Create a fresh Facebook profile with realistic details, cover, avatar and 2FA enabled.');
                  } else if (preset.type === 'comment_post') {
                    setTitle('Post 3 Meaningful Comments on Target Post');
                    setDescription('Leave positive, constructive comments on the target post URL and capture a screenshot.');
                  } else if (preset.type === 'community_reply') {
                    setTitle('Reply to Community Threads');
                    setDescription('Answer queries in target Facebook groups to establish authority.');
                  }
                }}
                className={`p-2 rounded-xl text-xs font-medium text-left border transition-all ${
                  taskType === preset.type
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-[10px] text-amber-400 font-semibold mt-0.5">+{preset.points} Pts</div>
              </button>
            ))}
          </div>
        </div>

        {/* Task Title */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Task Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Create Facebook Account with 2FA or Comment on Post"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Task Description & Requirements <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide clear steps for the SMM agent to execute..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
            required
          />
        </div>

        {/* Target URL & Reward Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Target Post / Group URL (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reward Points Awarded <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                step="5"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm font-semibold text-amber-300"
                required
              />
              <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Instructions & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Account Creation / Viral Commenting"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        {/* Verification Requirements Checkboxes */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">Proof Requirements</span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={screenshotRequired}
                onChange={(e) => setScreenshotRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Screenshot Proof Required (Cloudinary Upload)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={profileLinkRequired}
                onChange={(e) => setProfileLinkRequired(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Profile / Target Link Required</span>
            </label>
          </div>
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isSubmitting}
            leftIcon={<CheckSquare className="w-4 h-4" />}
          >
            {initialTask ? 'Save Changes' : 'Publish & Broadcast Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

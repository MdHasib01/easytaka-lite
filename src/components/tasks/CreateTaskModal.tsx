import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task, TaskType, TaskTargetMode, TaskTargetProduct } from '../../types';
import { Link as LinkIcon, Calendar, CheckSquare, Sparkles, Award, ShieldCheck, HelpCircle, LifeBuoy, Compass, Milk } from 'lucide-react';

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
  const [selectedTitlePreset, setSelectedTitlePreset] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [taskType, setTaskType] = useState<TaskType>(initialTask?.taskType || 'custom');
  const [targetMode, setTargetMode] = useState<TaskTargetMode>(initialTask?.targetMode || 'all');
  const [targetProduct, setTargetProduct] = useState<TaskTargetProduct>(initialTask?.targetProduct || 'all');
  const [category, setCategory] = useState(initialTask?.category || 'Facebook Engagement');
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

  const titlePresets = [
    {
      value: '🎖️ Reviewer: Product Experience & Review (প্রোডাক্ট অভিজ্ঞতা ও পজিটিভ রিভিউ)',
      taskType: 'reviewer' as TaskType,
      targetMode: 'reviewer' as TaskTargetMode,
      category: 'Reviewer Engagement',
      description: 'টার্গেট পোস্ট বা গ্রুপে প্রোডাক্ট ব্যবহারের বাস্তব অভিজ্ঞতা জানিয়ে পজিটিভ রিভিউ ও সন্তুষ্টি প্রকাশ করুন। ফিক্সড পারচেজ হিস্ট্রির সাথে মিল রেখে কথা বলুন।',
    },
    {
      value: '❓ Question: Problem Inquiry & Advice (সমস্যা নিয়ে প্রশ্ন ও পরামর্শ চাওয়া)',
      taskType: 'question' as TaskType,
      targetMode: 'question' as TaskTargetMode,
      category: 'Problem Inquiry',
      description: 'টার্গেট গ্রুপ বা পোস্টে একজন বাস্তব মায়ের মতো শিশুর দুধের সমস্যা নিয়ে অন্যদের পরামর্শ ও অভিজ্ঞতা চেয়ে পোস্ট বা কমেন্ট করুন।',
    },
    {
      value: '💡 Support: Helpful Advice & Solution (মায়ের মতো সহমর্মী পরামর্শ ও সমাধান)',
      taskType: 'support' as TaskType,
      targetMode: 'support' as TaskTargetMode,
      category: 'Empathetic Support',
      description: 'সমস্যায় থাকা মায়েদের সহানুভূতিশীল পরামর্শ দিন এবং উপযুক্ত সমাধান হিসেবে মিল্কিমম প্রোডাক্ট লেনের উল্লেখ করুন।',
    },
    {
      value: '🧭 Navigation: Guide to Official Page / Inbox (অফিশিয়াল পেইজে রেফার ও ইনবক্স গাইড)',
      taskType: 'navigation' as TaskType,
      targetMode: 'navigation' as TaskTargetMode,
      category: 'Page Navigation',
      description: 'দাম বা অর্ডার সংক্রান্ত জিজ্ঞাসায় গ্রাহককে অফিশিয়াল পেইজের ইনবক্সে যোগাযোগ করার দিকনির্দেশনা দিন।',
    },
    {
      value: '💬 Community Comments: 3+ Meaningful Replies (গ্রুপে ৩+ কমেন্ট ও আলোচনা)',
      taskType: 'comment_post' as TaskType,
      targetMode: 'all' as TaskTargetMode,
      category: 'Community Engagement',
      description: 'টার্গেট পোস্ট বা ফেসবুক গ্রুপে ৩টি গঠনমূলক ও প্রাসঙ্গিক কমেন্ট করুন। স্ক্রিনশট প্রুফ হিসেবে জমা দিন।',
    },
    {
      value: '✍️ Community Post: Value & Motherhood Experience (গ্রুপে সমস্যা বা অভিজ্ঞতা শেয়ার)',
      taskType: 'community_reply' as TaskType,
      targetMode: 'all' as TaskTargetMode,
      category: 'Value Post',
      description: 'টার্গেট ফেসবুক গ্রুপে মা ও শিশুর যত্ন বিষয়ক গঠনমূলক পোস্ট শেয়ার করুন।',
    },
    {
      value: '🔄 Daily Story: Product / Awareness Story (ফেসবুক স্টোরি শেয়ার)',
      taskType: 'story_post' as TaskType,
      targetMode: 'all' as TaskTargetMode,
      category: 'Story Marketing',
      description: 'আইডির ফেসবুক স্টোরিতে নির্ধারিত প্রোডাক্ট বা পোস্ট শেয়ার করুন।',
    },
    {
      value: '📱 Official Page: Comment & Review Handling (অফিশিয়াল পেইজের কমেন্ট হ্যান্ডলিং)',
      taskType: 'comment_post' as TaskType,
      targetMode: 'navigation' as TaskTargetMode,
      category: 'Official Page',
      description: 'অফিশিয়াল পেইজের কমেন্ট সেকশনে রেসপন্স গাইডলাইন অনুযায়ী উত্তর দিন।',
    },
    {
      value: 'custom',
      taskType: 'custom' as TaskType,
      targetMode: 'all' as TaskTargetMode,
      category: 'Custom Engagement',
      description: '',
    },
  ];

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setTaskType(initialTask.taskType || 'custom');
      setTargetMode(initialTask.targetMode || 'all');
      setTargetProduct(initialTask.targetProduct || 'all');
      setCategory(initialTask.category || 'Facebook Engagement');
      setTargetUrl(initialTask.targetUrl || '');
      setInstructions(initialTask.instructions || '');
      setScreenshotRequired(initialTask.screenshotRequired !== undefined ? initialTask.screenshotRequired : true);
      setProfileLinkRequired(initialTask.profileLinkRequired !== undefined ? initialTask.profileLinkRequired : true);
      setDeadline(initialTask.deadline ? initialTask.deadline.split('T')[0] : '');

      const found = titlePresets.find((p) => p.value === initialTask.title);
      if (found) {
        setSelectedTitlePreset(found.value);
      } else {
        setSelectedTitlePreset('custom');
        setCustomTitle(initialTask.title || '');
      }
    } else {
      // Default to first preset
      const defaultPreset = titlePresets[0];
      setSelectedTitlePreset(defaultPreset.value);
      setTitle(defaultPreset.value);
      setDescription(defaultPreset.description);
      setTaskType(defaultPreset.taskType);
      setTargetMode(defaultPreset.targetMode);
      setCategory(defaultPreset.category);
      setCustomTitle('');
    }
  }, [initialTask, isOpen]);

  const handlePresetChange = (presetValue: string) => {
    setSelectedTitlePreset(presetValue);
    if (presetValue === 'custom') {
      setTitle(customTitle);
    } else {
      const preset = titlePresets.find((p) => p.value === presetValue);
      if (preset) {
        setTitle(preset.value);
        setDescription(preset.description);
        setTaskType(preset.taskType);
        setTargetMode(preset.targetMode);
        setCategory(preset.category);
      }
    }
  };

  const handleCustomTitleChange = (val: string) => {
    setCustomTitle(val);
    setTitle(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    if (!finalTitle || !description.trim()) {
      setError('Task Title and Description are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Partial<Task> = {
      title: finalTitle,
      description: description.trim(),
      taskType,
      targetMode,
      targetProduct,
      category: category.trim(),
      rewardPoints: 0, // Points are awarded through daily routine & account verification
      targetUrl: targetUrl.trim(),
      instructions: instructions.trim(),
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Facebook Task' : 'Create New Facebook Task'}
      subtitle="Publish tasks for SMM agents with bilingual options and target profile mode rules."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Points Info Alert */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Routine Points System:</strong> Individual tasks track daily routine quotas. Agents earn reward points upon Daily Routine Checklist completion & Facebook Account Verification (<strong>+40 PTS</strong> each).
            </span>
          </div>
        </div>

        {/* 1. Task Title (Bilingual Dropdown) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Task Title (Bangla & English) <span className="text-rose-400">*</span>
          </label>
          <select
            value={selectedTitlePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {titlePresets.map((preset, idx) => (
              <option key={idx} value={preset.value}>
                {preset.value === 'custom' ? '✏️ Custom Task Title (কাস্টম টাইটেল লিখুন)...' : preset.value}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Title Input (If Custom is selected) */}
        {selectedTitlePreset === 'custom' && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Custom Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => handleCustomTitleChange(e.target.value)}
              placeholder="Enter bilingual task title (e.g. 💬 Reviewer: Specific Forum Comment)"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              required
            />
          </div>
        )}

        {/* 2. Target Profile Mode & Target Product Lane */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Target Profile Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>Target Profile Mode:</span>
              <span className="text-[10px] text-slate-400 font-normal">Who can see this task</span>
            </label>
            <select
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value as TaskTargetMode)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">🌐 All Modes (সকল আইডির জন্য দৃশ্যমান)</option>
              <option value="reviewer">🎖️ Mode R: Reviewer (শুধুমাত্র রিভিউয়ার আইডি)</option>
              <option value="question">❓ Mode Q: Question (শুধুমাত্র প্রশ্নকারী আইডি)</option>
              <option value="support">💡 Mode S: Support (শুধুমাত্র সাপোর্ট আইডি)</option>
              <option value="navigation">🧭 Mode N: Navigation (শুধুমাত্র ন্যাভিগেশন আইডি)</option>
            </select>
          </div>

          {/* Target Product Lane */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Target Product Lane:
            </label>
            <select
              value={targetProduct}
              onChange={(e) => setTargetProduct(e.target.value as TaskTargetProduct)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">✨ All Products / General (সকল প্রোডাক্ট)</option>
              <option value="milkimom">🥛 Milkimom (M)</option>
              <option value="milkready">🍼 MilkReady (MR)</option>
              <option value="smoothflow">💧 SmoothFlow (SF)</option>
              <option value="stableflow">🌊 StableFlow (ST)</option>
            </select>
          </div>
        </div>

        {/* 3. Description */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Task Description & Requirements <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide clear steps for the SMM agent to execute..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
            required
          />
        </div>

        {/* 4. Target URL & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Target Post / Group URL (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://facebook.com/groups/..."
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-xs text-white"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Deadline (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
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

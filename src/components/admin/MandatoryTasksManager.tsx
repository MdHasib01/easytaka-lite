import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { MandatoryDailyTask, MandatoryTaskType } from '../../types';
import { clsx } from 'clsx';
import {
  ListChecks,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Users,
  Camera,
  Image,
  Heart,
  GraduationCap,
  FileText,
  Zap,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
  Link,
  ShieldCheck,
  Check,
} from 'lucide-react';

const DEFAULT_MANDATORY_TASKS: MandatoryDailyTask[] = [
  {
    id: 'profile_pic',
    title: 'প্রোফাইল পিকচার আপলোড',
    titleEn: 'Upload profile picture',
    description: 'বাস্তবসম্মত ও শালীন প্রোফাইল ছবি যুক্ত করুন',
    taskType: 'profile_pic',
    groupName: '',
    targetUrl: '',
    isEnabled: true,
    order: 1,
  },
  {
    id: 'cover_photo',
    title: 'কভার ফটো আপলোড',
    titleEn: 'Upload Cover photo',
    description: 'প্রাকৃতিক বা রুচিশীল কভার ছবি আপলোড করুন',
    taskType: 'cover_photo',
    groupName: '',
    targetUrl: '',
    isEnabled: true,
    order: 2,
  },
  {
    id: 'marital_status',
    title: 'বৈবাহিক অবস্থা আপডেট (Married)',
    titleEn: 'Update Marital status',
    description: 'Relationship Status অবশ্যই "Married" (বিবাহিত) সিলেক্ট করুন',
    taskType: 'marital_status',
    groupName: '',
    targetUrl: '',
    isEnabled: true,
    order: 3,
  },
  {
    id: 'school_college',
    title: 'স্কুল/কলেজের তথ্য আপডেট',
    titleEn: 'Update School/College information',
    description: 'প্রোফাইলে বাস্তবসম্মত স্কুল বা কলেজের তথ্য যোগ করুন',
    taskType: 'school_college',
    groupName: '',
    targetUrl: '',
    isEnabled: true,
    order: 4,
  },
  {
    id: 'identity_post',
    title: 'প্রোফাইল ও পরিচয়ের সাথে মিল রেখে পোস্ট',
    titleEn: 'Complete a post related to profile & identity',
    description: 'আইডির মা/সংসার বা বাস্তব পরিচয়ের সাথে মিল রেখে পোস্ট সম্পন্ন করুন',
    taskType: 'identity_post',
    groupName: '',
    targetUrl: '',
    isEnabled: true,
    order: 5,
  },
];

const TASK_TYPE_PRESETS: Array<{
  type: MandatoryTaskType;
  label: string;
  defaultTitle: string;
  defaultTitleEn: string;
  defaultDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    type: 'group_join',
    label: '👥 Join Facebook Group (গ্রুপে জয়েন করুন)',
    defaultTitle: 'ফেসবুক গ্রুপে জয়েন করুন',
    defaultTitleEn: 'Join Facebook Group',
    defaultDesc: 'গ্রুপে জয়েন রিকোয়েস্ট পাঠান এবং নোটিফিকেশন অল পোস্ট অন রাখুন',
    icon: Users,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    type: 'profile_pic',
    label: '📷 Upload Profile Picture (প্রোফাইল পিকচার)',
    defaultTitle: 'প্রোফাইল পিকচার আপলোড',
    defaultTitleEn: 'Upload profile picture',
    defaultDesc: 'বাস্তবসম্মত ও শালীন প্রোফাইল ছবি যুক্ত করুন',
    icon: Camera,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    type: 'cover_photo',
    label: '🖼️ Upload Cover Photo (কভার ফটো)',
    defaultTitle: 'কভার ফটো আপলোড',
    defaultTitleEn: 'Upload Cover photo',
    defaultDesc: 'প্রাকৃতিক বা রুচিশীল কভার ছবি আপলোড করুন',
    icon: Image,
    color: 'from-pink-500 to-rose-600',
  },
  {
    type: 'marital_status',
    label: '💍 Update Marital Status (বৈবাহিক অবস্থা)',
    defaultTitle: 'বৈবাহিক অবস্থা আপডেট (Married)',
    defaultTitleEn: 'Update Marital status',
    defaultDesc: 'Relationship Status অবশ্যই "Married" (বিবাহিত) সিলেক্ট করুন',
    icon: Heart,
    color: 'from-rose-500 to-red-600',
  },
  {
    type: 'school_college',
    label: '🎓 Update School/College (শিক্ষা তথ্য)',
    defaultTitle: 'স্কুল/কলেজের তথ্য আপডেট',
    defaultTitleEn: 'Update School/College information',
    defaultDesc: 'প্রোফাইলে বাস্তবসম্মত স্কুল বা কলেজের তথ্য যোগ করুন',
    icon: GraduationCap,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    type: 'identity_post',
    label: '✍️ Complete Identity Post (পরিচয় পোস্ট)',
    defaultTitle: 'প্রোফাইল ও পরিচয়ের সাথে মিল রেখে পোস্ট',
    defaultTitleEn: 'Complete a post related to profile & identity',
    defaultDesc: 'আইডির মা/সংসার বা বাস্তব পরিচয়ের সাথে মিল রেখে পোস্ট সম্পন্ন করুন',
    icon: FileText,
    color: 'from-teal-500 to-emerald-600',
  },
  {
    type: 'custom',
    label: '⚡ Custom Mandatory Task (কাস্টম টাস্ক)',
    defaultTitle: 'দৈনিক স্পেশাল টাস্ক',
    defaultTitleEn: 'Daily Special Task',
    defaultDesc: 'নির্দেশনা অনুযায়ী কাজটি সম্পন্ন করুন',
    icon: Zap,
    color: 'from-violet-500 to-purple-600',
  },
];

const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({
  enabled,
  onChange,
}) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={clsx(
      'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
      enabled ? 'bg-emerald-600' : 'bg-slate-700'
    )}
  >
    <span
      className={clsx(
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
        enabled && 'translate-x-5'
      )}
    />
  </button>
);

export const MandatoryTasksManager: React.FC = () => {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();

  const [tasks, setTasks] = useState<MandatoryDailyTask[]>(DEFAULT_MANDATORY_TASKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Modal Form State
  const [formTaskType, setFormTaskType] = useState<MandatoryTaskType>('group_join');
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formGroupName, setFormGroupName] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsEnabled, setFormIsEnabled] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings?.mandatoryDailyTasks && settings.mandatoryDailyTasks.length > 0) {
      setTasks(settings.mandatoryDailyTasks);
    }
  }, [settings]);

  const getTaskIcon = (type: MandatoryTaskType) => {
    switch (type) {
      case 'profile_pic':
        return <Camera className="w-4 h-4 text-blue-400" />;
      case 'cover_photo':
        return <Image className="w-4 h-4 text-purple-400" />;
      case 'marital_status':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'school_college':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'identity_post':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'group_join':
        return <Users className="w-4 h-4 text-indigo-400" />;
      default:
        return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  const handleOpenCreateModal = () => {
    setEditingIndex(null);
    const defaultPreset = TASK_TYPE_PRESETS[0];
    setFormTaskType('group_join');
    setFormTitle(defaultPreset.defaultTitle);
    setFormTitleEn(defaultPreset.defaultTitleEn);
    setFormGroupName('');
    setFormTargetUrl('');
    setFormDescription(defaultPreset.defaultDesc);
    setFormIsEnabled(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    const task = tasks[index];
    setEditingIndex(index);
    setFormTaskType(task.taskType || 'custom');
    setFormTitle(task.title || '');
    setFormTitleEn(task.titleEn || '');
    setFormGroupName(task.groupName || '');
    setFormTargetUrl(task.targetUrl || '');
    setFormDescription(task.description || '');
    setFormIsEnabled(task.isEnabled !== false);
    setModalOpen(true);
  };

  const handlePresetSelect = (preset: (typeof TASK_TYPE_PRESETS)[0]) => {
    setFormTaskType(preset.type);
    if (!formTitle || formTitle === TASK_TYPE_PRESETS.find((p) => p.type === formTaskType)?.defaultTitle) {
      setFormTitle(preset.defaultTitle);
    }
    if (!formTitleEn || formTitleEn === TASK_TYPE_PRESETS.find((p) => p.type === formTaskType)?.defaultTitleEn) {
      setFormTitleEn(preset.defaultTitleEn);
    }
    if (!formDescription || formDescription === TASK_TYPE_PRESETS.find((p) => p.type === formTaskType)?.defaultDesc) {
      setFormDescription(preset.defaultDesc);
    }
  };

  const handleSaveModal = () => {
    if (!formTitle.trim()) {
      alert('Please enter a task title in Bangla.');
      return;
    }

    const newTask: MandatoryDailyTask = {
      id:
        editingIndex !== null && tasks[editingIndex]?.id
          ? tasks[editingIndex].id
          : `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: formTitle.trim(),
      titleEn: formTitleEn.trim(),
      description: formDescription.trim(),
      taskType: formTaskType,
      groupName: formGroupName.trim(),
      targetUrl: formTargetUrl.trim(),
      isEnabled: formIsEnabled,
      order: editingIndex !== null ? tasks[editingIndex].order : tasks.length + 1,
    };

    let updatedTasks: MandatoryDailyTask[];
    if (editingIndex !== null) {
      updatedTasks = tasks.map((t, idx) => (idx === editingIndex ? newTask : t));
    } else {
      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    setModalOpen(false);
  };

  const handleToggleTask = (index: number, newEnabled: boolean) => {
    const updated = tasks.map((t, idx) => (idx === index ? { ...t, isEnabled: newEnabled } : t));
    setTasks(updated);
  };

  const handleDeleteTask = (index: number) => {
    if (window.confirm(`Are you sure you want to remove "${tasks[index].title}" from mandatory tasks?`)) {
      const updated = tasks.filter((_, idx) => idx !== index);
      setTasks(updated);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...tasks];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setTasks(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === tasks.length - 1) return;
    const updated = [...tasks];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setTasks(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset mandatory checklist to the default 5 Facebook profile setup tasks?')) {
      setTasks(DEFAULT_MANDATORY_TASKS);
    }
  };

  const handleSaveAllToBackend = async () => {
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      const res = await updateSettings({
        mandatoryDailyTasks: tasks.map((t, idx) => ({
          ...t,
          order: idx + 1,
        })),
      });

      if (res.success) {
        setSuccessMsg('Mandatory daily tasks list saved successfully! All SMMs will see this list now.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = tasks.filter((t) => t.isEnabled !== false).length;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
              Mandatory Daily Checklist Control
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              {activeCount} Active Tasks ({tasks.length} total)
            </span>
          </div>
          <h3 className="text-lg font-black text-white">
            বাধ্যতামূলক দৈনিক চেকলিস্ট ও গ্রুপ জয়েন কন্ট্রোল
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            SMM ইউজারদের জন্য রুটিন চেকলিস্টে যে কাজগুলো থাকবে তা এখান থেকে নির্ধারণ ও পরিবর্তন করুন। নতুন গ্রুপ জয়েন টাস্ক, প্রোফাইল অপটিমাইজেশন বা যেকোনো কাস্টম টাস্ক লিংক সহ যুক্ত করতে পারবেন।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset Defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-emerald-400" />}
            className="text-xs text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10"
          >
            Add New Task
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveAllToBackend}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="text-xs"
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const isEnabled = task.isEnabled !== false;
          const isGroup = task.taskType === 'group_join' || !!task.groupName;

          return (
            <div
              key={task.id || idx}
              className={clsx(
                'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                isEnabled
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Index / Reorder */}
                <div className="flex flex-col items-center gap-0.5 text-slate-500 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === tasks.length - 1}
                    className="p-1 rounded hover:bg-slate-800 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Icon */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                    isEnabled
                      ? 'bg-slate-800/90 border-slate-700 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  )}
                >
                  {getTaskIcon(task.taskType)}
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={clsx(
                        'text-sm font-bold leading-tight',
                        isEnabled ? 'text-white' : 'text-slate-400 line-through'
                      )}
                    >
                      {task.title}
                    </h4>
                    {task.titleEn && (
                      <span className="text-[11px] text-slate-400 font-normal hidden md:inline">
                        ({task.titleEn})
                      </span>
                    )}

                    {isGroup && task.groupName && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-400" />
                        Group: {task.groupName}
                      </span>
                    )}

                    {task.taskType === 'marital_status' && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        Married Status
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 leading-snug">{task.description}</p>
                  )}

                  {task.targetUrl && (
                    <div className="pt-0.5">
                      <a
                        href={task.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline"
                      >
                        <Link className="w-3 h-3" />
                        <span className="truncate max-w-xs">{task.targetUrl}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {isEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <Toggle
                    enabled={isEnabled}
                    onChange={(newVal) => handleToggleTask(idx, newVal)}
                  />
                </div>

                <div className="h-5 w-px bg-slate-800" />

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(idx)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(idx)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMM Preview info banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">SMM রুটিন চেকলিস্ট ক্যালকুলেশন:</span>
          <span>
            এখানে সক্রিয় থাকা সকল টাস্ক SMM ইউজারদের প্রতিটি ফেসবুক আইডির দৈনিক রুটিন কার্ডে দেখানো হবে। প্রতিটি টাস্ক টিক দিলে স্বয়ংক্রিয়ভাবে প্রগ্রেস পার্সেন্টেজ হিসাব হবে (যেমন {activeCount} টি সক্রিয় টাস্কের প্রতিটির মান {activeCount > 0 ? (100 / activeCount).toFixed(1) : 100}%)।
          </span>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? 'Edit Mandatory Daily Task' : 'Add New Mandatory Daily Task'}
        size="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Task Type / Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TASK_TYPE_PRESETS.map((preset) => {
                const isSelected = formTaskType === preset.type;
                const IconComp = preset.icon;

                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={clsx(
                      'p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all',
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{preset.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Title (Bangla) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Task Title in Bangla (টাস্কের নাম): <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. ফেসবুক গ্রুপে জয়েন করুন"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Task Title (English Subtitle) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              English Subtitle (ঐচ্ছিক সাবটাইটেল):
            </label>
            <input
              type="text"
              value={formTitleEn}
              onChange={(e) => setFormTitleEn(e.target.value)}
              placeholder="e.g. Join Facebook Group"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Group Specific Fields */}
          {(formTaskType === 'group_join' || formTaskType === 'custom') && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Facebook Group Details (গ্রুপের তথ্য):</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Facebook Group Name (গ্রুপের নাম):
                </label>
                <input
                  type="text"
                  value={formGroupName}
                  onChange={(e) => setFormGroupName(e.target.value)}
                  placeholder="e.g. মা ও শিশুর স্বাস্থ্য ও পুষ্টি ক্লাব"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Group Link / Target URL (গ্রুপের সরাসরি লিংক):
                </label>
                <input
                  type="url"
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="e.g. https://www.facebook.com/groups/yourgroupname"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  SMM ইউজাররা এই লিংকে সরাসরি ক্লিক করে গ্রুপে চলে যেতে পারবে।
                </p>
              </div>
            </div>
          )}

          {/* Description / Instructions */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Instructions / Description (টাস্কের নির্দেশনা):
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. গ্রুপে জয়েন রিকোয়েস্ট পাঠান এবং নোটিফিকেশন অল পোস্ট অন রাখুন"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="font-bold text-white text-xs">Enable this task by default</div>
              <div className="text-[11px] text-slate-400">
                If enabled, this will immediately show on all SMM daily routine checklists.
              </div>
            </div>
            <Toggle enabled={formIsEnabled} onChange={setFormIsEnabled} />
          </div>

          {/* Live Preview Card */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Live SMM Checklist Preview:
            </span>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  {getTaskIcon(formTaskType)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>{formTitle || 'টাস্ক টাইটেল'}</span>
                    {formTitleEn && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({formTitleEn})
                      </span>
                    )}
                    {formGroupName && (
                      <span className="text-[10px] text-indigo-300 font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30">
                        👥 {formGroupName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formDescription || 'টাস্কের বিস্তারিত বিবরণ'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {formTargetUrl && (
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Visit Group
                  </span>
                )}
                <div className="w-5 h-5 rounded-full border border-slate-600" />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveModal}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {editingIndex !== null ? 'Update Task' : 'Add Task to List'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

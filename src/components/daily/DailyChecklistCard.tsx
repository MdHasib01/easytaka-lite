import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DailyRoutineCardData,
  RoutineItemState,
  DynamicTaskItem,
  MandatoryDailyTask,
  MandatoryTaskType,
  MandatoryChecklistItem,
} from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import {
  Camera,
  Image,
  Heart,
  GraduationCap,
  FileText,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  MessageCircle,
  Zap,
  Users,
  Award,
  HelpCircle,
  LifeBuoy,
  Compass,
  BookOpen,
  Link,
} from 'lucide-react';
import { SmmGuidelineModal } from '../accounts/SmmGuidelineModal';
import { useDailyStore } from '../../stores/useDailyStore';

interface DailyChecklistCardProps {
  cardData: DailyRoutineCardData;
  onUpdate: (accountId: string, updates: Partial<RoutineItemState>) => void;
}

const DEFAULT_FALLBACK_MANDATORY_TASKS: MandatoryDailyTask[] = [
  {
    id: 'profile_pic',
    title: 'প্রোফাইল পিকচার আপলোড',
    titleEn: 'Upload profile picture',
    description: 'বাস্তবসম্মত ও শালীন প্রোফাইল ছবি যুক্ত করুন',
    taskType: 'profile_pic',
    isEnabled: true,
    order: 1,
  },
  {
    id: 'cover_photo',
    title: 'কভার ফটো আপলোড',
    titleEn: 'Upload Cover photo',
    description: 'প্রাকৃতিক বা রুচিশীল কভার ছবি আপলোড করুন',
    taskType: 'cover_photo',
    isEnabled: true,
    order: 2,
  },
  {
    id: 'marital_status',
    title: 'বৈবাহিক অবস্থা আপডেট (Married)',
    titleEn: 'Update Marital status',
    description: 'Relationship Status অবশ্যই "Married" (বিবাহিত) সিলেক্ট করুন',
    taskType: 'marital_status',
    isEnabled: true,
    order: 3,
  },
  {
    id: 'school_college',
    title: 'স্কুল/কলেজের তথ্য আপডেট',
    titleEn: 'Update School/College information',
    description: 'প্রোফাইলে বাস্তবসম্মত স্কুল বা কলেজের তথ্য যোগ করুন',
    taskType: 'school_college',
    isEnabled: true,
    order: 4,
  },
  {
    id: 'identity_post',
    title: 'প্রোফাইল ও পরিচয়ের সাথে মিল রেখে পোস্ট',
    titleEn: 'Complete a post related to profile & identity',
    description: 'আইডির মা/সংসার বা বাস্তব পরিচয়ের সাথে মিল রেখে পোস্ট সম্পন্ন করুন',
    taskType: 'identity_post',
    isEnabled: true,
    order: 5,
  },
];

export const DailyChecklistCard: React.FC<DailyChecklistCardProps> = ({
  cardData,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { account, routine } = cardData;

  const storeMandatoryTasks = useDailyStore((state) => state.mandatoryDailyTasks);
  const mandatoryTasksList: MandatoryDailyTask[] =
    storeMandatoryTasks && storeMandatoryTasks.length > 0
      ? storeMandatoryTasks
      : DEFAULT_FALLBACK_MANDATORY_TASKS;

  const activeMandatoryTasks = mandatoryTasksList
    .filter((t) => t.isEnabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const items = routine.items || {
    profilePicUploaded: false,
    coverPhotoUploaded: false,
    maritalStatusUpdated: false,
    schoolCollegeUpdated: false,
    identityPostDone: false,
    mandatoryChecklist: [],
    dynamicChecklist: [],
  };

  const dynamicTasks: DynamicTaskItem[] = items.dynamicChecklist || [];
  const currentMandatoryChecklist: MandatoryChecklistItem[] = items.mandatoryChecklist || [];

  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);
  const [playbookModalOpen, setPlaybookModalOpen] = useState(false);

  const mode = account.accountMode || 'general';
  const assignedProduct = typeof account.assignedProductId === 'object' ? account.assignedProductId : null;
  const productCode = account.assignedAllProducts ? 'all_products' : assignedProduct?.code || 'none';

  const getModeBadge = () => {
    switch (mode) {
      case 'reviewer':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-400" /> MODE R: REVIEWER
          </span>
        );
      case 'question':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-sky-400" /> MODE Q: QUESTION
          </span>
        );
      case 'support':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1">
            <LifeBuoy className="w-3 h-3 text-amber-400" /> MODE S: SUPPORT
          </span>
        );
      case 'navigation':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-400" /> MODE N: NAVIGATION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
            GENERAL ID
          </span>
        );
    }
  };

  const getProductBadge = () => {
    if (account.assignedAllProducts) {
      return (
        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
          ✨ All Products
        </span>
      );
    }
    if (!assignedProduct) return null;
    return (
      <span
        className="px-2 py-0.5 rounded-lg border text-[10px] font-bold"
        style={{
          backgroundColor: `${assignedProduct.productColor}22`,
          borderColor: `${assignedProduct.productColor}55`,
          color: assignedProduct.productColor,
        }}
      >
        {assignedProduct.name}
      </span>
    );
  };

  const isTaskCompleted = (task: MandatoryDailyTask): boolean => {
    const existing = currentMandatoryChecklist.find((m) => m.taskId === task.id);
    if (existing !== undefined) {
      return !!existing.isDone;
    }
    // Fallback to legacy booleans
    if (task.id === 'profile_pic' || task.taskType === 'profile_pic') return !!items.profilePicUploaded;
    if (task.id === 'cover_photo' || task.taskType === 'cover_photo') return !!items.coverPhotoUploaded;
    if (task.id === 'marital_status' || task.taskType === 'marital_status') return !!items.maritalStatusUpdated;
    if (task.id === 'school_college' || task.taskType === 'school_college') return !!items.schoolCollegeUpdated;
    if (task.id === 'identity_post' || task.taskType === 'identity_post') return !!items.identityPostDone;
    return false;
  };

  const handleToggleMandatoryTask = (task: MandatoryDailyTask) => {
    const currentlyDone = isTaskCompleted(task);
    const newDone = !currentlyDone;

    const existingIndex = currentMandatoryChecklist.findIndex((m) => m.taskId === task.id);
    let updatedChecklist: MandatoryChecklistItem[];

    if (existingIndex >= 0) {
      updatedChecklist = currentMandatoryChecklist.map((m, idx) =>
        idx === existingIndex
          ? { ...m, isDone: newDone, completedAt: newDone ? new Date().toISOString() : undefined }
          : m
      );
    } else {
      updatedChecklist = [
        ...currentMandatoryChecklist,
        { taskId: task.id, isDone: newDone, completedAt: newDone ? new Date().toISOString() : undefined },
      ];
    }

    const legacyUpdates: Partial<RoutineItemState> = {
      mandatoryChecklist: updatedChecklist,
    };

    if (task.id === 'profile_pic' || task.taskType === 'profile_pic') legacyUpdates.profilePicUploaded = newDone;
    if (task.id === 'cover_photo' || task.taskType === 'cover_photo') legacyUpdates.coverPhotoUploaded = newDone;
    if (task.id === 'marital_status' || task.taskType === 'marital_status') legacyUpdates.maritalStatusUpdated = newDone;
    if (task.id === 'school_college' || task.taskType === 'school_college') legacyUpdates.schoolCollegeUpdated = newDone;
    if (task.id === 'identity_post' || task.taskType === 'identity_post') legacyUpdates.identityPostDone = newDone;

    onUpdate(account.id, legacyUpdates);
  };

  const handleToggleDynamicTask = (index: number) => {
    const updated = dynamicTasks.map((tItem, idx) =>
      idx === index
        ? {
            ...tItem,
            isDone: !tItem.isDone,
            completedAt: !tItem.isDone ? new Date().toISOString() : undefined,
          }
        : tItem
    );
    onUpdate(account.id, { dynamicChecklist: updated });
  };

  const handleCopyCaption = (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCaptionIndex(index);
    setTimeout(() => setCopiedCaptionIndex(null), 2500);
  };

  const handleMarkAllDone = () => {
    const allMandatoryDone: MandatoryChecklistItem[] = activeMandatoryTasks.map((t) => ({
      taskId: t.id,
      isDone: true,
      completedAt: new Date().toISOString(),
    }));

    const updatedDynamic = dynamicTasks.map((tItem) => ({ ...tItem, isDone: true }));

    onUpdate(account.id, {
      mandatoryChecklist: allMandatoryDone,
      profilePicUploaded: true,
      coverPhotoUploaded: true,
      maritalStatusUpdated: true,
      schoolCollegeUpdated: true,
      identityPostDone: true,
      dynamicChecklist: updatedDynamic,
    });
  };

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

  const getDynamicTaskIcon = (type: string) => {
    switch (type) {
      case 'personal_profile_post':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'react_group_post':
        return <ThumbsUp className="w-4 h-4 text-pink-400" />;
      case 'comment_group_post':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
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

  const isCompleted = routine.completionPercentage >= 100;

  const completedMandatoryCount = activeMandatoryTasks.filter((t) => isTaskCompleted(t)).length;
  const totalMandatoryCount = activeMandatoryTasks.length;

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
        isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/10 shadow-glow-success'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Accent */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}

      <div>
        {/* Top SMM Mode & Playbook Banner */}
        <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-800/80 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getModeBadge()}
            {getProductBadge()}
            {account.childAge && (
              <span className="text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                👶 {account.childAge}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPlaybookModalOpen(true)}
            className="text-[10px] text-indigo-300 hover:text-white font-bold flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 px-2 py-0.5 rounded-lg border border-indigo-500/30 transition-all"
            title="Open SMM script playbook"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>Playbook</span>
          </button>
        </div>

        {/* Account Info Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                account.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
              }
              alt={account.accountName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h4 className="font-bold text-white text-base leading-snug">{account.accountName}</h4>
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{t('common.openLink')}</span>
              </a>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {routine.completionPercentage}% {t('common.done')} ({completedMandatoryCount}/{totalMandatoryCount})
            </span>
          </div>
        </div>

        {/* Account Progress Bar */}
        <div className="mb-4">
          <ProgressBar progress={routine.completionPercentage} size="sm" showPercentage={false} />
        </div>

        {/* Dynamic Mandatory Checklist in Bangla */}
        <div className="space-y-2">
          {activeMandatoryTasks.map((task) => {
            const isDone = isTaskCompleted(task);
            const isGroup = task.taskType === 'group_join' || !!task.groupName;

            return (
              <div
                key={task.id}
                onClick={() => handleToggleMandatoryTask(task)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {getTaskIcon(task.taskType)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className={isDone ? 'line-through text-emerald-200' : 'text-white'}>
                        {task.title}
                      </span>
                      {task.titleEn && (
                        <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                          ({task.titleEn})
                        </span>
                      )}
                      {isGroup && task.groupName && (
                        <span className="text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-400" />
                          {task.groupName}
                        </span>
                      )}
                      {task.taskType === 'marital_status' && (
                        <span className="text-[10px] text-rose-300 font-bold px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30">
                          Married
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <div className="text-[11px] text-slate-400 leading-snug">
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {/* Group Link Button */}
                  {task.targetUrl && (
                    <a
                      href={task.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-blue-400 hover:text-white bg-blue-500/15 hover:bg-blue-600 px-2.5 py-1 rounded-lg border border-blue-500/30 font-bold flex items-center gap-1 transition-colors shadow-sm"
                      title="Open Facebook Group in new tab"
                    >
                      <Link className="w-3 h-3" />
                      <span>Visit Group</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                    </a>
                  )}

                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-600 hover:border-slate-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Assigned Daily Tasks */}
        {dynamicTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('daily.assignedTasksToday')} ({dynamicTasks.filter((tItem) => tItem.isDone).length}/
                {dynamicTasks.length})
              </span>
            </div>

            <div className="space-y-2">
              {dynamicTasks.map((dTask, idx) => {
                const isTaskDone = !!dTask.isDone;
                const isQuota = dTask.mode === 'targeted_quota';

                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleDynamicTask(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isTaskDone
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isQuota
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 mt-0.5">
                          {getDynamicTaskIcon(dTask.taskType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5
                              className={`text-xs font-bold leading-tight ${
                                isTaskDone ? 'text-emerald-300 line-through' : 'text-white'
                              }`}
                            >
                              {dTask.title}
                            </h5>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                                isQuota
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              }`}
                            >
                              {isQuota ? t('daily.targetedCampaign') : t('daily.globalRotation')}
                            </span>
                          </div>
                          {dTask.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                              {dTask.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center flex-shrink-0">
                        {isTaskDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-600" />
                        )}
                      </div>
                    </div>

                    {/* Sample Caption Helper */}
                    {dTask.sampleCaption && (
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-300 font-mono truncate max-w-[220px]">
                          {dTask.sampleCaption}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCaption(dTask.sampleCaption!, idx, e)}
                          className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                        >
                          {copiedCaptionIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> {t('common.copied')}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> {t('common.copyCaption')}
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Target Link Button */}
                    {dTask.targetUrl && (
                      <div className="flex justify-end pt-1">
                        <a
                          href={dTask.targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
                        >
                          <ExternalLink className="w-3 h-3" /> {t('common.openLink')}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">{t('common.autoSaved')}</span>
        {!isCompleted ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllDone}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-indigo-300"
          >
            {t('daily.completeAllChecklist')}
          </Button>
        ) : (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('daily.allDone')}
          </span>
        )}
      </div>

      {/* SMM Guideline & Playbook Modal */}
      <SmmGuidelineModal
        isOpen={playbookModalOpen}
        onClose={() => setPlaybookModalOpen(false)}
        initialMode={account.accountMode}
        initialProduct={productCode}
      />
    </div>
  );
};

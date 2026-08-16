import React, { useState } from 'react';
import { DailyRoutineCardData, RoutineItemState, DynamicTaskItem } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import {
  MessageCircle,
  Share2,
  Image,
  Compass,
  CheckCircle2,
  Plus,
  Minus,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  FileText,
  ThumbsUp,
  Zap,
  Users,
} from 'lucide-react';

interface DailyChecklistCardProps {
  cardData: DailyRoutineCardData;
  onUpdate: (accountId: string, updates: Partial<RoutineItemState>) => void;
}

export const DailyChecklistCard: React.FC<DailyChecklistCardProps> = ({
  cardData,
  onUpdate,
}) => {
  const { account, routine } = cardData;
  const items = routine.items || {
    feedScrollDone: false,
    commentsCount: 0,
    communityRepliesCount: 0,
    storyPostDone: false,
    groupShareCount: 0,
    dynamicChecklist: [],
  };

  const dynamicTasks: DynamicTaskItem[] = items.dynamicChecklist || [];

  const targets = account.routineTargets || {
    feedComments: 5,
    communityReplies: 3,
    storyPost: true,
    groupShare: 2,
    feedScrollMinutes: 10,
  };

  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);

  const handleCommentChange = (delta: number) => {
    const newVal = Math.max(0, (items.commentsCount || 0) + delta);
    onUpdate(account.id, { commentsCount: newVal });
  };

  const handleRepliesChange = (delta: number) => {
    const newVal = Math.max(0, (items.communityRepliesCount || 0) + delta);
    onUpdate(account.id, { communityRepliesCount: newVal });
  };

  const handleShareChange = (delta: number) => {
    const newVal = Math.max(0, (items.groupShareCount || 0) + delta);
    onUpdate(account.id, { groupShareCount: newVal });
  };

  const handleToggleStory = () => {
    onUpdate(account.id, { storyPostDone: !items.storyPostDone });
  };

  const handleToggleFeedScroll = () => {
    onUpdate(account.id, { feedScrollDone: !items.feedScrollDone });
  };

  const handleToggleDynamicTask = (index: number) => {
    const updated = dynamicTasks.map((t, idx) =>
      idx === index ? { ...t, isDone: !t.isDone, completedAt: !t.isDone ? new Date().toISOString() : undefined } : t
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
    const updatedDynamic = dynamicTasks.map((t) => ({ ...t, isDone: true }));
    onUpdate(account.id, {
      commentsCount: targets.feedComments,
      communityRepliesCount: targets.communityReplies,
      storyPostDone: true,
      feedScrollDone: true,
      groupShareCount: targets.groupShare,
      dynamicChecklist: updatedDynamic,
    });
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
                <span>View Facebook Profile</span>
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
              {routine.completionPercentage}% Done
            </span>
          </div>
        </div>

        {/* Account Progress Bar */}
        <div className="mb-4">
          <ProgressBar progress={routine.completionPercentage} size="sm" showPercentage={false} />
        </div>

        {/* Base Must-Do Checklist Items */}
        <div className="space-y-2.5">
          {/* 1. Post Comments */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Post Comments</div>
                <div className="text-[11px] text-slate-400">
                  Target: {targets.feedComments} comments on target niche
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCommentChange(-1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span
                className={`w-8 text-center text-xs font-bold tabular-nums ${
                  (items.commentsCount || 0) >= targets.feedComments ? 'text-emerald-400' : 'text-slate-200'
                }`}
              >
                {items.commentsCount || 0}/{targets.feedComments}
              </span>
              <button
                onClick={() => handleCommentChange(1)}
                className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Community Replies */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Community / Group Replies</div>
                <div className="text-[11px] text-slate-400">
                  Target: {targets.communityReplies} replies to help members
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleRepliesChange(-1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span
                className={`w-8 text-center text-xs font-bold tabular-nums ${
                  (items.communityRepliesCount || 0) >= targets.communityReplies ? 'text-emerald-400' : 'text-slate-200'
                }`}
              >
                {items.communityRepliesCount || 0}/{targets.communityReplies}
              </span>
              <button
                onClick={() => handleRepliesChange(1)}
                className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Story / Reel Post */}
          {targets.storyPost && (
            <div
              onClick={handleToggleStory}
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                items.storyPostDone
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Post Daily Story / Reel</div>
                  <div className="text-[11px] text-slate-400">Engage followers with fresh stories</div>
                </div>
              </div>

              <div className="flex items-center">
                {items.storyPostDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-600" />
                )}
              </div>
            </div>
          )}

          {/* 4. Feed Scroll & Warmup */}
          <div
            onClick={handleToggleFeedScroll}
            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
              items.feedScrollDone
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Feed Warmup Scrolling ({targets.feedScrollMinutes || 10} min)
                </div>
                <div className="text-[11px] text-slate-400">Scroll feed & react naturally to maintain trust</div>
              </div>
            </div>

            <div className="flex items-center">
              {items.feedScrollDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-600" />
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Assigned Daily Tasks (Rotated Global & Quota Campaigns) */}
        {dynamicTasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Assigned Engagement Tasks Today ({dynamicTasks.filter((t) => t.isDone).length}/
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
                              {isQuota ? 'TARGETED' : 'ROTATED'}
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
                              <Check className="w-3 h-3 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Caption
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
                          <ExternalLink className="w-3 h-3" /> Open Target Link
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
        <span className="text-[11px] text-slate-500">Auto-saved live</span>
        {!isCompleted ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllDone}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-indigo-300"
          >
            Complete All Checklist
          </Button>
        ) : (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Routine Completed!
          </span>
        )}
      </div>
    </div>
  );
};

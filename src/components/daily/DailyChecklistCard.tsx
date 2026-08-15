import React from 'react';
import { DailyRoutineCardData, RoutineItemState } from '../../types';
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
  };
  const targets = account.routineTargets || {
    feedComments: 5,
    communityReplies: 3,
    storyPost: true,
    groupShare: 2,
    feedScrollMinutes: 10,
  };

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

  const handleMarkAllDone = () => {
    onUpdate(account.id, {
      commentsCount: targets.feedComments,
      communityRepliesCount: targets.communityReplies,
      storyPostDone: true,
      feedScrollDone: true,
      groupShareCount: targets.groupShare,
    });
  };

  const isCompleted = routine.completionPercentage >= 100;

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all relative overflow-hidden ${
        isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/10 shadow-glow-success'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Accent */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      )}

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

      {/* Must-Do Checklist Items */}
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

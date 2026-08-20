import React, { useState } from 'react';
import { DailyWorkSubmission, DailyTaskScoreRules, User } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  MessageSquare,
  ExternalLink,
  ZoomIn,
  Users,
  Flame,
  Award,
  HelpCircle,
  LifeBuoy,
  Compass,
  MessageCircle,
  Share2,
  Image,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailySubmissionReviewCardProps {
  submission: DailyWorkSubmission;
  scoreRules?: DailyTaskScoreRules | null;
  defaultDailyReward?: number;
  onReview: (
    id: string,
    data: {
      action: 'approve' | 'reject';
      reviewScore?: number;
      pointsAwarded?: number;
      adminFeedback?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  onZoomImage?: (url: string) => void;
}

export const DailySubmissionReviewCard: React.FC<DailySubmissionReviewCardProps> = ({
  submission,
  scoreRules,
  defaultDailyReward = 100,
  onReview,
  onZoomImage,
}) => {
  const [selectedScore, setSelectedScore] = useState<number>(4);
  const [pointsInput, setPointsInput] = useState<number>(() => {
    if (scoreRules?.score4Points !== undefined) return scoreRules.score4Points;
    return Math.round(defaultDailyReward * 0.8);
  });
  const [adminFeedback, setAdminFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const smm = submission.smmId as User;
  const isPending = submission.status === 'pending';
  const isApproved = submission.status === 'approved';
  const isRejected = submission.status === 'rejected';

  const handleScoreChange = (score: number) => {
    setSelectedScore(score);
    let pts = defaultDailyReward;
    if (score === 5) pts = scoreRules?.score5Points ?? defaultDailyReward;
    else if (score === 4) pts = scoreRules?.score4Points ?? Math.round(defaultDailyReward * 0.8);
    else if (score === 3) pts = scoreRules?.score3Points ?? Math.round(defaultDailyReward * 0.6);
    else if (score === 2) pts = scoreRules?.score2Points ?? Math.round(defaultDailyReward * 0.4);
    else if (score === 1) pts = scoreRules?.score1Points ?? Math.round(defaultDailyReward * 0.2);
    setPointsInput(pts);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    const res = await onReview(submission._id, {
      action: 'approve',
      reviewScore: selectedScore,
      pointsAwarded: Number(pointsInput),
      adminFeedback: adminFeedback.trim() || 'Approved by Admin',
    });
    setIsProcessing(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleReject = async () => {
    if (!adminFeedback.trim()) {
      setErrorMessage('Please write a feedback note explaining why revision is requested.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    const res = await onReview(submission._id, {
      action: 'reject',
      adminFeedback: adminFeedback.trim(),
    });
    setIsProcessing(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const getModeBadge = (mode?: string) => {
    switch (mode) {
      case 'reviewer':
        return (
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
            MODE R: REVIEWER
          </span>
        );
      case 'question':
        return (
          <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
            MODE Q: QUESTION
          </span>
        );
      case 'support':
        return (
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
            MODE S: SUPPORT
          </span>
        );
      case 'navigation':
        return (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
            MODE N: NAVIGATION
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
            GENERAL
          </span>
        );
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border space-y-4 transition-all ${
        isPending
          ? 'border-amber-500/40 bg-amber-950/10 shadow-glow-brand'
          : isApproved
          ? 'border-emerald-500/30 bg-slate-900/40'
          : 'border-rose-500/30 bg-slate-900/40'
      }`}
    >
      {/* Top SMM Submitter Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              smm?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(smm?.name || 'SMM')}&background=4f46e5&color=fff`
            }
            alt={smm?.name}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm sm:text-base">
                {smm?.name || 'SMM Agent'}
              </span>
              <span className="text-xs text-slate-400">({smm?.email})</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Balance: {smm?.rewardPoints || 0} PTS
              </span>
              {smm?.streakDays !== undefined && smm.streakDays > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> {smm.streakDays}d Streak
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Date: <strong className="text-white font-medium">{submission.date}</strong></span>
              <span>•</span>
              <span>Submitted: {new Date(submission.submittedAt || submission.createdAt || Date.now()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status & Points Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" /> PENDING REVIEW
            </span>
          )}
          {isApproved && (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ⭐ {submission.reviewScore}/5 (+{submission.pointsAwarded} PTS)
            </span>
          )}
          {isRejected && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-400" /> REVISION REQUESTED
            </span>
          )}
        </div>
      </div>

      {/* Overall Progress & Accounts Summary */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Overall Daily Completion Progress:
          </span>
          <span className="font-black text-amber-300 text-sm">
            {submission.overallProgress}% ({submission.completedAccountsCount}/{submission.totalAccounts} Accounts Completed)
          </span>
        </div>
        <ProgressBar progress={submission.overallProgress} size="sm" showPercentage={false} />
      </div>

      {/* Account Routine Breakdown List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Facebook Profiles & Routine Actions Breakdown ({submission.accountSummaries?.length || 0}):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {(submission.accountSummaries || []).map((acc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white truncate max-w-[150px]">
                    {acc.accountName}
                  </span>
                  {getModeBadge(acc.accountMode)}
                </div>
                <span
                  className={`font-extrabold text-xs ${
                    acc.completionPercentage >= 100 ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {acc.completionPercentage}%
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-300">
                <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                  <MessageCircle className="w-3 h-3 text-indigo-400" />
                  {acc.commentsCount} Comments
                </span>
                <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
                  <Share2 className="w-3 h-3 text-cyan-400" />
                  {acc.communityRepliesCount} Replies
                </span>
                {acc.storyPostDone && (
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ✓ Story
                  </span>
                )}
                {acc.feedScrollDone && (
                  <span className="text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ✓ Warmup
                  </span>
                )}
              </div>

              {acc.dynamicChecklist && acc.dynamicChecklist.length > 0 && (
                <div className="pt-1 border-t border-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold block">Dynamic Tasks:</span>
                  <div className="space-y-0.5">
                    {acc.dynamicChecklist.map((d, dIdx) => (
                      <div key={dIdx} className="flex items-center justify-between text-[11px]">
                        <span className={`truncate max-w-[200px] ${d.isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                          {d.title}
                        </span>
                        <span className={d.isDone ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                          {d.isDone ? '✓ Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SMM Notes & Proof Links */}
      {(submission.smmNotes || submission.proofUrl || submission.screenshotUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
          <div className="space-y-2">
            {submission.smmNotes && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">
                  SMM Remarks:
                </span>
                <p className="text-slate-200 text-xs">{submission.smmNotes}</p>
              </div>
            )}

            {submission.proofUrl && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Proof Link:</span>
                <a
                  href={submission.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{submission.proofUrl}</span>
                </a>
              </div>
            )}
          </div>

          <div>
            {submission.screenshotUrl && (
              <div
                onClick={() => onZoomImage && onZoomImage(submission.screenshotUrl!)}
                className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-black/50 cursor-pointer h-28"
              >
                <img
                  src={submission.screenshotUrl}
                  alt="Proof Screenshot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold">
                  <ZoomIn className="w-4 h-4" /> Click to Zoom
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN EVALUATION & GRADING CONTROLS (IF PENDING) */}
      {isPending ? (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> Admin Grading & Reward Assignment:
            </span>
            <span className="text-[11px] text-indigo-300 font-semibold">
              Global Scale (1–5 Stars)
            </span>
          </div>

          {/* Star Rating Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {[5, 4, 3, 2, 1].map((s) => {
              let pts = defaultDailyReward;
              if (s === 5) pts = scoreRules?.score5Points ?? defaultDailyReward;
              else if (s === 4) pts = scoreRules?.score4Points ?? Math.round(defaultDailyReward * 0.8);
              else if (s === 3) pts = scoreRules?.score3Points ?? Math.round(defaultDailyReward * 0.6);
              else if (s === 2) pts = scoreRules?.score2Points ?? Math.round(defaultDailyReward * 0.4);
              else if (s === 1) pts = scoreRules?.score1Points ?? Math.round(defaultDailyReward * 0.2);

              const isSelected = selectedScore === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleScoreChange(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-glow-brand ring-2 ring-indigo-500'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: s }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span>{s}/5</span>
                  <span className="text-[10px] text-amber-300 font-black">({pts} PTS)</span>
                </button>
              );
            })}
          </div>

          {/* Points & Feedback Input */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Points to Award:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-black text-amber-300"
                />
                <span className="text-xs font-bold text-slate-400">PTS</span>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Admin Feedback / Evaluation Note:
              </label>
              <input
                type="text"
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder="e.g. Excellent tone and active replies today. Keep it up!"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <Button
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              onClick={handleReject}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Request Revision / Reject
            </Button>

            <Button
              variant="glow"
              size="sm"
              isLoading={isProcessing}
              onClick={handleApprove}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="shadow-glow-brand"
            >
              Approve & Award +{pointsInput} PTS (Score: {selectedScore}/5)
            </Button>
          </div>
        </div>
      ) : (
        /* Review Verdict Footer */
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-slate-400">
              Evaluated by:{' '}
              <strong className="text-white">
                {submission.reviewedBy && typeof submission.reviewedBy === 'object'
                  ? (submission.reviewedBy as any).name
                  : 'Admin'}
              </strong>{' '}
              on {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleString() : 'Recently'}
            </span>
            {submission.adminFeedback && (
              <p className="text-slate-300 italic">"{submission.adminFeedback}"</p>
            )}
          </div>

          {isApproved && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>+{submission.pointsAwarded} PTS Credited</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

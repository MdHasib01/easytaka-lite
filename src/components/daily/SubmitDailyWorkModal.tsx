import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Send,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Coins,
} from 'lucide-react';
import { DailyRoutineCardData, DailyTaskScoreRules } from '../../types';

interface SubmitDailyWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  overallProgress: number;
  totalAccounts: number;
  completedAccountsCount: number;
  routines: DailyRoutineCardData[];
  maxPoints?: number;
  scoreRules?: DailyTaskScoreRules | null;
  onSubmit: (data: {
    date: string;
    smmNotes?: string;
    proofUrl?: string;
    screenshotUrl?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

export const SubmitDailyWorkModal: React.FC<SubmitDailyWorkModalProps> = ({
  isOpen,
  onClose,
  date,
  overallProgress,
  totalAccounts,
  completedAccountsCount,
  routines,
  maxPoints = 100,
  scoreRules,
  onSubmit,
}) => {
  const [smmNotes, setSmmNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await onSubmit({
      date,
      smmNotes: smmNotes.trim(),
      proofUrl: proofUrl.trim(),
      screenshotUrl: screenshotUrl.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const s5 = scoreRules?.score5Points ?? maxPoints;
  const s4 = scoreRules?.score4Points ?? Math.round(maxPoints * 0.8);
  const s3 = scoreRules?.score3Points ?? Math.round(maxPoints * 0.6);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Daily Tasks for Admin Review"
      subtitle={`Submit your completed routine checklist and tasks for ${date} to be graded and rewarded.`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Overview Summary Banner */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Daily Completion Status
              </span>
            </div>
            <span className="text-sm font-black text-amber-300">
              {overallProgress}% Complete
            </span>
          </div>

          <ProgressBar progress={overallProgress} size="sm" showPercentage={false} />

          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <span>
              {completedAccountsCount} of {totalAccounts} Facebook Profiles Done
            </span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Up to +{s5} PTS Reward
            </span>
          </div>
        </div>

        {/* Global Rating Guide */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Admin Review & Point Scoring System:
          </span>
          <div className="flex items-center gap-3 flex-wrap text-slate-300 text-[11px]">
            <span className="flex items-center gap-1">
              ⭐ 5/5: <strong className="text-emerald-400">+{s5} PTS</strong>
            </span>
            <span className="flex items-center gap-1">
              ⭐ 4/5: <strong className="text-indigo-400">+{s4} PTS</strong>
            </span>
            <span className="flex items-center gap-1">
              ⭐ 3/5: <strong className="text-amber-400">+{s3} PTS</strong>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Admin will inspect your engagement quality, comments, and replies to assign your daily score.
          </p>
        </div>

        {/* Accounts Breakdown Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Accounts Included in this Submission:
          </label>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {routines.map((r) => (
              <div
                key={r.account.id}
                className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white truncate max-w-[160px]">
                    {r.account.accountName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                    {r.account.accountMode || 'general'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-400 text-[11px]">
                    {[
                      r.routine.items?.profilePicUploaded,
                      r.routine.items?.coverPhotoUploaded,
                      r.routine.items?.maritalStatusUpdated,
                      r.routine.items?.schoolCollegeUpdated,
                      r.routine.items?.identityPostDone,
                    ].filter(Boolean).length}
                    /5 tasks done
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      r.routine.completionPercentage >= 100 ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {r.routine.completionPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMM Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Notes / Summary for Reviewer (Optional):
          </label>
          <textarea
            rows={2}
            value={smmNotes}
            onChange={(e) => setSmmNotes(e.target.value)}
            placeholder="e.g. Finished all routine comments and joined 2 new mom groups today..."
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Optional Proof Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Proof Link / Post URL (Optional):
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Screenshot Image URL (Optional):
            </label>
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Admin Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

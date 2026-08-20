import React, { useState } from 'react';
import { TaskSubmission, Task, User, FacebookAccount } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ImageLightbox } from '../ui/ImageLightbox';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Coins,
  Clock,
  User as UserIcon,
  ZoomIn,
  MessageSquare,
  Sparkles,
  Star,
  Award,
} from 'lucide-react';

interface VerificationCardProps {
  submission: TaskSubmission;
  onVerify: (
    id: string,
    action: 'approve' | 'reject',
    adminNote?: string,
    rating?: number
  ) => Promise<{ success: boolean; message: string }>;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ submission, onVerify }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [adminNote, setAdminNote] = useState(submission.adminNote || '');
  const [rating, setRating] = useState<number>(submission.rating || 5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const task = submission.taskId as Task;
  const smm = submission.smmId as User;
  const fbAccount = submission.facebookAccountId as FacebookAccount;

  const handleAction = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !adminNote.trim()) {
      setFeedback('Please write a feedback note explaining why proof was rejected.');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    const res = await onVerify(submission._id, action, adminNote.trim(), rating);
    setIsProcessing(false);

    if (!res.success) {
      setFeedback(res.message);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Top Header: SMM submitter & status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <img
            src={
              smm?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(smm?.name || 'SMM')}&background=4f46e5&color=fff`
            }
            alt={smm?.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{smm?.name || 'SMM Agent'}</span>
              <span className="text-xs text-slate-400">({smm?.email})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Submitted: {new Date(submission.createdAt).toLocaleString()}</span>
              {fbAccount && (
                <span className="text-indigo-400 font-medium">
                  • Via FB: {fbAccount.accountName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              submission.status === 'approved'
                ? 'approved'
                : submission.status === 'rejected'
                ? 'rejected'
                : 'pending'
            }
          >
            {submission.status.toUpperCase()}
          </Badge>

          {submission.status === 'approved' ? (
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-emerald-300 font-bold text-xs">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>⭐ {submission.rating || 5}/5 Rated</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-xl text-indigo-300 font-medium text-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>12 AM Daily Point System</span>
            </div>
          )}
        </div>
      </div>

      {/* Task Summary Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
        <div className="text-xs font-semibold text-slate-200">
          Task: {task?.title || 'Engagement Task'}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{task?.description}</p>
      </div>

      {/* Proof Content: Profile/Target Link + Screenshot Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Left: Submission Data & Links */}
        <div className="space-y-3">
          {submission.profileUrl && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Submitted Profile / Proof Link:
              </label>
              <a
                href={submission.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl font-medium truncate"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{submission.profileUrl}</span>
              </a>
            </div>
          )}

          {submission.proofUrl && submission.proofUrl !== submission.profileUrl && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Target Action Proof URL:
              </label>
              <a
                href={submission.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl font-medium truncate"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{submission.proofUrl}</span>
              </a>
            </div>
          )}

          {submission.smmNotes && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                SMM Remarks:
              </label>
              <p className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl leading-relaxed">
                {submission.smmNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Screenshot Image */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Uploaded Screenshot Proof:
          </label>
          {submission.screenshotUrl ? (
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-black/50 cursor-pointer h-40"
            >
              <img
                src={submission.screenshotUrl}
                alt="Proof Screenshot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                <ZoomIn className="w-4 h-4" /> Click to Zoom Full Image
              </div>
            </div>
          ) : (
            <div className="h-40 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
              No screenshot provided for this task.
            </div>
          )}
        </div>
      </div>

      {/* Admin Action & Verification Form */}
      {submission.status === 'pending' ? (
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          {/* Star Rating Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quality Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`p-1 rounded-lg transition-all ${
                      rating >= s ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-300 ml-1">({rating}/5)</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-500">
              Daily points will be calculated at 12:00 AM based on average rating
            </span>
          </div>

          <div>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Optional approval note or REQUIRED feedback note if rejecting..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {feedback && <p className="text-xs text-rose-400 font-medium">{feedback}</p>}

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="danger"
              size="sm"
              isLoading={isProcessing}
              onClick={() => handleAction('reject')}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject / Request Revision
            </Button>
            <Button
              variant="success"
              size="sm"
              isLoading={isProcessing}
              onClick={() => handleAction('approve')}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve Task (⭐ {rating}/5)
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>
              Verified by:{' '}
              <span className="text-slate-200 font-medium">
                {submission.verifiedBy ? (submission.verifiedBy as User).name : 'Admin'}
              </span>
            </span>
            {submission.rating && (
              <span className="text-amber-300 font-semibold">• Rating: ⭐ {submission.rating}/5</span>
            )}
          </div>
          {submission.adminNote && (
            <span className="italic text-slate-300">"{submission.adminNote}"</span>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={submission.screenshotUrl}
        title={`Proof Screenshot - ${task?.title}`}
      />
    </div>
  );
};

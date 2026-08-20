import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CloudinaryUploader } from '../ui/CloudinaryUploader';
import { Task } from '../../types';
import { useAccountStore } from '../../stores/useAccountStore';
import { Link as LinkIcon, Send, AlertCircle, Coins, Sparkles } from 'lucide-react';
import { FacebookProfileExampleCard } from '../accounts/FacebookProfileExampleCard';

interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (taskId: string, payload: any) => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void;
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmit,
  onSuccess,
}) => {
  const { accounts, selectedAccount } = useAccountStore();
  const [facebookAccountId, setFacebookAccountId] = useState<string>(
    task?.mySubmission?.facebookAccountId?.toString() || selectedAccount?._id || ''
  );
  const [profileUrl, setProfileUrl] = useState<string>(task?.mySubmission?.profileUrl || '');
  const [proofUrl, setProofUrl] = useState<string>(task?.mySubmission?.proofUrl || '');
  const [screenshotUrl, setScreenshotUrl] = useState<string>(task?.mySubmission?.screenshotUrl || '');
  const [smmNotes, setSmmNotes] = useState<string>(task?.mySubmission?.smmNotes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  if (!task) return null;

  const isAccountCreation =
    task.taskType === 'create_account' ||
    task.title?.toLowerCase().includes('account') ||
    task.title?.toLowerCase().includes('facebook account') ||
    task.category?.toLowerCase().includes('account');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (task.profileLinkRequired && !profileUrl && !proofUrl) {
      setFeedback({ type: 'error', message: 'Please provide the profile URL or proof link.' });
      return;
    }

    if (task.screenshotRequired && !screenshotUrl) {
      setFeedback({ type: 'error', message: 'Please upload a screenshot proof to verify completion.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      facebookAccountId: facebookAccountId || undefined,
      profileUrl: profileUrl.trim() || proofUrl.trim(),
      proofUrl: proofUrl.trim() || profileUrl.trim(),
      screenshotUrl,
      smmNotes: smmNotes.trim(),
    };

    const res = await onSubmit(task._id, payload);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Proof for Verification"
      subtitle={`Submit your work for task: "${task.title}" for admin verification.`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Routine Verification Alert */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium">
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Approved submissions count towards your Daily Routine Checklist & streaks.</span>
          </div>
          <span className="font-bold text-emerald-400 text-xs">✓ Daily Routine Task</span>
        </div>

        {/* Task Guidelines summary */}
        {task.instructions && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-slate-200">Task Instructions:</span>
            <p className="whitespace-pre-line text-slate-400">{task.instructions}</p>
          </div>
        )}

        {/* Facebook Account Creation Example & Bangla Guidelines */}
        {isAccountCreation && (
          <FacebookProfileExampleCard className="mb-2" />
        )}

        {/* Select Managed Facebook Account */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Facebook Account Used
          </label>
          <select
            value={facebookAccountId}
            onChange={(e) => setFacebookAccountId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          >
            <option value="">
              {isAccountCreation ? '-- Newly Created Account (Will register profile below) --' : '-- Select Managed FB Account --'}
            </option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountName} ({acc.profileUrl})
              </option>
            ))}
          </select>
        </div>

        {/* Profile / Action URL */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            {isAccountCreation ? 'Created Facebook Profile URL' : 'Target Comment / Profile URL'}{' '}
            {task.profileLinkRequired && <span className="text-rose-400">*</span>}
          </label>
          <div className="relative">
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://facebook.com/profile.php?id=..."
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
              required={task.profileLinkRequired}
            />
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Cloudinary Screenshot Uploader */}
        <CloudinaryUploader
          label="Screenshot Proof (Cloudinary Upload)"
          required={task.screenshotRequired}
          defaultUrl={screenshotUrl}
          onUploadSuccess={(url) => setScreenshotUrl(url)}
        />

        {/* SMM Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Remarks & Notes for Verification (Optional)
          </label>
          <textarea
            value={smmNotes}
            onChange={(e) => setSmmNotes(e.target.value)}
            rows={2}
            placeholder="e.g. 2FA configured with Google Authenticator, 5 friends added, proxy location: NY."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Submit for Approval
          </Button>
        </div>
      </form>
    </Modal>
  );
};

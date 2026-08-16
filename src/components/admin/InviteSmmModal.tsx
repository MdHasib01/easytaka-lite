import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { Mail, Send, Copy, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, UserPlus } from 'lucide-react';

interface InviteSmmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteSmmModal: React.FC<InviteSmmModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setFeedback(null);
    setGeneratedLink('');

    try {
      const response = await api.post('/auth/invite-smm', { email: email.trim() });
      if (response.data.success) {
        setGeneratedLink(response.data.inviteUrl || '');
        setFeedback({
          type: 'success',
          message: `Invitation email dispatched to ${email}. SMM can complete profile and upload National ID via the link.`,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create invitation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClose = () => {
    setEmail('');
    setGeneratedLink('');
    setFeedback(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite New SMM Agent"
      subtitle="Input the SMM's email address. An invitation with a secure onboarding link will be sent automatically."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            SMM Agent Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent.smm@gmail.com"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Process Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Onboarding Pipeline:</span>
          </div>
          <p>
            1. SMM receives the invitation email via SMTP with their private link.
          </p>
          <p>
            2. They fill in their info, password, avatar, and upload <strong>both sides of their National ID</strong>.
          </p>
          <p>
            3. You review the documents in the Verification Portal and approve their account to grant access.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Generated Direct Link with Copy Button */}
        {generatedLink && (
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              <span>Direct Onboarding Link (Copy & Share):</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-700 font-mono truncate"
              />
              <Button
                type="button"
                variant={copied ? 'success' : 'secondary'}
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {generatedLink ? 'Done' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            {generatedLink ? 'Send Another Invite' : 'Send Invitation Email'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

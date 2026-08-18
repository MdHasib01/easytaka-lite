import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FacebookAccount } from '../../types';
import { Link as LinkIcon, User, Lock, Hash, Mail, Eye, EyeOff, Plus, CheckCircle2 } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<FacebookAccount>) => Promise<any>;
  initialAccount?: FacebookAccount | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAccount,
}) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [accountName, setAccountName] = useState('');
  const [profileUid, setProfileUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAccount) {
      setProfileUrl(initialAccount.profileUrl || '');
      setAccountName(initialAccount.accountName || '');
      setProfileUid(initialAccount.profileUid || '');
      setPassword(initialAccount.password || initialAccount.passwordHint || '');
      setEmail(initialAccount.emailOrPhone || '');
      setEmailPassword(initialAccount.emailPassword || '');
    } else {
      setProfileUrl('');
      setAccountName('');
      setProfileUid('');
      setPassword('');
      setEmail('');
      setEmailPassword('');
    }
    setError(null);
    setShowPassword(false);
    setShowEmailPassword(false);
  }, [initialAccount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl.trim() || !accountName.trim()) {
      setError('Profile Link and Account Name are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Partial<FacebookAccount> = {
      profileUrl: profileUrl.trim(),
      accountName: accountName.trim(),
      profileUid: profileUid.trim(),
      password: password.trim(),
      passwordHint: password.trim(),
      emailOrPhone: email.trim(),
      emailPassword: emailPassword.trim(),
    };

    const res = await onSubmit(payload);
    setIsSubmitting(false);

    if (res) {
      onClose();
    } else {
      setError('Failed to save Facebook account. Please check your details.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAccount ? 'Edit Facebook Account' : 'Add Facebook Account'}
      subtitle="Enter the Facebook account credentials and profile details."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Facebook Profile URL / Link */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Facebook Profile Link <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://facebook.com/username or profile url"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              required
              autoFocus
            />
            <LinkIcon className="w-4 h-4 text-blue-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 2. Account Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Account Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. John Doe / Marketer Sarah"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              required
            />
            <User className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 3. User ID / UID */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Facebook User ID / UID <span className="text-slate-500 font-normal">(Optional / Numeric ID)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={profileUid}
              onChange={(e) => setProfileUid(e.target.value)}
              placeholder="e.g. 1000892817291 or username"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
            <Hash className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 4. Password */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Account Password <span className="text-slate-500 font-normal">(For secure account vault)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Facebook account password"
              className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
            <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-white absolute right-3 top-3 p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 5. Email */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Email <span className="text-slate-500 font-normal">(Used to sign up / recover the account)</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="account.email@example.com"
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
            <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* 6. Email Password */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Email Password <span className="text-slate-500 font-normal">(For secure account vault)</span>
          </label>
          <div className="relative">
            <input
              type={showEmailPassword ? 'text' : 'password'}
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Enter email account password"
              className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
            <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowEmailPassword(!showEmailPassword)}
              className="text-slate-400 hover:text-white absolute right-3 top-3 p-0.5"
            >
              {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            isLoading={isSubmitting}
            leftIcon={initialAccount ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {initialAccount ? 'Save Changes' : 'Create Facebook Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

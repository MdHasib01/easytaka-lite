import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/useAuthStore';
import api from '../../services/api';
import {
  Link as LinkIcon,
  User as UserIcon,
  Lock,
  Hash,
  Mail,
  Eye,
  EyeOff,
  Plus,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Award,
  ShieldCheck,
} from 'lucide-react';
import type {
  FacebookAccount,
  User,
  FacebookAccountMode,
  FacebookAssignedProduct,
  FacebookWorkloadTier,
} from '../../types';

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
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [profileUrl, setProfileUrl] = useState('');
  const [accountName, setAccountName] = useState('');
  const [profileUid, setProfileUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [smms, setSmms] = useState<User[]>([]);

  const [accountMode, setAccountMode] = useState<FacebookAccountMode>('reviewer');
  const [assignedProduct, setAssignedProduct] = useState<FacebookAssignedProduct>('milkimom');
  const [workloadTier, setWorkloadTier] = useState<FacebookWorkloadTier>('active');
  const [childAge, setChildAge] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState('');
  const [writingStyle, setWritingStyle] = useState('Bangla (বাঙালি মা টোন)');
  const [personaBio, setPersonaBio] = useState('');
  const [customGuideline, setCustomGuideline] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAdmin) {
      api.get('/auth/smms').then((res) => {
        if (res.data.success) {
          setSmms(res.data.smms || []);
        } else {
          api.get('/auth/smm-verifications?status=all').then((res2) => {
            if (res2.data.success) setSmms(res2.data.smms || []);
          }).catch(() => {});
        }
      }).catch(() => {
        api.get('/auth/smm-verifications?status=all').then((res2) => {
          if (res2.data.success) setSmms(res2.data.smms || []);
        }).catch(() => {});
      });
    }

    if (initialAccount) {
      setProfileUrl(initialAccount.profileUrl || '');
      setAccountName(initialAccount.accountName || '');
      setProfileUid(initialAccount.profileUid || '');
      setPassword(initialAccount.password || initialAccount.passwordHint || '');
      setEmail(initialAccount.emailOrPhone || '');
      setEmailPassword(initialAccount.emailPassword || '');
      setAccountMode(initialAccount.accountMode || 'reviewer');
      setAssignedProduct(initialAccount.assignedProduct || 'milkimom');
      setWorkloadTier(initialAccount.workloadTier || 'active');
      setChildAge(initialAccount.childAge || '');
      setPurchaseDate(initialAccount.purchaseDate || '');
      setPurchaseHistory(initialAccount.purchaseHistory || '');
      setWritingStyle(initialAccount.writingStyle || 'Bangla (বাঙালি মা টোন)');
      setPersonaBio(initialAccount.personaBio || '');
      setCustomGuideline(initialAccount.customGuideline || '');

      const currentAssignedId =
        (typeof initialAccount.assignedTo === 'object' && initialAccount.assignedTo?._id) ||
        (typeof initialAccount.assignedTo === 'string' && initialAccount.assignedTo) ||
        (typeof initialAccount.smmId === 'object' && initialAccount.smmId?._id) ||
        (typeof initialAccount.smmId === 'string' && initialAccount.smmId) ||
        '';
      setAssignedTo(currentAssignedId);
    } else {
      setProfileUrl('');
      setAccountName('');
      setProfileUid('');
      setPassword('');
      setEmail('');
      setEmailPassword('');
      setAssignedTo('');
      setAccountMode('reviewer');
      setAssignedProduct('milkimom');
      setWorkloadTier('active');
      setChildAge('');
      setPurchaseDate('');
      setPurchaseHistory('');
      setWritingStyle('Bangla (বাঙালি মা টোন)');
      setPersonaBio('');
      setCustomGuideline('');
    }
    setError(null);
    setShowPassword(false);
    setShowEmailPassword(false);
  }, [initialAccount, isOpen, isAdmin]);

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
      assignedTo: assignedTo || undefined,
    };

    if (isAdmin) {
      payload.accountMode = accountMode;
      payload.assignedProduct = assignedProduct;
      payload.workloadTier = workloadTier;
      payload.childAge = childAge.trim();
      payload.purchaseDate = purchaseDate.trim();
      payload.purchaseHistory = purchaseHistory.trim();
      payload.writingStyle = writingStyle.trim();
      payload.personaBio = personaBio.trim();
      payload.customGuideline = customGuideline.trim();
    }

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
        {/* SMM Mode Notice for Non-Admins */}
        {!isAdmin && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>SMM Mode & Task Role Controlled by Admin</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Once verified by Admin, this account will be assigned a specific SMM mode (Reviewer, Question, Support, or Navigation) and product lane based on SMM Guidelines.
            </p>
          </div>
        )}

        {/* Assign SMM Agent (Admin Only) */}
        {isAdmin && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Assign to SMM Agent:
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {assignedTo ? 'Specific SMM Assigned' : 'Defaults to You (Admin)'}
                </span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="">👤 Keep assigned to myself (Admin)</option>
                {smms.map((smm) => (
                  <option key={smm._id || smm.id} value={smm._id || smm.id}>
                    {smm.name || smm.email} ({smm.email}) - {smm.rewardPoints ?? 0} PTS
                  </option>
                ))}
              </select>
            </div>

            {/* Admin SMM Persona & Mode Configuration */}
            <div className="pt-2 border-t border-indigo-500/20 space-y-3">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SMM Persona & Mode Settings (Admin Only)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Mode Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    ID Mode / Role:
                  </label>
                  <select
                    value={accountMode}
                    onChange={(e) => setAccountMode(e.target.value as FacebookAccountMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="reviewer">🎖️ Reviewer (R)</option>
                    <option value="question">❓ Question (Q)</option>
                    <option value="support">💡 Support (S)</option>
                    <option value="navigation">🧭 Navigation (N)</option>
                    <option value="general">🌐 General</option>
                  </select>
                </div>

                {/* Product Lane */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Assigned Product:
                  </label>
                  <select
                    value={assignedProduct}
                    onChange={(e) => setAssignedProduct(e.target.value as FacebookAssignedProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="milkimom">🥛 Milkimom (M)</option>
                    <option value="milkready">🍼 MilkReady (MR)</option>
                    <option value="smoothflow">💧 SmoothFlow (SF)</option>
                    <option value="stableflow">🌊 StableFlow (ST)</option>
                    <option value="all_products">✨ All Products</option>
                    <option value="none">None / General</option>
                  </select>
                </div>

                {/* Workload Tier */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Workload Tier:
                  </label>
                  <select
                    value={workloadTier}
                    onChange={(e) => setWorkloadTier(e.target.value as FacebookWorkloadTier)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="active">🟢 Active (Daily Tasks)</option>
                    <option value="light">🟡 Light (Warmup)</option>
                    <option value="rest">⚪ Rest (Cooling)</option>
                  </select>
                </div>
              </div>

              {/* Persona Context: Child Age & Writing Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    বাচ্চার বয়স (Child's Age):
                  </label>
                  <input
                    type="text"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder="e.g. ৬ মাস / 3 months"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    লেখার ধরন (Writing Style):
                  </label>
                  <input
                    type="text"
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    placeholder="e.g. Bangla (বাঙালি মা টোন) / Banglish"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              {/* Purchase History (For Reviewer IDs) */}
              {accountMode === 'reviewer' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    ক্রয়ের তারিখ ও বিবরণ (Fixed Purchase History):
                  </label>
                  <input
                    type="text"
                    value={purchaseHistory}
                    onChange={(e) => setPurchaseHistory(e.target.value)}
                    placeholder="e.g. Purchased 2 bottles Milkimom on 12 Jan 2026"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
            <UserIcon className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
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

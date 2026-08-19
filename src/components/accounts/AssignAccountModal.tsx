import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FacebookAccount, User, FacebookAccountMode, FacebookAssignedProduct, FacebookWorkloadTier } from '../../types';
import api from '../../services/api';
import {
  UserCheck,
  Search,
  Users,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Milk,
} from 'lucide-react';

interface AssignAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: FacebookAccount | null;
  onAssignSuccess?: (updatedAccount: FacebookAccount) => void;
}

export const AssignAccountModal: React.FC<AssignAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onAssignSuccess,
}) => {
  const [smms, setSmms] = useState<User[]>([]);
  const [isLoadingSmms, setIsLoadingSmms] = useState(false);
  const [selectedSmmId, setSelectedSmmId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // SMM Mode & Persona configuration state
  const [accountMode, setAccountMode] = useState<FacebookAccountMode>('reviewer');
  const [assignedProduct, setAssignedProduct] = useState<FacebookAssignedProduct>('milkimom');
  const [workloadTier, setWorkloadTier] = useState<FacebookWorkloadTier>('active');
  const [childAge, setChildAge] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState('');
  const [writingStyle, setWritingStyle] = useState('Bangla (বাঙালি মা টোন)');
  const [customGuideline, setCustomGuideline] = useState('');

  // Determine current creator and current assignee
  const creator =
    typeof account?.createdBy === 'object' && account?.createdBy !== null
      ? (account.createdBy as User)
      : typeof account?.smmId === 'object' && account?.smmId !== null
      ? (account.smmId as User)
      : null;

  const currentAssignee =
    typeof account?.assignedTo === 'object' && account?.assignedTo !== null
      ? (account.assignedTo as User)
      : typeof account?.smmId === 'object' && account?.smmId !== null
      ? (account.smmId as User)
      : null;

  useEffect(() => {
    if (isOpen && account) {
      setError(null);
      setSuccessMessage(null);
      setSearchQuery('');

      // Preselect current assigned SMM
      const currentId =
        (typeof account.assignedTo === 'object' && account.assignedTo?._id) ||
        (typeof account.assignedTo === 'string' && account.assignedTo) ||
        (typeof account.smmId === 'object' && account.smmId?._id) ||
        (typeof account.smmId === 'string' && account.smmId) ||
        '';
      setSelectedSmmId(currentId);

      // Preload current Mode & Persona settings
      setAccountMode(account.accountMode || 'reviewer');
      setAssignedProduct(account.assignedProduct || 'milkimom');
      setWorkloadTier(account.workloadTier || 'active');
      setChildAge(account.childAge || '');
      setPurchaseHistory(account.purchaseHistory || '');
      setWritingStyle(account.writingStyle || 'Bangla (বাঙালি মা টোন)');
      setCustomGuideline(account.customGuideline || '');

      fetchSmms();
    }
  }, [isOpen, account]);

  const fetchSmms = async () => {
    setIsLoadingSmms(true);
    try {
      // Fetch active SMM list
      const res = await api.get('/auth/smms');
      if (res.data.success) {
        setSmms(res.data.smms || []);
      } else {
        // Fallback to smm-verifications
        const res2 = await api.get('/auth/smm-verifications?status=all');
        if (res2.data.success) {
          setSmms(res2.data.smms || []);
        }
      }
    } catch (err) {
      try {
        const res2 = await api.get('/auth/smm-verifications?status=all');
        if (res2.data.success) {
          setSmms(res2.data.smms || []);
        }
      } catch (e) {
        console.error('Failed to fetch SMM list:', e);
      }
    } finally {
      setIsLoadingSmms(false);
    }
  };

  const handleAssign = async () => {
    if (!account) return;
    if (!selectedSmmId) {
      setError('Please select an SMM agent to assign this Facebook account to.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.put(`/accounts/${account._id}/assign`, {
        assignedTo: selectedSmmId,
        accountMode,
        assignedProduct,
        workloadTier,
        childAge: childAge.trim(),
        purchaseHistory: purchaseHistory.trim(),
        writingStyle: writingStyle.trim(),
        customGuideline: customGuideline.trim(),
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        if (onAssignSuccess) {
          onAssignSuccess(res.data.account);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.data.message || 'Failed to assign account.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign Facebook account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return null;

  const filteredSmms = smms.filter((smm) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return smm.name?.toLowerCase().includes(q) || smm.email?.toLowerCase().includes(q);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign & Configure SMM ID"
      subtitle={`Delegate "${account.accountName}" to an SMM agent and configure its Mode & Persona.`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Account Details Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={
                account.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
              }
              alt={account.accountName}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-sm truncate">{account.accountName}</h4>
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5 truncate"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{account.profileUrl}</span>
              </a>
            </div>
            {account.profileUid && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                UID: {account.profileUid}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Created By:</span>
              <span className="text-slate-200 font-medium truncate block">
                {creator?.name || creator?.email || 'Admin / SMM'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Currently Assigned:</span>
              <span className="text-indigo-300 font-medium truncate block">
                {currentAssignee?.name || currentAssignee?.email || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        {/* SMM Mode & Persona Settings */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ID Mode, Product Lane & Persona Configuration</span>
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
                লেখার ধরন (Writing Tone):
              </label>
              <input
                type="text"
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                placeholder="e.g. Bangla (বাঙালি মা টোন)"
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {accountMode === 'reviewer' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                ক্রয়ের বিবরণ (Fixed Purchase History):
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

        {/* SMM Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Select SMM Agent to Assign:</span>
            <span className="text-slate-400 text-[11px] font-normal">{smms.length} Agents Available</span>
          </label>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent by name or email..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* SMM Agents List */}
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {isLoadingSmms ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading SMM agents...</div>
            ) : filteredSmms.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No active SMM agents found matching your search.
              </div>
            ) : (
              filteredSmms.map((smm) => {
                const smmId = smm._id || smm.id;
                const isSelected = selectedSmmId === smmId;
                const isCurrent = currentAssignee?._id === smmId;

                return (
                  <div
                    key={smmId}
                    onClick={() => setSelectedSmmId(smmId)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/30 shadow-glow-brand ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {smm.avatar ? (
                        <img
                          src={smm.avatar}
                          alt={smm.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-500/30 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {(smm.name || smm.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-white text-xs truncate">
                            {smm.name || 'SMM Agent'}
                          </h5>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{smm.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-amber-300 font-semibold hidden sm:inline-block">
                        {smm.rewardPoints ?? 0} PTS
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="glow"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleAssign}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Confirm Assignment & Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

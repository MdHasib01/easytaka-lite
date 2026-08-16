import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useAccountStore } from '../stores/useAccountStore';
import { VerificationCard } from '../components/tasks/VerificationCard';
import { InviteSmmModal } from '../components/admin/InviteSmmModal';
import { SmmVerificationModal } from '../components/admin/SmmVerificationModal';
import { PointSettingsModal } from '../components/admin/PointSettingsModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  ExternalLink,
  ZoomIn,
  MessageSquare,
  Sparkles,
  UserPlus,
  Users,
  CreditCard,
  Eye,
  AlertCircle,
  Mail,
  Phone,
  FileCheck,
  Settings,
  Globe,
  Lock,
  Hash,
  Share2,
  MessageCircle,
  Gift,
} from 'lucide-react';
import { TaskSubmission, Task, User, FacebookAccount } from '../types';

export const VerificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { submissions, mySubmissions, fetchSubmissions, fetchMySubmissions, verifySubmission, isLoading } =
    useTaskStore();
  const { allAccounts, fetchAllAccounts, verifyAccount } = useAccountStore();

  const isAdmin = user?.role === 'admin';

  // Admin Top-level view tab: 'smm_verifications' | 'fb_accounts' | 'task_proofs'
  const [adminActiveTab, setAdminActiveTab] = useState<'smm_verifications' | 'fb_accounts' | 'task_proofs'>(
    'smm_verifications'
  );

  // SMM Verifications list state
  const [smmList, setSmmList] = useState<User[]>([]);
  const [smmStatusFilter, setSmmStatusFilter] = useState<string>('pending_verification');
  const [isSmmLoading, setIsSmmLoading] = useState<boolean>(false);
  const [selectedSmmForReview, setSelectedSmmForReview] = useState<User | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Facebook Accounts filter state
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('pending');
  const [rejectingAccount, setRejectingAccount] = useState<FacebookAccount | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Task proofs filter state
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('pending');
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);

  const fetchSmmVerifications = async (status: string) => {
    setIsSmmLoading(true);
    try {
      const response = await api.get(`/auth/smm-verifications?status=${status}`);
      if (response.data.success) {
        setSmmList(response.data.smms);
      }
    } catch (err) {
      console.error('Failed to fetch SMM verifications:', err);
    } finally {
      setIsSmmLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (adminActiveTab === 'smm_verifications') {
        fetchSmmVerifications(smmStatusFilter);
      } else if (adminActiveTab === 'fb_accounts') {
        fetchAllAccounts(accountStatusFilter);
      } else {
        fetchSubmissions(taskStatusFilter);
      }
    } else {
      fetchMySubmissions();
    }
  }, [isAdmin, adminActiveTab, smmStatusFilter, accountStatusFilter, taskStatusFilter]);

  const pendingSmmCount = smmList.filter((s) => s.status === 'pending_verification').length;
  const pendingTaskCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingAccountCount = allAccounts.filter((a) => a.approvalStatus === 'pending').length;

  const handleApproveAccount = async (account: FacebookAccount) => {
    const res = await verifyAccount(account._id, 'approve');
    if (res.success) {
      if (res.milestoneAwarded) {
        try {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
      setActionSuccessMessage(res.message);
      setTimeout(() => setActionSuccessMessage(null), 5000);
      fetchAllAccounts(accountStatusFilter);
    }
  };

  const handleRejectAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAccount) return;
    if (!rejectReason.trim()) return;

    const res = await verifyAccount(rejectingAccount._id, 'reject', rejectReason.trim());
    if (res.success) {
      setActionSuccessMessage('Account rejected with feedback note.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
      setRejectingAccount(null);
      setRejectReason('');
      fetchAllAccounts(accountStatusFilter);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAdmin ? 'Verification & Approval Portal' : 'My Proof Submissions'}
            </h1>
            {isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin Control
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Verify SMM applicant National IDs, approve Facebook profile creations (+40 PTS & milestone bonus), and review task proofs.'
              : 'Track your submitted task proofs, approval status, admin feedback, and earned points.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setSettingsModalOpen(true)}
              leftIcon={<Settings className="w-4 h-4 text-indigo-400" />}
            >
              Point Settings
            </Button>

            <Button
              variant="glow"
              onClick={() => setInviteModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="shadow-glow-brand"
            >
              Invite SMM Agent
            </Button>
          </div>
        )}
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-glow-success">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Admin Top-Level Tab Switcher */}
      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setAdminActiveTab('smm_verifications')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminActiveTab === 'smm_verifications'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SMM Account & NID Verifications</span>
            {pendingSmmCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {pendingSmmCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminActiveTab('fb_accounts')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminActiveTab === 'fb_accounts'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Facebook Account Submissions</span>
            {pendingAccountCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {pendingAccountCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminActiveTab('task_proofs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminActiveTab === 'task_proofs'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Task Proof Submissions</span>
            {pendingTaskCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {pendingTaskCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* VIEW 1: SMM ACCOUNT & NATIONAL ID VERIFICATION LIST (ADMIN) */}
      {isAdmin && adminActiveTab === 'smm_verifications' && (
        <div className="space-y-4">
          {/* Sub-status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'pending_verification', label: 'Pending Verification' },
              { id: 'active', label: 'Approved & Active' },
              { id: 'invited', label: 'Invited (Awaiting Setup)' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Applicants' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSmmStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  smmStatusFilter === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SMM Applicants Grid */}
          {smmList.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No SMM Accounts in this Filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Invite new SMM candidates by entering their email address or switch filters above.
              </p>
              <Button
                variant="glow"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Invite SMM
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smmList.map((smm) => {
                const isPending = smm.status === 'pending_verification';
                const isApproved = smm.status === 'active';
                const isRejected = smm.status === 'rejected';

                return (
                  <div
                    key={smm._id || smm.id}
                    className={`glass-card rounded-2xl p-5 border space-y-4 transition-all hover:border-slate-700 ${
                      isPending
                        ? 'border-amber-500/40 bg-amber-950/10 shadow-glow-brand'
                        : isApproved
                        ? 'border-emerald-500/20 bg-slate-900/40'
                        : isRejected
                        ? 'border-rose-500/20 bg-slate-900/40'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {smm.avatar ? (
                          <img
                            src={smm.avatar}
                            alt={smm.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center">
                            {(smm.name || smm.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-base">
                              {smm.name || 'Invited SMM'}
                            </h4>
                            <Badge variant={smm.status as any}>
                              {smm.status === 'pending_verification'
                                ? 'PENDING'
                                : smm.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {smm.email}
                          </p>
                          <span className="text-[10px] text-amber-300 font-semibold block mt-0.5">
                            Daily Task Reward: {smm.dailyTaskCompletionReward ?? 50} pts
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isPending ? 'glow' : 'secondary'}
                        onClick={() => setSelectedSmmForReview(smm)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        {isPending ? 'Review & Verify' : 'View Details'}
                      </Button>
                    </div>

                    {/* National ID Thumbnails Preview */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          NID Front
                        </span>
                        {smm.nidFront ? (
                          <div
                            onClick={() => setSelectedLightboxImg(smm.nidFront!)}
                            className="relative group rounded-lg overflow-hidden border border-slate-700 h-20 bg-slate-950 cursor-pointer"
                          >
                            <img
                              src={smm.nidFront}
                              alt="NID Front"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <ZoomIn className="w-3 h-3" /> Zoom
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 rounded-lg border border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center text-[10px] text-slate-500">
                            Not uploaded
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          NID Back
                        </span>
                        {smm.nidBack ? (
                          <div
                            onClick={() => setSelectedLightboxImg(smm.nidBack!)}
                            className="relative group rounded-lg overflow-hidden border border-slate-700 h-20 bg-slate-950 cursor-pointer"
                          >
                            <img
                              src={smm.nidBack}
                              alt="NID Back"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <ZoomIn className="w-3 h-3" /> Zoom
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 rounded-lg border border-dashed border-slate-800 bg-slate-900/50 flex items-center justify-center text-[10px] text-slate-500">
                            Not uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>
                        {smm.phone ? `Phone: ${smm.phone}` : `Role: SMM Agent`}
                      </span>
                      <span>
                        {smm.verificationSubmittedAt
                          ? `Submitted: ${new Date(smm.verificationSubmittedAt).toLocaleDateString()}`
                          : `Invited: ${new Date(smm.createdAt || Date.now()).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FACEBOOK ACCOUNT SUBMISSIONS (ADMIN) */}
      {isAdmin && adminActiveTab === 'fb_accounts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingAccountCount },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Accounts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAccountStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  accountStatusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {allAccounts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Facebook Accounts in this Filter</h3>
              <p className="text-xs text-slate-400">
                Switch filters above to inspect past approved or rejected Facebook accounts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAccounts.map((account) => {
                const smmOwner = account.smmId as User;
                const isPending = account.approvalStatus === 'pending';
                const isApproved = account.approvalStatus === 'approved';
                const isRejected = account.approvalStatus === 'rejected';

                return (
                  <div
                    key={account._id}
                    className={`glass-card rounded-2xl p-5 border space-y-4 transition-all ${
                      isPending
                        ? 'border-amber-500/40 bg-amber-950/10 shadow-glow-brand'
                        : isApproved
                        ? 'border-emerald-500/20 bg-slate-900/40'
                        : isRejected
                        ? 'border-rose-500/20 bg-slate-900/40'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header: Account Name & SMM Owner Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            account.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
                          }
                          alt={account.accountName}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-base leading-snug">{account.accountName}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>SMM: <strong className="text-slate-200">{smmOwner?.name || 'SMM'}</strong></span>
                            <span>•</span>
                            <span>{smmOwner?.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            PENDING APPROVAL
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            APPROVED (+{account.pointsAwarded || 40} PTS)
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                            REJECTED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Account Details & Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Profile URL:</span>
                        <a
                          href={account.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-[130px]"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{account.profileUrl}</span>
                        </a>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">UID:</span>
                        <span className="font-mono text-slate-200">{account.profileUid || 'N/A'}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Password/Hint:</span>
                        <span className="font-mono text-slate-200">{account.password || account.passwordHint || 'N/A'}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">Target Region:</span>
                        <span className="text-slate-200">{account.targetRegion || 'Global'}</span>
                      </div>
                    </div>

                    {/* Admin Note if present */}
                    {account.adminNote && (
                      <div
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                          isRejected
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px]">Note:</span>
                          <p className="text-[11px]">{account.adminNote}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Controls for Admin */}
                    {isPending && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setRejectingAccount(account);
                            setRejectReason('');
                          }}
                          className="text-xs"
                        >
                          Reject
                        </Button>

                        <Button
                          size="sm"
                          variant="glow"
                          onClick={() => handleApproveAccount(account)}
                          className="text-xs shadow-glow-brand"
                          leftIcon={<Coins className="w-3.5 h-3.5 text-amber-300" />}
                        >
                          Approve & Reward +40 PTS
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TASK PROOF VERIFICATIONS (ADMIN) */}
      {isAdmin && adminActiveTab === 'task_proofs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingTaskCount },
              { id: 'approved', label: 'Approved & Rewarded' },
              { id: 'rejected', label: 'Rejected / Revision' },
              { id: 'all', label: 'All Submissions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTaskStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  taskStatusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Task Submissions in this Filter</h3>
                <p className="text-xs text-slate-400">
                  Switch filters above to inspect past approved or rejected tasks.
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <VerificationCard key={sub._id} submission={sub} onVerify={verifySubmission} />
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: SMM SUBMISSION HISTORY (SMM USER) */}
      {!isAdmin && (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Task Submissions Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Go to the Tasks Hub, pick a Facebook assignment, and submit your proof!
              </p>
            </div>
          ) : (
            mySubmissions.map((sub) => {
              const task = sub.taskId as Task;
              const isApproved = sub.status === 'approved';
              const isRejected = sub.status === 'rejected';

              return (
                <div
                  key={sub._id}
                  className={`glass-card rounded-2xl p-5 border space-y-3 ${
                    isApproved
                      ? 'border-emerald-500/30 bg-emerald-950/5'
                      : isRejected
                      ? 'border-rose-500/30 bg-rose-950/5'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {task?.title || 'Facebook Task'}
                        </h4>
                        <Badge variant={sub.status as any}>{sub.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted: {new Date(sub.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {isApproved ? (
                        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-400" />
                          <span>+{sub.pointsAwarded || task?.rewardPoints} Pts Credited</span>
                        </div>
                      ) : (
                        <div className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{task?.rewardPoints || 50} Pts Reward</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Links & Screenshot Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-2">
                      {sub.profileUrl && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-400 font-semibold">Proof Link:</span>
                          <a
                            href={sub.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{sub.profileUrl}</span>
                          </a>
                        </div>
                      )}

                      {sub.smmNotes && (
                        <div className="text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 font-semibold block mb-0.5">My Notes:</span>
                          <p>{sub.smmNotes}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      {sub.screenshotUrl ? (
                        <div
                          onClick={() => setSelectedLightboxImg(sub.screenshotUrl)}
                          className="relative group rounded-xl overflow-hidden border border-slate-700 h-28 cursor-pointer"
                        >
                          <img
                            src={sub.screenshotUrl}
                            alt="Screenshot Proof"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <ZoomIn className="w-4 h-4" /> Zoom Screenshot
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
                          No screenshot attached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Feedback Box */}
                  {sub.adminNote && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        isRejected
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          {isRejected ? 'Cancellation Feedback / Revision Note:' : 'Admin Note:'}
                        </span>
                        <p className="mt-0.5">{sub.adminNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Admin Invite SMM Modal */}
      <InviteSmmModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => fetchSmmVerifications(smmStatusFilter)}
      />

      {/* Admin Point Settings Center Modal */}
      <PointSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Admin SMM Review & Document Inspection Modal */}
      <SmmVerificationModal
        isOpen={!!selectedSmmForReview}
        onClose={() => setSelectedSmmForReview(null)}
        smm={selectedSmmForReview}
        onVerificationComplete={() => fetchSmmVerifications(smmStatusFilter)}
      />

      {/* Admin Reject Account Note Modal */}
      <Modal
        isOpen={!!rejectingAccount}
        onClose={() => setRejectingAccount(null)}
        title="Reject Facebook Account"
        subtitle={`Provide feedback for ${rejectingAccount?.accountName} so the SMM agent knows why it was rejected.`}
        size="md"
      >
        <form onSubmit={handleRejectAccountSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Rejection Reason & Required Fixes:
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Profile URL is invalid, 2FA secret is missing, or profile lacks avatar."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRejectingAccount(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox for Zooming Images */}
      <ImageLightbox
        isOpen={!!selectedLightboxImg}
        onClose={() => setSelectedLightboxImg(null)}
        imageUrl={selectedLightboxImg || ''}
      />
    </div>
  );
};

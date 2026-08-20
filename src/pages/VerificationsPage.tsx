import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useDailyStore } from '../stores/useDailyStore';
import { VerificationCard } from '../components/tasks/VerificationCard';
import { DailySubmissionReviewCard } from '../components/daily/DailySubmissionReviewCard';
import { InviteSmmModal } from '../components/admin/InviteSmmModal';
import { SmmVerificationModal } from '../components/admin/SmmVerificationModal';
import { AssignAccountModal } from '../components/accounts/AssignAccountModal';
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
  UserCheck,
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
  Award,
  HelpCircle,
  LifeBuoy,
  Compass,
  BookOpen,
  CalendarCheck,
  Star,
} from 'lucide-react';
import {
  TaskSubmission,
  Task,
  User,
  FacebookAccount,
  FacebookAccountMode,
  FacebookAssignedProduct,
  FacebookWorkloadTier,
} from '../types';

export const VerificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { submissions, mySubmissions, fetchSubmissions, fetchMySubmissions, verifySubmission, isLoading } =
    useTaskStore();
  const { allAccounts, fetchAllAccounts, verifyAccount } = useAccountStore();
  const {
    dailySubmissions,
    adminScoreRules,
    adminRatingBreakpoints,
    adminDefaultDailyReward,
    isSubmissionsLoading,
    fetchDailySubmissions,
    reviewDailySubmission,
  } = useDailyStore();

  const isAdmin = user?.role === 'admin';

  // Admin Top-level view tab: 'smm_verifications' | 'fb_accounts' | 'task_proofs' | 'daily_routine_reviews'
  const [adminActiveTab, setAdminActiveTab] = useState<
    'smm_verifications' | 'fb_accounts' | 'task_proofs' | 'daily_routine_reviews'
  >('smm_verifications');

  // SMM Verifications list state
  const [smmList, setSmmList] = useState<User[]>([]);
  const [smmStatusFilter, setSmmStatusFilter] = useState<string>('pending_verification');
  const [isSmmLoading, setIsSmmLoading] = useState<boolean>(false);
  const [selectedSmmForReview, setSelectedSmmForReview] = useState<User | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);

  // Facebook Accounts filter state
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('pending');
  const [rejectingAccount, setRejectingAccount] = useState<FacebookAccount | null>(null);
  const [assigningAccount, setAssigningAccount] = useState<FacebookAccount | null>(null);
  const [approvingAccount, setApprovingAccount] = useState<FacebookAccount | null>(null);
  const [approveMode, setApproveMode] = useState<FacebookAccountMode>('reviewer');
  const [approveProduct, setApproveProduct] = useState<FacebookAssignedProduct>('milkimom');
  const [approveWorkload, setApproveWorkload] = useState<FacebookWorkloadTier>('active');
  const [approveChildAge, setApproveChildAge] = useState<string>('');
  const [approvePurchaseHistory, setApprovePurchaseHistory] = useState<string>('');
  const [approveWritingStyle, setApproveWritingStyle] = useState<string>('Bangla (বাঙালি মা টোন)');
  const [approveCustomPoints, setApproveCustomPoints] = useState<number>(40);
  const [approveAdminNote, setApproveAdminNote] = useState<string>('Approved by Admin');
  const [isApprovingLoading, setIsApprovingLoading] = useState<boolean>(false);

  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Task proofs filter state
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('pending');
  // Daily routine reviews filter state
  const [dailyStatusFilter, setDailyStatusFilter] = useState<string>('pending');
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
      fetchDailySubmissions();
      if (adminActiveTab === 'smm_verifications') {
        fetchSmmVerifications(smmStatusFilter);
      } else if (adminActiveTab === 'fb_accounts') {
        fetchAllAccounts(accountStatusFilter);
      } else if (adminActiveTab === 'task_proofs') {
        fetchSubmissions(taskStatusFilter);
      } else if (adminActiveTab === 'daily_routine_reviews') {
        fetchDailySubmissions({ status: dailyStatusFilter });
      }
    } else {
      fetchMySubmissions();
    }
  }, [isAdmin, adminActiveTab, smmStatusFilter, accountStatusFilter, taskStatusFilter, dailyStatusFilter]);

  const pendingSmmCount = smmList.filter((s) => s.status === 'pending_verification').length;
  const pendingTaskCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingAccountCount = allAccounts.filter((a) => a.approvalStatus === 'pending').length;
  const pendingDailyCount = dailySubmissions.filter((s) => s.status === 'pending').length;

  const handleOpenApproveModal = (account: FacebookAccount) => {
    setApprovingAccount(account);
    setApproveMode(account.accountMode || 'reviewer');
    setApproveProduct(account.assignedProduct || 'milkimom');
    setApproveWorkload(account.workloadTier || 'active');
    setApproveChildAge(account.childAge || '');
    setApprovePurchaseHistory(account.purchaseHistory || '');
    setApproveWritingStyle(account.writingStyle || 'Bangla (বাঙালি মা টোন)');
    setApproveCustomPoints(40);
    setApproveAdminNote('Approved by Admin');
  };

  const handleApproveAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingAccount) return;

    setIsApprovingLoading(true);
    const res = await verifyAccount(
      approvingAccount._id,
      'approve',
      approveAdminNote || 'Approved by Admin',
      approveCustomPoints,
      {
        accountMode: approveMode,
        assignedProduct: approveProduct,
        workloadTier: approveWorkload,
        childAge: approveChildAge.trim(),
        purchaseHistory: approvePurchaseHistory.trim(),
        writingStyle: approveWritingStyle.trim(),
      }
    );
    setIsApprovingLoading(false);

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
      setApprovingAccount(null);
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

          <button
            onClick={() => setAdminActiveTab('daily_routine_reviews')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              adminActiveTab === 'daily_routine_reviews'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Daily Routine Reviews</span>
            {pendingDailyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {pendingDailyCount}
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
                const creator =
                  typeof account.createdBy === 'object' && account.createdBy !== null
                    ? (account.createdBy as User)
                    : typeof account.smmId === 'object' && account.smmId !== null
                    ? (account.smmId as User)
                    : null;

                const assignee =
                  typeof account.assignedTo === 'object' && account.assignedTo !== null
                    ? (account.assignedTo as User)
                    : typeof account.smmId === 'object' && account.smmId !== null
                    ? (account.smmId as User)
                    : null;

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
                    {/* Top Creator & Submitter Bar: Avatar, Name & Submitted Date */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        {creator?.avatar ? (
                          <img
                            src={creator.avatar}
                            alt={creator.name || 'Creator'}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-indigo-500/30 flex-shrink-0">
                            {(creator?.name || creator?.email || 'S').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">
                              {creator?.name || 'SMM Agent'}
                            </span>
                            {creator?.email && (
                              <span className="text-xs text-slate-400 truncate">({creator.email})</span>
                            )}
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold uppercase">
                              Created By
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <span>
                              Submitted:{' '}
                              <strong className="text-slate-300 font-medium">
                                {account.createdAt
                                  ? new Date(account.createdAt).toLocaleString(undefined, {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    })
                                  : 'Recently'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 animate-spin" /> PENDING APPROVAL
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Coins className="w-3 h-3 text-emerald-400" /> +{account.pointsAwarded || 40} PTS
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-400" /> REJECTED
                          </span>
                        )}
                        <Badge variant={account.status as any}>{account.status.toUpperCase()}</Badge>
                      </div>
                    </div>

                    {/* Assigned SMM Banner */}
                    <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {assignee?.avatar ? (
                          <img
                            src={assignee.avatar}
                            alt={assignee.name || 'Assignee'}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/40 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                            {(assignee?.name || assignee?.email || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block font-semibold">Currently Assigned To:</span>
                          <span className="text-xs font-bold text-indigo-300 truncate block">
                            {assignee?.name || assignee?.email || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAssigningAccount(account)}
                        className="text-xs flex-shrink-0"
                        leftIcon={<UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
                      >
                        {assignee?._id ? 'Reassign SMM' : 'Assign to SMM'}
                      </Button>
                    </div>

                    {/* Facebook Account Profile Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            account.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
                          }
                          alt={account.accountName}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/30 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-base leading-snug truncate">
                            {account.accountName}
                          </h4>
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
                      </div>

                      {account.profileUid && (
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <span className="text-[10px] text-slate-400 block font-semibold">UID</span>
                          <span className="font-mono text-cyan-300 text-xs">{account.profileUid}</span>
                        </div>
                      )}
                    </div>

                    {/* Account Details & Credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Hash className="w-3.5 h-3.5 text-cyan-400" />
                          <span>UID:</span>
                        </div>
                        <span className="font-mono text-slate-200 truncate max-w-[130px]">
                          {account.profileUid || 'N/A'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Password/Hint:</span>
                        </div>
                        <span className="font-mono text-slate-200 truncate max-w-[130px]">
                          {account.password || account.passwordHint || 'N/A'}
                        </span>
                      </div>

                      {account.emailOrPhone && (
                        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Email/Phone:</span>
                          </div>
                          <span className="text-slate-200 truncate max-w-[130px]">
                            {account.emailOrPhone}
                          </span>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Target Region:</span>
                        </div>
                        <span className="text-slate-200 truncate max-w-[130px]">
                          {account.targetRegion || 'Global'}
                        </span>
                      </div>
                    </div>

                    {/* Daily Routine Targets Summary */}
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Routines:
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-indigo-400" />
                        {account.routineTargets?.feedComments || 5} Comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-cyan-400" />
                        {account.routineTargets?.communityReplies || 3} Replies
                      </span>
                      {account.routineTargets?.storyPost && (
                        <span className="text-emerald-400 font-medium">✓ Story</span>
                      )}
                    </div>

                    {/* Admin Note / Rejection Reason if present */}
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
                          <span className="font-bold block text-[11px]">
                            {isRejected ? 'Rejection Reason / Note:' : 'Admin Note:'}
                          </span>
                          <p className="text-[11px] mt-0.5">{account.adminNote}</p>
                        </div>
                      </div>
                    )}

                    {isApproved && account.approvedAt && (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span>
                          Approved by:{' '}
                          <strong className="text-slate-300">
                            {(account.approvedBy as User)?.name || 'Admin'}
                          </strong>
                        </span>
                        <span>{new Date(account.approvedAt).toLocaleString()}</span>
                      </div>
                    )}

                    {/* SMM Mode Badges if approved or pre-configured */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {account.accountMode && account.accountMode !== 'general' ? (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                          Mode: {account.accountMode}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                          Mode: Unassigned (Set on Approval)
                        </span>
                      )}

                      {account.assignedProduct && account.assignedProduct !== 'none' && (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                          Product: {account.assignedProduct}
                        </span>
                      )}

                      {account.childAge && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          👶 Baby: {account.childAge}
                        </span>
                      )}
                    </div>

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
                          onClick={() => handleOpenApproveModal(account)}
                          className="text-xs shadow-glow-brand"
                          leftIcon={<Coins className="w-3.5 h-3.5 text-amber-300" />}
                        >
                          Approve & Configure SMM Mode
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

      {/* VIEW 3.5: DAILY ROUTINE REVIEWS (ADMIN) */}
      {isAdmin && adminActiveTab === 'daily_routine_reviews' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingDailyCount },
              { id: 'approved', label: 'Approved & Rewarded' },
              { id: 'rejected', label: 'Revision Requested' },
              { id: 'all', label: 'All Daily Submissions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDailyStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  dailyStatusFilter === tab.id
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
            {isSubmissionsLoading ? (
              <div className="glass-card rounded-2xl p-12 text-center text-xs text-slate-400">
                Loading daily routine submissions...
              </div>
            ) : dailySubmissions.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Daily Routine Submissions in this Filter</h3>
                <p className="text-xs text-slate-400">
                  When SMMs complete their daily routine checklists and submit their work, submissions will appear here for grading.
                </p>
              </div>
            ) : (
              dailySubmissions.map((sub) => (
                <DailySubmissionReviewCard
                  key={sub._id}
                  submission={sub}
                  scoreRules={adminScoreRules}
                  ratingBreakpoints={adminRatingBreakpoints}
                  defaultDailyReward={adminDefaultDailyReward}
                  onReview={reviewDailySubmission}
                  onZoomImage={(url) => setSelectedLightboxImg(url)}
                />
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
                        <div className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>⭐ {sub.rating || 5}/5 Rated</span>
                        </div>
                      ) : isRejected ? (
                        <div className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Revision Needed</span>
                        </div>
                      ) : (
                        <div className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>Awaiting Review</span>
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

      {/* Admin SMM Review & Document Inspection Modal */}
      <SmmVerificationModal
        isOpen={!!selectedSmmForReview}
        onClose={() => setSelectedSmmForReview(null)}
        smm={selectedSmmForReview}
        onVerificationComplete={() => fetchSmmVerifications(smmStatusFilter)}
      />

      {/* Admin Assign Facebook Account Modal */}
      <AssignAccountModal
        isOpen={!!assigningAccount}
        onClose={() => setAssigningAccount(null)}
        account={assigningAccount}
        onAssignSuccess={() => {
          fetchAllAccounts(accountStatusFilter);
        }}
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

      {/* Admin Approve Facebook Account & Configure SMM Mode Modal */}
      <Modal
        isOpen={!!approvingAccount}
        onClose={() => setApprovingAccount(null)}
        title="Approve Facebook Account & Assign SMM Mode"
        subtitle={`Configure the SMM staff role, product focus, and persona characteristics for "${approvingAccount?.accountName}".`}
        maxWidth="lg"
      >
        {approvingAccount && (
          <form onSubmit={handleApproveAccountSubmit} className="space-y-4">
            {/* Account Credentials Brief */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">{approvingAccount.accountName}</span>
                <span className="text-[11px] text-blue-400 truncate block max-w-[280px]">
                  {approvingAccount.profileUrl}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                +{approveCustomPoints} PTS Reward
              </span>
            </div>

            {/* SMM Mode & Role Selection */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> SMM Persona & Mode Configuration:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    ID Mode / Role:
                  </label>
                  <select
                    value={approveMode}
                    onChange={(e) => setApproveMode(e.target.value as FacebookAccountMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="reviewer">🎖️ Reviewer (R)</option>
                    <option value="question">❓ Question (Q)</option>
                    <option value="support">💡 Support (S)</option>
                    <option value="navigation">🧭 Navigation (N)</option>
                    <option value="general">🌐 General</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Assigned Product:
                  </label>
                  <select
                    value={approveProduct}
                    onChange={(e) => setApproveProduct(e.target.value as FacebookAssignedProduct)}
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

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Workload Tier:
                  </label>
                  <select
                    value={approveWorkload}
                    onChange={(e) => setApproveWorkload(e.target.value as FacebookWorkloadTier)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="active">🟢 Active (12 IDs)</option>
                    <option value="light">🟡 Light (4 IDs)</option>
                    <option value="rest">⚪ Rest (4 IDs)</option>
                  </select>
                </div>
              </div>

              {/* Persona Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    বাচ্চার বয়স (Child's Age):
                  </label>
                  <input
                    type="text"
                    value={approveChildAge}
                    onChange={(e) => setApproveChildAge(e.target.value)}
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
                    value={approveWritingStyle}
                    onChange={(e) => setApproveWritingStyle(e.target.value)}
                    placeholder="e.g. Bangla (বাঙালি মা টোন) / Banglish"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              {/* Purchase History for Reviewer ID */}
              {approveMode === 'reviewer' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    ক্রয়ের তারিখ ও ইতিহাস (Fixed Purchase History):
                  </label>
                  <input
                    type="text"
                    value={approvePurchaseHistory}
                    onChange={(e) => setApprovePurchaseHistory(e.target.value)}
                    placeholder="e.g. Purchased 2 bottles Milkimom on 12 Jan 2026"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Points and Admin Note */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Points to Reward:
                </label>
                <input
                  type="number"
                  min="0"
                  value={approveCustomPoints}
                  onChange={(e) => setApproveCustomPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Approval / Admin Note:
                </label>
                <input
                  type="text"
                  value={approveAdminNote}
                  onChange={(e) => setApproveAdminNote(e.target.value)}
                  placeholder="Approved by Admin"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setApprovingAccount(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glow"
                size="sm"
                isLoading={isApprovingLoading}
                leftIcon={<Coins className="w-3.5 h-3.5 text-amber-300" />}
              >
                Approve & Credit +{approveCustomPoints} PTS
              </Button>
            </div>
          </form>
        )}
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

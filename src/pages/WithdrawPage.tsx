import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';
import { useWithdrawalStore } from '../stores/useWithdrawalStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Coins,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Search,
  Sparkles,
  RefreshCw,
  Phone,
  Hash,
  FileText,
  User as UserIcon,
  Check,
  Send,
  Lock,
  Copy,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { Withdrawal, AccountType } from '../types';

export const WithdrawPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    eligibility,
    myWithdrawals,
    allWithdrawals,
    withdrawalStats,
    isLoading,
    isSubmitting,
    fetchEligibility,
    fetchMyWithdrawals,
    createWithdrawal,
    fetchAllWithdrawals,
    updateWithdrawalStatus,
    fetchWithdrawalStats,
  } = useWithdrawalStore();

  const isAdmin = user?.role === 'admin';

  // SMM Form States
  const [bkashNumber, setBkashNumber] = useState(user?.phone || '');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [pointsInput, setPointsInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Admin View States
  const [adminTab, setAdminTab] = useState<'pending' | 'paid' | 'rejected' | 'all'>('pending');
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedWithdrawalForPay, setSelectedWithdrawalForPay] = useState<Withdrawal | null>(null);
  const [selectedWithdrawalForReject, setSelectedWithdrawalForReject] = useState<Withdrawal | null>(null);
  const [trxIdInput, setTrxIdInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isProcessingAdminAction, setIsProcessingAdminAction] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const maxRedeemLimit = 1000;

  useEffect(() => {
    fetchWithdrawalStats();
    if (isAdmin) {
      fetchAllWithdrawals(adminTab, adminSearch);
    } else {
      fetchEligibility();
      fetchMyWithdrawals();
    }
  }, [isAdmin, adminTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      fetchAllWithdrawals(adminTab, adminSearch);
    }
  };

  const handleCopyPhone = (number: string, id: string) => {
    navigator.clipboard.writeText(number);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  // Quick point selector handlers (Max 1000 PTS)
  const handleQuickPercent = (percent: number) => {
    if (!eligibility?.isEligible) return;
    const total = user?.rewardPoints || 0;
    const calculated = Math.min(maxRedeemLimit, Math.floor((total * percent) / 100));
    setPointsInput(calculated > 0 ? String(calculated) : '');
    setFormError(null);
  };

  const handleQuickAmount = (amount: number) => {
    if (!eligibility?.isEligible) return;
    const bounded = Math.min(maxRedeemLimit, amount);
    setPointsInput(String(bounded));
    setFormError(null);
  };

  // Handle SMM Submit Withdrawal
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!eligibility?.isEligible) {
      setFormError(eligibility?.ineligibleReason || 'Point redemption is currently unavailable.');
      return;
    }

    const pointsNum = parseInt(pointsInput, 10);
    const minPoints = eligibility?.minWithdrawalPoints || 50;

    if (!pointsNum || isNaN(pointsNum) || pointsNum <= 0) {
      setFormError('Please enter a valid points amount to redeem.');
      return;
    }

    if (pointsNum < minPoints) {
      setFormError(`Minimum withdrawal amount is ${minPoints} Points (৳${minPoints} BDT).`);
      return;
    }

    if (pointsNum > maxRedeemLimit) {
      setFormError(`Maximum withdrawal limit per request is ${maxRedeemLimit} Points (৳${maxRedeemLimit} BDT).`);
      return;
    }

    if (pointsNum > (user?.rewardPoints || 0)) {
      setFormError(`You have only ${user?.rewardPoints || 0} points available in your balance.`);
      return;
    }

    const cleanPhone = bkashNumber.trim().replace(/[\s\-()]/g, '');
    const normalizedPhone = cleanPhone.startsWith('+88')
      ? cleanPhone.slice(3)
      : cleanPhone.startsWith('88')
      ? cleanPhone.slice(2)
      : cleanPhone;

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      setFormError('Please enter a valid 11-digit Bangladeshi mobile number (013, 014, 015, 016, 017, 018, 019).');
      return;
    }

    const res = await createWithdrawal({
      points: pointsNum,
      accountNumber: normalizedPhone,
      accountType,
      paymentMethod: 'bkash',
    });

    if (res.success) {
      setFormSuccess(res.message);
      setPointsInput('');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => setFormSuccess(null), 6000);
    } else {
      setFormError(res.message);
    }
  };

  // Handle Admin Approve & Pay (Mark as Done)
  const handleAdminPay = async () => {
    if (!selectedWithdrawalForPay) return;
    setIsProcessingAdminAction(true);

    const res = await updateWithdrawalStatus(
      selectedWithdrawalForPay._id,
      'pay',
      trxIdInput || 'BKASH-MANUAL',
      adminNoteInput || 'Paid via bKash manually'
    );

    setIsProcessingAdminAction(false);
    if (res.success) {
      setSelectedWithdrawalForPay(null);
      setTrxIdInput('');
      setAdminNoteInput('');
      fetchAllWithdrawals(adminTab, adminSearch);
    }
  };

  // Handle Admin Reject & Refund
  const handleAdminReject = async () => {
    if (!selectedWithdrawalForReject) return;
    setIsProcessingAdminAction(true);

    const res = await updateWithdrawalStatus(
      selectedWithdrawalForReject._id,
      'reject',
      '',
      adminNoteInput || 'Withdrawal rejected by administrator'
    );

    setIsProcessingAdminAction(false);
    if (res.success) {
      setSelectedWithdrawalForReject(null);
      setAdminNoteInput('');
      fetchAllWithdrawals(adminTab, adminSearch);
    }
  };

  const pointsToWithdraw = parseInt(pointsInput, 10) || 0;
  const equivalentBDT = pointsToWithdraw; // 1 Point = 1 BDT
  const remainingPoints = Math.max(0, (user?.rewardPoints || 0) - pointsToWithdraw);

  // 7-day cycle calculations
  const daysInCycle = eligibility?.daysInCurrentCycle ?? 0;
  const cycleDays = eligibility?.cycleDays ?? 7;
  const cyclePercent = Math.min(100, Math.round((daysInCycle / cycleDays) * 100));

  const isFormDisabled = !eligibility?.isEligible;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Page Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D12053] to-pink-500 p-0.5 shadow-glow-brand flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isAdmin ? t('withdraw.adminManagement') : t('withdraw.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {isAdmin ? t('withdraw.adminSubtitle') : t('withdraw.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* 1 Point = 1 Taka Conversion & Limits Pill */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-indigo-500/10 border border-pink-500/20 rounded-2xl px-4 py-2 text-xs font-bold text-slate-200 shadow-md">
          <span className="flex items-center gap-1 text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            1 Point
          </span>
          <span className="text-slate-400">=</span>
          <span className="flex items-center gap-1 text-pink-400 font-extrabold text-sm">
            ৳ 1 BDT
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-md ml-1">
            Max 1,000 PTS
          </span>
        </div>
      </div>

      {/* Top 4 Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Available Balance */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('withdraw.currentBalance')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
              {user?.rewardPoints ?? 0} <span className="text-xs font-medium text-amber-400/80">PTS</span>
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              ≈ ৳ {user?.rewardPoints ?? 0} BDT
            </div>
          </div>
        </div>

        {/* Card 2: 7-Day Cycle Status */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('withdraw.sevenDayCycle')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300">
              {eligibility?.isEligible ? (
                <span className="text-emerald-400 text-lg sm:text-xl font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Eligible!
                </span>
              ) : (
                <span>
                  {eligibility?.daysUntilNextCycle ?? 7} <span className="text-xs font-medium text-indigo-300/80">Days Left</span>
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              Cycle #{eligibility?.currentCycleNumber ?? 1} (Day {eligibility?.daysInCurrentCycle ?? 0} of {eligibility?.cycleDays ?? 7})
            </div>
          </div>
        </div>

        {/* Card 3: Total Paid / Redeemed BDT */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isAdmin ? 'Total Paid Out' : t('withdraw.totalRedeemed')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
              ৳ {withdrawalStats?.totalPaidBDT ?? 0}{' '}
              <span className="text-xs font-medium text-emerald-400/80">BDT</span>
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {isAdmin
                ? `${withdrawalStats?.totalPaidCount ?? 0} Completed Payouts`
                : `${withdrawalStats?.myPaidCount ?? 0} Payouts Received`}
            </div>
          </div>
        </div>

        {/* Card 4: Pending Redemptions */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isAdmin ? 'Pending Approvals' : t('withdraw.pendingRedemption')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-pink-400 tabular-nums">
              ৳ {withdrawalStats?.totalPendingBDT ?? 0}{' '}
              <span className="text-xs font-medium text-pink-400/80">BDT</span>
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">
              {isAdmin
                ? `${withdrawalStats?.totalPendingCount ?? 0} Requests in Queue`
                : `${withdrawalStats?.myPendingCount ?? 0} Pending Verification`}
            </div>
          </div>
        </div>
      </div>

      {/* SMM VIEW: 7-Day Cycle Progress & bKash Redeem Cashout Form */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 7-Day Cycle Status & Info Banner */}
          <div className="lg:col-span-5 space-y-5">
            {/* 7-Day Cycle Interactive Card */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {t('withdraw.sevenDayCycle')}
                    </h3>
                    <p className="text-[11px] text-slate-400">7-Day Join & Work Activity Cycle</p>
                  </div>
                </div>

                <Badge
                  variant={eligibility?.isEligible ? 'success' : 'warning'}
                  className="font-bold text-xs px-2.5 py-1"
                >
                  {eligibility?.isEligible ? 'Eligible Now' : `${eligibility?.daysUntilNextCycle ?? 7}d to unlock`}
                </Badge>
              </div>

              {/* Visual 7-Step Day Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Cycle Progress</span>
                  <span className="font-bold text-slate-200">
                    Day {daysInCycle} of {cycleDays} ({cyclePercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      eligibility?.isEligible
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-brand'
                        : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                    }`}
                    style={{ width: `${cyclePercent || 14}%` }}
                  />
                </div>

                {/* Day Dots */}
                <div className="grid grid-cols-7 gap-1 pt-1 text-center">
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const isPassed = dayNum <= daysInCycle;
                    const isCurrent = dayNum === daysInCycle;
                    return (
                      <div
                        key={dayNum}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                          isPassed
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-900/50 text-slate-500 border-slate-800/60'
                        } ${isCurrent ? 'ring-2 ring-indigo-400 font-extrabold text-white' : ''}`}
                      >
                        D{dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Explanation Box */}
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                  eligibility?.isEligible
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {eligibility?.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {eligibility?.isEligible
                        ? '🎉 Redemption Window is Open!'
                        : '⏳ 7-Day Cycle in Progress'}
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {eligibility?.isEligible
                        ? 'You have satisfied the 7-day join and work cycle requirement. You can submit a cashout request to your bKash account below (Max 1,000 PTS).'
                        : eligibility?.ineligibleReason ||
                          'Points can be redeemed every 7 days from your join date and work activity.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Join & Work Info Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {t('withdraw.joinedOn')}:
                  </span>
                  <span className="font-bold text-slate-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} (
                    {eligibility?.daysSinceJoin ?? 0} days ago)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved Tasks:
                  </span>
                  <span className="font-bold text-emerald-400">
                    {eligibility?.workStats.approvedTasksCount ?? 0} Completed
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Verified Accounts:
                  </span>
                  <span className="font-bold text-blue-400">
                    {eligibility?.workStats.approvedAccountsCount ?? 0} FB Profiles
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: bKash Cashout Form (Disabled when ineligible) */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Card Header with bKash Visual Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D12053] to-pink-600 p-0.5 shadow-glow-brand flex items-center justify-center">
                    <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center font-black text-pink-400 text-sm">
                      bKash
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {t('withdraw.bkashRedeemForm')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Direct cashout to your Bangladeshi bKash account (Max 1,000 PTS / ৳1,000 BDT)
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" /> 1:1 Instant Payout
                </div>
              </div>

              {/* Disabled Lock Banner if Ineligible */}
              {isFormDisabled && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
                  <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">bKash Cashout Disabled</span>
                    <span className="text-slate-300 text-xs mt-0.5 block">
                      {eligibility?.ineligibleReason ||
                        `Cashout unlocks every 7 days from your join date. ${eligibility?.daysUntilNextCycle ?? 7} days remaining in current cycle.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Success/Error Alert Messages */}
              {formSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                {/* 1. bKash Account Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-pink-400" /> {t('withdraw.bkashNumber')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isFormDisabled}
                      value={bkashNumber}
                      onChange={(e) => {
                        setBkashNumber(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-4 pr-16 py-3 rounded-2xl glass-input text-sm font-bold text-white placeholder-slate-500 border border-slate-700/80 focus:border-pink-500 ${
                        isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900/50' : ''
                      }`}
                      required
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-lg">
                      BD 11-digit
                    </span>
                  </div>
                </div>

                {/* 2. Account Type Selector (Personal, Agent, Merchant) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t('withdraw.accountType')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['personal', 'agent', 'merchant'] as AccountType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        disabled={isFormDisabled}
                        onClick={() => setAccountType(type)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                          isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          accountType === type
                            ? 'bg-pink-600 text-white border-pink-500 shadow-glow-brand'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        {type === 'personal'
                          ? t('withdraw.personal')
                          : type === 'agent'
                          ? t('withdraw.agent')
                          : t('withdraw.merchant')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Points to Redeem Input & Quick Select Buttons (Max 1000 PTS) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> {t('withdraw.pointsToRedeem')}{' '}
                      <span className="text-[10px] text-pink-400 lowercase font-normal">(max 1,000 pts)</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Balance:{' '}
                      <strong className="text-amber-300 font-bold">{user?.rewardPoints ?? 0} PTS</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      disabled={isFormDisabled}
                      min={eligibility?.minWithdrawalPoints || 50}
                      max={Math.min(maxRedeemLimit, user?.rewardPoints || 0)}
                      value={pointsInput}
                      onChange={(e) => {
                        setPointsInput(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Enter points (Min 50, Max 1,000)"
                      className={`w-full pl-4 pr-16 py-3 rounded-2xl glass-input text-base font-black text-amber-300 placeholder-slate-500 border border-slate-700/80 focus:border-amber-500 ${
                        isFormDisabled ? 'opacity-50 cursor-not-allowed bg-slate-900/50' : ''
                      }`}
                      required
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                      PTS
                    </span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        disabled={isFormDisabled}
                        onClick={() => handleQuickPercent(pct)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 transition-all ${
                          isFormDisabled ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        {pct === 100 ? 'Max (1000)' : `${pct}%`}
                      </button>
                    ))}
                    {[50, 100, 250, 500, 1000].map((pts) => (
                      <button
                        key={`pts-${pts}`}
                        type="button"
                        disabled={isFormDisabled}
                        onClick={() => handleQuickAmount(pts)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 text-amber-300/80 hover:text-amber-300 hover:border-amber-500 transition-all ${
                          isFormDisabled ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        +{pts}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Live Payout Breakdown Preview Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/5 via-slate-900/80 to-amber-500/5 border border-slate-800/80 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{t('withdraw.payoutPreview')}</span>
                    <span className="text-pink-400">1 PTS = ৳ 1 BDT (bKash)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Points Redeemed:</span>
                    <span className="font-extrabold text-amber-300">{pointsToWithdraw} PTS</span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-1 border-b border-slate-800/60">
                    <span className="font-bold text-slate-200">{t('withdraw.youWillReceive')}:</span>
                    <span className="font-black text-lg text-emerald-400">
                      ৳ {equivalentBDT} <span className="text-xs font-normal text-emerald-300">BDT</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-400">{t('withdraw.remainingPoints')}:</span>
                    <span className="font-bold text-slate-300">{remainingPoints} PTS</span>
                  </div>
                </div>

                {/* 5. Submit Button */}
                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  disabled={isFormDisabled || isSubmitting}
                  className={`w-full text-white font-extrabold text-sm py-3.5 transition-all ${
                    isFormDisabled
                      ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60 shadow-none'
                      : 'bg-gradient-to-r from-[#D12053] via-pink-600 to-indigo-600 hover:from-[#b91b48] hover:to-indigo-500 shadow-glow-brand'
                  }`}
                  isLoading={isSubmitting}
                  leftIcon={isFormDisabled ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                >
                  {isFormDisabled
                    ? 'Cashout Option Disabled (7-Day Cycle in Progress)'
                    : `${t('withdraw.withdrawBtn')} (৳ ${equivalentBDT} BDT)`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SMM VIEW: My Withdrawal History Table */}
      {!isAdmin && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t('withdraw.historyTitle')}</h3>
                <p className="text-xs text-slate-400">Audit history of your bKash redemption requests</p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchMyWithdrawals();
                fetchEligibility();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {t('withdraw.noHistory')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">bKash Account</th>
                    <th className="py-3 px-3">Points</th>
                    <th className="py-3 px-3">Amount (BDT)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">TrxID / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {myWithdrawals.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString()} {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-pink-500" />
                          <span>{w.accountNumber}</span>
                          <span className="text-[10px] text-slate-400 uppercase">({w.accountType})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-amber-300 tabular-nums">
                        {w.points} PTS
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-400 text-sm tabular-nums">
                        ৳ {w.amountBDT}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {w.status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid via bKash
                          </span>
                        )}
                        {w.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )}
                        {w.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Rejected & Refunded
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                        {w.transactionId && (
                          <span className="font-mono text-indigo-300 font-bold mr-1">
                            TrxID: {w.transactionId}
                          </span>
                        )}
                        {w.adminNote && <span className="italic text-slate-400">({w.adminNote})</span>}
                        {!w.transactionId && !w.adminNote && '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADMIN VIEW: Full Withdrawal Management Hub */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl overflow-x-auto">
              {[
                { id: 'pending', label: t('withdraw.pendingRequests') },
                { id: 'paid', label: t('withdraw.paidRequests') },
                { id: 'rejected', label: t('withdraw.rejectedRequests') },
                { id: 'all', label: t('withdraw.allRequests') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    adminTab === tab.id
                      ? 'bg-pink-600 text-white shadow-glow-brand'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder={t('withdraw.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
              />
            </form>
          </div>

          {/* Admin Requests Table */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
            {allWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No withdrawal requests found under "{adminTab}" status filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">SMM Agent</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">bKash Number</th>
                      <th className="py-3 px-3">Points</th>
                      <th className="py-3 px-3">Cashout (BDT)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {allWithdrawals.map((w) => {
                      const smm = typeof w.userId === 'object' ? w.userId : null;
                      return (
                        <tr key={w._id} className="hover:bg-slate-900/40 transition-colors">
                          {/* SMM Agent */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              {smm?.avatar ? (
                                <img
                                  src={smm.avatar}
                                  alt={smm.name}
                                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                                  {(smm?.name || 'S').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-white leading-tight">
                                  {smm?.name || 'SMM User'}
                                </div>
                                <div className="text-[10px] text-slate-400">{smm?.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </td>

                          {/* bKash Number */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono">{w.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(w.accountNumber, w._id)}
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                title="Copy bKash Number"
                              >
                                {copiedPhoneId === w._id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-pink-400 uppercase font-semibold">
                              bKash ({w.accountType})
                            </span>
                          </td>

                          {/* Points */}
                          <td className="py-3.5 px-3 font-bold text-amber-300 tabular-nums">
                            {w.points} PTS
                          </td>

                          {/* Amount BDT */}
                          <td className="py-3.5 px-3 font-black text-emerald-400 text-sm tabular-nums">
                            ৳ {w.amountBDT}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {w.status === 'paid' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> Paid • {w.transactionId}
                              </span>
                            )}
                            {w.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                            {w.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" /> Rejected
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {w.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  className="text-xs py-1 px-2.5 font-bold"
                                  onClick={() => {
                                    setSelectedWithdrawalForPay(w);
                                    setTrxIdInput('');
                                    setAdminNoteInput('');
                                  }}
                                  leftIcon={<Check className="w-3.5 h-3.5" />}
                                >
                                  Mark as Done
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  className="text-xs py-1 px-2.5 font-bold"
                                  onClick={() => {
                                    setSelectedWithdrawalForReject(w);
                                    setAdminNoteInput('');
                                  }}
                                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                                >
                                  {t('withdraw.rejectRequest')}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                {w.adminNote || (w.status === 'paid' ? 'Processed' : '-')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN MODAL: Send Money Manually & Mark as Done with TrxID */}
      {selectedWithdrawalForPay && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWithdrawalForPay(null)}
          title="Send Money via bKash & Mark as Done"
          subtitle={`Manually send ৳${selectedWithdrawalForPay.amountBDT} BDT to ${selectedWithdrawalForPay.accountNumber}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-pink-500/10 border border-emerald-500/30 space-y-2 text-xs text-slate-200">
              <div className="font-bold text-emerald-300 text-sm flex items-center justify-between">
                <span>Payment Amount to Send:</span>
                <span className="text-lg font-black text-emerald-400">
                  ৳ {selectedWithdrawalForPay.amountBDT} BDT
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">bKash Mobile Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-white text-sm">
                    {selectedWithdrawalForPay.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyPhone(selectedWithdrawalForPay.accountNumber, 'modal')
                    }
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy Phone Number"
                  >
                    {copiedPhoneId === 'modal' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Account Type:</span>
                <span className="capitalize font-bold text-pink-300">
                  {selectedWithdrawalForPay.accountType}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-300 block">Manual Payment Steps:</strong>
              <p>1. Open your bKash App or Merchant Portal.</p>
              <p>2. Send <strong>৳{selectedWithdrawalForPay.amountBDT} BDT</strong> to <strong>{selectedWithdrawalForPay.accountNumber}</strong>.</p>
              <p>3. Enter the transaction ID below and click <strong>Confirm & Mark as Done</strong>.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                bKash Transaction ID (TrxID)
              </label>
              <input
                type="text"
                value={trxIdInput}
                onChange={(e) => setTrxIdInput(e.target.value)}
                placeholder="e.g. BL8K49M2 / 9K8X2910"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Note / Remarks (Optional)
              </label>
              <input
                type="text"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="e.g. Paid via bKash personal account"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedWithdrawalForPay(null)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                isLoading={isProcessingAdminAction}
                onClick={handleAdminPay}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Confirm & Mark as Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADMIN MODAL: Reject Request with Auto-Refund */}
      {selectedWithdrawalForReject && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedWithdrawalForReject(null)}
          title="Reject Withdrawal Request"
          subtitle={`Reject request and automatically refund ${selectedWithdrawalForReject.points} PTS to user's wallet`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-300 leading-relaxed">
              ⚠️ <strong>Auto-Refund Notice:</strong> Rejecting this withdrawal will immediately refund{' '}
              <strong className="text-amber-300">+{selectedWithdrawalForReject.points} PTS</strong> back to the SMM agent's wallet and notify them with your explanation note.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Rejection Reason (Required)
              </label>
              <textarea
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                rows={3}
                placeholder={t('withdraw.rejectReasonPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedWithdrawalForReject(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessingAdminAction}
                onClick={handleAdminReject}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                {t('withdraw.confirmReject')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WithdrawPage;

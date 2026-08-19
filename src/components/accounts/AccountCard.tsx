import React, { useState } from 'react';
import { FacebookAccount, AccountStatus, User } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ExternalLink,
  MessageCircle,
  Share2,
  Lock,
  Hash,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  UserCheck,
  UserPlus,
  BookOpen,
  Sparkles,
  Award,
  HelpCircle,
  LifeBuoy,
  Compass,
  Milk,
  Baby,
} from 'lucide-react';
import { SmmGuidelineModal } from './SmmGuidelineModal';

interface AccountCardProps {
  account: FacebookAccount;
  onEdit?: (account: FacebookAccount) => void;
  onDelete?: (id: string) => void;
  onAssign?: (account: FacebookAccount) => void;
  onStatusChange?: (id: string, newStatus: AccountStatus) => void;
  isCurrent?: boolean;
  onSelect?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
  isCurrent = false,
  onSelect,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false);
  const password = account.password || account.passwordHint || '';

  const approvalStatus = account.approvalStatus || 'approved';
  const isPending = approvalStatus === 'pending';
  const isApproved = approvalStatus === 'approved';
  const isRejected = approvalStatus === 'rejected';

  const mode = account.accountMode || 'general';
  const product = account.assignedProduct || 'none';
  const workloadTier = account.workloadTier || 'active';

  const getModeBadge = () => {
    switch (mode) {
      case 'reviewer':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <Award className="w-3 h-3 text-purple-400" /> MODE R: REVIEWER
          </span>
        );
      case 'question':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <HelpCircle className="w-3 h-3 text-sky-400" /> MODE Q: QUESTION
          </span>
        );
      case 'support':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <LifeBuoy className="w-3 h-3 text-amber-400" /> MODE S: SUPPORT
          </span>
        );
      case 'navigation':
        return (
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <Compass className="w-3 h-3 text-emerald-400" /> MODE N: NAVIGATION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
            GENERAL ID
          </span>
        );
    }
  };

  const getProductBadge = () => {
    switch (product) {
      case 'milkimom':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
            🥛 Milkimom (M)
          </span>
        );
      case 'milkready':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
            🍼 MilkReady (MR)
          </span>
        );
      case 'smoothflow':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            💧 SmoothFlow (SF)
          </span>
        );
      case 'stableflow':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
            🌊 StableFlow (ST)
          </span>
        );
      case 'all_products':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
            ✨ All Products
          </span>
        );
      default:
        return null;
    }
  };

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

  const getModeCardStyle = () => {
    if (isPending) return 'border-amber-500/40 bg-amber-950/10 shadow-sm';
    if (isRejected) return 'border-rose-500/40 bg-rose-950/10 shadow-sm';
    if (isCurrent) return 'border-indigo-500 bg-indigo-950/30 shadow-glow-brand ring-1 ring-indigo-500/60';

    switch (mode) {
      case 'reviewer':
        return 'border-purple-500/40 bg-gradient-to-b from-purple-950/20 via-slate-900/90 to-slate-950 hover:border-purple-500/70 shadow-sm';
      case 'question':
        return 'border-sky-500/40 bg-gradient-to-b from-sky-950/20 via-slate-900/90 to-slate-950 hover:border-sky-500/70 shadow-sm';
      case 'support':
        return 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950 hover:border-amber-500/70 shadow-sm';
      case 'navigation':
        return 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-950 hover:border-emerald-500/70 shadow-sm';
      default:
        return 'border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-sm';
    }
  };

  const getModeAvatarRing = () => {
    switch (mode) {
      case 'reviewer':
        return 'ring-2 ring-purple-500/50';
      case 'question':
        return 'ring-2 ring-sky-500/50';
      case 'support':
        return 'ring-2 ring-amber-500/50';
      case 'navigation':
        return 'ring-2 ring-emerald-500/50';
      default:
        return 'ring-2 ring-blue-500/30';
    }
  };

  const getModeTopStripe = () => {
    switch (mode) {
      case 'reviewer':
        return 'h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500';
      case 'question':
        return 'h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500';
      case 'support':
        return 'h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500';
      case 'navigation':
        return 'h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500';
      default:
        return null;
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${getModeCardStyle()}`}
    >
      {/* Top Mode Color Stripe */}
      {getModeTopStripe() && (
        <div className={`absolute top-0 left-0 right-0 ${getModeTopStripe()}`} />
      )}

      <div className="space-y-4">
        {/* SMM Mode & Role Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {getModeBadge()}
            {getProductBadge()}
            {workloadTier && (
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                  workloadTier === 'active'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : workloadTier === 'light'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {workloadTier.toUpperCase()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setGuidelineModalOpen(true)}
            className="text-[11px] text-indigo-300 hover:text-white font-bold flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 px-2.5 py-1 rounded-xl border border-indigo-500/30 transition-all flex-shrink-0 shadow-sm"
            title="Open Persona Details & Playbook dialog"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Playbook</span>
          </button>
        </div>

        {/* Header: Avatar, Name, Approval & Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={
                account.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
              }
              alt={account.accountName}
              className={`w-12 h-12 rounded-2xl object-cover ${getModeAvatarRing()}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base leading-snug">{account.accountName}</h4>
                {isCurrent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                    Active
                  </span>
                )}
              </div>
              <a
                href={account.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{account.profileUrl}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {/* Approval Status Badge */}
            {isPending && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" /> PENDING
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

        {/* Creator & Assignee Info */}
        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          {/* Creator Row */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {creator?.avatar ? (
                <img
                  src={creator.avatar}
                  alt={creator.name || 'Creator'}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-600 flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-slate-700">
                  {(creator?.name || creator?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 truncate">
                <span className="text-[10px] text-slate-400">Created by: </span>
                <strong className="text-slate-200 text-xs font-semibold truncate">
                  {creator?.name || creator?.email || 'Admin / SMM'}
                </strong>
              </div>
            </div>

            {account.createdAt && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{new Date(account.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Assigned To Row */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/60 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {assignee?.avatar ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name || 'Assignee'}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500/40 flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                  {(assignee?.name || assignee?.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 truncate">
                <span className="text-[10px] text-slate-400">Assigned to: </span>
                <strong className="text-indigo-300 text-xs font-semibold truncate">
                  {assignee?.name || assignee?.email || 'Unassigned'}
                </strong>
              </div>
            </div>

            {onAssign && (
              <button
                type="button"
                onClick={() => onAssign(account)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1 flex-shrink-0 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 transition-all hover:bg-indigo-500/20"
                title="Assign to specific SMM"
              >
                <UserCheck className="w-3 h-3" />
                <span>Assign</span>
              </button>
            )}
          </div>
        </div>

        {/* Rejection / Feedback Note if rejected */}
        {isRejected && account.adminNote && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px]">Rejection Note:</span>
              <p className="text-[11px]">{account.adminNote}</p>
            </div>
          </div>
        )}

        {/* Credentials Grid: UID & Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* User ID / UID */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>UID:</span>
            </div>
            <span className="font-mono text-slate-200 truncate max-w-[120px]">
              {account.profileUid || 'Not set'}
            </span>
          </div>

          {/* Password with reveal */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pass:</span>
            </div>
            {password ? (
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-200">
                  {showPassword ? password : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            ) : (
              <span className="text-slate-500 italic">None</span>
            )}
          </div>
        </div>

        {/* SMM Persona Summary Interactive Pill */}
        {(account.childAge || account.writingStyle || account.purchaseHistory) && (
          <button
            type="button"
            onClick={() => setGuidelineModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group flex items-center justify-between gap-2 text-xs"
            title="Click to view full Persona Details & Playbook dialog"
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-slate-300 font-semibold text-[11px] truncate">
                {account.childAge ? `👶 Baby: ${account.childAge}` : 'Persona Configured'}
                {account.writingStyle ? ` • ${account.writingStyle}` : ''}
              </span>
            </div>
            <span className="text-[10px] text-indigo-400 group-hover:text-indigo-300 font-bold flex items-center gap-0.5 flex-shrink-0">
              Details ➔
            </span>
          </button>
        )}

        {/* Daily Routine Targets Summary */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Daily Fixed Routine Targets:
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
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
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {onSelect && !isCurrent ? (
          <Button variant="outline" size="sm" onClick={onSelect}>
            Select for Work
          </Button>
        ) : (
          <span className="text-xs text-slate-500">Facebook Account</span>
        )}

        <div className="flex items-center gap-1">
          {onStatusChange && (
            <select
              value={account.status}
              onChange={(e) => onStatusChange(account._id, e.target.value as AccountStatus)}
              className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="warmup">Warmup</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="banned">Banned</option>
            </select>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(account)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(account._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SMM Guideline & Response Playbook Modal */}
      <SmmGuidelineModal
        isOpen={guidelineModalOpen}
        onClose={() => setGuidelineModalOpen(false)}
        account={account}
        initialMode={account.accountMode}
        initialProduct={account.assignedProduct}
      />
    </div>
  );
};

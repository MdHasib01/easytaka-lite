import React, { useState } from 'react';
import { FacebookAccount, AccountStatus } from '../../types';
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
} from 'lucide-react';

interface AccountCardProps {
  account: FacebookAccount;
  onEdit?: (account: FacebookAccount) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: AccountStatus) => void;
  isCurrent?: boolean;
  onSelect?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onDelete,
  onStatusChange,
  isCurrent = false,
  onSelect,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const password = account.password || account.passwordHint || '';
  const approvalStatus = account.approvalStatus || 'approved';
  const isPending = approvalStatus === 'pending';
  const isApproved = approvalStatus === 'approved';
  const isRejected = approvalStatus === 'rejected';

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between ${
        isCurrent
          ? 'border-indigo-500/60 bg-indigo-950/20 shadow-glow-brand'
          : isPending
          ? 'border-amber-500/30 bg-amber-950/5'
          : isRejected
          ? 'border-rose-500/30 bg-rose-950/5'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="space-y-4">
        {/* Header: Avatar, Name, Approval & Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={
                account.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(account.accountName)}&background=1877f2&color=fff`
              }
              alt={account.accountName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30"
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
    </div>
  );
};

import React from 'react';
import { FacebookAccount, AccountStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Users,
  ExternalLink,
  MessageCircle,
  Share2,
  Shield,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
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
  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between ${
        isCurrent
          ? 'border-indigo-500/60 bg-indigo-950/20 shadow-glow-brand'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="space-y-4">
        {/* Header: Avatar, Name, Status */}
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
                <span className="truncate">{account.profileUrl.replace('https://facebook.com/', '@')}</span>
              </a>
            </div>
          </div>

          <Badge variant={account.status as any}>{account.status.toUpperCase()}</Badge>
        </div>

        {/* Account Metadata Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>{account.friendsCount || 0} Friends</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{account.groupsCount || 0} Groups</span>
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

        {account.notes && (
          <p className="text-xs text-slate-400 italic bg-slate-900/30 p-2 rounded-lg border border-slate-800/40">
            "{account.notes}"
          </p>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {onSelect && !isCurrent ? (
          <Button variant="outline" size="sm" onClick={onSelect}>
            Select for Work
          </Button>
        ) : (
          <span className="text-xs text-slate-500">{account.accountCategory || 'FB Profile'}</span>
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

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAccountStore } from '../stores/useAccountStore';
import { AccountCard } from '../components/accounts/AccountCard';
import { AddAccountModal } from '../components/accounts/AddAccountModal';
import { AssignAccountModal } from '../components/accounts/AssignAccountModal';
import { AccountMilestoneProgressBar } from '../components/gamification/AccountMilestoneProgressBar';
import { Button } from '../components/ui/Button';
import { FacebookAccount, AccountStatus } from '../types';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Sparkles,
  Coins,
  Gift,
  BookOpen,
  Award,
  HelpCircle,
  LifeBuoy,
  Compass,
} from 'lucide-react';
import { SmmGuidelineModal } from '../components/accounts/SmmGuidelineModal';

export const AccountsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    accounts,
    allAccounts,
    selectedAccount,
    milestoneProgress,
    setSelectedAccount,
    fetchMyAccounts,
    fetchAllAccounts,
    fetchMilestoneProgress,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccountStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FacebookAccount | null>(null);
  const [assigningAccount, setAssigningAccount] = useState<FacebookAccount | null>(null);
  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdmin = user?.role === 'admin';
  const targetAccounts = isAdmin ? allAccounts : accounts;

  useEffect(() => {
    if (isAdmin) {
      fetchAllAccounts();
    } else {
      fetchMyAccounts();
      fetchMilestoneProgress();
    }
  }, [isAdmin]);

  const filteredAccounts = targetAccounts.filter((acc) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && acc.approvalStatus !== 'pending') return false;
      if (statusFilter === 'approved' && acc.approvalStatus !== 'approved') return false;
      if (statusFilter === 'rejected' && acc.approvalStatus !== 'rejected') return false;
      if (!['pending', 'approved', 'rejected'].includes(statusFilter) && acc.status !== statusFilter) {
        return false;
      }
    }
    if (modeFilter !== 'all') {
      if (acc.accountMode !== modeFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        acc.accountName.toLowerCase().includes(q) ||
        acc.profileUrl.toLowerCase().includes(q) ||
        acc.accountCategory?.toLowerCase().includes(q) ||
        acc.accountMode?.toLowerCase().includes(q) ||
        (typeof acc.assignedProductId === 'object' ? acc.assignedProductId?.name : '')?.toLowerCase().includes(q) ||
        acc.profileUid?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Facebook Accounts Manager
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {targetAccounts.length} Managed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Central inventory of all Facebook profiles. Configure SMM modes (R/Q/S/N), product lanes, and persona identities.'
              : 'Add and manage multiple Facebook profiles, follow your assigned SMM role guidelines, & earn bonuses!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setGuidelineModalOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-indigo-400" />}
          >
            SMM Guidelines
          </Button>

          <Button
            variant="glow"
            onClick={() => {
              setEditingAccount(null);
              setAddModalOpen(true);
            }}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Facebook Account
          </Button>
        </div>
      </div>

      {/* SMM Mode Quick Strategic Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SMM Mental Models:
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-[11px]">
            🎖️ R: "আমি সত্যি ব্যবহার করেছি"
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold text-[11px]">
            ❓ Q: "আপনার problemটা কী?"
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
            💡 S: "সিচুয়েশন এভাবে বুঝুন"
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px]">
            🧭 N: "চলুন অফিশিয়াল পেজে যাই"
          </span>
        </div>

        <button
          onClick={() => setGuidelineModalOpen(true)}
          className="text-indigo-400 hover:text-indigo-300 text-xs font-bold underline flex items-center gap-1"
        >
          View Full Playbook ➔
        </button>
      </div>

      {/* Gamified Milestone Progress Bar (SMM User) */}
      {!isAdmin && <AccountMilestoneProgressBar milestoneProgress={milestoneProgress} />}

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'approved', label: 'Approved' },
              { id: 'pending', label: 'Pending Approval' },
              { id: 'warmup', label: 'Warm-up Phase' },
              { id: 'restricted', label: 'Restricted' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-glow-fb font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, URL, mode..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Mode Filters (R / Q / S / N) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/60 overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 whitespace-nowrap">
            Filter by Mode:
          </span>
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'reviewer', label: '🎖️ Reviewer (R)' },
            { id: 'question', label: '❓ Question (Q)' },
            { id: 'support', label: '💡 Support (S)' },
            { id: 'navigation', label: '🧭 Navigation (N)' },
          ].map((mTab) => (
            <button
              key={mTab.id}
              onClick={() => setModeFilter(mTab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                modeFilter === mTab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {mTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Accounts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No Facebook profiles matched your search.'
              : 'Add your first Facebook account to get started with daily engagement workflows.'}
          </p>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Facebook Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <AccountCard
              key={acc._id}
              account={acc}
              isCurrent={selectedAccount?._id === acc._id}
              onSelect={() => setSelectedAccount(acc)}
              onEdit={(a) => {
                setEditingAccount(a);
                setAddModalOpen(true);
              }}
              onAssign={(a) => setAssigningAccount(a)}
              onDelete={deleteAccount}
              onStatusChange={(id, status) => updateAccount(id, { status })}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddAccountModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingAccount(null);
        }}
        initialAccount={editingAccount}
        onSubmit={async (data) => {
          if (editingAccount) {
            return updateAccount(editingAccount._id, data);
          } else {
            return createAccount(data);
          }
        }}
      />

      {/* Assign Account Modal */}
      <AssignAccountModal
        isOpen={!!assigningAccount}
        onClose={() => setAssigningAccount(null)}
        account={assigningAccount}
        onAssignSuccess={() => {
          if (isAdmin) {
            fetchAllAccounts();
          } else {
            fetchMyAccounts();
          }
        }}
      />

      {/* SMM Guideline & Playbook Modal */}
      <SmmGuidelineModal
        isOpen={guidelineModalOpen}
        onClose={() => setGuidelineModalOpen(false)}
      />
    </div>
  );
};

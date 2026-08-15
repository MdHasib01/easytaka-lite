import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useAccountStore } from '../stores/useAccountStore';
import { AccountCard } from '../components/accounts/AccountCard';
import { AddAccountModal } from '../components/accounts/AddAccountModal';
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
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    accounts,
    allAccounts,
    selectedAccount,
    setSelectedAccount,
    fetchMyAccounts,
    fetchAllAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccountStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FacebookAccount | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAdmin = user?.role === 'admin';
  const targetAccounts = isAdmin ? allAccounts : accounts;

  useEffect(() => {
    if (isAdmin) {
      fetchAllAccounts();
    } else {
      fetchMyAccounts();
    }
  }, [isAdmin]);

  const filteredAccounts = targetAccounts.filter((acc) => {
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        acc.accountName.toLowerCase().includes(q) ||
        acc.profileUrl.toLowerCase().includes(q) ||
        acc.accountCategory?.toLowerCase().includes(q) ||
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
              ? 'Central inventory of all Facebook profiles managed across the entire team.'
              : 'Add and manage multiple Facebook profiles, track account status, and configure custom daily targets.'}
          </p>
        </div>

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

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'active', label: 'Active' },
            { id: 'warmup', label: 'Warm-up Phase' },
            { id: 'restricted', label: 'Restricted' },
            { id: 'banned', label: 'Banned' },
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
            placeholder="Search account name, URL..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl glass-input text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
    </div>
  );
};

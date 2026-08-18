import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import {
  UserCog,
  Search,
  Mail,
  ShieldAlert,
  ShieldOff,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { User } from '../types';

export const SmmManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [smmList, setSmmList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'active_access' | 'revoked'>('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [revokingSmm, setRevokingSmm] = useState<User | null>(null);
  const [resettingSmm, setResettingSmm] = useState<User | null>(null);
  const [deletingSmm, setDeletingSmm] = useState<User | null>(null);

  const fetchSmms = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/smm-verifications?status=all');
      if (response.data.success) {
        setSmmList(response.data.smms);
      }
    } catch (err) {
      console.error('Failed to fetch SMM list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchSmms();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-white font-bold">Admins Only</h2>
        <p className="text-xs text-slate-400">This page is only available to admin accounts.</p>
      </div>
    );
  }

  const flash = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const filteredSmms = smmList.filter((smm) => {
    const matchesSearch =
      !search.trim() ||
      smm.name?.toLowerCase().includes(search.toLowerCase()) ||
      smm.email?.toLowerCase().includes(search.toLowerCase());

    const matchesAccess =
      accessFilter === 'all' ||
      (accessFilter === 'active_access' && smm.isActive !== false) ||
      (accessFilter === 'revoked' && smm.isActive === false);

    return matchesSearch && matchesAccess;
  });

  const revokedCount = smmList.filter((s) => s.isActive === false).length;

  const handleToggleAccess = async (smm: User) => {
    const nextIsActive = smm.isActive === false;
    setBusyId(smm._id || smm.id);
    try {
      const res = await api.put(`/auth/smms/${smm._id || smm.id}/access`, { isActive: nextIsActive });
      if (res.data.success) {
        flash('success', res.data.message);
        setRevokingSmm(null);
        fetchSmms();
      }
    } catch (err: any) {
      flash('error', err.response?.data?.message || 'Failed to update access.');
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (smm: User) => {
    const id = smm._id || smm.id;
    setBusyId(id);
    try {
      const res = await api.post(`/auth/smms/${id}/reset-password`);
      if (res.data.success) {
        flash('success', res.data.message);
        setResettingSmm(null);
      }
    } catch (err: any) {
      flash('error', err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (smm: User) => {
    const id = smm._id || smm.id;
    setBusyId(id);
    try {
      const res = await api.delete(`/auth/smms/${id}`);
      if (res.data.success) {
        flash('success', res.data.message);
        setDeletingSmm(null);
        fetchSmms();
      }
    } catch (err: any) {
      flash('error', err.response?.data?.message || 'Failed to delete SMM.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">SMM Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revoke or restore SMM login access, reset passwords, or permanently remove SMM accounts.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-glow-success'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All SMMs' },
            { id: 'active_access', label: 'Access Granted' },
            { id: 'revoked', label: `Access Revoked${revokedCount > 0 ? ` (${revokedCount})` : ''}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAccessFilter(tab.id as typeof accessFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                accessFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SMM List */}
      {isLoading ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800">
          <p className="text-xs text-slate-400">Loading SMM accounts...</p>
        </div>
      ) : filteredSmms.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-2">
          <UserCog className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No SMM Accounts Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search or filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSmms.map((smm) => {
            const id = smm._id || smm.id;
            const isRevoked = smm.isActive === false;
            const isBusy = busyId === id;

            return (
              <div
                key={id}
                className={`glass-card rounded-2xl p-5 border space-y-4 transition-all hover:border-slate-700 ${
                  isRevoked ? 'border-rose-500/30 bg-rose-950/5' : 'border-slate-800'
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-base">{smm.name || 'Invited SMM'}</h4>
                        <Badge variant={smm.status as any}>{smm.status.toUpperCase()}</Badge>
                        {isRevoked && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ACCESS REVOKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {smm.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                  {isRevoked ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleToggleAccess(smm)}
                      isLoading={isBusy}
                      leftIcon={<Unlock className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Restore Access
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setRevokingSmm(smm)}
                      leftIcon={<ShieldOff className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Revoke Access
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setResettingSmm(smm)}
                    leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-400" />}
                    className="text-xs"
                  >
                    Reset Password
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeletingSmm(smm)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    className="text-xs ml-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revoke Access Confirmation Modal */}
      <Modal
        isOpen={!!revokingSmm}
        onClose={() => setRevokingSmm(null)}
        title="Revoke SMM Access"
        subtitle={`${revokingSmm?.name || revokingSmm?.email} will be immediately signed out and unable to log in until access is restored.`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <ShieldOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Their account, points, and Facebook accounts are kept as-is — only login/API access is blocked.</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRevokingSmm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={busyId === (revokingSmm?._id || revokingSmm?.id)}
              onClick={() => revokingSmm && handleToggleAccess(revokingSmm)}
            >
              Confirm Revoke
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Confirmation Modal */}
      <Modal
        isOpen={!!resettingSmm}
        onClose={() => setResettingSmm(null)}
        title="Reset Password"
        subtitle={`A temporary password will be emailed to ${resettingSmm?.email}.`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2">
            <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {resettingSmm?.name || 'This SMM'} will be required to set a new password immediately after logging in
              with the temporary one.
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setResettingSmm(null)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              isLoading={busyId === (resettingSmm?._id || resettingSmm?.id)}
              onClick={() => resettingSmm && handleResetPassword(resettingSmm)}
            >
              Send Temporary Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingSmm}
        onClose={() => setDeletingSmm(null)}
        title="Delete SMM Account"
        subtitle={`This will permanently delete ${deletingSmm?.name || deletingSmm?.email}.`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This action cannot be undone. Their profile and all Facebook accounts they manage will be permanently
              deleted. Task and withdrawal history is kept for records.
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingSmm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={busyId === (deletingSmm?._id || deletingSmm?.id)}
              onClick={() => deletingSmm && handleDelete(deletingSmm)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

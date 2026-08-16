import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useStatsStore } from '../stores/useStatsStore';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Coins,
  Flame,
  ShieldCheck,
  Calendar,
  History,
  CheckCircle2,
  Sparkles,
  Wallet,
  ArrowRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { transactions, fetchTransactions } = useStatsStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateProfile({ name, phone });
    setIsSaving(false);
    setMessage(ok ? 'Profile updated successfully!' : 'Failed to update profile');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Account & Reward Wallet
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal details and view your point reward earnings history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                }
                alt={user?.name}
                className="w-24 h-24 rounded-3xl mx-auto object-cover ring-4 ring-indigo-500/30 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                {user?.role}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>

            {/* Points & Streak Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-300 font-extrabold text-lg">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{user?.rewardPoints ?? 0}</span>
                </div>
                <div className="text-[10px] text-amber-400/80 font-medium">Reward Points</div>
              </div>

              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
                <div className="flex items-center justify-center gap-1 text-orange-400 font-extrabold text-lg">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>{user?.streakDays ?? 0}d</span>
                </div>
                <div className="text-[10px] text-orange-400/80 font-medium">Daily Streak</div>
              </div>
            </div>

            {/* Withdraw Points to bKash Action Button */}
            <Link
              to="/withdraw"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#D12053] to-pink-600 hover:from-[#b91b48] hover:to-pink-500 text-white text-xs font-bold transition-all shadow-glow-brand"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw Points to bKash (৳ {user?.rewardPoints ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Edit Profile Form */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Details</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {message && <p className="text-xs text-emerald-400">{message}</p>}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Reward Points History Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Points Reward Ledger</h3>
                  <p className="text-xs text-slate-400">Audit history of all earned rewards</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Balance:</span>
                <span className="text-base font-extrabold text-amber-300 ml-1.5">
                  {user?.rewardPoints ?? 0} pts
                </span>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No point reward transactions recorded yet. Complete tasks to earn points!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <div key={tx._id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-200">{tx.description}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{tx.amount} Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

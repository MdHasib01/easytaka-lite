import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import api from '../../services/api';
import {
  Coins,
  Settings,
  Gift,
  Flame,
  Users,
  Check,
  Sparkles,
  Award,
  Save,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { User } from '../../types';

interface PointSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PointSettingsModal: React.FC<PointSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, fetchSettings, updateSettings, updateSmmDailyReward, isLoading } =
    useSettingsStore();

  const [activeTab, setActiveTab] = useState<'global' | 'smm_rewards'>('global');
  const [smms, setSmms] = useState<User[]>([]);
  const [isSmmLoading, setIsSmmLoading] = useState(false);
  const [savingSmmId, setSavingSmmId] = useState<string | null>(null);
  const [savedSmmSuccessId, setSavedSmmSuccessId] = useState<string | null>(null);

  // Form states for Global Config
  const [fbAccountReward, setFbAccountReward] = useState<number>(40);
  const [fbMilestoneReward, setFbMilestoneReward] = useState<number>(100);
  const [fbMilestoneStep, setFbMilestoneStep] = useState<number>(5);
  const [defaultDailyReward, setDefaultDailyReward] = useState<number>(50);
  const [minWithdrawalPoints, setMinWithdrawalPoints] = useState<number>(50);
  const [withdrawalCycleDays, setWithdrawalCycleDays] = useState<number>(7);
  const [globalSaveMessage, setGlobalSaveMessage] = useState<string | null>(null);

  // Per-SMM reward inputs state
  const [smmDailyRewards, setSmmDailyRewards] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      fetchSmms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (settings) {
      setFbAccountReward(settings.facebookAccountReward ?? 40);
      setFbMilestoneReward(settings.facebookMilestoneReward ?? 100);
      setFbMilestoneStep(settings.facebookMilestoneStep ?? 5);
      setDefaultDailyReward(settings.defaultDailyCompletionReward ?? 50);
      setMinWithdrawalPoints(settings.minWithdrawalPoints ?? 50);
      setWithdrawalCycleDays(settings.withdrawalCycleDays ?? 7);
    }
  }, [settings]);

  const fetchSmms = async () => {
    setIsSmmLoading(true);
    try {
      const res = await api.get('/auth/smms');
      if (res.data.success) {
        const list = res.data.smms || [];
        setSmms(list);
        const map: Record<string, number> = {};
        list.forEach((s: User) => {
          map[s._id || s.id] = s.dailyTaskCompletionReward ?? 50;
        });
        setSmmDailyRewards(map);
      }
    } catch (err) {
      console.error('Fetch SMMs error:', err);
    } finally {
      setIsSmmLoading(false);
    }
  };

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSaveMessage(null);

    const res = await updateSettings({
      facebookAccountReward: Number(fbAccountReward),
      facebookMilestoneReward: Number(fbMilestoneReward),
      facebookMilestoneStep: Number(fbMilestoneStep),
      defaultDailyCompletionReward: Number(defaultDailyReward),
      minWithdrawalPoints: Number(minWithdrawalPoints),
      withdrawalCycleDays: Number(withdrawalCycleDays),
    });

    if (res.success) {
      setGlobalSaveMessage('Global reward settings saved successfully!');
      setTimeout(() => setGlobalSaveMessage(null), 4000);
    }
  };

  const handleSaveSmmReward = async (smmId: string) => {
    const points = smmDailyRewards[smmId] ?? 50;
    setSavingSmmId(smmId);
    const res = await updateSmmDailyReward(smmId, points);
    setSavingSmmId(null);
    if (res.success) {
      setSavedSmmSuccessId(smmId);
      setTimeout(() => setSavedSmmSuccessId(null), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reward & Point Management Center"
      subtitle="Configure global point incentives and customize daily completion rewards per SMM agent."
      size="xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'global'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Global Point Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('smm_rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'smm_rewards'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User-Specific Daily Rewards ({smms.length})</span>
          </button>
        </div>

        {/* TAB 1: GLOBAL SETTINGS */}
        {activeTab === 'global' && (
          <form onSubmit={handleSaveGlobal} className="space-y-5">
            {globalSaveMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{globalSaveMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Facebook Account Creation Reward */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Facebook Account Approval Reward
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Points awarded to the SMM immediately after an admin approves their submitted Facebook profile.
                </p>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={fbAccountReward}
                      onChange={(e) => setFbAccountReward(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-amber-300"
                    />
                    <span className="text-xs font-bold text-slate-400">PTS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Default: 40 PTS per approved account</span>
                </div>
              </div>

              {/* Facebook Account 5-Account Milestone Bonus */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Gift className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Account Milestone Bonus
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Extra gamified bonus points awarded automatically every time an SMM reaches the milestone target.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Bonus Points</label>
                    <input
                      type="number"
                      min="0"
                      value={fbMilestoneReward}
                      onChange={(e) => setFbMilestoneReward(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Every (Accounts)</label>
                    <input
                      type="number"
                      min="1"
                      value={fbMilestoneStep}
                      onChange={(e) => setFbMilestoneStep(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-white"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block">Default: +100 PTS every 5 accounts</span>
              </div>

              {/* Default Daily Task Completion Reward */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CalendarCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Default Daily Task Completion Reward
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fallback points awarded when an SMM finishes 100% of their daily routine tasks within the day, unless overridden for a specific user in the User-Specific tab.
                </p>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="0"
                    value={defaultDailyReward}
                    onChange={(e) => setDefaultDailyReward(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-300"
                  />
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Default: 50 PTS on 100% daily checklist completion</span>
              </div>

              {/* bKash Point Redemption & 7-Day Cycle Configuration */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 sm:col-span-2">
                <div className="flex items-center gap-2 text-pink-400">
                  <Coins className="w-4 h-4 text-pink-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    bKash Withdrawal & 7-Day Cycle Settings (1 Point = 1 BDT)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Configure minimum points required per withdrawal and the recurring join & work cycle interval (default 7 days).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Min Withdrawal (PTS)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={minWithdrawalPoints}
                        onChange={(e) => setMinWithdrawalPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300"
                      />
                      <span className="text-xs font-bold text-slate-400">PTS</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 50 PTS (৳ 50 BDT)</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cycle Interval (Days)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={withdrawalCycleDays}
                        onChange={(e) => setWithdrawalCycleDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-indigo-300"
                      />
                      <span className="text-xs font-bold text-slate-400">Days</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 7 Days from join date</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="glow"
                isLoading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Global Settings
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: USER-SPECIFIC DAILY REWARDS */}
        {activeTab === 'smm_rewards' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              💡 <strong>Custom Daily Task Rewards:</strong> Configure how many points each specific SMM agent will receive upon completing all their daily Facebook engagement tasks for the day.
            </div>

            {isSmmLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading SMM agents...</div>
            ) : smms.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No active SMM agents found.</div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto pr-1">
                {smms.map((smm) => {
                  const id = smm._id || smm.id;
                  const currentReward = smmDailyRewards[id] ?? (smm.dailyTaskCompletionReward ?? 50);
                  const isSaving = savingSmmId === id;
                  const isSaved = savedSmmSuccessId === id;

                  return (
                    <div
                      key={id}
                      className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {smm.avatar ? (
                          <img
                            src={smm.avatar}
                            alt={smm.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                            {(smm.name || smm.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-white text-xs sm:text-sm">{smm.name || 'SMM Agent'}</h5>
                          <p className="text-[11px] text-slate-400">{smm.email}</p>
                          <span className="text-[10px] text-amber-300 font-semibold">
                            Balance: {smm.rewardPoints || 0} pts
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                          <span className="text-[11px] text-slate-400 font-semibold">Daily Reward:</span>
                          <input
                            type="number"
                            min="0"
                            value={currentReward}
                            onChange={(e) =>
                              setSmmDailyRewards({
                                ...smmDailyRewards,
                                [id]: Number(e.target.value),
                              })
                            }
                            className="w-16 bg-transparent text-xs font-black text-amber-300 focus:outline-none text-right"
                          />
                          <span className="text-[11px] font-bold text-slate-400">PTS</span>
                        </div>

                        <Button
                          size="sm"
                          variant={isSaved ? 'success' : 'secondary'}
                          onClick={() => handleSaveSmmReward(id)}
                          isLoading={isSaving}
                          className="text-xs"
                          leftIcon={isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : undefined}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

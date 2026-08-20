import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  Coins,
  Settings,
  Gift,
  Flame,
  Award,
  Save,
  CheckCircle2,
  CalendarCheck,
  Star,
  Plus,
  Trash2,
  RotateCcw,
  Calculator,
  Sliders,
} from 'lucide-react';
import { RatingBreakpoint } from '../../types';

interface PointSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_BREAKPOINTS: RatingBreakpoint[] = [
  { minRating: 5.0, points: 90, label: '5.0 ⭐ (Excellent)' },
  { minRating: 4.5, points: 85, label: '4.5 ⭐ (Superior)' },
  { minRating: 4.0, points: 80, label: '4.0 ⭐ (Very Good)' },
  { minRating: 3.5, points: 70, label: '3.5 ⭐ (Good Plus)' },
  { minRating: 3.0, points: 60, label: '3.0 ⭐ (Good)' },
  { minRating: 2.5, points: 50, label: '2.5 ⭐ (Satisfactory)' },
  { minRating: 2.0, points: 40, label: '2.0 ⭐ (Average)' },
  { minRating: 1.5, points: 30, label: '1.5 ⭐ (Below Average)' },
  { minRating: 1.0, points: 20, label: '1.0 ⭐ (Poor)' },
];

export const PointSettingsModal: React.FC<PointSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'global' | 'scoring_matrix'>('global');

  // Form states for Global Config
  const [fbAccountReward, setFbAccountReward] = useState<number>(40);
  const [fbMilestoneReward, setFbMilestoneReward] = useState<number>(100);
  const [fbMilestoneStep, setFbMilestoneStep] = useState<number>(5);
  const [defaultDailyReward, setDefaultDailyReward] = useState<number>(100);
  const [minWithdrawalPoints, setMinWithdrawalPoints] = useState<number>(50);
  const [maxWithdrawalPoints, setMaxWithdrawalPoints] = useState<number>(1000);
  const [withdrawalCycleDays, setWithdrawalCycleDays] = useState<number>(7);
  const [globalSaveMessage, setGlobalSaveMessage] = useState<string | null>(null);

  // Breakpoints state
  const [breakpoints, setBreakpoints] = useState<RatingBreakpoint[]>(DEFAULT_BREAKPOINTS);
  const [simulatedRating, setSimulatedRating] = useState<number>(4.6);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    if (settings) {
      setFbAccountReward(settings.facebookAccountReward ?? 40);
      setFbMilestoneReward(settings.facebookMilestoneReward ?? 100);
      setFbMilestoneStep(settings.facebookMilestoneStep ?? 5);
      setDefaultDailyReward(settings.defaultDailyCompletionReward ?? 100);
      setMinWithdrawalPoints(settings.minWithdrawalPoints ?? 50);
      setMaxWithdrawalPoints(settings.maxWithdrawalPoints ?? 1000);
      setWithdrawalCycleDays(settings.withdrawalCycleDays ?? 7);

      if (settings.ratingBreakpoints && settings.ratingBreakpoints.length > 0) {
        setBreakpoints([...settings.ratingBreakpoints].sort((a, b) => b.minRating - a.minRating));
      } else {
        setBreakpoints(DEFAULT_BREAKPOINTS);
      }
    }
  }, [settings]);

  const handleBreakpointChange = (index: number, field: keyof RatingBreakpoint, val: any) => {
    const updated = [...breakpoints];
    updated[index] = { ...updated[index], [field]: val };
    setBreakpoints(updated);
  };

  const handleAddBreakpoint = () => {
    const lowest = breakpoints[breakpoints.length - 1]?.minRating ?? 1.0;
    const newMin = Math.max(0.5, Number((lowest - 0.5).toFixed(1)));
    const newPoints = Math.max(0, (breakpoints[breakpoints.length - 1]?.points ?? 20) - 10);
    setBreakpoints([
      ...breakpoints,
      { minRating: newMin, points: newPoints, label: `${newMin.toFixed(1)} ⭐ Tier` },
    ]);
  };

  const handleRemoveBreakpoint = (index: number) => {
    if (breakpoints.length <= 1) return;
    setBreakpoints(breakpoints.filter((_, i) => i !== index));
  };

  const handleResetBreakpoints = () => {
    setBreakpoints(DEFAULT_BREAKPOINTS);
  };

  const getSimulatedPoints = (rating: number) => {
    const sorted = [...breakpoints].sort((a, b) => b.minRating - a.minRating);
    const matched = sorted.find((bp) => rating >= bp.minRating - 0.05);
    return matched ? { points: matched.points, tier: matched.label || `${matched.minRating} ⭐` } : { points: 0, tier: 'Below lowest tier' };
  };

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSaveMessage(null);

    const sortedBreakpoints = [...breakpoints].sort((a, b) => b.minRating - a.minRating);

    const res = await updateSettings({
      facebookAccountReward: Number(fbAccountReward),
      facebookMilestoneReward: Number(fbMilestoneReward),
      facebookMilestoneStep: Number(fbMilestoneStep),
      defaultDailyCompletionReward: Number(defaultDailyReward),
      ratingBreakpoints: sortedBreakpoints,
      minWithdrawalPoints: Number(minWithdrawalPoints),
      maxWithdrawalPoints: Number(maxWithdrawalPoints),
      withdrawalCycleDays: Number(withdrawalCycleDays),
    });

    if (res.success) {
      setGlobalSaveMessage('Global reward rules and rating breakpoints saved successfully!');
      setTimeout(() => setGlobalSaveMessage(null), 4000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reward & Point Management Center"
      subtitle="Configure global point incentives and daily rating breakpoints for all SMM agents."
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
            onClick={() => setActiveTab('scoring_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'scoring_matrix'
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Rating Breakpoints (e.g. 5★=90, 4.5★=85, 4★=80)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveGlobal} className="space-y-5">
          {globalSaveMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{globalSaveMessage}</span>
            </div>
          )}

          {/* TAB 1: GLOBAL SETTINGS */}
          {activeTab === 'global' && (
            <div className="space-y-4">
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
                    Points awarded immediately after an admin approves an SMM's submitted Facebook profile.
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

                {/* Global Daily Task Base / Max Points */}
                <div className="glass-card rounded-2xl p-4 border border-indigo-500/30 bg-indigo-950/10 space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CalendarCheck className="w-4 h-4" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Global Daily Task Max Reward (5/5 Rating)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Evaluated at 12:00 AM Midnight
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Points are evaluated at 12:00 AM midnight based on the SMM's daily average star rating and matching breakpoints configured in the Breakpoints tab.
                  </p>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      min="0"
                      value={defaultDailyReward}
                      onChange={(e) => setDefaultDailyReward(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-300"
                    />
                    <span className="text-xs font-bold text-slate-400">PTS (Max)</span>
                  </div>
                </div>

                {/* bKash Point Redemption & 7-Day Cycle Configuration */}
                <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 sm:col-span-2">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Coins className="w-4 h-4 text-pink-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      bKash Withdrawal Settings (1 Point = 1 BDT)
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
            </div>
          )}

          {/* TAB 2: RATING BREAKPOINTS */}
          {activeTab === 'scoring_matrix' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs space-y-1.5">
                <div className="font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Rating Breakpoints & Point Distribution Rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetBreakpoints}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset 0.5 Steps
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBreakpoint}
                      className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 px-2.5 py-1 rounded-lg border border-indigo-500/40 font-semibold transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Breakpoint
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Specify the exact points awarded for each star rating breakpoint (e.g. 5.0 ⭐ = 90 PTS, 4.5 ⭐ = 85 PTS, 4.0 ⭐ = 80 PTS). At midnight, the SMM's daily average rating is matched against these break points.
                </p>
              </div>

              {/* Breakpoints Table */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <div className="col-span-3 sm:col-span-3">Rating Threshold (≥ Stars)</div>
                  <div className="col-span-5 sm:col-span-5">Tier Label / Description</div>
                  <div className="col-span-3 sm:col-span-3">Points Awarded</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {breakpoints.map((bp, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-3 items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                    >
                      {/* Rating Threshold */}
                      <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={bp.minRating}
                          onChange={(e) => handleBreakpointChange(idx, 'minRating', Number(e.target.value))}
                          className="w-16 sm:w-20 px-2 py-1 rounded-lg glass-input text-xs font-extrabold text-amber-300 text-center"
                        />
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      </div>

                      {/* Label */}
                      <div className="col-span-5 sm:col-span-5">
                        <input
                          type="text"
                          value={bp.label || ''}
                          onChange={(e) => handleBreakpointChange(idx, 'label', e.target.value)}
                          placeholder="e.g. 4.5 ⭐ (Superior)"
                          className="w-full px-2 py-1 rounded-lg glass-input text-xs text-white"
                        />
                      </div>

                      {/* Points */}
                      <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={bp.points}
                          onChange={(e) => handleBreakpointChange(idx, 'points', Number(e.target.value))}
                          className="w-16 sm:w-20 px-2 py-1 rounded-lg glass-input text-xs font-black text-emerald-300 text-center"
                        />
                        <span className="text-[10px] font-bold text-slate-400">PTS</span>
                      </div>

                      {/* Delete Action */}
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveBreakpoint(idx)}
                          disabled={breakpoints.length <= 1}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove breakpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulator */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-400" /> Breakpoint Test Simulator:
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-semibold">Test Average Score:</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={simulatedRating}
                      onChange={(e) => setSimulatedRating(Number(e.target.value))}
                      className="w-18 px-2 py-1 rounded-lg glass-input text-xs font-black text-amber-300 text-center"
                    />
                    <span className="text-xs font-bold text-amber-400">⭐</span>
                  </div>

                  {(() => {
                    const res = getSimulatedPoints(simulatedRating);
                    return (
                      <div className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-xl text-xs">
                        <span className="text-slate-300">
                          Result for <strong>{simulatedRating} ⭐</strong>:
                        </span>
                        <span className="text-emerald-300 font-black">
                          +{res.points} PTS
                        </span>
                        <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                          {res.tier}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button
              type="submit"
              variant="glow"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Point Settings
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

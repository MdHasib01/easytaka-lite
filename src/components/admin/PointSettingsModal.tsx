import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
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
  Star,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { DailyTaskScoreRules } from '../../types';

interface PointSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  // Score Matrix Form States
  const [score5, setScore5] = useState<number>(100);
  const [score4, setScore4] = useState<number>(80);
  const [score3, setScore3] = useState<number>(60);
  const [score2, setScore2] = useState<number>(40);
  const [score1, setScore1] = useState<number>(20);

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

      const rules = settings.dailyTaskScoreRules;
      if (rules) {
        setScore5(rules.score5Points ?? 100);
        setScore4(rules.score4Points ?? 80);
        setScore3(rules.score3Points ?? 60);
        setScore2(rules.score2Points ?? 40);
        setScore1(rules.score1Points ?? 20);
      } else {
        const max = settings.defaultDailyCompletionReward || 100;
        setScore5(max);
        setScore4(Math.round(max * 0.8));
        setScore3(Math.round(max * 0.6));
        setScore2(Math.round(max * 0.4));
        setScore1(Math.round(max * 0.2));
      }
    }
  }, [settings]);

  // When default daily max reward changes, automatically recalculate score tiers if desired
  const handleMaxDailyChange = (val: number) => {
    const num = Math.max(0, val);
    setDefaultDailyReward(num);
    setScore5(num);
    setScore4(Math.round(num * 0.8));
    setScore3(Math.round(num * 0.6));
    setScore2(Math.round(num * 0.4));
    setScore1(Math.round(num * 0.2));
  };

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSaveMessage(null);

    const res = await updateSettings({
      facebookAccountReward: Number(fbAccountReward),
      facebookMilestoneReward: Number(fbMilestoneReward),
      facebookMilestoneStep: Number(fbMilestoneStep),
      defaultDailyCompletionReward: Number(defaultDailyReward),
      dailyTaskScoreRules: {
        score5Points: Number(score5),
        score4Points: Number(score4),
        score3Points: Number(score3),
        score2Points: Number(score2),
        score1Points: Number(score1),
      },
      minWithdrawalPoints: Number(minWithdrawalPoints),
      maxWithdrawalPoints: Number(maxWithdrawalPoints),
      withdrawalCycleDays: Number(withdrawalCycleDays),
    });

    if (res.success) {
      setGlobalSaveMessage('Global reward and daily scoring settings saved successfully!');
      setTimeout(() => setGlobalSaveMessage(null), 4000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reward & Point Management Center"
      subtitle="Configure global point incentives and daily task review scoring rules for all SMM agents."
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
            <Star className="w-4 h-4 text-amber-400" />
            <span>Daily Review Scoring Matrix (1–5 ⭐)</span>
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
                      Global System
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Maximum daily completion reward for completing daily tasks. When SMMs submit their daily routine, Admins review their work and award points based on their 1–5 review score (e.g. 5/5 = 100 PTS, 4/5 = 80 PTS).
                  </p>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      min="0"
                      value={defaultDailyReward}
                      onChange={(e) => handleMaxDailyChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-emerald-300"
                    />
                    <span className="text-xs font-bold text-slate-400">PTS (Max)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Default: 100 PTS for a perfect 5/5 score. Points scale proportionally across 1–5 ratings.
                  </span>
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

          {/* TAB 2: DAILY REVIEW SCORING MATRIX */}
          {activeTab === 'scoring_matrix' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Global Daily Task Review Scoring System</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  When an SMM completes and submits their daily Facebook tasks, the Admin reviews and rates their work from 1 to 5. Define the points awarded for each score level below:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* 5 Stars */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-300 block">5 / 5 (Excellent)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={score5}
                      onChange={(e) => setScore5(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-center text-xs font-black text-emerald-300"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                  </div>
                </div>

                {/* 4 Stars */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <Star className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="text-xs font-bold text-indigo-300 block">4 / 5 (Very Good)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={score4}
                      onChange={(e) => setScore4(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-center text-xs font-black text-indigo-300"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                  </div>
                </div>

                {/* 3 Stars */}
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    {[4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-slate-600" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-300 block">3 / 5 (Good)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={score3}
                      onChange={(e) => setScore3(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-center text-xs font-black text-amber-300"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                  </div>
                </div>

                {/* 2 Stars */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    {[1, 2].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    {[3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-slate-600" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-300 block">2 / 5 (Average)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={score2}
                      onChange={(e) => setScore2(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-center text-xs font-black text-slate-300"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                  </div>
                </div>

                {/* 1 Star */}
                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {[2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-slate-600" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-rose-300 block">1 / 5 (Poor)</span>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={score1}
                      onChange={(e) => setScore1(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg glass-input text-center text-xs font-black text-rose-300"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">PTS</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">💡 How Admin Review Works:</span>
                <p>
                  1. SMM completes their daily checklist across all Facebook accounts and clicks <strong>"Submit Day's Routine"</strong>.
                </p>
                <p>
                  2. Admin opens <strong>Verification Portal &gt; Daily Routine Reviews</strong> to inspect the comments, replies, story posts, and dynamic tasks.
                </p>
                <p>
                  3. Admin selects a score (e.g. 4/5), and the system automatically pre-fills <strong>{score4} PTS</strong> (or Admin can customize points), writes feedback notes, and approves the submission.
                </p>
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

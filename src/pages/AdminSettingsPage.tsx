import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui/Button';
import { clsx } from 'clsx';
import {
  Mail,
  Lock,
  Server,
  Hash,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Cpu,
  Save,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Coins,
  Gift,
  Star,
  Plus,
  Trash2,
  RotateCcw,
  Calculator,
  Sliders,
  ListChecks,
} from 'lucide-react';
import { RatingBreakpoint } from '../types';
import { MandatoryTasksManager } from '../components/admin/MandatoryTasksManager';

type SettingsTab = 'points' | 'mandatory_tasks' | 'recovery_email' | 'ai_config';
type AiProvider = 'openai' | 'gemini';

const MODEL_OPTIONS: Record<AiProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'o4-mini'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'],
};
const CUSTOM_MODEL_VALUE = '__custom__';

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

const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={clsx(
      'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
      enabled ? 'bg-indigo-600' : 'bg-slate-700'
    )}
  >
    <span
      className={clsx(
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
        enabled && 'translate-x-5'
      )}
    />
  </button>
);

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<SettingsTab>('points');

  // Point & Reward Settings Form State
  const [fbAccountReward, setFbAccountReward] = useState<number>(40);
  const [fbMilestoneReward, setFbMilestoneReward] = useState<number>(100);
  const [fbMilestoneStep, setFbMilestoneStep] = useState<number>(5);
  const [minWithdrawalPoints, setMinWithdrawalPoints] = useState<number>(50);
  const [maxWithdrawalPoints, setMaxWithdrawalPoints] = useState<number>(1000);
  const [withdrawalCycleDays, setWithdrawalCycleDays] = useState<number>(7);
  const [pointsMessage, setPointsMessage] = useState<string | null>(null);

  // Rating Breakpoints state (Primary daily task point system)
  const [breakpoints, setBreakpoints] = useState<RatingBreakpoint[]>(DEFAULT_BREAKPOINTS);
  const [simulatedRating, setSimulatedRating] = useState<number>(4.6);

  // Recovery Email form state
  const [address, setAddress] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [appPasswordSet, setAppPasswordSet] = useState(false);
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [pollIntervalSeconds, setPollIntervalSeconds] = useState(60);
  const [triggerSender, setTriggerSender] = useState('');
  const [recoveryEnabled, setRecoveryEnabled] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // AI Configuration form state
  const [provider, setProvider] = useState<AiProvider>('openai');
  const [model, setModel] = useState('');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchSettings();
  }, [isAdmin]);

  useEffect(() => {
    if (!settings) return;

    // Load Point Settings
    setFbAccountReward(settings.facebookAccountReward ?? 40);
    setFbMilestoneReward(settings.facebookMilestoneReward ?? 100);
    setFbMilestoneStep(settings.facebookMilestoneStep ?? 5);
    setMinWithdrawalPoints(settings.minWithdrawalPoints ?? 50);
    setMaxWithdrawalPoints(settings.maxWithdrawalPoints ?? 1000);
    setWithdrawalCycleDays(settings.withdrawalCycleDays ?? 7);

    // Load Breakpoints (the rating point rules)
    if (settings.ratingBreakpoints && settings.ratingBreakpoints.length > 0) {
      setBreakpoints(
        [...settings.ratingBreakpoints].sort((a, b) => b.minRating - a.minRating)
      );
    } else {
      setBreakpoints(DEFAULT_BREAKPOINTS);
    }

    // Load Recovery Email
    if (settings.recoveryEmailConfig) {
      setAddress(settings.recoveryEmailConfig.address || '');
      setImapHost(settings.recoveryEmailConfig.imapHost || 'imap.gmail.com');
      setImapPort(settings.recoveryEmailConfig.imapPort || 993);
      setPollIntervalSeconds(settings.recoveryEmailConfig.pollIntervalSeconds || 60);
      setTriggerSender(settings.recoveryEmailConfig.triggerSender || '');
      setRecoveryEnabled(Boolean(settings.recoveryEmailConfig.enabled));
      setAppPasswordSet(Boolean(settings.recoveryEmailConfig.appPasswordSet));
    }

    // Load AI Config
    if (settings.aiConfig) {
      const loadedProvider = settings.aiConfig.provider || 'openai';
      const loadedModel = settings.aiConfig.model || '';
      setProvider(loadedProvider);
      setModel(loadedModel);
      setIsCustomModel(Boolean(loadedModel) && !MODEL_OPTIONS[loadedProvider].includes(loadedModel));
      setAiEnabled(Boolean(settings.aiConfig.enabled));
      setApiKeySet(Boolean(settings.aiConfig.apiKeySet));
    }
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-white font-bold">Admins Only</h2>
        <p className="text-xs text-slate-400">This settings page is only available to admin accounts.</p>
      </div>
    );
  }

  // Breakpoint Handlers
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

  const handleSavePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setPointsMessage(null);

    const sortedBreakpoints = [...breakpoints].sort((a, b) => b.minRating - a.minRating);
    const maxRatingPoint = sortedBreakpoints[0]?.points ?? 100;

    const res = await updateSettings({
      facebookAccountReward: Number(fbAccountReward),
      facebookMilestoneReward: Number(fbMilestoneReward),
      facebookMilestoneStep: Number(fbMilestoneStep),
      defaultDailyCompletionReward: maxRatingPoint,
      ratingBreakpoints: sortedBreakpoints,
      minWithdrawalPoints: Number(minWithdrawalPoints),
      maxWithdrawalPoints: Number(maxWithdrawalPoints),
      withdrawalCycleDays: Number(withdrawalCycleDays),
    });

    if (res.success) {
      setPointsMessage('Rating points and reward settings saved successfully!');
      setTimeout(() => setPointsMessage(null), 4000);
    }
  };

  const handleSaveRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    const res = await updateSettings({
      recoveryEmailConfig: {
        address: address.trim(),
        ...(appPassword.trim() ? { appPassword: appPassword.trim() } : {}),
        imapHost: imapHost.trim() || 'imap.gmail.com',
        imapPort: Number(imapPort) || 993,
        enabled: recoveryEnabled,
        pollIntervalSeconds: Number(pollIntervalSeconds) || 60,
        triggerSender: triggerSender.trim(),
      },
    });

    if (res.success) {
      setAppPassword('');
      setRecoveryMessage('Recovery email settings saved successfully!');
      setTimeout(() => setRecoveryMessage(null), 4000);
    }
  };

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiMessage(null);

    const res = await updateSettings({
      aiConfig: {
        provider,
        model: model.trim(),
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        enabled: aiEnabled,
      },
    });

    if (res.success) {
      setApiKey('');
      setAiMessage('AI configuration saved successfully!');
      setTimeout(() => setAiMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure daily task review rating points (e.g. 5★=90, 4.5★=85, 4★=80), account bonuses, OTP mailbox watcher, and AI configuration.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('points')}
          className={clsx(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'points'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Point & Rating Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('mandatory_tasks')}
          className={clsx(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'mandatory_tasks'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <ListChecks className="w-4 h-4 text-emerald-400" />
          <span>Mandatory Checklist & Groups</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery_email')}
          className={clsx(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'recovery_email'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Mail className="w-4 h-4 text-indigo-400" />
          <span>Recovery Email</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_config')}
          className={clsx(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'ai_config'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Configuration</span>
        </button>
      </div>

      {/* TAB 1: POINT & RATING BREAKPOINT SETTINGS */}
      {activeTab === 'points' && (
        <form onSubmit={handleSavePoints} className="space-y-6">
          {pointsMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pointsMessage}</span>
            </div>
          )}

          {/* 1. DAILY TASK RATING POINTS (BREAKPOINTS) */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Daily Task Rating Points & Breakpoints</span>
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
                Specify the exact reward points awarded for each star rating breakpoint (e.g. 5.0 ⭐ = 90 PTS, 4.5 ⭐ = 85 PTS, 4.0 ⭐ = 80 PTS). At 12:00 AM midnight, the SMM's daily average review rating determines the points they receive.
              </p>
            </div>

            {/* Breakpoints Table */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                <div className="col-span-3 sm:col-span-3">Rating Threshold (≥ Stars)</div>
                <div className="col-span-5 sm:col-span-5">Tier Label / Description</div>
                <div className="col-span-3 sm:col-span-3">Points Awarded</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="space-y-2.5">
                {breakpoints.map((bp, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
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
                        className="w-18 sm:w-20 px-2.5 py-1.5 rounded-lg glass-input text-xs font-extrabold text-amber-300 text-center"
                      />
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                    </div>

                    {/* Label */}
                    <div className="col-span-5 sm:col-span-5">
                      <input
                        type="text"
                        value={bp.label || ''}
                        onChange={(e) => handleBreakpointChange(idx, 'label', e.target.value)}
                        placeholder="e.g. 4.5 ⭐ (Superior)"
                        className="w-full px-2.5 py-1.5 rounded-lg glass-input text-xs text-white"
                      />
                    </div>

                    {/* Points */}
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={bp.points}
                        onChange={(e) => handleBreakpointChange(idx, 'points', Number(e.target.value))}
                        className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg glass-input text-xs font-black text-emerald-300 text-center"
                      />
                      <span className="text-[11px] font-bold text-slate-400">PTS</span>
                    </div>

                    {/* Delete Action */}
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveBreakpoint(idx)}
                        disabled={breakpoints.length <= 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove breakpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Breakpoint Simulator */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" /> Breakpoint Test Simulator:
                </span>
                <span className="text-[11px] text-slate-400">
                  Live testing how average ratings evaluate to reward points
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold">Test Average Score:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={simulatedRating}
                    onChange={(e) => setSimulatedRating(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-lg glass-input text-xs font-black text-amber-300 text-center"
                  />
                  <span className="text-xs font-bold text-amber-400">⭐</span>
                </div>

                {(() => {
                  const res = getSimulatedPoints(simulatedRating);
                  return (
                    <div className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl text-xs">
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

          {/* 2. FACEBOOK ACCOUNT & MILESTONE REWARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facebook Account Approval Reward */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Coins className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Facebook Account Approval Reward
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
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
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-pink-400">
                <Gift className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Account Milestone Bonus
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Extra gamified bonus points awarded automatically every time an SMM reaches the milestone target.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Bonus Points</label>
                  <input
                    type="number"
                    min="0"
                    value={fbMilestoneReward}
                    onChange={(e) => setFbMilestoneReward(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-bold text-amber-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Every (Accounts)</label>
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

            {/* bKash Point Redemption Settings */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 sm:col-span-2">
              <div className="flex items-center gap-2 text-pink-400">
                <Coins className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  bKash Withdrawal Settings (1 Point = 1 BDT)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Configure minimum points required per withdrawal and the recurring join & work cycle interval (default 7 days).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Min Withdrawal (PTS)</label>
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
                  <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Cycle Interval (Days)</label>
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
            <Button type="submit" variant="glow" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Save Point & Rating Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: RECOVERY EMAIL */}
      {activeTab === 'recovery_email' && (
        <form onSubmit={handleSaveRecoveryEmail} className="space-y-5">
          {recoveryMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{recoveryMessage}</span>
            </div>
          )}

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Mail className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mailbox Watcher</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {recoveryEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Toggle enabled={recoveryEnabled} onChange={setRecoveryEnabled} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              The mailbox registered with Facebook as the recovery email for team accounts. When enabled, this inbox
              is polled for new mail and checked for OTP verification codes.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Recovery Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="admin.recovery@gmail.com"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Mail className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                App Password{' '}
                <span className="text-slate-500 font-normal">
                  {appPasswordSet ? '(configured — enter a new value to replace it)' : '(e.g. Gmail App Password)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showAppPassword ? 'text' : 'password'}
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder={appPasswordSet ? '•••• •••• •••• ••••' : 'Enter 16-char app password'}
                  className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowAppPassword(!showAppPassword)}
                  className="text-slate-400 hover:text-white absolute right-3 top-3 p-0.5"
                >
                  {showAppPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">IMAP Host</label>
                <div className="relative">
                  <input
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    placeholder="imap.gmail.com"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white"
                  />
                  <Server className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">IMAP Port (SSL)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.target.value))}
                    placeholder="993"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white"
                  />
                  <Hash className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Poll Interval (seconds)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={pollIntervalSeconds}
                    onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
                    placeholder="60"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white"
                  />
                  <Clock className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Sender Filter <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={triggerSender}
                    onChange={(e) => setTriggerSender(e.target.value)}
                    placeholder="security@facebookmail.com"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                  />
                  <Mail className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="glow" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Save Recovery Email
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: AI CONFIGURATION */}
      {activeTab === 'ai_config' && (
        <form onSubmit={handleSaveAiConfig} className="space-y-5">
          {aiMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{aiMessage}</span>
            </div>
          )}

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Classification</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">{aiEnabled ? 'Enabled' : 'Disabled'}</span>
                <Toggle enabled={aiEnabled} onChange={setAiEnabled} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              When enabled, incoming emails matching the watcher are passed to the configured AI model to extract OTPs
              and classify the message type.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('openai');
                    setModel(MODEL_OPTIONS.openai[0]);
                    setIsCustomModel(false);
                  }}
                  className={clsx(
                    'p-3 rounded-xl border text-left transition-all',
                    provider === 'openai'
                      ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-glow-brand'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  )}
                >
                  <div className="font-bold text-sm">OpenAI</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">GPT-4o, GPT-4.1-mini, etc.</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProvider('gemini');
                    setModel(MODEL_OPTIONS.gemini[0]);
                    setIsCustomModel(false);
                  }}
                  className={clsx(
                    'p-3 rounded-xl border text-left transition-all',
                    provider === 'gemini'
                      ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-glow-brand'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  )}
                >
                  <div className="font-bold text-sm">Google Gemini</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Gemini 2.5 Flash, 2.0, etc.</div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Model</label>
              <div className="relative">
                <select
                  value={isCustomModel ? CUSTOM_MODEL_VALUE : model}
                  onChange={(e) => {
                    if (e.target.value === CUSTOM_MODEL_VALUE) {
                      setIsCustomModel(true);
                      setModel('');
                    } else {
                      setIsCustomModel(false);
                      setModel(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 pl-9 pr-9 rounded-xl glass-input text-sm text-white appearance-none"
                >
                  <option value="" disabled>
                    Select a model
                  </option>
                  {MODEL_OPTIONS[provider].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value={CUSTOM_MODEL_VALUE}>Custom…</option>
                </select>
                <Cpu className="w-4 h-4 text-indigo-400 absolute left-3 top-3 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              {isCustomModel && (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Enter a custom model id"
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                  autoFocus
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                API Key{' '}
                <span className="text-slate-500 font-normal">
                  {apiKeySet ? '(configured — enter a new value to replace it)' : ''}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={apiKeySet ? '•••• •••• •••• ••••' : 'Enter provider API key'}
                  className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-400 hover:text-white absolute right-3 top-3 p-0.5"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="glow" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Save AI Configuration
            </Button>
          </div>
        </form>
      )}

      {/* TAB 4: MANDATORY DAILY CHECKLIST & GROUPS */}
      {activeTab === 'mandatory_tasks' && <MandatoryTasksManager />}
    </div>
  );
};

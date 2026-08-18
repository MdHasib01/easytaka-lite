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
  Filter,
} from 'lucide-react';

type SettingsTab = 'recovery_email' | 'ai_config';
type AiProvider = 'openai' | 'gemini';

// Current model options per provider, kept short-listed to the fast/cheap models
// suited for this task (classifying a single short email). "Custom" covers
// anything newer that isn't listed yet.
const MODEL_OPTIONS: Record<AiProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'o4-mini'],
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'],
};
const CUSTOM_MODEL_VALUE = '__custom__';

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

  const [activeTab, setActiveTab] = useState<SettingsTab>('recovery_email');

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
    if (settings.recoveryEmailConfig) {
      setAddress(settings.recoveryEmailConfig.address || '');
      setImapHost(settings.recoveryEmailConfig.imapHost || 'imap.gmail.com');
      setImapPort(settings.recoveryEmailConfig.imapPort || 993);
      setPollIntervalSeconds(settings.recoveryEmailConfig.pollIntervalSeconds || 60);
      setTriggerSender(settings.recoveryEmailConfig.triggerSender || '');
      setRecoveryEnabled(Boolean(settings.recoveryEmailConfig.enabled));
      setAppPasswordSet(Boolean(settings.recoveryEmailConfig.appPasswordSet));
    }
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
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure the recovery-email inbox watcher and the AI provider used to read Facebook OTP mail.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('recovery_email')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'recovery_email'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Mail className="w-4 h-4" />
          <span>Recovery Email</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_config')}
          className={clsx(
            'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
            activeTab === 'ai_config'
              ? 'bg-indigo-600 text-white shadow-glow-brand'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Configuration</span>
        </button>
      </div>

      {/* TAB 1: RECOVERY EMAIL */}
      {activeTab === 'recovery_email' && (
        <form onSubmit={handleSaveRecoveryEmail} className="space-y-5">
          {recoveryMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{recoveryMessage}</span>
            </div>
          )}

          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
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
                  placeholder={appPasswordSet ? '•••• •••• •••• ••••' : 'Enter mailbox app password'}
                  className="w-full px-3.5 py-2.5 pl-9 pr-10 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowAppPassword(!showAppPassword)}
                  className="text-slate-400 hover:text-white absolute right-3 top-3 p-0.5"
                >
                  {showAppPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Trigger Sender{' '}
                <span className="text-slate-500 font-normal">(matched by sender name only, not the email address)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={triggerSender}
                  onChange={(e) => setTriggerSender(e.target.value)}
                  placeholder="Facebook <notification@facebook.com>"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <Filter className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Only the name before "&lt;" is used to match — e.g. entering "Facebook" (or pasting the full "Facebook
                &lt;notification@facebook.com&gt;") both just check that "Facebook" appears in the sender. Leave blank
                to fall back to a generic Facebook/Meta sender match.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">IMAP Host</label>
                <div className="relative">
                  <input
                    type="text"
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    className="w-full px-3 py-2 pl-8 rounded-xl glass-input text-xs font-semibold text-white"
                  />
                  <Server className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">IMAP Port</label>
                <div className="relative">
                  <input
                    type="number"
                    value={imapPort}
                    onChange={(e) => setImapPort(Number(e.target.value))}
                    className="w-full px-3 py-2 pl-8 rounded-xl glass-input text-xs font-semibold text-white"
                  />
                  <Hash className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Poll Interval (sec)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={30}
                    value={pollIntervalSeconds}
                    onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 pl-8 rounded-xl glass-input text-xs font-semibold text-white"
                  />
                  <Clock className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="glow" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Save Recovery Email Settings
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: AI CONFIGURATION */}
      {activeTab === 'ai_config' && (
        <form onSubmit={handleSaveAiConfig} className="space-y-5">
          {aiMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{aiMessage}</span>
            </div>
          )}

          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Email Analysis</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">{aiEnabled ? 'Enabled' : 'Disabled'}</span>
                <Toggle enabled={aiEnabled} onChange={setAiEnabled} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              The AI model used to read incoming Facebook mail and decide whether it contains a recovery-email OTP
              code.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProvider('openai');
                    setModel('');
                    setIsCustomModel(false);
                  }}
                  className={clsx(
                    'px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                    provider === 'openai'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'glass-input text-slate-300 border-slate-700 hover:border-slate-600'
                  )}
                >
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvider('gemini');
                    setModel('');
                    setIsCustomModel(false);
                  }}
                  className={clsx(
                    'px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors',
                    provider === 'gemini'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'glass-input text-slate-300 border-slate-700 hover:border-slate-600'
                  )}
                >
                  Gemini
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
    </div>
  );
};

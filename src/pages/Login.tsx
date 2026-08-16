import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Button } from '../components/ui/Button';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Top language toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-glow-brand mb-2">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 text-2xl font-sans">
                ET
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">EsyTaka Lite</h1>
          <p className="text-xs text-slate-400">
            Facebook Media Manager, Daily Routines & Task Verification Hub
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address / ইমেইল ঠিকানা
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@esytaka.com"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm font-medium"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password / পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-glow-brand font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In / সাইন ইন করুন
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">
            🔒 Account registration is by <strong>Admin invitation only</strong>.
          </p>
          <p className="text-[11px] text-slate-500">
            Check your email for your private onboarding link or contact your team administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  };

  const handleDemo = async (role: 'admin' | 'smm') => {
    const success = await demoLogin(role);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-glow-brand mb-2">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 text-2xl">
                ET
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">EsyTaka Lite</h1>
          <p className="text-xs text-slate-400">
            Facebook Media Manager, Daily Routines & Task Verification Hub
          </p>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Quick 1-Click Demo Login:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleDemo('admin')}
              leftIcon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
              className="text-xs border-indigo-500/30 hover:border-indigo-500/60"
            >
              Demo Admin
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleDemo('smm')}
              leftIcon={<UserCheck className="w-4 h-4 text-emerald-400" />}
              className="text-xs border-emerald-500/30 hover:border-emerald-500/60"
            >
              Demo SMM
            </Button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@esytaka.com"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
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
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-glow-brand"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Workspace
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/80">
          <span>🔒 Account registration is by <strong>Admin invitation only</strong>.</span>
          <p className="text-[11px] text-slate-500 mt-1">
            Check your email for your private onboarding link or contact an administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6 text-center">
        <div className="flex items-center justify-center mb-1">
          <img
            src="/assets/logo.png"
            alt="EsyTaka Lite"
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Registration by Invitation Only
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Public self-signup is disabled on <strong>EsyTaka Lite</strong>. All Social Media Marketer
            (SMM) accounts are provisioned exclusively through official administrator invitations.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Mail className="w-4 h-4" />
            <span>Already received an invitation?</span>
          </div>
          <p className="text-slate-400">
            Please check your inbox for an invitation email from <strong>Milkimom / EsyTaka</strong> and
            click the personalized setup link to complete your onboarding and upload your National ID.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/login">
            <Button
              variant="glow"
              size="lg"
              className="w-full shadow-glow-brand"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { CloudinaryUploader } from '../components/ui/CloudinaryUploader';
import { Modal } from '../components/ui/Modal';
import {
  ShieldCheck,
  User,
  Phone,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Building,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';

export const SetupAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  // Token validation state
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string>('');

  // Step state (1: Info & Photo, 2: NID & Terms, 3: Under Verification)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 Form fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Step 2 Form fields
  const [nidFront, setNidFront] = useState<string>('');
  const [nidBack, setNidBack] = useState<string>('');
  const [nidNumber, setNidNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Verify invitation token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenError('No invitation token was provided in the link. Please check your invitation email.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await api.get(`/auth/invitation/${token}`);
        if (response.data.success) {
          setInvitedEmail(response.data.email);
        } else {
          setTokenError(response.data.message || 'Invalid or expired invitation link.');
        }
      } catch (err: any) {
        setTokenError(
          err.response?.data?.message ||
            'This invitation link is invalid, has expired, or has already been used.'
        );
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token]);

  // Handle Step 1 -> Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setCurrentStep(2);
  };

  // Handle Step 2 -> Submit Onboarding
  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nidFront || !nidBack) {
      setFormError('Both Front and Back images of your National ID card are strictly required.');
      return;
    }

    if (!termsAgreed) {
      setFormError('You must agree to the Terms & Conditions and Verification Policies.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        token,
        name: name.trim(),
        phone: phone.trim(),
        password,
        avatar: avatarUrl,
        nidFront,
        nidBack,
        nidNumber: nidNumber.trim(),
        address: address.trim(),
        termsAgreed: true,
      };

      const response = await api.post('/auth/complete-onboarding', payload);

      if (response.data.success) {
        setCurrentStep(3);
      } else {
        setFormError(response.data.message || 'Failed to submit onboarding.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state during token validation
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Validating Invitation...</h2>
          <p className="text-xs text-slate-400">Verifying secure onboarding access credentials.</p>
        </div>
      </div>
    );
  }

  // Token Error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">Invalid Invitation</h2>
            <p className="text-xs text-rose-300">{tokenError}</p>
          </div>
          <p className="text-xs text-slate-400">
            Please ask your administrator to send you a fresh invitation link to join EsyTaka Lite.
          </p>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-glow-brand mb-1">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 text-2xl">
                ET
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SMM Agent Account Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Complete your profile and upload National ID for administrator verification.
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 text-xs">
          <div
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all ${
              currentStep === 1
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : currentStep > 1
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-500'
            }`}
          >
            {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : <span>1</span>}
            <span className="truncate">Profile Info</span>
          </div>

          <div
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all ${
              currentStep === 2
                ? 'bg-indigo-600 text-white shadow-glow-brand'
                : currentStep > 2
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-500'
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : <span>2</span>}
            <span className="truncate">National ID</span>
          </div>

          <div
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all ${
              currentStep === 3
                ? 'bg-amber-500 text-slate-950 font-black shadow-glow-brand'
                : 'text-slate-500'
            }`}
          >
            <span>3</span>
            <span className="truncate">Verification</span>
          </div>
        </div>

        {/* Form Errors */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Personal Info & Photo */}
        {currentStep === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Invited Email:</span>
              <span className="text-indigo-300 font-bold">{invitedEmail}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1700 000000"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Create Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 pl-9 pr-9 rounded-xl glass-input text-sm"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white absolute right-3 top-3"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Profile Photo Uploader */}
            <div className="pt-2">
              <CloudinaryUploader
                label="Profile Picture / Avatar (Optional)"
                defaultUrl={avatarUrl}
                onUploadSuccess={(url) => setAvatarUrl(url)}
              />
            </div>

            <div className="pt-4 flex items-center justify-end">
              <Button
                type="submit"
                variant="glow"
                size="lg"
                className="w-full sm:w-auto shadow-glow-brand"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: National ID Verification
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: National ID Dual-Sided & Legal Terms */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmitOnboarding} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Identity Verification Requirement</span>
                Please upload clear, legible photos of both sides of your National ID (NID) card.
                This ensures workspace compliance and secures your payout account.
              </div>
            </div>

            {/* NID Front and Back Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <CloudinaryUploader
                  label="National ID Card — Front Side"
                  required
                  defaultUrl={nidFront}
                  onUploadSuccess={(url) => setNidFront(url)}
                />
              </div>

              <div className="space-y-1">
                <CloudinaryUploader
                  label="National ID Card — Back Side"
                  required
                  defaultUrl={nidBack}
                  onUploadSuccess={(url) => setNidBack(url)}
                />
              </div>
            </div>

            {/* NID Number & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  National ID / Smart Card Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    placeholder="e.g. 5928193821092"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Present Residential Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, District, Country"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Terms and Conditions Agreement */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                  required
                />
                <div className="text-xs text-slate-300">
                  <span>I agree to the </span>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-indigo-400 font-bold underline hover:text-indigo-300 inline"
                  >
                    Terms & Conditions and SMM Workplace Policies
                  </button>
                  <span>
                    . I certify that the uploaded National ID documents and information provided are
                    truthful and belong to me.
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Profile
              </Button>

              <Button
                type="submit"
                variant="glow"
                size="lg"
                isLoading={isSubmitting}
                className="shadow-glow-brand"
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Submit for Admin Verification
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: Verification Submitted Screen */}
        {currentStep === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-glow-brand">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-extrabold text-white">
                Account Submitted for Verification!
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you for completing your registration, <strong>{name}</strong>. Your profile
                details and National ID documents have been submitted securely to our Administrator
                team.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto space-y-2 text-left">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>What happens next?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>An administrator will inspect and verify your National ID.</li>
                <li>You will receive an email confirmation once your account is activated.</li>
                <li>After approval, log in with your email and chosen password to access tasks.</li>
              </ul>
            </div>

            <div className="pt-4 max-w-xs mx-auto">
              <Link to="/login">
                <Button variant="glow" size="lg" className="w-full shadow-glow-brand">
                  Go to Sign In Page
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms & Conditions & SMM Policies"
        subtitle="EsyTaka Lite Workplace Identity and Activity Compliance Guidelines"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300 max-h-96 overflow-y-auto pr-2">
          <div>
            <h4 className="font-bold text-white mb-1">1. Identity Verification</h4>
            <p className="text-slate-400 leading-relaxed">
              All Social Media Marketers (SMMs) on EsyTaka Lite must provide authentic government-issued
              identification (National ID / Smart Card) to ensure authentic task operations and prevent
              fraudulent submissions.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">2. Data Privacy & Document Security</h4>
            <p className="text-slate-400 leading-relaxed">
              Your National ID documents are stored encrypted in secure cloud storage accessible only by
              verified system administrators for the purpose of identity validation.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">3. Task Integrity & Fair Operations</h4>
            <p className="text-slate-400 leading-relaxed">
              SMM agents agree to perform Facebook media tasks according to specified rules and guidelines.
              Submission of fake proofs or forged documents will result in permanent account suspension.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1">4. Reward Points & Payouts</h4>
            <p className="text-slate-400 leading-relaxed">
              Points earned through approved daily routines and verified task submissions are credited to
              your account balance once verified by an administrator.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            variant="glow"
            size="sm"
            onClick={() => {
              setTermsAgreed(true);
              setTermsModalOpen(false);
            }}
          >
            I Understand & Agree
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SetupAccount;

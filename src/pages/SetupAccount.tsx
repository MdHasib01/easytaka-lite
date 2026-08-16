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
  Image as ImageIcon,
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

  // Step 2 Form fields (NID front/back images only)
  const [nidFront, setNidFront] = useState<string>('');
  const [nidBack, setNidBack] = useState<string>('');
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
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Validating Invitation Link</h2>
          <p className="text-xs text-slate-400">
            Please wait while we verify your personalized onboarding token...
          </p>
        </div>
      </div>
    );
  }

  // Error state if token is invalid or expired
  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Invalid or Expired Link</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{tokenError}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 text-left">
            <span className="font-semibold text-slate-300 block mb-1">What should you do?</span>
            Please contact your administrator to request a new invitation email.
          </div>
          <Link to="/login">
            <Button variant="secondary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/assets/logo.png"
              alt="EsyTaka Lite"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
            />
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

        {/* Form Error Banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: Basic Profile, Phone & Password */}
        {currentStep === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="text-slate-300 font-semibold block">Invited Email Address:</span>
              <span className="font-mono text-indigo-300 font-bold">{invitedEmail}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name / পুরো নাম <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Khan"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Mobile Number / মোবাইল নম্বর (Optional / bKash)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password and Confirm Password */}
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
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 pl-9 pr-9 rounded-xl glass-input text-sm"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
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
                    placeholder="Re-enter password"
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

        {/* STEP 2: National ID Dual-Sided Images & Legal Terms */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmitOnboarding} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Identity Verification Requirement</span>
                Please upload clear photos of both Front and Back sides of your National ID (NID) card.
                NID number input is not required — only clear front & back photos.
              </div>
            </div>

            {/* NID Example Previews Guide */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Example National ID Format:
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Reference sample</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1 flex items-center justify-center">
                    <img
                      src="/assets/nid-front.png"
                      alt="Sample NID Front"
                      className="w-full h-32 object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-center block text-slate-300">
                    Sample: NID Front Side (সামনের দিক)
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1 flex items-center justify-center">
                    <img
                      src="/assets/nid-back.png"
                      alt="Sample NID Back"
                      className="w-full h-32 object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-center block text-slate-300">
                    Sample: NID Back Side (পিছনের দিক)
                  </span>
                </div>
              </div>
            </div>

            {/* NID Front and Back Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <CloudinaryUploader
                  label="Upload Your National ID — Front Side"
                  required
                  defaultUrl={nidFront}
                  onUploadSuccess={(url) => setNidFront(url)}
                />
              </div>

              <div className="space-y-1">
                <CloudinaryUploader
                  label="Upload Your National ID — Back Side"
                  required
                  defaultUrl={nidBack}
                  onUploadSuccess={(url) => setNidBack(url)}
                />
              </div>
            </div>

            {/* Residential Address Details */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Present Residential Address (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, District, Bangladesh"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl glass-input text-sm"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-brand animate-in zoom-in">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Application Submitted Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Your profile and National ID documents have been submitted to the administration
                team for verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 text-left space-y-2 max-w-md mx-auto">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Account Status: Pending Review</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Our administrators usually review and approve SMM accounts within a few hours. Once
                approved, you can sign in with your email and password to start tasks and earn points.
              </p>
            </div>

            <div className="pt-2 max-w-xs mx-auto">
              <Link to="/login">
                <Button variant="glow" size="lg" className="w-full shadow-glow-brand">
                  Go to Sign In
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
        title="Terms & Conditions and SMM Workplace Policies"
        subtitle="Please review our operational standards and verification rules."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">1. Identity Verification</h4>
            <p className="text-slate-400">
              All SMM candidates must submit genuine, unaltered National ID (NID) photos. Accounts
              found with fraudulent or forged documents will be permanently blacklisted.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">2. Task Integrity & Verification</h4>
            <p className="text-slate-400">
              Facebook profile submissions, post engagements, and routine task executions must
              strictly comply with the provided guidelines.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">3. Reward Points & Payouts</h4>
            <p className="text-slate-400">
              Reward points are earned through completed and verified tasks. Payout redemptions to
              bKash are subject to a 7-day recurring cycle from your join date and work activity.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SetupAccount;

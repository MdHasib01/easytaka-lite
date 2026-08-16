import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ImageLightbox } from '../ui/ImageLightbox';
import { User } from '../../types';
import api from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ZoomIn,
  CreditCard,
  Building,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Send,
  RefreshCw,
} from 'lucide-react';

interface SmmVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  smm: User | null;
  onVerificationComplete: () => void;
}

export const SmmVerificationModal: React.FC<SmmVerificationModalProps> = ({
  isOpen,
  onClose,
  smm,
  onVerificationComplete,
}) => {
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!smm) return null;

  const handleVerify = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    setFeedback(null);

    try {
      const response = await api.post(`/auth/verify-smm/${smm._id || smm.id}`, {
        action,
        rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
      });

      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: response.data.message || `SMM ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
        });
        onVerificationComplete();
        setTimeout(() => {
          onClose();
          setShowRejectInput(false);
          setRejectionReason('');
          setFeedback(null);
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Verification update failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendInvite = async () => {
    setIsProcessing(true);
    setFeedback(null);

    try {
      const response = await api.post(`/auth/resend-invite/${smm._id || smm.id}`);
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `Invitation email resent to ${smm.email}`,
        });
        onVerificationComplete();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to resend invitation.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending = smm.status === 'pending_verification';
  const isInvited = smm.status === 'invited';
  const isActive = smm.status === 'active';
  const isRejected = smm.status === 'rejected';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="SMM Identity & Document Verification"
        subtitle={`Review registration details and National ID cards for ${smm.name || smm.email}`}
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Applicant Header Profile Info */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {smm.avatar ? (
                <img
                  src={smm.avatar}
                  alt={smm.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xl flex items-center justify-center">
                  {(smm.name || smm.email).charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-lg">{smm.name || 'Invited Applicant'}</h3>
                  <Badge variant={smm.status as any}>
                    {smm.status === 'pending_verification'
                      ? 'PENDING REVIEW'
                      : smm.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {smm.email}
                  </span>
                  {smm.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {smm.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              <span className="block font-semibold text-slate-300">
                {smm.verificationSubmittedAt ? 'Submitted:' : 'Created:'}
              </span>
              <span>
                {new Date(smm.verificationSubmittedAt || smm.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* National ID Document Inspection Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-400" /> National ID (NID) Documents
              </h4>
              {smm.nidNumber && (
                <span className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  NID No: {smm.nidNumber}
                </span>
              )}
            </div>

            {smm.nidFront || smm.nidBack ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    National ID — Front Side
                  </span>
                  {smm.nidFront ? (
                    <div
                      onClick={() => setSelectedLightboxImg(smm.nidFront!)}
                      className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-40 cursor-pointer shadow-md"
                    >
                      <img
                        src={smm.nidFront}
                        alt="NID Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ZoomIn className="w-4 h-4" /> Click to Zoom Document
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
                      No front side uploaded
                    </div>
                  )}
                </div>

                {/* Back Side */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    National ID — Back Side
                  </span>
                  {smm.nidBack ? (
                    <div
                      onClick={() => setSelectedLightboxImg(smm.nidBack!)}
                      className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-40 cursor-pointer shadow-md"
                    >
                      <img
                        src={smm.nidBack}
                        alt="NID Back"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <ZoomIn className="w-4 h-4" /> Click to Zoom Document
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
                      No back side uploaded
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="font-semibold text-white">No National ID Documents Uploaded Yet</p>
                <p className="text-slate-500">
                  The SMM has not submitted their profile and documents through the onboarding link.
                </p>
              </div>
            )}
          </div>

          {/* Address & Terms Metadata */}
          {smm.address && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <Building className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-semibold block">Residential Address:</span>
                <span>{smm.address}</span>
              </div>
            </div>
          )}

          {smm.termsAgreed && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Agreed to Terms & Conditions and Workplace Policies on{' '}
                {smm.termsAgreedAt ? new Date(smm.termsAgreedAt).toLocaleString() : 'Submission'}
              </span>
            </div>
          )}

          {/* Rejection Feedback if previously rejected */}
          {smm.rejectionReason && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
              <span className="font-bold block">Previous Rejection Feedback:</span>
              <p>{smm.rejectionReason}</p>
            </div>
          )}

          {/* Rejection Reason Input field */}
          {showRejectInput && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <label className="text-xs font-semibold text-rose-300 block">
                Reason for Rejection (Will be emailed to the SMM candidate)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. The uploaded National ID back photo is blurry or unreadable. Please provide a clear scan."
                rows={3}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectInput(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={() => handleVerify('reject')}
                  leftIcon={<XCircle className="w-3.5 h-3.5" />}
                >
                  Confirm Rejection & Send Email
                </Button>
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>

            <div className="flex items-center gap-2">
              {isInvited && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={isProcessing}
                  onClick={handleResendInvite}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Resend Invitation Email
                </Button>
              )}

              {!showRejectInput && (
                <>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setShowRejectInput(true)}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Reject Application
                  </Button>

                  <Button
                    type="button"
                    variant="glow"
                    size="sm"
                    isLoading={isProcessing}
                    onClick={() => handleVerify('approve')}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="shadow-glow-brand"
                  >
                    Approve SMM & Activate Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Lightbox for zooming NID documents */}
      <ImageLightbox
        isOpen={!!selectedLightboxImg}
        onClose={() => setSelectedLightboxImg(null)}
        imageUrl={selectedLightboxImg || ''}
      />
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { VerificationCard } from '../components/tasks/VerificationCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  ExternalLink,
  ZoomIn,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { TaskSubmission, Task, User, FacebookAccount } from '../types';

export const VerificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { submissions, mySubmissions, fetchSubmissions, fetchMySubmissions, verifySubmission, isLoading } =
    useTaskStore();

  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions(statusFilter);
    } else {
      fetchMySubmissions();
    }
  }, [isAdmin, statusFilter]);

  const listToRender = isAdmin ? submissions : mySubmissions;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAdmin ? 'Task Verification & Approval Portal' : 'My Proof Submissions'}
            </h1>
            {isAdmin && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {submissions.filter((s) => s.status === 'pending').length} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Verify SMM task submissions, inspect screenshot proofs, approve with reward points, or cancel with feedback notes.'
              : 'Track your submitted task proofs, approval status, admin feedback, and earned points.'}
          </p>
        </div>
      </div>

      {/* Admin Status Filter Tabs */}
      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'pending', label: 'Pending Review', count: submissions.filter((s) => s.status === 'pending').length },
            { id: 'approved', label: 'Approved & Rewarded' },
            { id: 'rejected', label: 'Rejected / Revision' },
            { id: 'all', label: 'All Submissions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Verification List for Admin */}
      {isAdmin ? (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Submissions in this Filter</h3>
              <p className="text-xs text-slate-400">
                Switch filters above to inspect past approved or rejected tasks.
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <VerificationCard key={sub._id} submission={sub} onVerify={verifySubmission} />
            ))
          )}
        </div>
      ) : (
        /* SMM Submission History View */
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-slate-800 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Task Submissions Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Go to the Tasks Hub, pick a Facebook assignment, and submit your proof!
              </p>
            </div>
          ) : (
            mySubmissions.map((sub) => {
              const task = sub.taskId as Task;
              const isApproved = sub.status === 'approved';
              const isRejected = sub.status === 'rejected';

              return (
                <div
                  key={sub._id}
                  className={`glass-card rounded-2xl p-5 border space-y-3 ${
                    isApproved
                      ? 'border-emerald-500/30 bg-emerald-950/5'
                      : isRejected
                      ? 'border-rose-500/30 bg-rose-950/5'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {task?.title || 'Facebook Task'}
                        </h4>
                        <Badge variant={sub.status as any}>{sub.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted: {new Date(sub.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {isApproved ? (
                        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-400" />
                          <span>+{sub.pointsAwarded || task?.rewardPoints} Pts Credited</span>
                        </div>
                      ) : (
                        <div className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{task?.rewardPoints || 50} Pts Reward</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Links & Screenshot Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-2">
                      {sub.profileUrl && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-400 font-semibold">Proof Link:</span>
                          <a
                            href={sub.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{sub.profileUrl}</span>
                          </a>
                        </div>
                      )}

                      {sub.smmNotes && (
                        <div className="text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 font-semibold block mb-0.5">My Notes:</span>
                          <p>{sub.smmNotes}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      {sub.screenshotUrl ? (
                        <div
                          onClick={() => setSelectedLightboxImg(sub.screenshotUrl)}
                          className="relative group rounded-xl overflow-hidden border border-slate-700 h-28 cursor-pointer"
                        >
                          <img
                            src={sub.screenshotUrl}
                            alt="Screenshot Proof"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <ZoomIn className="w-4 h-4" /> Zoom Screenshot
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex items-center justify-center text-xs text-slate-500">
                          No screenshot attached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Feedback Box */}
                  {sub.adminNote && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        isRejected
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">
                          {isRejected ? 'Cancellation Feedback / Revision Note:' : 'Admin Note:'}
                        </span>
                        <p className="mt-0.5">{sub.adminNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        isOpen={!!selectedLightboxImg}
        onClose={() => setSelectedLightboxImg(null)}
        imageUrl={selectedLightboxImg || ''}
      />
    </div>
  );
};

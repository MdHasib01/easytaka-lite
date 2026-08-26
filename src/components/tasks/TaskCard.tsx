import React from 'react';
import { Task, UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LinkPreview } from '../ui/LinkPreview';
import {
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  Link as LinkIcon,
  Trash2,
  Edit,
  ArrowRight,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  userRole: UserRole;
  onSubmitProof?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onViewSubmissions?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  userRole,
  onSubmitProof,
  onEdit,
  onDelete,
  onViewSubmissions,
}) => {
  const isAdmin = userRole === 'admin';
  const mySubmission = task.mySubmission;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'create_account':
        return 'Account Creation';
      case 'comment_post':
        return 'Post Comment';
      case 'community_reply':
        return 'Community Reply';
      case 'group_join':
        return 'Group Join';
      case 'story_post':
        return 'Story Post';
      default:
        return 'Engagement Task';
    }
  };

  const getModeBadge = (targetMode?: string) => {
    switch (targetMode) {
      case 'reviewer':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            🎖️ Mode R: Reviewer
          </span>
        );
      case 'question':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            ❓ Mode Q: Question
          </span>
        );
      case 'support':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            💡 Mode S: Support
          </span>
        );
      case 'navigation':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            🧭 Mode N: Navigation
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
            🌐 All Modes
          </span>
        );
    }
  };

  const getProductBadge = () => {
    const product = typeof task.targetProductId === 'object' ? task.targetProductId : null;
    if (!product) return null;
    return (
      <span
        className="px-1.5 py-0.5 rounded border text-[9px] font-bold"
        style={{
          backgroundColor: `${product.productColor}22`,
          borderColor: `${product.productColor}55`,
          color: product.productColor,
        }}
      >
        {product.name}
      </span>
    );
  };

  const getModeStripe = (targetMode?: string) => {
    switch (targetMode) {
      case 'reviewer':
        return 'from-purple-500 via-pink-500 to-indigo-500';
      case 'question':
        return 'from-sky-500 via-cyan-400 to-blue-500';
      case 'support':
        return 'from-amber-500 via-orange-400 to-yellow-500';
      case 'navigation':
        return 'from-emerald-500 via-teal-400 to-cyan-500';
      default:
        return 'from-indigo-500 via-purple-500 to-pink-500';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border-slate-800 hover:border-slate-700">
      {/* Top Accent Glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getModeStripe(task.targetMode)} opacity-70 group-hover:opacity-100 transition-opacity`} />

      {/* Card Content */}
      <div className="space-y-3.5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getModeBadge(task.targetMode)}
            {getProductBadge()}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {getTypeLabel(task.taskType)}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            Daily Routine Task
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
            {task.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Task Details & Links */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
          {task.targetUrl && <LinkPreview url={task.targetUrl} variant="badge" />}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              {task.screenshotRequired && (
                <span className="flex items-center gap-1 text-slate-400" title="Screenshot proof required">
                  <Camera className="w-3 h-3 text-indigo-400" /> Screenshot
                </span>
              )}
              {task.profileLinkRequired && (
                <span className="flex items-center gap-1 text-slate-400" title="Profile/Proof link required">
                  <LinkIcon className="w-3 h-3 text-blue-400" /> Link
                </span>
              )}
            </div>

            {task.deadline && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Submission Status banner if SMM */}
        {!isAdmin && mySubmission && (
          <div
            className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 ${
              mySubmission.status === 'approved'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : mySubmission.status === 'rejected'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-1.5">
                {mySubmission.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {mySubmission.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 animate-pulse" />}
                {mySubmission.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-400" />}
                <span className="capitalize">{mySubmission.status}</span>
              </div>
              {mySubmission.status === 'approved' && (
                <span className="text-[11px] font-bold text-emerald-400">✓ Routine Counted</span>
              )}
            </div>
            {mySubmission.status === 'rejected' && mySubmission.adminNote && (
              <p className="text-[11px] text-rose-300/90 font-normal">
                <span className="font-semibold">Reason:</span> {mySubmission.adminNote}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {isAdmin ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">Created by Admin</span>
            <div className="flex items-center gap-1.5">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {mySubmission?.status === 'approved' ? (
              <Button variant="outline" size="sm" className="w-full text-emerald-400 border-emerald-500/30 cursor-default">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Completed
              </Button>
            ) : mySubmission?.status === 'pending' ? (
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-amber-300"
                onClick={() => onSubmitProof && onSubmitProof(task)}
              >
                Update Proof Submission
              </Button>
            ) : mySubmission?.status === 'rejected' ? (
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => onSubmitProof && onSubmitProof(task)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Resubmit Fix Proof
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => onSubmitProof && onSubmitProof(task)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start & Submit Proof
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

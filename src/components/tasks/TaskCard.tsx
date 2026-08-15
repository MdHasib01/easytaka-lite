import React from 'react';
import { Task, UserRole } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Coins,
  Calendar,
  ExternalLink,
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

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Top Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Card Content */}
      <div className="space-y-3.5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {getTypeLabel(task.taskType)}
            </span>
            {task.isBroadcast ? (
              <span className="text-[10px] text-slate-400 font-medium">Broadcast</span>
            ) : (
              <span className="text-[10px] text-purple-400 font-medium">Direct Assign</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-300 font-bold text-xs shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>+{task.rewardPoints} Pts</span>
          </div>
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
          {task.targetUrl && (
            <div className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 truncate">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <a
                href={task.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:underline"
              >
                {task.targetUrl}
              </a>
            </div>
          )}

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
                <span className="text-[11px] font-bold">+{mySubmission.pointsAwarded || task.rewardPoints} Pts Earned</span>
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

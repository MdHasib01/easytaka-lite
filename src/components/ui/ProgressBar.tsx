import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = clamped >= 100;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          {label && (
            <span className="text-slate-300 flex items-center gap-1.5">
              {label}
              {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
            </span>
          )}
          {showPercentage && (
            <span
              className={clsx(
                'font-semibold tabular-nums',
                isComplete ? 'text-emerald-400' : clamped > 50 ? 'text-indigo-400' : 'text-slate-400'
              )}
            >
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div className={clsx('w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50', heightClasses[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-success'
              : clamped > 60
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 shadow-glow-brand'
              : 'bg-gradient-to-r from-indigo-600 to-blue-500'
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

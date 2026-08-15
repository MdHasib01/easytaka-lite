import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'warmup' | 'restricted' | 'banned' | 'pending' | 'approved' | 'rejected' | 'points' | 'default';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'md',
}) => {
  const base = 'inline-flex items-center font-medium rounded-full border';

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variants = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warmup: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    restricted: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    banned: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse-subtle',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    points: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold',
    default: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span className={clsx(base, sizes[size], variants[variant], className)}>
      {children}
    </span>
  );
};

import React from 'react';
import {
  ExternalLink,
  User,
  Users,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon2,
  AlertCircle,
} from 'lucide-react';
import { parseLinkMeta, LinkKind } from '../../utils/linkMeta';

const KIND_STYLE: Record<LinkKind, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  profile: { icon: User, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
  group: { icon: Users, color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  page: { icon: FileText, color: 'text-indigo-300', bg: 'bg-indigo-500/10', border: 'border-indigo-500/25' },
  post: { icon: ImageIcon, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  video: { icon: Video, color: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/25' },
  link: { icon: LinkIcon2, color: 'text-slate-300', bg: 'bg-slate-800/60', border: 'border-slate-700' },
};

interface LinkPreviewProps {
  url?: string | null;
  /** 'card' = full detail box (modals, verification review). 'badge' = compact inline pill (list/card rows). */
  variant?: 'card' | 'badge';
  className?: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, variant = 'card', className = '' }) => {
  if (!url || !url.trim()) return null;

  const meta = parseLinkMeta(url);

  if (!meta) {
    return (
      <div
        className={`flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Not a valid link — can't identify its target.</span>
      </div>
    );
  }

  const { icon: Icon, color, bg, border } = KIND_STYLE[meta.kind];

  if (variant === 'badge') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={url}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg border ${bg} ${border} ${color} hover:brightness-125 transition truncate max-w-full ${className}`}
      >
        <Icon className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">
          {meta.label}
          {meta.identifier ? ` · ${meta.identifier}` : ''}
        </span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={url}
      className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${bg} ${border} hover:brightness-110 transition-all group ${className}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${bg} ${border}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold ${color} flex items-center gap-1.5 flex-wrap`}>
          <span>{meta.label}</span>
          {meta.identifier && <span className="font-medium text-slate-300">{meta.identifier}</span>}
        </div>
        <div className="text-[10px] text-slate-500 truncate">{url}</div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white flex-shrink-0" />
    </a>
  );
};
